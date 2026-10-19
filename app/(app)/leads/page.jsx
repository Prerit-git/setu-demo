"use client";
import {useState,useEffect} from "react";import {ZONES,STATUSES} from "@/lib/data";
const TC={hot:"bg-red-500/15 text-red-400",warm:"bg-amber/15 text-amber",cold:"bg-sky-500/15 text-sky-400"};
const ago=l=>{const m=Math.floor((Date.now()-l.at)/6e4);return m<1?"just now":m<60?m+"m ago":m<1440?Math.floor(m/60)+"h ago":Math.floor(m/1440)+"d ago"};
export default function Leads(){const [q,setQ]=useState(""),[st,setSt]=useState(""),[z,setZ]=useState(""),[all,setAll]=useState([]);
useEffect(()=>{const f=()=>fetch("/api/leads").then(r=>r.json()).then(d=>setAll(d.leads)).catch(()=>{});f();const i=setInterval(f,2000);return()=>clearInterval(i)},[]);
const rows=all.filter(l=>(l.name+l.phone+(l.handle||"")).toLowerCase().includes(q.toLowerCase())&&(!st||l.status===st)&&(!z||l.zone===z));
return <div><p className="eyebrow">Leads module · live</p><div className="mt-1 flex items-end justify-between"><h1 className="text-4xl font-extrabold">Lead pipeline</h1><span className="font-mono text-xs text-brand">{rows.length} / {all.length} leads</span></div>
<div className="mt-6 grid gap-3 md:grid-cols-3"><input className="input" placeholder="Search name, phone, handle" value={q} onChange={e=>setQ(e.target.value)}/>
<select className="input" onChange={e=>setSt(e.target.value)}><option value="">All statuses</option>{STATUSES.map(s=><option key={s}>{s}</option>)}</select>
<select className="input" onChange={e=>setZ(e.target.value)}><option value="">All zones</option>{ZONES.map(s=><option key={s}>{s}</option>)}</select></div>
<div className="card mt-4 overflow-x-auto p-0"><table className="w-full text-left text-sm"><thead className="font-mono text-[11px] uppercase text-slate-500"><tr>{["Lead","Status","Type","Zone","Source","Agent","AI score","Captured"].map(h=><th key={h} className="p-3">{h}</th>)}</tr></thead>
<tbody>{rows.slice(0,80).map(l=><tr key={l.id} className="border-t border-line hover:bg-white/5"><td className="p-3"><div className="font-medium">{l.name}</div><div className="font-mono text-[11px] text-slate-500">{l.phone||l.handle}</div></td>
<td className="p-3">{l.status}</td><td className="p-3"><span className={`pill ${TC[l.type]}`}>{l.type}</span></td><td className="p-3">{l.zone}</td><td className="p-3">{l.source}</td><td className="p-3">{l.cp}</td>
<td className="p-3"><div className="flex items-center gap-2"><div className="h-1.5 w-16 rounded bg-line"><div className="h-1.5 rounded bg-brand" style={{width:l.score+"%"}}/></div>{l.score}</div></td><td className="p-3 text-slate-500">{ago(l)}</td></tr>)}</tbody></table></div></div>}
