"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, Flame, Clock, X } from "lucide-react";

const tone = { HOT: "text-orange-400 border-orange-400/40", WARM: "text-amber border-amber/40", COLD: "text-sky-400 border-sky-400/40" };
const fmt = (s) => `${Math.floor(s / 60)}m ${s % 60}s`;
const why = { "no-reply": "WhatsApp pe jawab nahi aaya", manual: "Manual" };

export default function AiCalls() {
  const [d, setD] = useState({ calls: [], jobs: [], provider: "manual" });
  const [open, setOpen] = useState(null);
  const [f, setF] = useState({ name: "", phone: "" });
  const load = () => fetch("/api/aicalls").then((r) => r.json()).then(setD).catch(() => {});
  useEffect(() => { load(); const i = setInterval(load, 2000); return () => clearInterval(i); }, []);
  const patch = async (id, action) => { await fetch("/api/aicalls", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, action }) }); load(); };
  const add = async () => { if (!f.phone.trim()) return; await fetch("/api/aicalls", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "enqueue", ...f }) }); setF({ name: "", phone: "" }); load(); };
  const callNow = (j) => { window.open(`/voice?mode=outbound&name=${encodeURIComponent(j.name || "")}&phone=${j.phone}`, "_blank"); patch(j.id, "done"); };
  const queued = d.jobs.filter((j) => j.state === "queued");

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="eyebrow">AI calling</div>
          <h1 className="mt-1 text-4xl font-extrabold">Calls & outbound queue</h1>
          <p className="mt-1 text-slate-400">Har AI call ka transcript, summary, score aur next action. Campaign me jawab na dene wale leads yahan queue me aate hain.</p>
        </div>
        <span className={`pill border ${d.provider === "exotel" ? "border-brand text-brand" : "border-amber/40 text-amber"}`}>{d.provider === "exotel" ? "Telephony: Exotel" : "Telephony: manual (browser demo)"}</span>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        {/* ---- call log ---- */}
        <div className="space-y-3">
          <div className="text-lg font-bold">Call log <span className="text-sm font-normal text-slate-500">({d.calls.length})</span></div>
          {!d.calls.length && <div className="card text-sm text-slate-500">Abhi koi call nahi. <a href="/voice" className="text-sky-400">/voice</a> pe call karke dekho.</div>}
          {d.calls.map((c) => (
            <motion.div key={c.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card">
              <button className="w-full text-left" onClick={() => setOpen(open === c.id ? null : c.id)}>
                <div className="flex items-center justify-between">
                  <div><b>{c.name}</b> <span className="text-xs text-slate-500">{c.phone && `+${c.phone} · `}{c.mode} · {fmt(c.duration)} · {new Date(c.at).toLocaleTimeString()}</span></div>
                  <span className={`pill border ${tone[c.label]}`}>{c.label === "HOT" && <Flame size={12} className="mr-1 inline" />}{c.label} {c.score}</span>
                </div>
                <p className="mt-2 text-sm">{c.summary}</p>
                <p className="mt-1 text-sm text-slate-400"><b className="text-slate-200">Next:</b> {c.next}</p>
                <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-400">
                  {["bhk", "budget", "zone", "timeline"].map((k) => c.profile[k] && <span key={k} className="rounded-full bg-white/5 px-2 py-0.5">{k}: {c.profile[k]}</span>)}
                  {c.profile.visit && <span className="rounded-full bg-brand/20 px-2 py-0.5 text-brand">site visit ✓</span>}
                </div>
              </button>
              <AnimatePresence>
                {open === c.id && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="mt-3 space-y-2 border-t border-slate-800 pt-3">
                      {c.transcript.map((m, i) => <div key={i} className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${m.r === "user" ? "ml-auto bg-white/10" : "bg-cyan-900/40"}`}><span className="block text-[10px] uppercase text-slate-500">{m.r === "user" ? "Customer" : "Aanya"}</span>{m.t}</div>)}
                    </div>
                  </motion.div>)}
              </AnimatePresence>
            </motion.div>))}
        </div>

        {/* ---- outbound queue ---- */}
        <div className="space-y-3">
          <div className="text-lg font-bold">Outbound queue <span className="text-sm font-normal text-slate-500">({queued.length} pending)</span></div>
          <div className="card space-y-2">
            <div className="text-xs uppercase text-slate-500">Queue me lead daalo</div>
            <div className="flex gap-2"><input className="input" placeholder="Naam" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /><input className="input" placeholder="Phone" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} onKeyDown={(e) => e.key === "Enter" && add()} /><button className="btn" onClick={add}>Add</button></div>
          </div>
          <AnimatePresence>
            {d.jobs.map((j) => (
              <motion.div key={j.id} layout initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className={`card ${j.state !== "queued" ? "opacity-50" : ""}`}>
                <div className="flex items-center justify-between">
                  <div><b>{j.name || "Lead"}</b> <span className="text-xs text-slate-500">+{j.phone}</span></div>
                  <span className="flex items-center gap-1 text-xs uppercase text-slate-400"><Clock size={12} />{j.state}</span>
                </div>
                <div className="mt-1 text-xs text-slate-400">{why[j.reason] || j.reason}{j.note && ` · ${j.note}`}</div>
                {j.state === "queued" && (
                  <div className="mt-2 flex gap-2 text-sm">
                    <button onClick={() => callNow(j)} className="flex items-center gap-1 rounded-lg bg-brand px-3 py-1 font-bold text-black"><Phone size={14} />AI se call karo</button>
                    {d.provider === "exotel" && <button onClick={() => patch(j.id, "dial")} className="rounded-lg border border-slate-600 px-3 py-1">Real dial (Exotel)</button>}
                    <button onClick={() => patch(j.id, "cancel")} className="rounded-lg border border-red-500/40 px-2 py-1 text-red-400"><X size={14} /></button>
                  </div>)}
              </motion.div>))}
          </AnimatePresence>
          {!d.jobs.length && <div className="card text-sm text-slate-500">Queue khali hai. Campaign banate waqt "Jawab na aaye to AI call" tick karo.</div>}
          <p className="text-xs text-slate-500">Manual mode me "AI se call karo" /voice kholta hai jahan Aanya us lead ka naam lekar baat shuru karti hai (tum lead ban ke test karo). Asli phone call ke liye telephony account (Exotel/MyOperator/Twilio) chahiye.</p>
        </div>
      </div>
    </div>
  );
}
