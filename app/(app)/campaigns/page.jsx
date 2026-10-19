"use client";
import { useEffect, useRef, useState } from "react";

const SAMPLE = `name,phone,zone
Rahul Sharma,9876543210,Golf Course Road
Priya Iyer,98111 22233,Sohna Road
Aditya Gupta,+91 98123 10000,DLF Phase 5`;

const stateColor = { draft: "text-slate-400", running: "text-brand", paused: "text-amber", done: "text-sky-400" };

export default function Campaigns() {
  const [list, setList] = useState([]);
  const [meta, setMeta] = useState({});
  const [sel, setSel] = useState(null);
  const [det, setDet] = useState(null);
  const [f, setF] = useState({ name: "", text: "Namaste {{name}} ji! KMA Global Property ki taraf se ek khaas update. Details ke liye reply karein. Band karne ke liye STOP likhein.", contactsText: "", rate: 5, metaTemplate: "", params: "", callFallback: false, callAfterMin: 30 });
  const [dry, setDry] = useState(null);
  const [goal, setGoal] = useState("");
  const [vars, setVars] = useState([]);
  const [busy, setBusy] = useState("");
  const [err, setErr] = useState("");
  const fileRef = useRef();

  const load = async () => {
    try {
      const r = await (await fetch("/api/campaigns")).json(); setList(r.items || []); setMeta(r);
      if (sel) setDet(await (await fetch("/api/campaigns?id=" + sel)).json());
    } catch {}
  };
  useEffect(() => { load(); const t = setInterval(load, 1500); return () => clearInterval(t); }, [sel]);

  // contacts badalte hi dry-run (kitne valid / dupes / bad + preview)
  useEffect(() => {
    if (!f.contactsText.trim()) { setDry(null); return; }
    const t = setTimeout(async () => {
      const r = await fetch("/api/campaigns", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ dryRun: true, text: f.text, contactsText: f.contactsText }) });
      setDry(await r.json());
    }, 400);
    return () => clearTimeout(t);
  }, [f.contactsText, f.text]);

  const upd = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const onFile = (e) => { const x = e.target.files[0]; if (!x) return; const rd = new FileReader(); rd.onload = () => setF((p) => ({ ...p, contactsText: String(rd.result) })); rd.readAsText(x); };

  const draft = async () => {
    if (!goal.trim()) return; setBusy("draft");
    const r = await (await fetch("/api/campaigns/draft", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ goal }) })).json();
    setVars(r.variants || []); setBusy("");
  };
  const fromLeads = async () => {
    try {
      const j = await (await fetch("/api/leads")).json(); const a = Array.isArray(j) ? j : j.leads || [];
      const rows = a.map((l) => `${l.name || ""},${l.phone || l.mobile || l.number || l.whatsapp || ""}`).filter((x) => /\d{10}/.test(x.replace(/\D/g, "")));
      if (!rows.length) return setErr("Leads me phone field nahi mila — CSV paste karo.");
      setErr(""); setF({ ...f, contactsText: "name,phone\n" + rows.join("\n") });
    } catch { setErr("Leads load nahi hui."); }
  };
  const create = async () => {
    setErr(""); setBusy("create");
    const body = { ...f, params: f.params.split(",").map((x) => x.trim()).filter(Boolean) };
    const r = await (await fetch("/api/campaigns", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) })).json();
    setBusy("");
    if (!r.ok) return setErr(r.error || "Error");
    setSel(r.id); setF({ ...f, contactsText: "", name: "" }); load();
  };
  const act = async (id, action) => { await fetch("/api/campaigns", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ id, action }) }); if (action === "delete") { setSel(null); setDet(null); } load(); };

  const c = det?.campaign;
  const pct = c ? Math.round(((c.stats.sent + c.stats.failed + c.stats.skipped) / Math.max(c.stats.total, 1)) * 100) : 0;

  return (
    <div className="p-6 max-w-[1400px]">
      <div className="flex items-center justify-between">
        <div>
          <div className="eyebrow">Broadcast engine</div>
          <h1 className="mt-1 text-4xl font-extrabold">Bulk campaigns</h1>
          <p className="mt-2 text-slate-400">CSV daalo → AI se message likhwao → rate-limit ke saath bhejo. Opt-out aur dedupe automatic.</p>
        </div>
        <span className={`pill ${meta.live ? "bg-brand text-black" : "border-amber/40 text-amber"}`}>{meta.live ? "LIVE · Meta Cloud API" : "SIMULATED"}</span>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        {/* ------- naya campaign ------- */}
        <div className="card space-y-3">
          <div className="text-lg font-bold">Naya campaign</div>
          <input className="w-full rounded-lg border border-slate-700 bg-transparent p-2" placeholder="Campaign ka naam (e.g. Diwali Offer)" value={f.name} onChange={upd("name")} />

          <div className="rounded-lg border border-slate-700 p-3">
            <div className="text-xs uppercase text-slate-500">AI se message likhwao</div>
            <div className="mt-2 flex gap-2">
              <input className="flex-1 rounded-lg border border-slate-700 bg-transparent p-2 text-sm" placeholder="Goal: Golf Course Road 3BHK launch, site visit invite" value={goal} onChange={(e) => setGoal(e.target.value)} />
              <button onClick={draft} className="rounded-lg bg-brand px-3 text-sm font-bold text-black">{busy === "draft" ? "…" : "Likho"}</button>
            </div>
            {vars.map((v, i) => (<button key={i} onClick={() => setF({ ...f, text: v })} className="mt-2 block w-full rounded-lg border border-slate-700 p-2 text-left text-sm hover:border-brand">{v}</button>))}
          </div>

          <div>
            <div className="text-xs uppercase text-slate-500">Message — variables: {"{{name}} {{first_name}}"} + CSV ke column naam (jaise {"{{zone}}"})</div>
            <textarea rows={4} className="mt-1 w-full rounded-lg border border-slate-700 bg-transparent p-2 text-sm" value={f.text} onChange={upd("text")} />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="text-xs uppercase text-slate-500">Meta template naam (optional)</div>
              <input className="mt-1 w-full rounded-lg border border-slate-700 bg-transparent p-2 text-sm" placeholder="diwali_offer" value={f.metaTemplate} onChange={upd("metaTemplate")} />
            </div>
            <div>
              <div className="text-xs uppercase text-slate-500">Template params (CSV column, comma se)</div>
              <input className="mt-1 w-full rounded-lg border border-slate-700 bg-transparent p-2 text-sm" placeholder="first_name,zone" value={f.params} onChange={upd("params")} />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <div className="text-xs uppercase text-slate-500">Contacts (name,phone) — CSV paste ya file</div>
              <div className="flex gap-3 text-xs text-sky-400">
                <button onClick={() => setF({ ...f, contactsText: SAMPLE })}>sample</button>
                <button onClick={fromLeads}>leads se</button>
                <button onClick={() => fileRef.current.click()}>CSV file</button>
                <input ref={fileRef} type="file" accept=".csv,.txt" hidden onChange={onFile} />
              </div>
            </div>
            <textarea rows={6} className="mt-1 w-full rounded-lg border border-slate-700 bg-transparent p-2 font-mono text-xs" placeholder={"name,phone\nRahul,9876543210"} value={f.contactsText} onChange={upd("contactsText")} />
            {dry && (
              <div className="mt-2 rounded-lg bg-slate-800/50 p-2 text-sm">
                <b className="text-brand">{dry.count}</b> valid · {dry.bad} galat number · {dry.dupes} duplicate · {dry.optedOut} opted-out
                {dry.sample?.map((s, i) => (<div key={i} className="mt-1 text-xs text-slate-400">+{s.phone}: {s.msg}</div>))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <label className="text-sm text-slate-400">Speed</label>
            <select className="rounded-lg border border-slate-700 bg-transparent p-2 text-sm" value={f.rate} onChange={upd("rate")}>
              <option value={1}>1 msg/sec (safe)</option><option value={5}>5 msg/sec</option><option value={10}>10 msg/sec</option>
            </select>
            <label className="flex items-center gap-2 text-sm text-slate-300"><input type="checkbox" checked={f.callFallback} onChange={(e) => setF({ ...f, callFallback: e.target.checked })} />Jawab na aaye to</label>
            <input type="number" min="0.1" step="any" className="w-16 rounded-lg border border-slate-700 bg-transparent p-2 text-sm" value={f.callAfterMin} onChange={upd("callAfterMin")} /><span className="text-sm text-slate-400">min baad AI call</span>
            <button disabled={busy === "create"} onClick={create} className="ml-auto rounded-lg bg-brand px-4 py-2 font-bold text-black">Campaign banao</button>
          </div>
          {err && <div className="text-sm text-red-400">{err}</div>}
        </div>

        {/* ------- list + live progress ------- */}
        <div className="space-y-4">
          <div className="card">
            <div className="flex items-center justify-between">
              <div className="text-lg font-bold">Campaigns</div>
              <div className="text-xs text-slate-500">aaj bheje: {meta.sentToday || 0}/{meta.cap} · opt-outs: {meta.optouts || 0}</div>
            </div>
            {!list.length && <div className="mt-3 text-sm text-slate-500">Abhi koi campaign nahi.</div>}
            {list.map((x) => (
              <button key={x.id} onClick={() => setSel(x.id)} className={`mt-2 block w-full rounded-lg border p-3 text-left ${sel === x.id ? "border-brand" : "border-slate-700"}`}>
                <div className="flex justify-between"><b>{x.name}</b><span className={`text-xs uppercase ${stateColor[x.state]}`}>{x.state}</span></div>
                <div className="text-xs text-slate-400">{x.stats.sent}/{x.stats.total} sent · {x.stats.failed} failed · {x.stats.skipped} skipped</div>
              </button>
            ))}
          </div>

          {c && (
            <div className="card">
              <div className="flex items-center justify-between">
                <div className="text-lg font-bold">{c.name}</div>
                <div className="flex gap-2 text-sm">
                  {c.state !== "running" && c.state !== "done" && <button onClick={() => act(c.id, "start")} className="rounded-lg bg-brand px-3 py-1 font-bold text-black">{c.state === "paused" ? "Resume" : "Start"}</button>}
                  {c.state === "running" && <button onClick={() => act(c.id, "pause")} className="rounded-lg border border-amber/50 px-3 py-1 text-amber">Pause</button>}
                  {c.stats.failed > 0 && <button onClick={() => act(c.id, "retry")} className="rounded-lg border border-slate-600 px-3 py-1">Retry failed</button>}
                  <button onClick={() => act(c.id, "delete")} className="rounded-lg border border-red-500/40 px-3 py-1 text-red-400">Delete</button>
                </div>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded bg-slate-800"><div className="h-full bg-brand transition-all" style={{ width: pct + "%" }} /></div>
              <div className="mt-2 grid grid-cols-5 gap-2 text-center text-xs">
                {["queued", "sent", "failed", "skipped", "total"].map((k) => (<div key={k} className="rounded-lg bg-slate-800/50 p-2"><div className="text-lg font-bold">{c.stats[k]}</div><div className="uppercase text-slate-500">{k}</div></div>))}
              </div>
              {c.note && <div className="mt-2 text-sm text-amber">{c.note}</div>}
              <div className="mt-3 max-h-64 overflow-auto text-sm">
                {det.log.map((l, i) => (
                  <div key={i} className="flex justify-between border-b border-slate-800 py-1">
                    <span>{l.name || "—"} <span className="text-xs text-slate-500">+{l.phone}</span></span>
                    <span className={l.st === "sent" ? "text-brand" : l.st === "failed" ? "text-red-400" : "text-slate-500"}>{l.st}{l.err ? ` · ${l.err}` : ""}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
