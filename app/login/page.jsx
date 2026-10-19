"use client";
import {useRouter} from "next/navigation";import {Zap} from "lucide-react";
export default function Login(){const r=useRouter();
return <div className="grid min-h-screen md:grid-cols-2">
<div className="relative hidden flex-col justify-center p-16 md:flex" style={{backgroundImage:"linear-gradient(rgba(7,11,20,.75),rgba(7,11,20,.95)),url(https://images.unsplash.com/photo-1566552881560-0be862a7c445?auto=format&fit=crop&w=2000&q=85)",backgroundSize:"cover"}}>
<div className="mb-10 flex items-center gap-2 text-xl font-extrabold"><span className="grid h-9 w-9 place-items-center rounded-xl bg-brand text-black"><Zap size={18}/></span>SETU सेतु</div>
<h1 className="text-5xl font-extrabold leading-tight">The bridge from <span className="text-brand">lead</span> to <span className="text-amber">deal.</span></h1>
<p className="mt-4 max-w-md text-slate-400">India's AI-native real estate engine — it scores, matches, follows-up and routes every lead.</p></div>
<div className="grid place-items-center p-8"><form onSubmit={e=>{e.preventDefault();r.push("/dashboard")}} className="card w-full max-w-sm space-y-4">
<p className="eyebrow">Operator console</p><h2 className="text-2xl font-bold">Sign in to SETU</h2>
<input className="input" defaultValue="admin@setu.in" placeholder="Email"/><input className="input" type="password" defaultValue="Setu@2026" placeholder="Password"/>
<button className="btn w-full">Enter</button></form></div></div>}
