import {NextResponse} from "next/server";import {S,addMsg,ev} from "@/lib/store";import {inbound} from "@/lib/flow";import {sendWA} from "@/lib/whatsapp";import {sendIG} from "@/lib/meta";
export const dynamic="force-dynamic";
export async function GET(){return NextResponse.json({chats:Object.values(S.chats).filter(c=>c.msgs.length).sort((a,b)=>b.msgs.at(-1).at-a.msgs.at(-1).at)})}
export async function POST(req){const b=await req.json();
if(b.action==="agent"){const ig=b.phone.startsWith("ig:"),s=ig?await sendIG(b.phone.slice(3),b.text):await sendWA(b.phone,b.text);addMsg(b.phone,"","out",b.text);ev(`Agent reply (${s.mode}) → ${b.phone}`,"WhatsApp Triggers",s.ok?"ok":"err");return NextResponse.json(s)}
return NextResponse.json(await inbound(b))}
