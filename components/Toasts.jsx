"use client";
import {useEffect,useRef,useState} from "react";import {AnimatePresence,motion} from "framer-motion";
export default function Toasts(){const [t,setT]=useState([]),max=useRef(null);
useEffect(()=>{const f=async()=>{try{const d=await fetch("/api/leads").then(r=>r.json());const m=Math.max(...d.leads.map(l=>l.id));
if(max.current!==null&&m>max.current)d.leads.filter(l=>l.id>max.current).forEach(l=>{const id=Math.random();setT(x=>[...x.slice(-3),{id,l}]);setTimeout(()=>setT(x=>x.filter(y=>y.id!==id)),5000)});max.current=m}catch{}};f();const i=setInterval(f,1500);return()=>clearInterval(i)},[]);
return <div className="fixed bottom-5 right-5 z-50 space-y-2"><AnimatePresence>{t.map(({id,l})=><motion.div key={id} initial={{opacity:0,x:60}} animate={{opacity:1,x:0}} exit={{opacity:0,x:60}} className="card w-72 !p-3 shadow-2xl"><div className="eyebrow">New lead · {l.source}</div><div className="font-semibold">{l.name}</div><div className="text-xs text-slate-400">{l.zone} · score {l.score} · → {l.cp}</div></motion.div>)}</AnimatePresence></div>}
