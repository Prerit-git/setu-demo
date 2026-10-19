// SETU theme switcher.   Use:  node theme.js aqua   |  node theme.js list  |  node theme.js green (original)
// Naya rang chahiye? Neeche THEMES me ek line copy karke apne hex/rgb daal do.
const fs=require("fs"),path=require("path");
const THEMES={
 // h=main hex | r=same rgb (comma) | c=rgb (space) | c2,c3=gradient ke doosre rang | bub=chat bubble tint | acc=checkbox rang
 green :{h:"#22c55e",r:"34,197,94",  c:"34 197 94",  c2:"16 185 129",c3:"52 211 153",bub:"emerald-900/40",acc:"green-500"},
 aqua  :{h:"#22d3ee",r:"34,211,238", c:"34 211 238", c2:"59 130 246",c3:"139 92 246",bub:"cyan-900/40",   acc:"cyan-500"},
 violet:{h:"#a78bfa",r:"167,139,250",c:"167 139 250",c2:"99 102 241",c3:"236 72 153",bub:"violet-900/40", acc:"violet-500"},
 sunset:{h:"#fb923c",r:"251,146,60", c:"251 146 60", c2:"244 63 94", c3:"250 204 21",bub:"orange-900/40", acc:"orange-500"},
 gold  :{h:"#fbbf24",r:"251,191,36", c:"251 191 36", c2:"249 115 22",c3:"253 224 71",bub:"amber-900/40",  acc:"yellow-500"}};
const arg=process.argv[2];
if(!arg||arg==="list"){console.log("Themes:",Object.keys(THEMES).join(", "));process.exit(0)}
const to=THEMES[arg];if(!to){console.log("Aisa theme nahi. Options:",Object.keys(THEMES).join(", "));process.exit(1)}
const ST=".setu-theme",cur=THEMES[fs.existsSync(ST)?fs.readFileSync(ST,"utf8").trim():"green"]||THEMES.green;
const rep=s=>s.split(cur.h).join(to.h).split(cur.r).join(to.r).split("bg-"+cur.bub).join("bg-"+to.bub).split("accent-"+cur.acc).join("accent-"+to.acc);
// 1) tailwind "brand" ko CSS variable se jodo (text-brand, bg-brand/15 sab isse chalte hain)
const tc="tailwind.config.js";fs.writeFileSync(tc,fs.readFileSync(tc,"utf8").replace(/brand:\s*["']#[0-9a-fA-F]{6}["']/,'brand:"rgb(var(--brand) / <alpha-value>)"'));
// 2) globals.css: purana theme block hatao, naya likho
const PREMIUM=`
body{background-image:radial-gradient(1200px 600px at 85% -10%,rgb(var(--brand)/.14),transparent 60%),radial-gradient(900px 500px at -10% 110%,rgb(var(--brand2)/.12),transparent 60%);background-attachment:fixed}
.btn:not([class*="!bg-"]){background-image:linear-gradient(135deg,rgb(var(--brand)),rgb(var(--brand2)));color:#041018;box-shadow:0 6px 24px -8px rgb(var(--brand)/.6)}
.card{background-image:linear-gradient(160deg,rgba(255,255,255,.05),rgba(255,255,255,.01));border-color:rgb(var(--brand)/.16)}
.card:hover{border-color:rgb(var(--brand)/.5);box-shadow:0 14px 50px -18px rgb(var(--brand)/.5)}
main h1{background:linear-gradient(90deg,#fff 25%,rgb(var(--brand)) 100%);-webkit-background-clip:text;background-clip:text;color:transparent}
.eyebrow{background:linear-gradient(90deg,rgb(var(--brand)),rgb(var(--brand3)));-webkit-background-clip:text;background-clip:text;color:transparent}
.input:focus{border-color:rgb(var(--brand))!important;box-shadow:0 0 0 3px rgb(var(--brand)/.18)}
.aurora.a1{background:rgb(var(--brand))!important}.aurora.a2{background:rgb(var(--brand2))!important}`;
const BLOCK=`/* SETU-THEME:START */\n:root{--brand:${to.c};--brand2:${to.c2};--brand3:${to.c3}}${arg==="green"?"":PREMIUM}\n/* SETU-THEME:END */\n`;
const gc="app/globals.css";let g=fs.readFileSync(gc,"utf8").replace(/\/\* SETU-THEME:START \*\/[\s\S]*?\/\* SETU-THEME:END \*\/\n?/,"");
fs.writeFileSync(gc,rep(g).trimEnd()+"\n"+BLOCK);
// 3) code me hardcoded rang (charts, glow, shadows) badlo
let n=0;const walk=d=>{if(!fs.existsSync(d))return;for(const f of fs.readdirSync(d)){const p=path.join(d,f);if(fs.statSync(p).isDirectory()){if(f!=="node_modules"&&f!==".next")walk(p)}else if(/\.(jsx?|mjs)$/.test(f)){const a=fs.readFileSync(p,"utf8"),b=rep(a);if(a!==b){fs.writeFileSync(p,b);n++}}}};
["app","components","lib"].forEach(walk);
fs.writeFileSync(ST,arg);
console.log(`✔ Theme "${arg}" lag gaya (${n} files). Ab server restart karo: Control+C, phir npm run dev`);
