import {LEADS,ZONES} from "./data";
const g=globalThis;
if(!g.__setu)g.__setu={leads:LEADS.map(l=>({...l,at:Date.now()-l.days*864e5,handle:"",message:""})),events:[],nid:1000,chats:{},channels:{},sim:new Set(),stats:{replies:0,ms:0}};
export const S=g.__setu;
S.chats??={};S.channels??={};S.sim??=new Set();S.stats??={replies:0,ms:0};
export const ev=(m,mod,tag="ok")=>{S.events.unshift({id:Date.now()+Math.random(),m,mod,tag,at:Date.now()});S.events.length=Math.min(S.events.length,80)};
export const fmtPhone=p=>{const d=String(p||"").replace(/\D/g,"");return !d?"":d.length===10?"+91"+d:d.length===11&&d[0]==="0"?"+91"+d.slice(1):"+"+d};
// Zone aliases — Gurgaon sectors & landmarks
export const MAP={"Golf Course Road":["golf course road","golf course rd","gcr","sector 42","sector 43","sector 53","sector 54","dlf phase 5","dlf 5","phase 5","phase v"],
"Golf Course Extension":["golf course ext","gce","extension road","sector 56","sector 57","sector 58","sector 59","sector 62","sector 63","sector 65","sector 66","sector 67"],
"Dwarka Expressway":["dwarka","dxp","expressway","sector 99","sector 100","sector 102","sector 103","sector 104","sector 105","sector 109","sector 110","sector 111","sector 112","sector 113","sector 114","sector 115"],
"Sohna Road":["sohna","sector 33","sector 47","sector 48","sector 49","sector 50","sector 70","sector 71","sector 72","badshahpur"],
"Southern Peripheral Road":["spr","southern peripheral","peripheral","sector 60","sector 61","sector 69","sector 76","sector 77","sector 78"],
"New Gurgaon":["new gurgaon","new gurugram","manesar","sector 79","sector 80","sector 81","sector 82","sector 83","sector 84","sector 85","sector 86","sector 88","sector 89","sector 90","sector 91","sector 92","sector 93","sector 95","sector 37d","sector 37 d"],
"Sector 106-108":["sector 106","sector 107","sector 108","sec 106","sec 108"],
"MG Road & Cyber City":["mg road","m g road","mgf","cyber city","cybercity","sector 22","sector 24","sector 25","udyog vihar","dlf phase 1","dlf phase 2","dlf phase 3","dlf phase 4"]};
// strict: null agar text me koi zone na ho
export const zoneIn=t=>{const x=(t||"").toLowerCase().replace(/\s+/g," ");let best=null,bl=0;for(const z of Object.keys(MAP))for(const k of [z.toLowerCase(),...MAP[z]]){const re=new RegExp("(^|[^a-z0-9])"+k.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")+"($|[^0-9])");if(re.test(x)&&k.length>bl){best=z;bl=k.length}}return best};
export const zoneFor=t=>zoneIn(t)||ZONES[S.leads.length%ZONES.length];
export const score=l=>Math.min(95,20+(l.budget?20:0)+(l.message?15:0)+(["WhatsApp","Instagram","Referral","Social Handle"].includes(l.source)?15:5)+(l.phone?15:0)+(l.prefs?.bhk?5:0));
// dir: "in" = customer ka msg, "out" = business/agent ka msg. Ticks: sent -> delivered -> read
export const addMsg=(key,name,dir,t,x={})=>{const c=S.chats[key]??={name:name||key,phone:key,msgs:[]};if(name)c.name=name;c.demo=S.sim.has(key);
const m={id:Date.now()+Math.random(),dir,t,at:Date.now(),st:dir==="in"?"read":"sent",...x};c.msgs.push(m);
if(dir==="out"){setTimeout(()=>{m.st="delivered"},900);setTimeout(()=>{m.st="read"},2400)}return m};
