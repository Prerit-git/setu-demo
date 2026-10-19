import {NextResponse} from "next/server";import {waLive} from "@/lib/whatsapp";
export const dynamic="force-dynamic";
const g=globalThis;
// Business WhatsApp number (wa.me link / QR ke liye). WA_BUSINESS_NUMBER env ya Meta se auto
export async function GET(){const e=process.env;let wa=(e.WA_BUSINESS_NUMBER||"").replace(/\D/g,"");
if(!wa&&waLive()){if(g.__waNum===undefined){try{const r=await fetch(`https://graph.facebook.com/${e.WA_GRAPH_VERSION||"v21.0"}/${e.WA_PHONE_NUMBER_ID}?fields=display_phone_number&access_token=${e.WA_ACCESS_TOKEN}`);const j=await r.json();g.__waNum=(j.display_phone_number||"").replace(/\D/g,"")}catch{g.__waNum=""}}wa=g.__waNum}
return NextResponse.json({wa,live:waLive(),brand:"KMA Global Property"})}
