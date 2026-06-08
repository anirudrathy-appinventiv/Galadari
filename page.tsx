"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BarVisualizer,
  LiveKitRoom,
  RoomAudioRenderer,
  useLocalParticipant,
  useRoomContext,
  useVoiceAssistant,
} from "@livekit/components-react";
import { ParticipantKind, type RpcInvocationData } from "livekit-client";
import { MENU, CURRENCY, type Dish } from "./menu";

type ConnectionDetails = { serverUrl: string; token: string };
type CartRow = { label: string; price: string; isTotal: boolean };

const STATUS_LABEL: Record<string, string> = {
  connecting: "Seating you",
  initializing: "Warming the kitchen",
  listening: "Listening",
  thinking: "Considering",
  speaking: "Telling you",
  disconnected: "Away",
};

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-");

export default function Page() {
  const [details, setDetails] = useState<ConnectionDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const connect = useCallback(async () => {
    setError(null);
    setPending(true);
    try {
      const res = await fetch("/api/connection-details");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not reach the kitchen");
      setDetails(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Connection failed");
    } finally {
      setPending(false);
    }
  }, []);

  if (!details) {
    return <Landing onStart={connect} pending={pending} error={error} />;
  }

  return (
    <LiveKitRoom
      serverUrl={details.serverUrl}
      token={details.token}
      connect
      audio
      onDisconnected={() => setDetails(null)}
    >
      <Table />
      <RoomAudioRenderer />
    </LiveKitRoom>
  );
}

function Landing({
  onStart,
  pending,
  error,
}: {
  onStart: () => void;
  pending: boolean;
  error: string | null;
}) {
  return (
    <main className="landing">
      <div className="grain" aria-hidden />
      <div className="frame" aria-hidden />
      <div className="landing-inner">
        <p className="kicker reveal" style={{ animationDelay: "60ms" }}>
          Galadari <span className="dot-sep">·</span> Kitchen of Bengal
        </p>
        <h1 className="display reveal" style={{ animationDelay: "140ms" }}>
          A table for one,
          <br />
          <em>served by voice.</em>
        </h1>
        <p className="bengali-flourish reveal" style={{ animationDelay: "220ms" }} aria-hidden>
          আজ কী খাবেন?
        </p>
        <p className="lede reveal" style={{ animationDelay: "300ms" }}>
          No menus to scroll, no buttons to hunt. Just speak — ask what&rsquo;s good,
          and our waiter will recommend, answer, and write up your order as you go.
        </p>
        <div className="reveal" style={{ animationDelay: "380ms" }}>
          <button className="cta" onClick={onStart} disabled={pending}>
            <span>{pending ? "Pulling up a chair…" : "Begin your order"}</span>
            <Arrow />
          </button>
          {error && <p className="error">{error}</p>}
        </div>
      </div>
      <p className="corner-mark" aria-hidden>
        est. Kolkata
      </p>
    </main>
  );
}

function parseCart(payload: string): CartRow[] {
  return payload
    .split("\n")
    .map((raw) => raw.trim())
    .filter(Boolean)
    .map((raw) => {
      const priceMatch = raw.match(/\[\[([^\]]+)\]\]/);
      const price = priceMatch ? priceMatch[1] : "";
      const label = raw
        .replace(/\[\[[^\]]+\]\]/g, "")
        .replace(/\*\*/g, "")
        .replace(/^[-•\s]+/, "")
        .replace(/[·•\s]+$/, "")
        .trim();
      return { label, price, isTotal: /total/i.test(raw) };
    });
}

function Table() {
  const room = useRoomContext();
  const [cart, setCart] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  // The cart lives here (lifted) so both the bill and the checkout screen see it.
  useEffect(() => {
    if (!room) return;
    const handler = async (data: RpcInvocationData) => {
      setCart(data.payload);
      return "ok";
    };
    room.localParticipant.registerRpcMethod("set_cart_content", handler);
    return () => room.localParticipant.unregisterRpcMethod("set_cart_content");
  }, [room]);

  const rows = cart.trim() ? parseCart(cart) : [];
  const hasOrder = rows.some((r) => !r.isTotal);

  return (
    <main className="table">
      <div className="grain" aria-hidden />
      <header className="topbar">
        <span className="wordmark">Galadari</span>
        <div className="topbar-actions">
          <span className="topbar-sub">Voice Table</span>
          <button
            className={`menu-toggle ${menuOpen ? "menu-toggle-on" : ""}`}
            onClick={() => setMenuOpen((o) => !o)}
            aria-expanded={menuOpen}
          >
            <MenuGlyph />
            {menuOpen ? "Hide menu" : "View menu"}
          </button>
        </div>
      </header>

      <div className={`room ${menuOpen ? "room-split" : ""}`}>
        <section className="agent">
          <Pass />
          <Bill rows={rows} hasOrder={hasOrder} onCheckout={() => setCheckoutOpen(true)} />
        </section>
        {menuOpen && <MenuPanel onClose={() => setMenuOpen(false)} />}
      </div>

      {menuOpen && <div className="scrim" onClick={() => setMenuOpen(false)} aria-hidden />}
      {checkoutOpen && <Checkout rows={rows} onClose={() => setCheckoutOpen(false)} />}
    </main>
  );
}

function Pass() {
  const { state, audioTrack, agentTranscriptions } = useVoiceAssistant();
  const status = STATUS_LABEL[state ?? ""] ?? "Connecting";
  const caption = agentTranscriptions?.at(-1)?.text ?? "";

  return (
    <section className={`pass pass-${state ?? "idle"}`}>
      <div className="vb-orb">
        <span className="vb-orb-ring" aria-hidden />
        <BarVisualizer
          state={state}
          barCount={5}
          trackRef={audioTrack}
          className="viz"
          options={{ minHeight: 6, maxHeight: 44 }}
        />
      </div>

      <div className="vb-mid">
        <div className={`status status-${state ?? "idle"}`}>
          <span className="status-pip" aria-hidden />
          {status}
        </div>
        <p className="vb-caption" aria-live="polite">
          {caption || "Say hello, or ask for a recommendation."}
        </p>
      </div>

      <Controls />
    </section>
  );
}

function Controls() {
  const { localParticipant, isMicrophoneEnabled } = useLocalParticipant();
  const room = useRoomContext();
  const [paused, setPaused] = useState(false);
  const [pausePending, setPausePending] = useState(false);

  // Pause = the waiter stops talking and stops listening, but the session,
  // the conversation memory and the cart stay alive. Resume continues
  // exactly where the guest left off.
  const togglePause = useCallback(async () => {
    if (!room || pausePending) return;
    const peers = Array.from(room.remoteParticipants.values());
    const agent = peers.find((p) => p.kind === ParticipantKind.Agent) ?? peers[0];
    if (!agent) return;
    const next = !paused;
    setPausePending(true);
    try {
      await room.localParticipant.performRpc({
        destinationIdentity: agent.identity,
        method: "set_paused",
        payload: next ? "true" : "false",
      });
      setPaused(next);
    } catch (e) {
      console.error("pause/resume failed", e);
    } finally {
      setPausePending(false);
    }
  }, [room, paused, pausePending]);

  return (
    <div className="controls">
      <button
        className={`ctrl ${isMicrophoneEnabled ? "ctrl-on" : "ctrl-off"}`}
        onClick={() => localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled)}
        aria-label={isMicrophoneEnabled ? "Mute microphone" : "Unmute microphone"}
      >
        <MicIcon muted={!isMicrophoneEnabled} />
        <span className="ctrl-label">{isMicrophoneEnabled ? "Mute" : "Unmute"}</span>
      </button>
      <button
        className={`ctrl ${paused ? "ctrl-off" : "ctrl-on"}`}
        onClick={togglePause}
        disabled={pausePending}
        aria-label={paused ? "Resume the waiter" : "Pause the waiter"}
      >
        <PauseIcon paused={paused} />
        <span className="ctrl-label">{paused ? "Resume" : "Pause"}</span>
      </button>
      <button className="ctrl ctrl-end" onClick={() => room.disconnect()} aria-label="End order">
        <span className="ctrl-label">Close out</span>
      </button>
    </div>
  );
}

function MenuPanel({ onClose }: { onClose: () => void }) {
  const [active, setActive] = useState(slug(MENU[0]?.name ?? ""));

  const jump = useCallback((id: string) => {
    setActive(id);
    document.getElementById(`cat-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  return (
    <section className="menu-panel" aria-label="Menu">
      <div className="menu-panel-head">
        <div>
          <h2 className="menu-title">The Menu</h2>
          <span className="menu-hint">Browse while you talk — or just ask the waiter</span>
        </div>
        <button className="menu-close" onClick={onClose} aria-label="Close menu">
          ×
        </button>
      </div>

      <nav className="menu-nav" aria-label="Menu sections">
        {MENU.map((c) => {
          const id = slug(c.name);
          return (
            <button
              key={id}
              className={`menu-chip ${active === id ? "menu-chip-on" : ""}`}
              onClick={() => jump(id)}
            >
              {c.name}
            </button>
          );
        })}
      </nav>

      <div className="menu-scroll">
        {MENU.map((c, ci) => (
          <section key={c.name} id={`cat-${slug(c.name)}`} className="menu-cat">
            <header className="menu-cat-head">
              <span className="menu-cat-name">{c.name}</span>
              <span className="menu-cat-rule" aria-hidden />
              <span className="menu-cat-count">{c.items.length}</span>
            </header>
            <div className="menu-grid">
              {c.items.map((d) => (
                <DishCard key={d.name} dish={d} hue={ci} />
              ))}
            </div>
          </section>
        ))}
        <p className="menu-foot" aria-hidden>
          ছবি শীঘ্রই · photography coming soon
        </p>
      </div>
    </section>
  );
}

function DishCard({ dish, hue }: { dish: Dish; hue: number }) {
  const initial = dish.name.charAt(0).toUpperCase();
  const spice = dish.spice && /mild|medium|hot/i.test(dish.spice) ? dish.spice : "";
  return (
    <article className="dish">
      <div className={`dish-thumb hue-${hue % 5}`} aria-hidden>
        <span className="dish-thumb-initial">{initial}</span>
        <ForkKnife />
        <span className={`dish-dot ${dish.veg ? "dot-veg" : "dot-nonveg"}`} title={dish.veg ? "Veg" : "Non-veg"} />
      </div>
      <div className="dish-info">
        <div className="dish-row">
          <h3 className="dish-name">{dish.name}</h3>
          <span className="dish-price">
            {CURRENCY} {dish.price}
          </span>
        </div>
        {dish.desc && <p className="dish-desc">{dish.desc}</p>}
        <div className="dish-tags">
          {dish.popular && <span className="tag tag-pop">Popular</span>}
          {spice && <span className="tag tag-spice">{spice}</span>}
          {dish.cal > 0 && <span className="tag tag-cal">{dish.cal} kcal</span>}
        </div>
      </div>
    </article>
  );
}

function Bill({
  rows,
  hasOrder,
  onCheckout,
}: {
  rows: CartRow[];
  hasOrder: boolean;
  onCheckout: () => void;
}) {
  const orderNo = useMemo(() => Math.floor(1000 + Math.random() * 9000).toString(), []);

  return (
    <aside className="bill">
      <div className="bill-perf" aria-hidden />
      <div className="bill-head">
        <span className="bill-brand">Galadari</span>
        <span className="bill-meta">
          Order №&nbsp;{orderNo} <span className="dot-sep">·</span> Table 1
        </span>
      </div>
      <div className="bill-rule" aria-hidden />

      {rows.length === 0 ? (
        <p className="bill-empty">
          Nothing written down yet.
          <span>Your order appears here as you ask for it.</span>
        </p>
      ) : (
        <div className="bill-rows">
          {rows.map((row, i) => (
            <div key={i} className={`bill-row ${row.isTotal ? "bill-row-total" : ""}`}>
              <span className="bill-name">{row.label}</span>
              <span className="bill-leader" aria-hidden />
              <span className="bill-price">{row.price}</span>
            </div>
          ))}
        </div>
      )}

      {hasOrder && (
        <button className="bill-checkout" onClick={onCheckout}>
          Checkout
          <Arrow />
        </button>
      )}

      <div className="bill-foot" aria-hidden>
        <span>ধন্যবাদ</span>
        <span>thank you</span>
      </div>
    </aside>
  );
}

function Checkout({ rows, onClose }: { rows: CartRow[]; onClose: () => void }) {
  const [method, setMethod] = useState<string | null>(null);
  const [placed, setPlaced] = useState(false);
  const items = rows.filter((r) => !r.isTotal);
  const total = rows.find((r) => r.isTotal);
  const methods: [string, string][] = [
    ["card", "Card"],
    ["cash", "Cash"],
    ["wallet", "Wallet"],
  ];

  return (
    <div className="checkout-scrim" onClick={onClose}>
      <div
        className="checkout"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <button className="checkout-x" onClick={onClose} aria-label="Close">
          ×
        </button>

        {placed ? (
          <div className="checkout-done">
            <CheckMark />
            <h2 className="checkout-title">Order placed</h2>
            <p className="checkout-done-text">
              Thank you — your order has been sent to the kitchen.
            </p>
            <p className="checkout-demo">Demo only · no payment was taken</p>
            <button className="checkout-place" onClick={onClose}>
              Done
            </button>
          </div>
        ) : (
          <>
            <h2 className="checkout-title">Checkout</h2>
            <div className="checkout-summary">
              {items.map((r, i) => (
                <div key={i} className="checkout-line">
                  <span>{r.label}</span>
                  <span>{r.price}</span>
                </div>
              ))}
              {total && (
                <div className="checkout-line checkout-total">
                  <span>{total.label || "Total"}</span>
                  <span>{total.price}</span>
                </div>
              )}
            </div>

            <p className="checkout-pay-label">Payment method</p>
            <div className="checkout-methods">
              {methods.map(([id, label]) => (
                <button
                  key={id}
                  className={`pay ${method === id ? "pay-on" : ""}`}
                  onClick={() => setMethod(id)}
                >
                  {label}
                </button>
              ))}
            </div>

            <button className="checkout-place" disabled={!method} onClick={() => setPlaced(true)}>
              Place order
            </button>
            <p className="checkout-demo">Demo only · no real payment is processed</p>
          </>
        )}
      </div>
    </div>
  );
}

function Arrow() {
  return (
    <svg width="22" height="12" viewBox="0 0 22 12" fill="none" aria-hidden>
      <path d="M1 6h19m0 0-5-5m5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MicIcon({ muted }: { muted: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="9" y="2" width="6" height="12" rx="3" stroke="currentColor" strokeWidth="1.6" />
      <path d="M5 11a7 7 0 0 0 14 0M12 18v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      {muted && <path d="M4 3l16 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />}
    </svg>
  );
}

function PauseIcon({ paused }: { paused: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      {paused ? (
        <path d="M8 5l11 7-11 7V5z" fill="currentColor" />
      ) : (
        <path d="M7 4h3v16H7zM14 4h3v16h-3z" fill="currentColor" />
      )}
    </svg>
  );
}

function MenuGlyph() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function ForkKnife() {
  return (
    <svg className="dish-thumb-glyph" width="48" height="48" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M7 2v8m0 0a2 2 0 0 0 2-2V2M7 10v12M5 2v6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M17 2c-1.5 0-2.5 2-2.5 5s1 4 2.5 4 2.5-1 2.5-4-1-5-2.5-5zM17 11v11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function CheckMark() {
  return (
    <svg className="checkout-check" width="56" height="56" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.4" />
      <path d="M7.5 12.5l3 3 6-6.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}