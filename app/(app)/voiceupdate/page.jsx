"use client";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Square, Sparkles, Check, CalendarClock, Flame } from "lucide-react";

const tempTone = { hot: "text-orange-400", warm: "text-amber", cold: "text-sky-400" };
const eq = `@keyframes eq2{0%,100%{transform:scaleY(.2)}50%{transform:scaleY(1)}}.eq2{width:4px;height:28px;border-radius:4px;background:#22d3ee;animation:eq2 .9s ease-in-out infinite;transform-origin:center}
@keyframes pr{0%{transform:scale(.9);opacity:.6}100%{transform:scale(2);opacity:0}}.pr::before,.pr::after{content:"";position:absolute;inset:0;border-radius:9999px;border:2px solid #ef4444;animation:pr 1.8s ease-out infinite}.pr::after{animation-delay:.9s}`;
const ago = (t) => { const m = Math.round((Date.now() - t) / 60000); return m < 1 ? "abhi" : m < 60 ? `${m} min pehle` : `${Math.round(m / 60)} ghante pehle`; };

export default function VoiceUpdate() {
  const [leads, setLeads] = useState([]);
  const [leadId, setLeadId] = useState("");
  const [lang, setLang] = useState("hi-IN");
  const [rec, setRec] = useState(false);
  const [text, setText] = useState("");
  const [interim, setInterim] = useState("");
  const [prop, setProp] = useState(null);
  const [busy, setBusy] = useState(false);
  const [auto, setAuto] = useState(false);
  const [toast, setToast] = useState("");
  const [tl, setTl] = useState({ entries: [], tasks: [], stages: [], labels: {} });
  const [by, setBy] = useState("Vishal");
  const recRef = useRef(), recOn = useRef(false), textRef = useRef(""), langRef = useRef(lang);
  textRef.current = text; langRef.current = lang;

  useEffect(() => { try { setAuto(localStorage.getItem("setu_vu_auto") === "1"); setBy(localStorage.getItem("setu_vu_by") || "Vishal"); } catch {} }, []);
  const loadTl = () => fetch("/api/voiceupdate").then((r) => r.json()).then(setTl).catch(() => {});
  useEffect(() => {
    fetch("/api/leads").then((r) => r.json()).then((j) => setLeads((Array.isArray(j) ? j : j.leads || []).map((l) => ({ id: l.id, name: l.name || `Lead ${l.id}`, status: l.status || l.type || "" })))).catch(() => {});
    loadTl(); const i = setInterval(loadTl, 4000); return () => clearInterval(i);
  }, []);
  const flash = (m) => { setToast(m); setTimeout(() => setToast(""), 3500); };
  const lead = leads.find((l) => String(l.id) === String(leadId));

  /* ---- bolna (dictation) ---- */
  const startRec = () => {
    const R = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!R) return flash("Chrome me kholo, ya neeche type karo.");
    setProp(null); recOn.current = true; setRec(true);
    const go = () => {
      const r = new R(); r.lang = langRef.current; r.continuous = true; r.interimResults = true;
      r.onresult = (e) => { let it = "", fin = ""; for (let i = e.resultIndex; i < e.results.length; i++) { const x = e.results[i]; if (x.isFinal) fin += x[0].transcript + " "; else it += x[0].transcript; } if (fin) setText((t) => (t + " " + fin).trim()); setInterim(it); };
      r.onend = () => { setInterim(""); if (recOn.current) setTimeout(go, 150); };
      r.onerror = (e) => { if (e.error === "not-allowed") { recOn.current = false; setRec(false); flash("Mic permission do (lock icon → Microphone → Allow)."); } };
      recRef.current = r; try { r.start(); } catch {}
    };
    go();
  };
  const stopRec = () => { recOn.current = false; setRec(false); try { recRef.current?.stop(); } catch {} setTimeout(() => { if (textRef.current.trim()) understand(textRef.current); }, 700); };

  /* ---- samajhna ---- */
  const understand = async (t = text) => {
    if (!t.trim()) return;
    setBusy(true);
    const r = await fetch("/api/voiceupdate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ transcript: t, leadId: leadId || null, leads }) });
    const j = await r.json(); setBusy(false);
    if (!j.proposal) return flash(j.error || "Samajh nahi aaya");
    const p = j.proposal; setProp(p);
    if (auto && p.leadId && (p.confidence ?? 0) >= 0.8 && !(p.missing || []).length) apply(p, t);
  };

  const apply = async (p = prop, t = text) => {
    const id = p.leadId || leadId; const l = leads.find((x) => String(x.id) === String(id));
    if (!id) return flash("Pehle lead chuno");
    const r = await fetch("/api/voiceupdate", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ leadId: id, leadName: l?.name || "", update: p, by, transcript: t }) });
    const j = await r.json();
    if (j.ok) { flash(`✓ ${l?.name || "Lead"} update ho gaya${j.tasksAdded ? ` · ${j.tasksAdded} follow-up task` : ""}`); setProp(null); setText(""); loadTl(); } else flash(j.error || "Error");
  };
  const toggleTask = async (id, done) => { await fetch("/api/voiceupdate", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ taskId: id, done }) }); loadTl(); };
  const up = (k, v) => setProp((p) => ({ ...p, [k]: v }));
  const upN = (k, f, v) => setProp((p) => ({ ...p, [k]: { ...(p[k] || {}), [f]: v || null } }));

  const entries = tl.entries.filter((e) => !leadId || String(e.leadId) === String(leadId));
  const open = tl.tasks.filter((t) => !t.done);

  return (
    <div>
      <style>{eq}</style>
      <div className="eyebrow">Zero-typing CRM</div>
      <h1 className="mt-1 text-4xl font-extrabold">Voice update</h1>
      <p className="mt-2 max-w-2xl text-slate-400">Visit ke baad bas bolo: “Rahul Sharma ko Golf Course Road dikhaya, 3 BHK pasand aaya, budget 3.5 crore, kal shaam 5 baje dobara call karna.” Baaki stage, notes, visit, follow-up task sab apne aap bharta hai.</p>

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
        <div className="space-y-4">
          <div className="card space-y-4">
            <div className="grid gap-2 sm:grid-cols-3">
              <select className="input sm:col-span-2" value={leadId} onChange={(e) => setLeadId(e.target.value)}>
                <option value="">Auto-detect (bolte waqt lead ka naam lo)</option>
                {leads.map((l) => <option key={l.id} value={l.id}>{l.name}{l.status ? ` · ${l.status}` : ""}</option>)}
              </select>
              <select className="input" value={lang} onChange={(e) => setLang(e.target.value)}><option value="hi-IN">Hindi / Hinglish</option><option value="en-IN">English</option></select>
            </div>

            <div className="flex flex-col items-center gap-3 py-2">
              <div className="relative">
                {!rec ? <button onClick={startRec} className="grid h-24 w-24 place-items-center rounded-full bg-brand text-black shadow-[0_0_50px_rgba(34,211,238,.45)] transition hover:scale-105"><Mic size={36} /></button>
                  : <button onClick={stopRec} className="pr relative grid h-24 w-24 place-items-center rounded-full bg-red-500 text-white"><Square size={30} /></button>}
              </div>
              <div className="flex h-8 items-center gap-1">{rec ? Array.from({ length: 14 }).map((_, i) => <i key={i} className="eq2" style={{ animationDelay: `${i * 0.07}s`, animationDuration: `${0.6 + (i % 5) * 0.15}s` }} />) : null}</div>
              <div className="text-sm text-slate-400">{rec ? "Sun rahi hu… bolte raho, khatam hone par ■ dabao" : "Mic dabao aur apni update bolo"}</div>
            </div>

            <textarea rows={4} className="input" placeholder="Ya yahan type karo / bola hua text edit karo…" value={text + (interim ? " " + interim : "")} onChange={(e) => setText(e.target.value)} />
            <div className="flex flex-wrap items-center gap-3">
              <button disabled={busy || !text.trim()} onClick={() => understand()} className="btn flex items-center gap-2 disabled:opacity-40"><Sparkles size={16} />{busy ? "Samajh rahi hu…" : "Samjho"}</button>
              <label className="flex items-center gap-2 text-sm text-slate-400"><input type="checkbox" checked={auto} onChange={(e) => { setAuto(e.target.checked); try { localStorage.setItem("setu_vu_auto", e.target.checked ? "1" : "0"); } catch {} }} />Pakka ho to khud update kar do</label>
              <input className="input !w-28 text-sm" value={by} onChange={(e) => { setBy(e.target.value); try { localStorage.setItem("setu_vu_by", e.target.value); } catch {} }} title="Kisne update kiya" />
            </div>
          </div>

          <AnimatePresence>
            {prop && (
              <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="card space-y-3 border-brand/40">
                <div className="flex items-center justify-between">
                  <div className="font-bold">AI ne ye samjha <span className="text-xs font-normal text-slate-500">({prop.mode === "claude" ? "Claude" : "rules"} · confidence {Math.round((prop.confidence ?? 0) * 100)}%)</span></div>
                  {prop.temperature && <span className={`flex items-center gap-1 text-xs font-bold uppercase ${tempTone[prop.temperature]}`}>{prop.temperature === "hot" && <Flame size={13} />}{prop.temperature}</span>}
                </div>
                {!!prop.missing?.length && <div className="text-sm text-amber">Ye clear nahi tha: {prop.missing.join(", ")} — neeche theek kar lo.</div>}
                <div className="grid gap-2 sm:grid-cols-2">
                  <label className="text-xs uppercase text-slate-500">Lead
                    <select className="input mt-1" value={prop.leadId || ""} onChange={(e) => up("leadId", e.target.value)}><option value="">— chuno —</option>{leads.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}</select></label>
                  <label className="text-xs uppercase text-slate-500">Stage
                    <select className="input mt-1" value={prop.stage || ""} onChange={(e) => up("stage", e.target.value || null)}><option value="">(badalna nahi)</option>{tl.stages.map((s) => <option key={s} value={s}>{tl.labels[s]}</option>)}</select></label>
                </div>
                <label className="block text-xs uppercase text-slate-500">Note
                  <textarea rows={2} className="input mt-1" value={prop.summary || ""} onChange={(e) => up("summary", e.target.value)} /></label>
                <div className="grid gap-2 sm:grid-cols-3">
                  <label className="text-xs uppercase text-slate-500">Budget<input className="input mt-1" value={prop.budget || ""} onChange={(e) => up("budget", e.target.value || null)} /></label>
                  <label className="text-xs uppercase text-slate-500">BHK<input className="input mt-1" value={prop.bhk || ""} onChange={(e) => up("bhk", +e.target.value || null)} /></label>
                  <label className="text-xs uppercase text-slate-500">Zone<input className="input mt-1" value={prop.zone || ""} onChange={(e) => up("zone", e.target.value || null)} /></label>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="rounded-lg border border-slate-700 p-2"><div className="mb-1 flex items-center gap-1 text-xs uppercase text-slate-500"><CalendarClock size={12} />Site visit {prop.siteVisit?.done && "(ho chuki)"}</div>
                    <div className="flex gap-2"><input type="date" className="input" value={prop.siteVisit?.date || ""} onChange={(e) => upN("siteVisit", "date", e.target.value)} /><input type="time" className="input" value={prop.siteVisit?.time || ""} onChange={(e) => upN("siteVisit", "time", e.target.value)} /></div></div>
                  <div className="rounded-lg border border-slate-700 p-2"><div className="mb-1 text-xs uppercase text-slate-500">Follow-up</div>
                    <div className="flex gap-2"><input type="date" className="input" value={prop.followUp?.date || ""} onChange={(e) => upN("followUp", "date", e.target.value)} /><input type="time" className="input" value={prop.followUp?.time || ""} onChange={(e) => upN("followUp", "time", e.target.value)} /></div></div>
                </div>
                {!!prop.objections?.length && <div className="flex flex-wrap gap-2">{prop.objections.map((o, i) => <span key={i} className="rounded-full bg-red-500/15 px-2 py-0.5 text-xs text-red-300">⚠ {o}</span>)}</div>}
                {!!prop.tasks?.length && <div className="text-sm"><div className="mb-1 text-xs uppercase text-slate-500">Tasks jo ban jayenge</div>{prop.tasks.map((t, i) => <div key={i} className="text-slate-300">• {t.title}{t.due ? ` — ${t.due}` : ""}{t.time ? ` ${t.time}` : ""}</div>)}</div>}
                <div className="flex gap-2"><button onClick={() => apply()} className="btn flex items-center gap-2"><Check size={16} />Lead update karo</button><button onClick={() => setProp(null)} className="rounded-lg border border-slate-600 px-3 py-2 text-sm">Cancel</button></div>
              </motion.div>)}
          </AnimatePresence>
        </div>

        <div className="space-y-4">
          <div className="card">
            <div className="mb-2 text-lg font-bold">Follow-ups <span className="text-sm font-normal text-slate-500">({open.length} pending)</span></div>
            {!open.length && <p className="text-sm text-slate-500">Koi pending task nahi.</p>}
            {open.slice(0, 8).map((t) => (
              <label key={t.id} className="flex items-start gap-2 border-b border-slate-800 py-2 text-sm"><input type="checkbox" className="mt-1" onChange={() => toggleTask(t.id, true)} /><span><b>{t.leadName || "Lead"}</b> — {t.title}<span className="block text-xs text-slate-500">{t.due || "date nahi"} {t.time || ""}</span></span></label>))}
          </div>
          <div className="card">
            <div className="mb-3 text-lg font-bold">Lead timeline {lead && <span className="text-sm font-normal text-brand">· {lead.name}</span>}</div>
            {!entries.length && <p className="text-sm text-slate-500">Abhi koi voice update nahi.</p>}
            <div className="space-y-3">
              {entries.slice(0, 20).map((e) => (
                <motion.div key={e.id} initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} className="border-l-2 border-brand/50 pl-3 text-sm">
                  <div className="flex justify-between"><b>{e.leadName || `Lead ${e.leadId}`}</b><span className="text-xs text-slate-500">{e.by} · {ago(e.at)}</span></div>
                  <div className="text-slate-300">{e.summary}</div>
                  <div className="mt-1 flex flex-wrap gap-1 text-xs">
                    {e.stage && <span className="rounded-full bg-brand/20 px-2 py-0.5 text-brand">{tl.labels[e.stage] || e.stage}</span>}
                    {e.siteVisit?.date && <span className="rounded-full bg-white/10 px-2 py-0.5">visit {e.siteVisit.date} {e.siteVisit.time || ""}</span>}
                    {e.followUp?.date && <span className="rounded-full bg-white/10 px-2 py-0.5">follow-up {e.followUp.date}</span>}
                    {e.budget && <span className="rounded-full bg-white/10 px-2 py-0.5">{e.budget}</span>}
                  </div>
                </motion.div>))}
            </div>
          </div>
        </div>
      </div>
      <AnimatePresence>{toast && <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="fixed bottom-6 right-6 z-50 rounded-xl border border-brand bg-slate-900 px-4 py-3 text-sm shadow-xl">{toast}</motion.div>}</AnimatePresence>
    </div>
  );
}
