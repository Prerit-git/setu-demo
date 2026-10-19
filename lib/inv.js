// LIVE INVENTORY — CP portal yahan likhta hai, AI yahin se padhta hai (single source of truth)
const g=globalThis;
if(!g.__inv)g.__inv={items:[
{id:1,t:"The Crest",bhk:3,zone:"Golf Course Road",price:"₹3.20 Cr",cr:3.2,st:"Available",cp:"Priya Iyer"},
{id:2,t:"Kolte Patil Life",bhk:2,zone:"DLF Phase 5",price:"₹2.80 Cr",cr:2.8,st:"Available",cp:"Neha Agarwal"},
{id:3,t:"Palm Grove",bhk:4,zone:"DLF Phase 5",price:"₹6.50 Cr",cr:6.5,st:"On Hold",cp:"Meera Gupta"},
{id:4,t:"Aurum Heights",bhk:3,zone:"Sector 54",price:"₹4.80 Cr",cr:4.8,st:"Available",cp:"Aditya Sethi"},
{id:5,t:"Lodha Vista",bhk:3,zone:"Sohna Road",price:"₹2.10 Cr",cr:2.1,st:"Available",cp:"Priya Iyer"},
{id:6,t:"Skyline Residences",bhk:4,zone:"Golf Course Road",price:"₹6.50 Cr",cr:6.5,st:"Sold",cp:"Neha Agarwal"},
{id:7,t:"Prestige Lakeside",bhk:2,zone:"Dwarka Expressway",price:"₹1.20 Cr",cr:1.2,st:"Available",cp:"Meera Gupta"},
{id:8,t:"Godrej Serenity",bhk:3,zone:"MG Road",price:"₹3.60 Cr",cr:3.6,st:"On Hold",cp:"Aditya Sethi"}],log:[]};
export const INV=g.__inv;
export const avail=()=>INV.items.filter(x=>x.st==="Available");
export function setStatus(id,st,by){const x=INV.items.find(i=>i.id===id);if(!x)return null;x.st=st;
INV.log.unshift({id:Date.now()+Math.random(),m:`${by||"CP"} marked ${x.t} (${x.bhk} BHK, ${x.zone}) → ${st}`,at:Date.now()});INV.log.length=Math.min(INV.log.length,30);return x}
