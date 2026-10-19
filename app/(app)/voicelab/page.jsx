"use client";
import { useEffect, useRef, useState } from "react";
import { Mic, Square, Upload, Play } from "lucide-react";

export default function VoiceLab() {
  const [st, setSt] = useState({});
  const [speaker, setSpeaker] = useState("");
  const [consent, setConsent] = useState(false);
  const [files, setFiles] = useState([]);
  const [rec, setRec] = useState(false);
  const [secs, setSecs] = useState(0);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [vid, setVid] = useState("");
  const [test, setTest] = useState("नमस्ते जी! मैं आन्या हूँ, के एम ए ग्लोबल प्रॉपर्टी से। बताइए, मैं आपकी क्या मदद कर सकती हूँ?");
  const mr = useRef(), chunks = useRef([]), timer = useRef(), fileRef = useRef();

  const refresh = () => fetch("/api/tts").then((r) => r.json()).then(setSt).catch(() => {});
  useEffect(() => { refresh(); }, []);

  const startRec = async () => {
    setMsg("");
    try {
      const s = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: true } });
      const m = new MediaRecorder(s); chunks.current = [];
      m.ondataavailable = (e) => e.data.size && chunks.current.push(e.data);
      m.onstop = () => { s.getTracks().forEach((t) => t.stop()); const b = new Blob(chunks.current, { type: m.mimeType }); setFiles((f) => [...f, new File([b], `recording-${Date.now()}.webm`, { type: m.mimeType })]); };
      m.start(); mr.current = m; setRec(true); setSecs(0); timer.current = setInterval(() => setSecs((x) => x + 1), 1000);
    } catch { setMsg("Mic permission nahi mili."); }
  };
  const stopRec = () => { mr.current?.stop(); clearInterval(timer.current); setRec(false); };

  const clone = async () => {
    setBusy(true); setMsg("");
    const fd = new FormData(); fd.append("speaker", speaker); fd.append("consent", consent ? "yes" : "no"); files.forEach((f) => fd.append("files", f));
    const r = await fetch("/api/tts/clone", { method: "POST", body: fd }); const j = await r.json(); setBusy(false);
    if (j.ok) { setVid(j.voiceId); setMsg("Voice ban gayi! Ab /voice pe Aanya isi awaaz me bolegi."); refresh(); } else setMsg(typeof j.error === "string" ? j.error : JSON.stringify(j.error));
  };
  const play = async () => {
    setMsg("");
    const r = await fetch("/api/tts", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ text: test }) });
    if (!r.ok) { const j = await r.json().catch(() => ({})); return setMsg(j.error === "TTS not configured" ? "Pehle voice banao ya .env.local me ELEVENLABS_VOICE_ID daalo." : `${j.error || "error"} ${j.detail || ""}`); }
    new Audio(URL.createObjectURL(await r.blob())).play();
  };

  return (
    <div className="max-w-4xl">
      <div className="eyebrow">Voice lab</div>
      <h1 className="mt-1 text-4xl font-extrabold">Aanya ki awaaz</h1>
      <p className="mt-2 text-slate-400">Ek ladki ki awaaz record karo — Aanya usi awaaz me baat karegi. Abhi engine: <b className={st.engine === "elevenlabs" ? "text-brand" : "text-amber"}>{st.engine === "elevenlabs" ? "Custom voice (ElevenLabs)" : "Browser ki inbuilt awaaz"}</b></p>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <div className="card space-y-3">
          <div className="text-lg font-bold">1. Awaaz record / upload karo</div>
          <ul className="list-disc space-y-1 pl-5 text-sm text-slate-400">
            <li>1 se 3 minute, shaant kamra, ek hi insaan, background music nahi.</li>
            <li>Waise hi bolo jaisa Aanya ko bolna chahiye: soft, dheere, muskurate hue, Hindi + thodi English (BHK, site visit, budget…).</li>
            <li>Best result ke liye WAV/MP3 file upload karo; browser recording (webm) kabhi-kabhi reject ho sakti hai.</li>
          </ul>
          <div className="flex flex-wrap gap-2">
            {!rec ? <button onClick={startRec} className="btn flex items-center gap-2"><Mic size={16} />Record</button> : <button onClick={stopRec} className="flex items-center gap-2 rounded-lg bg-red-500 px-3 py-2 font-bold text-white"><Square size={14} />Stop · {secs}s</button>}
            <button onClick={() => fileRef.current.click()} className="flex items-center gap-2 rounded-lg border border-slate-600 px-3 py-2"><Upload size={16} />File upload</button>
            <input ref={fileRef} type="file" accept="audio/*" multiple hidden onChange={(e) => setFiles((f) => [...f, ...e.target.files])} />
          </div>
          {files.map((f, i) => <div key={i} className="flex justify-between rounded-lg bg-white/5 px-3 py-1 text-sm"><span>{f.name}</span><button className="text-red-400" onClick={() => setFiles(files.filter((_, j) => j !== i))}>hatao</button></div>)}
        </div>

        <div className="card space-y-3">
          <div className="text-lg font-bold">2. Permission + clone</div>
          <input className="input" placeholder="Jis ladki ki awaaz hai uska poora naam" value={speaker} onChange={(e) => setSpeaker(e.target.value)} />
          <label className="flex gap-2 text-sm text-slate-300"><input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1" />Is awaaz wali ne AI voice agent me apni awaaz use karne ki <b>likhit permission</b> di hai, aur wo jaanti hai ki customers ko ye AI ki awaaz lagegi.</label>
          <button disabled={busy || !files.length || !consent || !speaker.trim()} onClick={clone} className="btn disabled:opacity-40">{busy ? "Ban rahi hai…" : "Voice banao"}</button>
          {vid && <div className="rounded-lg bg-emerald-900/30 p-3 text-xs">Hamesha ke liye <code>.env.local</code> me daalo, warna restart pe chali jayegi:<br /><code className="text-brand">ELEVENLABS_VOICE_ID={vid}</code></div>}
          {msg && <div className="text-sm text-amber">{msg}</div>}
        </div>
      </div>

      <div className="card mt-5 space-y-3">
        <div className="text-lg font-bold">3. Suno</div>
        <textarea rows={3} className="input" value={test} onChange={(e) => setTest(e.target.value)} />
        <button onClick={play} className="btn flex w-fit items-center gap-2"><Play size={16} />Awaaz sunao</button>
        <p className="text-xs text-slate-500">Tip: Hindi bulwane ke liye Devanagari me likho (जैसे ऊपर). Aanya ke jawab apne aap Devanagari me bolte hain.</p>
      </div>
    </div>
  );
}
