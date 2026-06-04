import { AccessToken } from "livekit-server-sdk";

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

  const room = "drive-thru";
  const identity = `web-${Math.random().toString(36).slice(2, 10)}`;

  const at = new AccessToken(apiKey, apiSecret, { identity, ttl: "15m" });
  at.addGrant({ room, roomJoin: true, canPublish: true, canSubscribe: true });
  const token = await at.toJwt();

  return Response.json({ serverUrl, token });
}
