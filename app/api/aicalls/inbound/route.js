import { NextResponse } from "next/server";
import { optOut, isStop } from "@/lib/campaign";
import { markReplied } from "@/lib/outbound";

// flow.js ke inbound me har incoming WhatsApp message pe ye call karo:
//   fetch("http://localhost:3002/api/aicalls/inbound",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({phone,text})})
// Ya seedha: import {markReplied} from "@/lib/outbound"; import {optOut,isStop} from "@/lib/campaign";
export async function POST(req) {
  const { phone, text } = await req.json();
  markReplied(phone);
  const stop = isStop(text);
  if (stop) optOut(phone);
  return NextResponse.json({ ok: true, optedOut: stop });
}
