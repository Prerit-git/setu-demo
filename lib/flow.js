import {S,ev,fmtPhone,zoneIn,zoneFor,score,addMsg} from "./store";import {sendWA,sendWAImage,markRead,waLive} from "./whatsapp";import {sendIG,igProfile} from "./meta";import {AGENTS,PROPS} from "./data";

// ---------- Requirement parser: BHK + budget + Gurgaon zone ----------
export function parsePrefs(t=""){const x=t.toLowerCase(),o={};
let m=x.match(/(\d)\s*[-.]?\s*bhk/)||x.match(/\b(\d)\s*(?:bed|bedroom|room)/);if(m)o.bhk=+m[1];
m=x.match(/(\d+(?:\.\d+)?)\s*(?:cr|crore|karod|करोड़|करोड)/);if(m)o.cr=+m[1];
else{m=x.match(/(\d+(?:\.\d+)?)\s*(?:l|lac|lacs|lakh|lakhs|लाख)\b/);if(m)o.cr=+m[1]/100}
const z=zoneIn(x);if(z)o.zone=z;return o}
const fmtCr=c=>c>=10?`₹${+c.toFixed(1)} Cr`:c<1?`₹${Math.round(c*100)} L`:`₹${+c.toFixed(2)} Cr`;
const desc=p=>[p.bhk&&`${p.bhk} BHK`,p.zone,p.cr&&`~${fmtCr(p.cr)}`].filter(Boolean).join(" · ");
export function match(p,n=2){const c=PROPS.filter(x=>x.st!=="Sold").map(x=>{let s=x.st==="Available"?1:-1;
if(p.zone)s+=x.zone===p.zone?4:0;if(p.bhk)s+=x.bhk===p.bhk?3:Math.abs(x.bhk-p.bhk)===1?1:-1;
if(p.cr)s+=x.cr<=p.cr*1.1?(x.cr>=p.cr*.6?4:2):-4;return{x,s}}).sort((a,b)=>b.s-a.s||a.x.cr-b.x.cr);
return c.slice(0,n).map(a=>a.x)}
const fn=n=>/^(IG |Instagram|WA |Unknown|Meta |FB )/i.test(n||"")||!n?"ji":n.split(" ")[0];
const NUM=["1️⃣","2️⃣","3️⃣"];
const picks=(f,p,lead)=>{const m=match(p,2),over=p.cr&&m.every(x=>x.cr>p.cr*1.1);lead&&(lead.lastProp=m[0]);
return{text:`🏡 ${f}, aapki requirement (${desc(p)}) ke hisaab se top picks:${over?"\n(Is budget me options limited hain — closest ye hain)":""}\n\n${m.map((x,i)=>`${NUM[i]} ${x.t}\n📍 ${x.sector}, ${x.zone}\n💰 ${x.price} · ${x.sqft} sq ft`).join("\n\n")}\n\nSite visit chahiye? Bas "VISIT" likh dijiye 🙂`,img:m[0]?.img,prop:m[0]}};
const ask=f=>({text:`Namaste ${f}! 👋 Main SETU hu, KMA Global Property ka AI advisor.\nGurgaon me best match dene ke liye bata dijiye:\n1️⃣ Kitne BHK?\n2️⃣ Kaunsa area? (Golf Course Road / Dwarka Expressway / Sohna Road / New Gurgaon…)\n3️⃣ Budget?\nExample: "3BHK Golf Course Ext, 3 Cr"`});
const DAY={saturday:"Saturday",sat:"Saturday",sunday:"Sunday",sun:"Sunday",monday:"Monday",tuesday:"Tuesday",wednesday:"Wednesday",thursday:"Thursday",friday:"Friday",kal:"Tomorrow",tomorrow:"Tomorrow",aaj:"Today",today:"Today",weekend:"Saturday"};
export function autoReply(t="",lead={}){const x=t.toLowerCase(),f=fn(lead.name),ag=lead.cp||"hamare advisor";
const np=parsePrefs(t),p=lead.prefs||{};
if(/\b(stop|unsubscribe)\b/.test(x))return{text:"Aap unsubscribe ho gaye. Dobara shuru karne ke liye START likhein.",intent:"stop"};
if(/visit|\bsite\b|\btour\b|dekhna|dekhne|milna|appointment/.test(x)){const d=Object.keys(DAY).find(k=>new RegExp("\\b"+k+"\\b").test(x)),tm=x.match(/(\d{1,2})(?::(\d\d))?\s*(am|pm)/),time=tm?`${tm[1]}:${tm[2]||"00"} ${tm[3].toUpperCase()}`:"11:00 AM",pr=lead.lastProp||(Object.keys(p).length?match(p,1)[0]:null);
return{intent:"visit",text:`✅ Site visit confirm, ${f}!\n📅 ${d?DAY[d]:"Saturday"}, ${time}\n${pr?`🏢 ${pr.t}\n📍 ${pr.sector}, ${pr.zone}, Gurgaon\n`:""}👤 ${ag} aapko wahan meet karenge.\nLocation pin abhi bhej raha hu 📍`,img:null}}
if(/call|callback|baat/.test(x)&&!/brochure/.test(x))return{intent:"call",text:`Zaroor ${f}! 📞 ${ag} aapko 15 minute me call karenge.`};
if(/brochure|floor ?plan|details|detail/.test(x))return{intent:"brochure",text:`📄 ${f}, brochure aur floor plans bhej raha hu${lead.lastProp?` (${lead.lastProp.t})`:""}.\nKuch aur pasand ho to batayein — main aur options dikha sakta hu.`};
if(/thank|thanks|shukriya|dhanyavaad/.test(x))return{intent:"thanks",text:`Aapka swagat hai ${f}! 🙏 Kabhi bhi message kar dijiye, main 24x7 yahan hu.`};
if(Object.keys(p).length&&(Object.keys(np).length||/price|rate|cost|kitna|option|show|dikha|property|flat|home|ghar|\bhi\b|hello|\bhey\b|namaste|interested/.test(x)))return{intent:"match",...picks(f,p,lead)};
if(/price|rate|cost|kitna|budget/.test(x))return{intent:"ask",...ask(f)};
return{intent:"ask",...ask(f)}}

// ---------- Lead ingestion (website / ads / portals / handle) ----------
export async function ingest(i){
const steps=[],phone=fmtPhone(i.phone),src=i.source||"Website";
const ex=(phone&&S.leads.find(l=>l.phone===phone))||(i.handle&&S.leads.find(l=>l.handle===i.handle));
if(phone&&i.demo)S.sim.add(phone);
if(ex){if(phone&&!ex.phone){ex.phone=phone}if(!i.noWelcome)ev(`Repeat enquiry via ${src} merged → ${ex.name}`,"Leads");return{lead:ex,merged:true,steps:[{t:"Repeat enquiry — existing lead merged",ok:1}]}}
const np=parsePrefs((i.message||"")+" "+(i.locality||"")+" "+(i.budget||"")+" "+(i.bhk?i.bhk+" bhk":""));
const l={id:++S.nid,name:i.name||i.handle||"Unknown",phone,handle:i.handle||"",status:"New",zone:np.zone||zoneFor(i.locality),source:src,message:i.message||"",budget:i.budget||"",prefs:np,cp:"—",days:0,at:Date.now(),demo:!!i.demo};
l.score=score(l);l.type=l.score>=70?"hot":l.score>=45?"warm":"cold";
const ag=AGENTS.find(a=>a.role==="Agent"&&a.zone===l.zone)||AGENTS[0];l.cp=ag.name;S.leads.unshift(l);
steps.push({t:`Lead captured from ${src}${l.handle?" ("+l.handle+")":""}`,ok:1},{t:`Phone formatted → ${phone||"not provided"}`,ok:!!phone},{t:`Zone routed → ${l.zone}`,ok:1},{t:`AI score ${l.score} → ${l.type.toUpperCase()}`,ok:1},{t:`Assigned to agent ${ag.name}`,ok:1});
ev(`${src}: new lead ${l.name} captured → ${ag.name}`,"Leads");
const needTpl=waLive()&&!S.sim.has(phone)&&!process.env.WA_WELCOME_TEMPLATE&&process.env.WA_WINDOW_OPEN!=="1";
if(phone&&!i.noWelcome&&needTpl){steps.push({t:"Live mode: customer ke pehle WhatsApp message ka wait (24h rule) — form page pe WhatsApp button dikhega",ok:1});ev(`Lead ${l.name}: first WhatsApp message ka wait`,"WhatsApp Triggers")}
if(phone&&!i.noWelcome&&!needTpl){const f=fn(l.name),wt=`Namaste ${f}! 👋 KMA Global Property me aapka swagat hai. Aapke advisor ${ag.name} jaldi hi Gurgaon ke best homes share karenge.`;addMsg(phone,l.name,"out",wt,{ai:1});const r=await sendWA(phone,wt,{name:process.env.WA_WELCOME_TEMPLATE,params:[f]});
steps.push({t:`Welcome WhatsApp ${r.ok?"sent ("+r.mode+")":"FAILED: "+(r.error||"error")}`,ok:r.ok});ev(`Welcome WhatsApp (${r.mode}) → ${l.name}`,"WhatsApp Triggers",r.ok?"ok":"err");
// Simulated me turant AI picks; live me customer ke pehle reply pe (24h window rule)
if(Object.keys(np).length&&(!waLive()||S.sim.has(phone)||process.env.WA_WINDOW_OPEN==="1")){const pk=picks(f,np,l);setTimeout(async()=>{addMsg(phone,l.name,"out",pk.text,{ai:1});const s=await sendWA(phone,pk.text);if(pk.img){addMsg(phone,l.name,"out","",{ai:1,img:pk.img,cap:pk.prop?.t});await sendWAImage(phone,pk.img,pk.prop?.t)}ev(`AI picks (${s.mode}) → ${l.name}: ${pk.prop?.t}`,"WhatsApp Triggers",s.ok?"ok":"err")},1800);steps.push({t:`AI property match → ${match(np,1)[0]?.t}`,ok:1})}}
steps.push({t:"Pending-details bot + follow-up reminder scheduled",ok:1});ev(`Pending-details bot started for ${l.name}`,"Leads");
return{lead:l,steps}}

// ---------- Customer ka message: lead banao/merge karo, status badlo, ~1s me AI reply ----------
// ch: "wa" (default) ya "ig". ig me key = igsid
export async function inbound({phone,name,text="",source,demo,ch="wa",igsid,waId}){
const t0=Date.now(),isIG=ch==="ig",p=isIG?"":fmtPhone(phone),key=isIG?"ig:"+igsid:p;
if(demo&&p)S.sim.add(p);
if(isIG&&!name){const pr=await igProfile(igsid);name=pr.name||pr.username||"Instagram User";if(pr.username)var handle="@"+pr.username}
const known=isIG?S.leads.find(l=>l.handle===(handle||"ig:"+igsid)||l.igsid===igsid):S.leads.find(l=>l.phone===p);
const {lead}=await ingest({name,phone:p,handle:isIG?(handle||"ig:"+igsid):"",source:source||(isIG?"Instagram":"WhatsApp"),message:text,noWelcome:true,demo});
if(isIG)lead.igsid=igsid;
// naye requirement merge
const np=parsePrefs(text);const oz=lead.zone;lead.prefs={...(lead.prefs||{}),...np};if(np.zone&&np.zone!==oz){lead.zone=np.zone;const na=AGENTS.find(a=>a.role==="Agent"&&a.zone===np.zone);if(na&&na.name!==lead.cp){ev(`Zone updated → ${np.zone}: re-routed ${lead.name} to ${na.name}`,"Leads");lead.cp=na.name}}if(np.cr)lead.budget=fmtCr(np.cr);lead.message=text||lead.message;lead.score=Math.max(lead.score,score(lead));lead.type=lead.score>=70?"hot":lead.score>=45?"warm":"cold";
// IG me phone number mil gaya?
const pm=isIG&&text.match(/(?:\+?91[\s-]?)?([6-9]\d{9})/);let gotPhone=null;if(pm&&!lead.phone){lead.phone=gotPhone=fmtPhone(pm[1]);if(demo)S.sim.add(lead.phone);ev(`Phone captured from Instagram DM → ${lead.name} ${lead.phone}`,"Leads")}
addMsg(key,lead.name,"in",text);markRead(waId);
if(lead.status==="New"){lead.status="Contacted";ev(`${lead.name} replied → status Contacted`,"Leads")}
const r=autoReply(text,lead);
if(r.intent==="visit"&&lead.status!=="Site Visit Scheduled"){lead.status="Site Visit Scheduled";ev(`Site visit requested → ${lead.name} (agent ${lead.cp} alerted)`,"Leads")}
if(r.intent==="ask"&&lead.status==="Contacted")lead.status="Details Pending";
if(r.intent==="match"&&lead.status==="Details Pending")lead.status="Contacted";
const wait=900+Math.floor(Math.random()*500);
setTimeout(async()=>{const s=isIG?await sendIG(igsid,r.text):await sendWA(p,r.text);addMsg(key,lead.name,"out",r.text,{ai:1});
if(r.img){addMsg(key,lead.name,"out","",{ai:1,img:r.img,cap:r.prop?.t});if(!isIG)await sendWAImage(p,r.img,r.prop?.t)}
const ms=Date.now()-t0;if(!lead.respMs)lead.respMs=ms;S.stats.replies++;S.stats.ms+=ms;ev(`AI reply (${s.mode}, ${(ms/1000).toFixed(1)}s) → ${lead.name} [${r.intent}]`,isIG?"Instagram":"WhatsApp Triggers",s.ok?"ok":"err");
if(gotPhone){const f=fn(lead.name),wt=`Namaste ${f}! Instagram pe aapki baat ke baad ab WhatsApp pe bhi connected hain 🙂 Yahin properties aur site visit details bhejta hu.`;addMsg(gotPhone,lead.name,"out",wt,{ai:1});const w=await sendWA(gotPhone,wt,{name:process.env.WA_WELCOME_TEMPLATE,params:[f]});ev(`Instagram → WhatsApp handoff (${w.mode}) → ${lead.name}`,"WhatsApp Triggers",w.ok?"ok":"err")}},wait);
return{lead,reply:r.text,newLead:!known}}
