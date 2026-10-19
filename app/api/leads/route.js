import {NextResponse} from "next/server";import {S,ev} from "@/lib/store";import {ingest} from "@/lib/flow";import {waLive} from "@/lib/whatsapp";
export const dynamic="force-dynamic";
export async function GET(){const st=S.stats;return NextResponse.json({leads:S.leads,events:S.events,live:waLive(),avgMs:st.replies?Math.round(st.ms/st.replies):0,replies:st.replies})}
export async function POST(req){return NextResponse.json(await ingest(await req.json()))}
export async function PATCH(req){const {id,status}=await req.json(),l=S.leads.find(x=>x.id===id);if(l){l.status=status;ev(`${l.name} → ${status}`,"Leads")}return NextResponse.json({ok:!!l})}
