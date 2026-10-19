import {PROPS} from "@/lib/data";
const C={Available:"bg-brand text-black","On Hold":"bg-amber text-black",Sold:"bg-slate-500 text-white"};
export default function Properties(){return <div><p className="eyebrow">Property module</p><div className="mt-1 flex items-end justify-between"><h1 className="text-4xl font-extrabold">Inventory</h1><button className="btn">+ Add property</button></div>
<div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">{PROPS.map(p=><div key={p.t} className="card overflow-hidden p-0">
<div className="relative h-52 bg-gradient-to-br from-slate-800 to-slate-900"><img src={p.img} alt={p.t} className="h-full w-full object-cover" loading="lazy"/>
<span className={`pill absolute left-3 top-3 ${C[p.st]}`}>{p.st}</span><div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 p-4 font-mono text-2xl font-bold">{p.price}</div></div>
<div className="p-4"><div className="font-semibold">{p.t}</div><div className="text-xs text-slate-500">{p.loc}</div>
<div className="mt-3 flex gap-2 text-xs"><button className="rounded-md bg-brand/20 px-3 py-1 text-brand">Share</button><button className="rounded-md border border-line px-3 py-1">Available</button><button className="rounded-md border border-line px-3 py-1">Sold</button></div></div></div>)}</div></div>}
