import {S} from "./store";
export const waLive=()=>!!(process.env.WA_PHONE_NUMBER_ID&&process.env.WA_ACCESS_TOKEN);
const url=()=>`https://graph.facebook.com/${process.env.WA_GRAPH_VERSION||"v21.0"}/${process.env.WA_PHONE_NUMBER_ID}/messages`;
const hdr=()=>({Authorization:"Bearer "+process.env.WA_ACCESS_TOKEN,"Content-Type":"application/json"});
// Demo/test ke fake numbers pe kabhi live message nahi jayega
const simOnly=to=>S.sim.has("+"+String(to).replace(/\D/g,""));
async function call(payload){try{const r=await fetch(url(),{method:"POST",headers:hdr(),body:JSON.stringify(payload)});const j=await r.json();return{ok:r.ok,mode:"live",id:j.messages?.[0]?.id,error:j.error?.message}}catch(e){return{ok:false,mode:"live",error:String(e)}}}
// tpl: {name,params} -> approved template (24h window ke bahar zaroori)
export async function sendWA(to,text,tpl){
 if(!waLive()||simOnly(to))return{ok:true,mode:"simulated"};
 const t=String(to).replace(/\D/g,"");
 return call(tpl?.name?{messaging_product:"whatsapp",to:t,type:"template",template:{name:tpl.name,language:{code:process.env.WA_TEMPLATE_LANG||"en"},components:[{type:"body",parameters:(tpl.params||[]).map(x=>({type:"text",text:x}))}]}}:{messaging_product:"whatsapp",to:t,type:"text",text:{body:text}})}
export async function sendWAImage(to,link,caption){
 if(!waLive()||simOnly(to))return{ok:true,mode:"simulated"};
 return call({messaging_product:"whatsapp",to:String(to).replace(/\D/g,""),type:"image",image:{link,caption}})}
// Blue ticks customer ko dikhane ke liye
export async function markRead(id){if(!waLive()||!id)return;try{await fetch(url(),{method:"POST",headers:hdr(),body:JSON.stringify({messaging_product:"whatsapp",status:"read",message_id:id})})}catch{}}
