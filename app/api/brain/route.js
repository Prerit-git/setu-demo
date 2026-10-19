import { NextResponse } from "next/server";
import { think, opener, AGENT } from "@/lib/brain";

export async function POST(req) {
  return NextResponse.json(await think(await req.json()));
}
// GET /api/brain?name=Rahul&mode=outbound -> Aanya ka opening line (screen text + awaaz wala Devanagari)
export function GET(req) {
  const u = new URL(req.url).searchParams;
  const o = opener({ name: u.get("name") || "", mode: u.get("mode") || "inbound" });
  return NextResponse.json({ agent: AGENT, opener: o.text, openerSpeak: o.speak });
}
