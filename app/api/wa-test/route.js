import {NextResponse} from "next/server";import {sendWA,waLive} from "@/lib/whatsapp";import {fmtPhone,addMsg,ev} from "@/lib/store";
// Apne number pe test message bhejke token verify karo (live mode me asli message jata hai)
export async function POST(req){const {to,template}=await req.json(),p=fmtPhone(to);
if(!p)return NextResponse.json({ok:false,error:"number daalo"});
const t=`✅ SETU live test — KMA Global Property se WhatsApp connection sahi chal raha hai. (${new Date().toLocaleTimeString("en-IN")})`;
const r=await sendWA(p,t,template&&process.env.WA_WELCOME_TEMPLATE?{name:process.env.WA_WELCOME_TEMPLATE,params:["Vishal"]}:undefined);
if(r.ok)addMsg(p,"",'out',t,{ai:1});ev(`WhatsApp test (${r.mode}) → ${p}${r.error?" : "+r.error:""}`,"Integrations",r.ok?"ok":"err");
return NextResponse.json({...r,live:waLive()})}
