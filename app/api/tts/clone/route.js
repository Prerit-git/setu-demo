import { NextResponse } from "next/server";
// ElevenLabs "Instant Voice Clone". Sirf us awaaz ke liye jiski likhit permission tumhare paas hai.
export async function POST(req) {
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) return NextResponse.json({ error: "ELEVENLABS_API_KEY .env.local me daalo" }, { status: 400 });
  const fd = await req.formData();
  if (fd.get("consent") !== "yes" || !String(fd.get("speaker") || "").trim())
    return NextResponse.json({ error: "Awaaz wali ki permission aur uska naam zaroori hai" }, { status: 400 });
  const files = fd.getAll("files").filter((f) => f && typeof f !== "string" && f.size > 0);
  if (!files.length) return NextResponse.json({ error: "Audio file do" }, { status: 400 });
  const out = new FormData();
  out.append("name", `Aanya (${String(fd.get("speaker")).trim()})`);
  out.append("description", "SETU voice agent — recorded with the speaker's consent");
  for (const f of files) out.append("files", f, f.name || "sample.wav");
  const r = await fetch("https://api.elevenlabs.io/v1/voices/add", { method: "POST", headers: { "xi-api-key": key }, body: out });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || !j.voice_id) return NextResponse.json({ error: j.detail?.message || j.detail || `ElevenLabs ${r.status}` }, { status: 502 });
  globalThis.__tts = globalThis.__tts || { cache: new Map(), voiceId: "" };
  globalThis.__tts.voiceId = j.voice_id; // abhi ke liye chalu; hamesha ke liye .env.local me daalo
  return NextResponse.json({ ok: true, voiceId: j.voice_id });
}
