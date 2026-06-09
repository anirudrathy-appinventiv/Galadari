import { AccessToken, RoomAgentDispatch, RoomConfiguration } from "livekit-server-sdk";

// Mint a short-lived room token server-side. The agent uses automatic dispatch
// (no agent_name), so it joins whatever room the browser connects to.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  const serverUrl = process.env.LIVEKIT_URL;

  if (!apiKey || !apiSecret || !serverUrl) {
    return new Response(
      JSON.stringify({ error: "Missing LIVEKIT_URL / LIVEKIT_API_KEY / LIVEKIT_API_SECRET" }),
      { status: 500, headers: { "content-type": "application/json" } },
    );
  }

  // A fresh room per visitor: the agent uses automatic dispatch, so every new
  // room gets its own agent session. This lets several people test the link at
  // the same time without landing in each other's conversation.
  const room = `galadari-${Math.random().toString(36).slice(2, 10)}`;
  const identity = `web-${Math.random().toString(36).slice(2, 10)}`;

  const at = new AccessToken(apiKey, apiSecret, { identity, ttl: "15m" });
  at.addGrant({ room, roomJoin: true, canPublish: true, canSubscribe: true });
  // Which waiter to summon comes from configuration, mirroring the agent's
  // AGENT_NAME mechanism: in production this is "galadari-waiter" (explicit
  // dispatch to the cloud deployment); locally the setting is absent, the
  // room is created plain, and a nameless lab agent picks it up automatically.
  const agentName = process.env.AGENT_NAME;
  if (agentName) {
    at.roomConfig = new RoomConfiguration({
      agents: [new RoomAgentDispatch({ agentName })],
    });
  }
  const token = await at.toJwt();

  return Response.json({ serverUrl, token });
}