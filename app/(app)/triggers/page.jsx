"use client";
import {useState} from "react";import {AnimatePresence,motion} from "framer-motion";import {Send} from "lucide-react";
import {Header,Sim} from "@/components/UI";import {TRIGGERS,LEADS} from "@/lib/data";import {post} from "@/lib/api";
export default function Triggers(){const [t,setT]=useState(0),[r,setR]=useState(0),[log,setLog]=useState([]),lead=LEADS[r];
const msg=TRIGGERS[t][2].replace("{name}",lead.name.split(" ")[0]).replace("{agent}",lead.cp);
const fire=async()=>{await post("/whatsapp/trigger",{trigger:TRIGGERS[t][0],leadId:lead.id});setLog(l=>[{n:lead.name,tr:TRIGGERS[t][0],m:msg,id:Date.now()},...l])};
return <div><Header eyebrow="WhatsApp triggers" title="Triggers & log" sub="Every trigger fires through the official Meta WhatsApp Cloud API." action={<Sim/>}/>
<div className="grid gap-5 lg:grid-cols-[420px_1fr]"><div className="space-y-5"><div className="card space-y-3"><h3 className="flex items-center gap-2 font-semibold"><Send size={16} className="text-brand"/>Fire a trigger</h3>
<select className="input" value={t} onChange={e=>setT(+e.target.value)}>{TRIGGERS.map((x,i)=><option key={i} value={i}>{x[0]}</option>)}</select>
<select className="input" value={r} onChange={e=>setR(+e.target.value)}>{LEADS.slice(0,20).map((l,i)=><option key={i} value={i}>{l.name} — {l.phone}</option>)}</select>
<motion.div key={t+"-"+r} initial={{opacity:0}} animate={{opacity:1}} className="rounded-xl border border-brand/30 bg-brand/5 p-3 text-sm">{msg}</motion.div><button onClick={fire} className="btn w-full">Send via Meta Cloud API</button></div>
<div className="card"><h3 className="mb-3 font-semibold">Template library</h3><div className="space-y-2">{TRIGGERS.map((x,i)=><button key={i} onClick={()=>setT(i)} className={`flex w-full justify-between rounded-lg border px-3 py-2 text-sm ${t===i?"border-brand/50 bg-brand/10":"border-line"}`}>{x[0]}<span className="font-mono text-[10px] text-slate-500">{x[1]}</span></button>)}</div></div></div>
<div className="card"><h3 className="mb-3 font-semibold">Message log <span className="font-mono text-xs text-slate-500">{log.length}</span></h3>{!log.length&&<p className="text-sm text-slate-500">Koi trigger fire karo — yahan log dikhega.</p>}
<AnimatePresence>{log.map(l=><motion.div key={l.id} layout initial={{opacity:0,x:30}} animate={{opacity:1,x:0}} className="border-b border-line py-3"><div className="font-medium">{l.n} <span className="font-mono text-[11px] text-slate-500">Lead</span></div><div className="font-mono text-[11px] uppercase text-brand">{l.tr}</div><div className="mt-1 text-sm text-slate-300">{l.m}</div><div className="text-xs text-sky-400">✓✓ sent</div></motion.div>)}</AnimatePresence></div></div></div>}
