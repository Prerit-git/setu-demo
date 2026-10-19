import { NextResponse } from "next/server";
// Aanya ki "asli" awaaz: ElevenLabs (cloned / chuni hui ladki ki voice). Key na ho to browser ki inbuilt awaaz chalti hai.
const g = globalThis;
if (!g.__tts) g.__tts = { cache: new Map(), voiceId: "" };
const vid = () => process.env.ELEVENLABS_VOICE_ID || g.__tts.voiceId;
const ready = () => !!(process.env.ELEVENLABS_API_KEY && vid());

export function GET() {
  return NextResponse.json({ engine: ready() ? "elevenlabs" : "browser", hasKey: !!process.env.ELEVENLABS_API_KEY, voiceId: vid() ? "set" : "" });
}

export async function POST(req) {
  if (!ready()) return NextResponse.json({ error: "TTS not configured" }, { status: 501 });
  const { text = "" } = await req.json();
  const t = String(text).slice(0, 600);
  if (!t.trim()) return NextResponse.json({ error: "empty" }, { status: 400 });
  const k = vid() + "|" + t, hit = g.__tts.cache.get(k);
  if (hit) return new Response(hit, { headers: { "content-type": "audio/mpeg" } });
  const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${vid()}?output_format=mp3_44100_128`, {
    method: "POST",
    headers: { "xi-api-key": process.env.ELEVENLABS_API_KEY, "content-type": "application/json", accept: "audio/mpeg" },
    body: JSON.stringify({
      text: t, model_id: process.env.ELEVENLABS_MODEL || "eleven_multilingual_v2",
      // stability thodi upar = ek jaisi, soft tone; style kam = natural
      voice_settings: { stability: 0.55, similarity_boost: 0.8, style: 0.15, use_speaker_boost: true },
    }),
  });
  if (!r.ok) return NextResponse.json({ error: `TTS ${r.status}`, detail: (await r.text()).slice(0, 200) }, { status: 502 });
  const buf = await r.arrayBuffer();
  if (g.__tts.cache.size > 150) g.__tts.cache.delete(g.__tts.cache.keys().next().value);
  g.__tts.cache.set(k, buf);
  return new Response(buf, { headers: { "content-type": "audio/mpeg" } });
}
