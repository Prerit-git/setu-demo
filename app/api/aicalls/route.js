import { NextResponse } from "next/server";
import { CALLS, saveCall } from "@/lib/calls";
import { O, enqueue, dial, provider } from "@/lib/outbound";
export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({ calls: CALLS.items, jobs: O.jobs, provider: provider() });
}

export async function POST(req) {
  const b = await req.json();
  if (b.type === "enqueue") { const j = enqueue({ name: b.name, phone: b.phone, reason: "manual" }); return NextResponse.json({ ok: !!j, job: j }); }
  return NextResponse.json({ ok: true, call: await saveCall(b) });
}

export async function PATCH(req) {
  const { id, action } = await req.json();
  const j = O.jobs.find((x) => x.id === id); if (!j) return NextResponse.json({ ok: false });
  if (action === "cancel") { j.state = "cancelled"; j.note = "manually cancel"; }
  if (action === "done") j.state = "done";
  if (action === "dial") { const r = await dial(j); j.note = r.ok ? "dial request bheja" : r.err; if (r.ok) j.state = "done"; return NextResponse.json(r); }
  return NextResponse.json({ ok: true });
}
