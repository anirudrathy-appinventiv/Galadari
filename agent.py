import asyncio
import json
import logging
import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from dataclasses import dataclass
from typing import Annotated

from dotenv import load_dotenv
from menu_rag import SYSTEM_PROMPT, build_menu_catalog, menu_overview, query_menu
from order import OrderedDish, OrderState
from pydantic import Field

from livekit.agents import (
    Agent,
    AgentServer,
    AgentSession,
    AudioConfig,
    BackgroundAudioPlayer,
    FunctionTool,
    JobContext,
    RunContext,
    ToolError,
    cli,
    function_tool,
)
from livekit.plugins import openai

load_dotenv()

logger = logging.getLogger("drive-thru")


@dataclass
class Userdata:
    order: OrderState
    # id -> dish dict, parsed from data/menu.csv (the order source of truth).
    catalog: dict[str, dict]


class DriveThruAgent(Agent):
    def __init__(self, *, userdata: Userdata) -> None:
        instructions = SYSTEM_PROMPT + "\n\n## MENU\n" + menu_overview()

        super().__init__(
            instructions=instructions,
            tools=[
                self.build_order_dish_tool(userdata.catalog),
                # RAG over data/menu.csv: recommendations + availability checks.
                query_menu,
            ],
        )

    def build_order_dish_tool(self, catalog: dict[str, dict]) -> FunctionTool:
        dish_ids = list(catalog.keys())

        @function_tool
        async def order_dish(
            ctx: RunContext[Userdata],
            dish_id: Annotated[
                str,
                Field(
                    description="The ID of the menu dish to add to the order.",
                    json_schema_extra={"enum": dish_ids},
                ),
            ],
            quantity: Annotated[
                int,
                Field(description="How many of this dish to add. Defaults to 1."),
            ] = 1,
        ) -> str:
            """
            Add a dish from the menu to the customer's order.

            Only dishes that exist on the menu can be added. If you are unsure whether an
            item is on the menu, call `query_menu` first to confirm it — never try to add
            something that isn't on the menu.
            """
            dish = catalog.get(dish_id)
            if dish is None:
                raise ToolError(f"error: '{dish_id}' is not on the menu")

            item = OrderedDish(
                dish_id=dish_id,
                name=dish["name"],
                price=dish["price"],
                quantity=max(1, quantity),
            )
            await ctx.userdata.order.add(item)
            return f"The item was added: {item.model_dump_json()}"

        return order_dish

    @function_tool
    async def remove_order_item(
        self,
        ctx: RunContext[Userdata],
        order_id: Annotated[
            list[str],
            Field(
                description="A list of internal `order_id`s of the items to remove. Use `list_order_items` to look it up if needed."
            ),
        ],
    ) -> str:
        """
        Removes one or more items from the user's order using their `order_id`s.

        Useful when the user asks to cancel or delete existing items (e.g., “Remove the cheeseburger”).

        If the `order_id`s are unknown, call `list_order_items` first to retrieve them.
        """
        not_found = [oid for oid in order_id if oid not in ctx.userdata.order.items]
        if not_found:
            raise ToolError(f"error: no item(s) found with order_id(s): {', '.join(not_found)}")

        removed_items = [await ctx.userdata.order.remove(oid) for oid in order_id]
        return "Removed items:\n" + "\n".join(item.model_dump_json() for item in removed_items)

    @function_tool
    async def list_order_items(self, ctx: RunContext[Userdata]) -> str:
        """
        Retrieves the current list of items in the user's order, including each item's internal `order_id`.

        Helpful when:
        - An `order_id` is required before modifying or removing an existing item.
        - Confirming details or contents of the current order.

        Examples:
        - User requests modifying an item, but the item's `order_id` is unknown (e.g., "Change the fries from small to large").
        - User requests removing an item, but the item's `order_id` is unknown (e.g., "Remove the cheeseburger").
        - User asks about current order details (e.g., "What's in my order so far?").
        """
        items = ctx.userdata.order.items.values()
        if not items:
            return "The order is empty"

        return "\n".join(item.model_dump_json() for item in items)


def format_cart(userdata: Userdata) -> str:
    """Render the current order as markdown for the playground card.

    Returns an empty string when the cart is empty, which signals the
    UI to hide the card. The card itself already shows "Current order"
    in its title bar, so the body skips a heading and goes straight to
    the line items.
    """
    if not userdata.order.items:
        return ""
    lines: list[str] = []
    total = 0.0
    for item in userdata.order.items.values():
        line_total = item.price * item.quantity
        total += line_total
        qty = f"{item.quantity} × " if item.quantity > 1 else ""
        lines.append(f"- **{qty}{item.name}** · [[Rs {line_total:.0f}]]")
    lines.append("")
    lines.append(f"**Total · [[Rs {total:.0f}]]**")
    return "\n".join(lines)


async def new_userdata() -> Userdata:
    return Userdata(order=OrderState(items={}), catalog=build_menu_catalog())


server = AgentServer()


async def on_session_end(ctx: JobContext) -> None:
    report = ctx.make_session_report()
    _ = json.dumps(report.to_dict(), indent=2)


@server.rtc_session(on_session_end=on_session_end)
async def drive_thru_agent(ctx: JobContext) -> None:
    userdata = await new_userdata()
    session = AgentSession[Userdata](
        userdata=userdata,
        # Pure speech-to-speech: the Realtime model runs its OWN turn detection
        # (server-side VAD) and transcription. We intentionally do NOT attach an
        # external STT / VAD / turn detector — those were desyncing the model's
        # conversation state and causing it to cut off and speak gibberish.
        llm=openai.realtime.RealtimeModel(voice="alloy"),
        max_tool_steps=10,
    )

    background_audio = BackgroundAudioPlayer(
        ambient_sound=AudioConfig(
            str(os.path.join(os.path.dirname(os.path.abspath(__file__)), "bg_noise.mp3")),
            volume=1.0,
        ),
    )

    # Push the cart as markdown to the playground's cart view
    # whenever it changes. Coalesced + serialized: rapid changes
    # (e.g. batch-remove that pops items one at a time) collapse
    # into a single trailing push of the *latest* cart state, so
    # an empty-cart payload can't get reordered behind a stale
    # mid-state push. Fire-and-forget at the call site — the
    # function tool that mutated the order shouldn't block on the
    # RPC round-trip.
    push_pending = False
    push_running = False

    async def _push_to(identity: str, payload: str) -> None:
        try:
            await ctx.room.local_participant.perform_rpc(
                destination_identity=identity,
                method="set_cart_content",
                payload=payload,
            )
        except Exception:
            logger.exception("cart push to %s failed", identity)

    async def _push_runner() -> None:
        nonlocal push_pending, push_running
        push_running = True
        try:
            while push_pending:
                push_pending = False
                payload = format_cart(userdata)
                logger.info("push_cart: %d chars", len(payload))
                peers = list(ctx.room.remote_participants.values())
                if not peers:
                    continue
                await asyncio.gather(
                    *(_push_to(p.identity, payload) for p in peers),
                    return_exceptions=True,
                )
        finally:
            push_running = False

    async def push_cart() -> None:
        nonlocal push_pending
        push_pending = True
        if push_running:
            return
        asyncio.create_task(_push_runner())

    userdata.order.on_change = push_cart

    await session.start(agent=DriveThruAgent(userdata=userdata), room=ctx.room)
    await background_audio.start(room=ctx.room, agent_session=session)


if __name__ == "__main__":
    cli.run_app(server)
