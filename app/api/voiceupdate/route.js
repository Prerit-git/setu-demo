import { NextResponse } from "next/server";
import { extract, STAGES, STAGE_LABEL } from "@/lib/extract";
import { TL, applyUpdate, setTask } from "@/lib/timeline";
export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({ entries: TL.entries.slice(0, 100), tasks: TL.tasks.slice(0, 200), stages: STAGES, labels: STAGE_LABEL });
}

// 1) bolna -> proposal (abhi apply nahi hota)
export async function POST(req) {
  const { transcript, leadId, leads } = await req.json();
  if (!String(transcript || "").trim()) return NextResponse.json({ error: "Kuch bolo ya likho" }, { status: 400 });
  return NextResponse.json({ proposal: await extract({ transcript, leads: leads || [], leadId }) });
}

// 2) confirm -> timeline + tasks me apply
export async function PUT(req) {
  const { leadId, leadName, update, by, transcript } = await req.json();
  if (!leadId) return NextResponse.json({ error: "Lead chuno" }, { status: 400 });
  return NextResponse.json({ ok: true, ...applyUpdate({ leadId, leadName, update, by, transcript }) });
}

export async function PATCH(req) {
  const { taskId, done } = await req.json();
  return NextResponse.json({ ok: setTask(taskId, done) });
}
