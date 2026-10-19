import {NextResponse} from "next/server";import crypto from "crypto";
import {ingest,inbound} from "@/lib/flow";import {fetchLeadgen} from "@/lib/meta";import {ev} from "@/lib/store";
// Ek hi webhook: WhatsApp messages + Instagram DMs + Facebook/Instagram Lead Ads
export async function GET(req){const u=new URL(req.url);
if(u.searchParams.get("hub.verify_token")===(process.env.META_VERIFY_TOKEN||"setu_verify_123")){ev("Meta webhook verified ✔","Integrations");return new Response(u.searchParams.get("hub.challenge"))}
return new Response("forbidden",{status:403})}
export async function POST(req){const raw=await req.text(),sec=process.env.META_APP_SECRET;
if(sec){const exp="sha256="+crypto.createHmac("sha256",sec).update(raw).digest("hex");if((req.headers.get("x-hub-signature-256")||"")!==exp)return new Response("bad signature",{status:401})}
const b=JSON.parse(raw||"{}");
try{for(const e of b.entry||[]){
for(const c of e.changes||[]){const v=c.value||{};
if(c.field==="messages")for(const m of v.messages||[])await inbound({phone:m.from,name:v.contacts?.[0]?.profile?.name,text:m.text?.body||m.button?.text||m.interactive?.button_reply?.title||"",waId:m.id});
if(c.field==="leadgen"){const d=await fetchLeadgen(v.leadgen_id);await ingest(d?{...d,source:"Meta Lead Ads"}:{name:"Meta Lead "+v.leadgen_id,source:"Meta Lead Ads",message:"leadgen "+v.leadgen_id})}}
for(const m of e.messaging||[])if(m.message?.text&&!m.message.is_echo)await inbound({ch:"ig",igsid:m.sender.id,text:m.message.text})}}
catch(err){ev("Webhook error: "+String(err).slice(0,120),"Integrations","err")}
return NextResponse.json({ok:true})}
