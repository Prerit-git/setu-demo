"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, PhoneOff, Mic, MicOff, Send, Sparkles, Volume2, VolumeX, Flame } from "lucide-react";

/* ---------------- config ---------------- */
const HUE = { idle: 150, connecting: 200, listening: 195, thinking: 265, speaking: 330 };
const LABEL = {
  idle: "Aanya taiyar hai", connecting: "Connect ho rahi hai…", listening: "Aanya sun rahi hai…",
  thinking: "Soch rahi hai…", speaking: "Aanya bol rahi hai…",
};
const STYLES = { soft: { n: "Soft & calm", rate: 0.9, pitch: 1.12 }, warm: { n: "Warm", rate: 1, pitch: 1.06 }, bright: { n: "Bright", rate: 1.06, pitch: 1.2 } };
const CHIPS = ["3 BHK Golf Course Road, budget 3 crore", "Sohna Road me 2 BHK chahiye", "Site visit karni hai", "Budget thoda kam hai"];
const FEMALE = /lekha|google\s*(हिन्दी|hindi)|swara|heera|kalpana|neerja|veena|priya|female|zira|samantha|karen|tessa/i;
const MALE = /rishi|hemant|prabhat|ravi|madhur|male(?!.*fe)|david|mark|daniel/i;

const calcScore = (p = {}) => {
  let s = 10;
  if (p.bhk) s += 15; if (p.budget) s += 20; if (p.zone) s += 15; if (p.timeline) s += 10; if (p.visit) s += 30;
  if (p.mood === "annoyed") s -= 20;
  s = Math.max(0, Math.min(100, s));
  return { s, label: s >= 70 ? "HOT" : s >= 40 ? "WARM" : "COLD" };
};

/* ---------------- animated orb (canvas) ---------------- */
function Orb({ state, levelRef, pulseRef }) {
  const cv = useRef();
  const stRef = useRef(state);
  stRef.current = state;
  useEffect(() => {
    const c = cv.current, ctx = c.getContext("2d"), dpr = Math.min(window.devicePixelRatio || 1, 2), S = 360;
    c.width = c.height = S * dpr; ctx.scale(dpr, dpr);
    let raf, hue = 150, amp = 0.15; const t0 = performance.now();
    const draw = (now) => {
      const t = (now - t0) / 1000, s = stRef.current;
      hue += ((HUE[s] ?? 150) - hue) * 0.05;
      let a;
      if (s === "listening") a = 0.18 + levelRef.current * 1.4;
      else if (s === "speaking") a = 0.3 + 0.18 * Math.sin(t * 8) + 0.12 * Math.sin(t * 13.7) + pulseRef.current * 0.5;
      else if (s === "thinking") a = 0.22 + 0.06 * Math.sin(t * 5);
      else a = 0.12 + 0.04 * Math.sin(t * 1.6);
      amp += (a - amp) * 0.12; pulseRef.current *= 0.9;
      ctx.clearRect(0, 0, S, S); ctx.globalCompositeOperation = "lighter";
      const cx = S / 2, cy = S / 2, base = 84 + amp * 14;
      const g = ctx.createRadialGradient(cx, cy, base * 0.2, cx, cy, base * 2.2);
      g.addColorStop(0, `hsla(${hue},90%,60%,${0.25 + amp * 0.3})`); g.addColorStop(1, `hsla(${hue},90%,50%,0)`);
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, base * 2.2, 0, 7); ctx.fill();
      for (let L = 0; L < 4; L++) {
        ctx.beginPath();
        const k = 3 + L, ph = L * 1.7, sp = (0.6 + L * 0.25) * (s === "thinking" ? 3 : 1);
        for (let i = 0; i <= 120; i++) {
          const th = (i / 120) * Math.PI * 2;
          const r = base + amp * 34 * Math.sin(k * th + t * sp + ph) + amp * 14 * Math.sin((k + 2) * th - t * sp * 1.3);
          const x = cx + r * Math.cos(th), y = cy + r * Math.sin(th);
          i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
        }
        ctx.closePath();
        const gr = ctx.createRadialGradient(cx - 20, cy - 30, 10, cx, cy, base + 40);
        gr.addColorStop(0, `hsla(${hue + L * 18},95%,${70 - L * 4}%,0.55)`); gr.addColorStop(1, `hsla(${hue - 20 + L * 18},90%,50%,0.12)`);
        ctx.fillStyle = gr; ctx.fill();
      }
      for (let i = 0; i < 26; i++) {
        const th = (i / 26) * Math.PI * 2 + t * (s === "thinking" ? 1.6 : 0.3), rr = base + 46 + 10 * Math.sin(t * 2 + i);
        ctx.fillStyle = `hsla(${hue + i * 3},95%,75%,${0.35 + 0.3 * Math.sin(t * 3 + i)})`;
        ctx.beginPath(); ctx.arc(cx + rr * Math.cos(th), cy + rr * Math.sin(th), 1.6 + (s === "speaking" ? amp * 3 : 0), 0, 7); ctx.fill();
      }
      if (s === "listening" || s === "speaking") {
        for (let i = 0; i < 3; i++) {
          const p = (t * 0.5 + i / 3) % 1;
          ctx.strokeStyle = `hsla(${hue},90%,70%,${(1 - p) * 0.35})`; ctx.lineWidth = 1.5;
          ctx.beginPath(); ctx.arc(cx, cy, base + 10 + p * 70, 0, 7); ctx.stroke();
        }
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);
  return <canvas ref={cv} className="mx-auto aspect-square w-[min(100%,360px)]" />;
}

const css = `
@keyframes eq{0%,100%{transform:scaleY(.25)}50%{transform:scaleY(1)}}
@keyframes ring{0%{transform:scale(.8);opacity:.7}100%{transform:scale(1.9);opacity:0}}
@keyframes floaty{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
.eqbar{width:3px;border-radius:3px;background:currentColor;transform-origin:center;animation:eq 1s ease-in-out infinite}
.callbtn::before,.callbtn::after{content:"";position:absolute;inset:0;border-radius:9999px;border:2px solid #22d3ee;animation:ring 2s ease-out infinite}
.callbtn::after{animation-delay:1s}
`;

/* ---------------- page ---------------- */
export default function Voice() {
  const [phase, setPhase] = useState("idle");
  const [inCall, setInCall] = useState(false);
  const [msgs, setMsgs] = useState([]);
  const [profile, setProfile] = useState({});
  const [engine, setEngine] = useState("");
  const [lead, setLead] = useState({ name: "", phone: "" });
  const [mode, setMode] = useState("inbound");
  const [lang, setLang] = useState("hi-IN");
  const [style, setStyle] = useState("soft");
  const [voices, setVoices] = useState([]);
  const [voiceName, setVoiceName] = useState("");
  const [muted, setMuted] = useState(false);
  const [micOff, setMicOff] = useState(false);
  const [txt, setTxt] = useState("");
  const [interim, setInterim] = useState("");
  const [cap, setCap] = useState({ t: "", n: 0 });
  const [secs, setSecs] = useState(0);
  const [inv, setInv] = useState([]);
  const [saved, setSaved] = useState(null);
  const [err, setErr] = useState("");
  const [ttsOn, setTtsOn] = useState(false);

  const callRef = useRef(false), msgsRef = useRef([]), profRef = useRef({}), recRef = useRef(null), stRef = useRef("idle");
  const levelRef = useRef(0), pulseRef = useRef(0), speakId = useRef(0), t0 = useRef(0), micOffRef = useRef(false);
  const audioRef = useRef({}), fn = useRef({}), boxRef = useRef(), capTimer = useRef();
  stRef.current = phase; micOffRef.current = micOff; profRef.current = profile; msgsRef.current = msgs;

  /* query params: /voice?name=Rahul&phone=98..&mode=outbound */
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    setLead({ name: q.get("name") || "", phone: q.get("phone") || "" });
    if (q.get("mode") === "outbound") setMode("outbound");
  }, []);

  useEffect(() => { fetch("/api/tts").then((r) => r.json()).then((d) => setTtsOn(d.engine === "elevenlabs")).catch(() => {}); }, []);

  /* voices (browser ki inbuilt awaazein) */
  useEffect(() => {
    const load = () => { const v = speechSynthesis.getVoices().filter((x) => /^(hi|en-IN|en_IN)/i.test(x.lang)); setVoices(v); };
    load(); speechSynthesis.onvoiceschanged = load;
    try { setVoiceName(localStorage.getItem("setu_voice") || ""); setStyle(localStorage.getItem("setu_style") || "soft"); } catch {}
  }, []);
  const pickVoice = () => {
    const want = lang.slice(0, 2), pool = voices.filter((v) => v.lang.toLowerCase().startsWith(want) || (want === "en" && /en.in/i.test(v.lang)));
    const list = pool.length ? pool : voices;
    const chosen = list.find((v) => v.name === voiceName);
    if (chosen) return chosen;
    const sc = (v) => (FEMALE.test(v.name) ? 10 : 0) - (MALE.test(v.name) ? 10 : 0) + (/google/i.test(v.name) ? 1 : 0) + (v.lang.toLowerCase().replace("_", "-") === lang.toLowerCase() ? 3 : 0);
    return [...list].sort((a, b) => sc(b) - sc(a))[0];
  };

  /* inventory (matching property cards) */
  useEffect(() => {
    const load = () => fetch("/api/inventory").then((r) => r.json()).then((d) => setInv(d.items || [])).catch(() => {});
    load(); const i = setInterval(load, 2500); return () => clearInterval(i);
  }, []);
  const cr = parseFloat(String(profile.budget || "").replace(/[^\d.]/g, "")) || 0;
  const matches = inv.filter((p) => p.st === "Available" && (!profile.bhk || p.bhk === profile.bhk) && (!cr || p.cr <= cr * 1.15) && (!profile.zone || p.zone.toLowerCase().includes(profile.zone))).slice(0, 3);

  /* call timer + autoscroll */
  useEffect(() => { if (!inCall) return; const i = setInterval(() => setSecs(Math.round((Date.now() - t0.current) / 1000)), 1000); return () => clearInterval(i); }, [inCall]);
  useEffect(() => { boxRef.current?.scrollTo({ top: 1e5, behavior: "smooth" }); }, [msgs.length]);

  /* ---- mic level (orb ko mic pe react karwane ke liye) ---- */
  const initMic = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
      const ac = new (window.AudioContext || window.webkitAudioContext)(), an = ac.createAnalyser(); an.fftSize = 512;
      ac.createMediaStreamSource(stream).connect(an);
      const buf = new Uint8Array(an.fftSize); let raf;
      const tick = () => { an.getByteTimeDomainData(buf); let s = 0; for (const b of buf) { const x = (b - 128) / 128; s += x * x; } levelRef.current += (Math.min(Math.sqrt(s / buf.length) * 4, 1) - levelRef.current) * 0.3; raf = requestAnimationFrame(tick); };
      tick(); audioRef.current = { stream, ac, stop: () => cancelAnimationFrame(raf) };
    } catch { setErr("Mic permission nahi mili — address bar ke lock icon se Microphone Allow karo, ya neeche type karke baat karo."); }
  };
  const stopMic = () => { const a = audioRef.current; a.stop?.(); a.stream?.getTracks().forEach((t) => t.stop()); a.ac?.close?.().catch(() => {}); audioRef.current = {}; levelRef.current = 0; };

  /* ---- bolna: custom/cloned voice (ElevenLabs) ho to wahi, warna browser ki ladki wali awaaz ---- */
  const stopAudio = () => { const a = audioRef.current.el; if (a) { a.onended = null; a.pause(); } audioRef.current.el = null; audioRef.current.vstop?.(); };
  const speak = (text, after, say) => {
    clearInterval(capTimer.current); stopAudio();
    setCap({ t: text, n: 0 });
    const spoken = lang.startsWith("hi") && say ? say : text; // Hindi awaaz ko Devanagari do
    const id = ++speakId.current;
    const reveal = (ms) => { let n = 0; capTimer.current = setInterval(() => { n += 1; setCap({ t: text, n }); if (n >= text.length) clearInterval(capTimer.current); }, ms); };
    const done = () => { if (id !== speakId.current) return; clearInterval(capTimer.current); setCap({ t: text, n: text.length }); after?.(); };
    if (muted) { done(); return; }
    const browserSay = () => {
      const synth = window.speechSynthesis; if (!synth) return done();
      synth.cancel();
      const u = new SpeechSynthesisUtterance(spoken), v = pickVoice(), st = STYLES[style] || STYLES.soft;
      if (v) { u.voice = v; u.lang = v.lang; } else u.lang = lang;
      u.rate = st.rate; u.pitch = st.pitch; u.volume = 1;
      reveal(62);
      u.onstart = () => setPhase("speaking"); u.onboundary = () => { pulseRef.current = 1; };
      u.onend = done; u.onerror = done; synth.speak(u);
    };
    if (!ttsOn) return browserSay();
    (async () => {
      try {
        const r = await fetch("/api/tts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: spoken }) });
        if (!r.ok) throw new Error("tts");
        const blob = await r.blob(); if (id !== speakId.current) return;
        const el = new Audio(URL.createObjectURL(blob)); audioRef.current.el = el;
        // orb ko awaaz ke saath hilao
        try {
          const ac = new (window.AudioContext || window.webkitAudioContext)(), src = ac.createMediaElementSource(el), an = ac.createAnalyser(); an.fftSize = 256; src.connect(an); an.connect(ac.destination);
          const buf = new Uint8Array(an.frequencyBinCount); let raf;
          const tick = () => { an.getByteFrequencyData(buf); pulseRef.current = Math.max(pulseRef.current, (buf.reduce((x, y) => x + y, 0) / buf.length / 255) * 2.2); raf = requestAnimationFrame(tick); };
          tick(); audioRef.current.vstop = () => { cancelAnimationFrame(raf); ac.close().catch(() => {}); };
        } catch {}
        el.onplay = () => { setPhase("speaking"); reveal(Math.max(30, (el.duration ? (el.duration * 1000) / text.length : 62))); };
        el.onended = () => { audioRef.current.vstop?.(); done(); };
        el.onerror = () => { audioRef.current.vstop?.(); browserSay(); };
        await el.play();
      } catch { browserSay(); }
    })();
  };

  /* ---- sunna ---- */
  const listen = () => {
    if (!callRef.current || micOffRef.current) { if (callRef.current) setPhase("listening"); return; }
    const R = window.SpeechRecognition || window.webkitSpeechRecognition;
    setPhase("listening");
    if (!R) { setErr("Is browser me voice recognition nahi hai — Chrome use karo, ya neeche type karo."); return; }
    try { recRef.current?.abort(); } catch {}
    const r = new R(); r.lang = lang; r.interimResults = true; r.continuous = false;
    let fin = "";
    r.onresult = (e) => { let it = ""; for (let i = e.resultIndex; i < e.results.length; i++) { const x = e.results[i]; if (x.isFinal) fin += x[0].transcript; else it += x[0].transcript; } setInterim(it || fin); };
    r.onend = () => { setInterim(""); if (!callRef.current || stRef.current !== "listening") return; if (fin.trim()) fn.current.ask(fin.trim()); else if (!micOffRef.current) setTimeout(() => callRef.current && stRef.current === "listening" && fn.current.listen(), 250); };
    r.onerror = (e) => { if (e.error === "not-allowed" || e.error === "service-not-allowed") setErr("Mic permission do (lock icon → Microphone → Allow)."); };
    recRef.current = r; try { r.start(); } catch {}
  };

  const addMsg = (m) => setMsgs((x) => { const n = [...x, m]; msgsRef.current = n; return n; });
  const mergeProfile = (it = {}) => setProfile((p) => { const n = { ...p, ...Object.fromEntries(Object.entries(it).filter(([k, v]) => v && k !== "end")) }; profRef.current = n; return n; });

  const ask = async (text) => {
    if (!text.trim() || !callRef.current) return;
    try { recRef.current?.abort(); } catch {}
    window.speechSynthesis?.cancel(); stopAudio(); speakId.current++;
    const hist = msgsRef.current.filter((m) => !m.open).map((m) => ({ role: m.r, content: m.t }));
    addMsg({ r: "user", t: text }); setPhase("thinking");
    let o;
    try { o = await fetch("/api/brain", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text, name: lead.name || "Customer", history: hist, mode, lang }) }).then((r) => r.json()); }
    catch { o = { reply: "Maaf kijiye, network me thodi dikkat aa gayi. Kya aap dobara bol sakte hain?", intent: {} }; }
    if (!callRef.current) return;
    addMsg({ r: "assistant", t: o.reply }); mergeProfile(o.intent); setEngine(o.mode);
    speak(o.reply, () => (o.intent?.end ? fn.current.endCall() : fn.current.listen()), o.speak);
  };

  const startCall = async () => {
    setErr(""); setSaved(null); setMsgs([]); msgsRef.current = []; setProfile({}); profRef.current = {}; setSecs(0); t0.current = Date.now();
    callRef.current = true; setInCall(true); setPhase("connecting");
    await initMic();
    let op = "Namaste! Main Aanya hu, KMA Global Property se. Boliye, kaisi property dhoondh rahe hain?";
    let opSay = "";
    try { const o = await fetch(`/api/brain?name=${encodeURIComponent(lead.name)}&mode=${mode}`).then((r) => r.json()); op = o.opener; opSay = o.openerSpeak; } catch {}
    addMsg({ r: "assistant", t: op, open: true });
    speak(op, () => fn.current.listen(), opSay);
  };

  const endCall = async () => {
    if (!callRef.current) return;
    callRef.current = false; setInCall(false); setPhase("idle"); setInterim("");
    window.speechSynthesis?.cancel(); stopAudio(); speakId.current++; clearInterval(capTimer.current);
    try { recRef.current?.abort(); } catch {} stopMic();
    const tr = msgsRef.current.map(({ r, t }) => ({ r, t }));
    if (tr.some((m) => m.r === "user")) {
      try {
        const j = await fetch("/api/aicalls", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: lead.name || "Customer", phone: lead.phone, transcript: tr, profile: profRef.current, duration: Math.round((Date.now() - t0.current) / 1000), mode }) }).then((r) => r.json());
        setSaved(j.call);
      } catch {}
    }
  };
  fn.current = { ask, listen, endCall };
  useEffect(() => () => { callRef.current = false; window.speechSynthesis?.cancel(); stopAudio(); stopMic(); }, []);

  const toggleMic = () => { const v = !micOff; setMicOff(v); micOffRef.current = v; if (v) { try { recRef.current?.abort(); } catch {} } else if (stRef.current === "listening") fn.current.listen(); };
  const send = () => { const t = txt.trim(); if (!t) return; setTxt(""); fn.current.ask(t); };

  const sc = calcScore(profile), ring = 2 * Math.PI * 34;
  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  const glow = `radial-gradient(520px circle at 50% 38%, hsla(${HUE[phase]},90%,55%,.16), transparent 70%)`;
  const showEq = phase === "speaking" || phase === "listening";

  return (
    <div>
      <style>{css}</style>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="eyebrow">Voice agent</div>
          <h1 className="mt-1 text-4xl font-extrabold">Aanya <span className="text-brand">· SETU voice AI</span></h1>
          <p className="mt-1 text-slate-400">Hindi/Hinglish me baat karti hai, live inventory dekh ke jawab deti hai aur lead profile + score khud banati hai.</p>
        </div>
        <div className="flex items-center gap-2">
          <a href="/voicelab" className={`pill border ${ttsOn ? "border-brand text-brand" : "border-slate-600 text-slate-300"}`}>{ttsOn ? "Custom voice ✓" : "Voice lab →"}</a>
          <span className={`pill border ${engine === "claude" ? "border-brand text-brand" : "border-amber/40 text-amber"}`}>{engine === "claude" ? "Claude LIVE" : engine === "rules" ? "Rules mode" : "AI ready"}</span>
          <a href="/aicalls" className="pill border border-slate-600 text-slate-300">Call log →</a>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        {/* ================= STAGE ================= */}
        <div className="card relative flex min-h-[640px] flex-col overflow-hidden" style={{ background: glow, transition: "background 1.2s" }}>
          {!inCall && (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex rounded-xl border border-slate-700 p-1 text-sm sm:col-span-2">
                {[["inbound", "Customer call kar raha hai"], ["outbound", "Aanya customer ko call kar rahi hai"]].map(([k, l]) => (
                  <button key={k} onClick={() => setMode(k)} className={`flex-1 rounded-lg px-3 py-2 ${mode === k ? "bg-brand font-bold text-black" : "text-slate-400"}`}>{l}</button>))}
              </div>
              <input className="input" placeholder="Lead ka naam (optional)" value={lead.name} onChange={(e) => setLead({ ...lead, name: e.target.value })} />
              <input className="input" placeholder="Phone (optional)" value={lead.phone} onChange={(e) => setLead({ ...lead, phone: e.target.value })} />
              <select className="input" value={lang} onChange={(e) => setLang(e.target.value)}><option value="hi-IN">Hindi / Hinglish</option><option value="en-IN">English (India)</option></select>
              <select className="input" value={style} onChange={(e) => { setStyle(e.target.value); try { localStorage.setItem("setu_style", e.target.value); } catch {} }}>{Object.entries(STYLES).map(([k, v]) => <option key={k} value={k}>Awaaz: {v.n}</option>)}</select>
              <select className="input sm:col-span-2" value={voiceName} onChange={(e) => { setVoiceName(e.target.value); try { localStorage.setItem("setu_voice", e.target.value); } catch {} }}>
                <option value="">Auto — sabse soft ladki ki awaaz{pickVoice() ? ` (${pickVoice().name})` : ""}</option>
                {voices.map((v) => <option key={v.name + v.lang} value={v.name}>{v.name} · {v.lang}</option>)}
              </select>
            </div>
          )}

          <div className="relative mt-2 flex flex-1 flex-col items-center justify-center">
            <div style={{ animation: "floaty 6s ease-in-out infinite" }} className="w-full"><Orb state={phase} levelRef={levelRef} pulseRef={pulseRef} /></div>
            <div className="-mt-4 flex items-center gap-2 font-mono text-xs uppercase tracking-widest" style={{ color: `hsl(${HUE[phase]},90%,70%)` }}>
              <span className="flex h-4 items-center gap-[3px]">{showEq && Array.from({ length: 9 }).map((_, i) => <i key={i} className="eqbar" style={{ height: 16, animationDelay: `${i * 0.11}s`, animationDuration: `${0.6 + (i % 4) * 0.2}s` }} />)}</span>
              {LABEL[phase]}{inCall && <span className="text-slate-500"> · {fmt(secs)}</span>}
            </div>
            <div className="mt-3 min-h-[64px] max-w-xl px-4 text-center">
              <AnimatePresence mode="wait">
                {interim ? <motion.p key="i" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-lg italic text-sky-300">“{interim}”</motion.p>
                  : cap.t ? <motion.p key={cap.t} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="text-lg font-medium text-slate-100">{cap.t.slice(0, cap.n)}<span className="text-slate-600">{cap.t.slice(cap.n)}</span></motion.p>
                    : <p className="text-slate-500">{inCall ? "…" : "“Call shuru karo” dabao — Aanya khud baat shuru karegi."}</p>}
              </AnimatePresence>
            </div>
            {err && <div className="mt-2 max-w-md text-center text-sm text-amber">{err}</div>}
          </div>

          {/* controls */}
          <div className="mt-3 flex flex-col items-center gap-3">
            {!inCall ? (
              <button onClick={startCall} className="callbtn relative grid h-20 w-20 place-items-center rounded-full bg-brand text-black shadow-[0_0_50px_rgba(34,211,238,.5)] transition hover:scale-105"><Phone size={30} /></button>
            ) : (
              <div className="flex items-center gap-4">
                <button onClick={toggleMic} className={`grid h-12 w-12 place-items-center rounded-full border ${micOff ? "border-red-500/50 text-red-400" : "border-slate-600 text-slate-200"}`} title="Mic on/off">{micOff ? <MicOff size={20} /> : <Mic size={20} />}</button>
                <button onClick={endCall} className="grid h-16 w-16 place-items-center rounded-full bg-red-500 text-white shadow-[0_0_40px_rgba(239,68,68,.45)] hover:scale-105"><PhoneOff size={26} /></button>
                <button onClick={() => { setMuted(!muted); window.speechSynthesis?.cancel(); }} className="grid h-12 w-12 place-items-center rounded-full border border-slate-600 text-slate-200" title="Aanya ki awaaz on/off">{muted ? <VolumeX size={20} /> : <Volume2 size={20} />}</button>
              </div>
            )}
            {inCall && (
              <>
                <div className="flex flex-wrap justify-center gap-2">{CHIPS.map((c) => <button key={c} onClick={() => ask(c)} className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300 hover:border-brand hover:text-brand">{c}</button>)}</div>
                <div className="flex w-full max-w-xl gap-2"><input className="input" placeholder="Ya yahan type karo…" value={txt} onChange={(e) => setTxt(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} /><button className="btn" onClick={send}><Send size={16} /></button></div>
              </>
            )}
          </div>

          {msgs.length > 0 && (
            <div ref={boxRef} className="mt-4 max-h-44 space-y-2 overflow-y-auto border-t border-slate-800 pt-3">
              {msgs.map((m, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`max-w-[82%] rounded-2xl px-3 py-2 text-sm ${m.r === "user" ? "ml-auto bg-white/10" : "border border-brand/30 bg-cyan-900/40"}`}>{m.t}</motion.div>))}
            </div>
          )}
        </div>

        {/* ================= SIDE ================= */}
        <div className="space-y-4">
          <div className="card">
            <div className="flex items-center gap-4">
              <svg width="84" height="84" viewBox="0 0 84 84" className="-rotate-90">
                <circle cx="42" cy="42" r="34" stroke="#1e293b" strokeWidth="7" fill="none" />
                <motion.circle cx="42" cy="42" r="34" strokeWidth="7" fill="none" strokeLinecap="round" stroke={sc.label === "HOT" ? "#f97316" : sc.label === "WARM" ? "#f59e0b" : "#38bdf8"} strokeDasharray={ring} animate={{ strokeDashoffset: ring * (1 - sc.s / 100) }} transition={{ type: "spring", stiffness: 60, damping: 14 }} />
              </svg>
              <div>
                <div className="text-xs uppercase text-slate-500">Lead score</div>
                <motion.div key={sc.s} initial={{ scale: 1.35 }} animate={{ scale: 1 }} className="text-3xl font-extrabold">{sc.s}</motion.div>
                <div className={`flex items-center gap-1 text-xs font-bold ${sc.label === "HOT" ? "text-orange-400" : sc.label === "WARM" ? "text-amber" : "text-sky-400"}`}>{sc.label === "HOT" && <Flame size={14} />}{sc.label}</div>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              {[["BHK", "bhk"], ["Budget", "budget"], ["Zone", "zone"], ["Timeline", "timeline"], ["Site visit", "visit"]].map(([l, k]) => (
                <div key={k} className="flex justify-between border-b border-slate-800 pb-2 text-sm">
                  <span className="text-slate-500">{l}</span>
                  <motion.b key={String(profile[k])} initial={{ scale: 1.5, color: "#22d3ee" }} animate={{ scale: 1, color: "#e2e8f0" }}>{profile[k] === true ? "Yes ✓" : profile[k] || "—"}</motion.b>
                </div>))}
            </div>
          </div>

          <div className="card">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold"><Sparkles size={15} className="text-brand" />Live matching properties</div>
            <AnimatePresence>
              {matches.map((p) => (
                <motion.div key={p.id} layout initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="mb-2 rounded-xl border border-brand/30 bg-emerald-900/20 p-3 text-sm">
                  <div className="flex justify-between"><b>{p.t}</b><span className="text-brand">{p.price}</span></div>
                  <div className="text-xs text-slate-400">{p.bhk} BHK · {p.zone} · {p.cp}</div>
                </motion.div>))}
            </AnimatePresence>
            {!matches.length && <p className="text-xs text-slate-500">Requirement batane par yahan available units aayenge. CP portal me status badlo — yahan turant badlega.</p>}
          </div>

          <AnimatePresence>
            {saved && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card border-brand/40">
                <div className="text-xs uppercase text-brand">Call save ho gayi · {saved.label} ({saved.score})</div>
                <p className="mt-2 text-sm">{saved.summary}</p>
                <p className="mt-2 text-sm text-slate-400"><b className="text-slate-200">Next:</b> {saved.next}</p>
                <a href="/aicalls" className="mt-2 inline-block text-xs text-sky-400">Poora transcript dekho →</a>
              </motion.div>)}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
