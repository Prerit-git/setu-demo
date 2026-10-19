import {NextResponse} from "next/server";import {S} from "@/lib/store";import {waLive} from "@/lib/whatsapp";import {igLive,fbLive} from "@/lib/meta";
export const dynamic="force-dynamic";
const mask=v=>v?v.slice(0,4)+"…"+v.slice(-3):"";
export async function GET(req){const e=process.env,host=req.headers.get("x-forwarded-host")||req.headers.get("host"),proto=req.headers.get("x-forwarded-proto")||"http";
// Meta se token check (sirf WhatsApp — asli test)
let wa={configured:waLive(),phoneId:mask(e.WA_PHONE_NUMBER_ID)};
if(wa.configured){try{const r=await fetch(`https://graph.facebook.com/${e.WA_GRAPH_VERSION||"v21.0"}/${e.WA_PHONE_NUMBER_ID}?fields=display_phone_number,verified_name,quality_rating&access_token=${e.WA_ACCESS_TOKEN}`);const j=await r.json();wa={...wa,ok:r.ok,number:j.display_phone_number,name:j.verified_name,quality:j.quality_rating,error:j.error?.message}}catch(x){wa.error=String(x)}}
return NextResponse.json({origin:`${proto}://${host}`,verifyToken:e.META_VERIFY_TOKEN||"setu_verify_123",whatsapp:wa,template:e.WA_WELCOME_TEMPLATE||"",instagram:{configured:igLive()},facebook:{configured:fbLive()},signature:!!e.META_APP_SECRET,websiteKey:!!e.WEBSITE_WEBHOOK_KEY,googleKey:!!e.GOOGLE_ADS_KEY,leads:S.leads.length,channels:S.channels})}
