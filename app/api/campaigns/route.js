import { NextResponse } from "next/server";
import { C, create, get, act, summary, isLive, dailyCap, optOut, parseContacts, fill } from "@/lib/campaign";
import "@/lib/outbound"; // call-fallback scanner chalu rakhta hai
export const dynamic = "force-dynamic";

export function GET(req) {
  const id = new URL(req.url).searchParams.get("id");
  const base = { live: isLive(), cap: dailyCap(), sentToday: C.sentToday, optouts: C.optout.size };
  if (id) {
    const c = get(id); if (!c) return NextResponse.json({ ...base, error: "not found" }, { status: 404 });
    const log = c.contacts.filter((x) => x.st !== "queued").slice(-60).reverse().map((x) => ({ phone: x.phone, name: x.vars.name, st: x.st, err: x.err, at: x.at }));
    const preview = c.contacts.slice(0, 3).map((x) => ({ phone: x.phone, msg: fill(c.text, x.vars) }));
    return NextResponse.json({ ...base, campaign: summary(c), log, preview });
  }
  return NextResponse.json({ ...base, items: C.items.map(summary) });
}

export async function POST(req) {
  const b = await req.json();
  if (b.dryRun) { const p = parseContacts(b.contactsText); return NextResponse.json({ ok: true, count: p.contacts.length, total: p.total, bad: p.bad.length, dupes: p.dupes, optedOut: p.optedOut, sample: p.contacts.slice(0, 3).map((x) => ({ phone: x.phone, msg: fill(b.text, x.vars) })) }); }
  if (!b.text?.trim() && !b.metaTemplate) return NextResponse.json({ ok: false, error: "Message likho" }, { status: 400 });
  const c = create(b);
  if (!c.contacts.length) { act(c.id, "delete"); return NextResponse.json({ ok: false, error: "Ek bhi valid number nahi mila" }, { status: 400 }); }
  return NextResponse.json({ ok: true, id: c.id, report: c.report });
}

export async function PATCH(req) {
  const { id, action, phone } = await req.json();
  if (action === "optout") return NextResponse.json({ ok: optOut(phone) });
  return NextResponse.json({ ok: !!act(id, action) });
}
