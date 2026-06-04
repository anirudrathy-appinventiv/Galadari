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
import type { RpcInvocationData } from "livekit-client";

type ConnectionDetails = { serverUrl: string; token: string };

const STATUS_LABEL: Record<string, string> = {
  connecting: "Seating you",
  initializing: "Warming the kitchen",
  listening: "Listening",
  thinking: "Considering",
  speaking: "Telling you",
  disconnected: "Away",
};

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

function Table() {
  return (
    <main className="table">
      <div className="grain" aria-hidden />
      <header className="topbar">
        <span className="wordmark">Galadari</span>
        <span className="topbar-sub">Voice Table</span>
      </header>
      <div className="stage">
        <Pass />
        <Bill />
      </div>
    </main>
  );
}

function Pass() {
  const { state, audioTrack, agentTranscriptions } = useVoiceAssistant();
  const status = STATUS_LABEL[state ?? ""] ?? "Connecting";
  const caption = agentTranscriptions?.at(-1)?.text ?? "";

  return (
    <section className="pass">
      <div className={`thali thali-${state ?? "idle"}`}>
        <div className="thali-ring" aria-hidden />
        <div className="thali-glow" aria-hidden />
        <BarVisualizer
          state={state}
          barCount={5}
          trackRef={audioTrack}
          className="viz"
          options={{ minHeight: 8, maxHeight: 80 }}
        />
      </div>

      <div className={`status status-${state ?? "idle"}`}>
        <span className="status-pip" aria-hidden />
        {status}
      </div>

      <p className="caption" aria-live="polite">
        {caption || "Say hello, or ask for a recommendation."}
      </p>

      <Controls />
    </section>
  );
}

function Controls() {
  const { localParticipant, isMicrophoneEnabled } = useLocalParticipant();
  const room = useRoomContext();

  return (
    <div className="controls">
      <button
        className={`ctrl ${isMicrophoneEnabled ? "ctrl-on" : "ctrl-off"}`}
        onClick={() => localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled)}
        aria-label={isMicrophoneEnabled ? "Mute microphone" : "Unmute microphone"}
      >
        <MicIcon muted={!isMicrophoneEnabled} />
        {isMicrophoneEnabled ? "Mute" : "Unmute"}
      </button>
      <button className="ctrl ctrl-end" onClick={() => room.disconnect()} aria-label="End order">
        Close out
      </button>
    </div>
  );
}

type CartRow = { label: string; price: string; isTotal: boolean };

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

function Bill() {
  const room = useRoomContext();
  const [cart, setCart] = useState("");
  const orderNo = useMemo(
    () => Math.floor(1000 + Math.random() * 9000).toString(),
    [],
  );

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

      <div className="bill-foot" aria-hidden>
        <span>ধন্যবাদ</span>
        <span>thank you</span>
      </div>
    </aside>
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
