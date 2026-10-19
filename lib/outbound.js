// Outbound AI call queue.
// Jobs 2 jagah se aate hain: (1) campaign me "jawab na aaye to AI call" (2) manual "Call queue me daalo".
// Abhi: manual mode — "AI se call karo" dabao to /voice me Aanya us lead se baat shuru karti hai (tum lead ban ke test karo).
// Real phone call: EXOTEL_* env daalo (neeche dial()) — telephony account ke baad hi chalega.
import { C as CAMP, normPhone } from "./campaign";

const g = globalThis;
if (!g.__out) g.__out = { jobs: [], seq: 1, replied: new Set(), timer: null };
export const O = g.__out;

export const provider = () => (process.env.EXOTEL_SID && process.env.EXOTEL_KEY && process.env.EXOTEL_TOKEN && process.env.EXOTEL_FROM ? "exotel" : "manual");

export function enqueue({ name = "", phone, reason = "manual", campaignId = null }) {
  const p = normPhone(phone); if (!p) return null;
  if (CAMP.optout.has(p)) return null;
  const dup = O.jobs.find((j) => j.phone === p && j.state === "queued");
  if (dup) return dup;
  const j = { id: O.seq++, name, phone: p, reason, campaignId, state: "queued", at: Date.now(), note: "" };
  O.jobs.unshift(j);
  return j;
}

// flow.js ke inbound me: customer ne reply kiya -> AI call ki zaroorat nahi
export function markReplied(phone) {
  const p = normPhone(phone); if (!p) return;
  O.replied.add(p);
  for (const j of O.jobs) if (j.phone === p && j.state === "queued" && j.reason === "no-reply") { j.state = "cancelled"; j.note = "customer ne reply kar diya"; }
}

// Campaign contacts: WhatsApp gaya + callAfterMin tak reply nahi -> call queue
function scan() {
  const now = Date.now();
  for (const c of CAMP.items) {
    if (!c.callFallback) continue;
    for (const ct of c.contacts) {
      if (ct.st === "sent" && !ct.called && !O.replied.has(ct.phone) && now - ct.at >= c.callAfterMin * 60000) {
        ct.called = true;
        enqueue({ name: ct.vars.name, phone: ct.phone, reason: "no-reply", campaignId: c.id });
      }
    }
  }
}
if (!O.timer) { O.timer = setInterval(scan, 5000); O.timer.unref?.(); }

// Real dial (EXPERIMENTAL — Exotel account ke baad apne flow/applet ke saath test karna)
export async function dial(job) {
  if (provider() !== "exotel") return { ok: false, err: "Telephony set nahi hai" };
  const sub = process.env.EXOTEL_SUBDOMAIN || "api.exotel.com";
  const auth = Buffer.from(`${process.env.EXOTEL_KEY}:${process.env.EXOTEL_TOKEN}`).toString("base64");
  const body = new URLSearchParams({ From: "+" + job.phone, CallerId: process.env.EXOTEL_FROM });
  if (process.env.EXOTEL_FLOW_URL) body.set("Url", process.env.EXOTEL_FLOW_URL);
  const r = await fetch(`https://${sub}/v1/Accounts/${process.env.EXOTEL_SID}/Calls/connect.json`, { method: "POST", headers: { Authorization: `Basic ${auth}` }, body });
  const t = await r.text();
  return r.ok ? { ok: true } : { ok: false, err: `HTTP ${r.status} ${t.slice(0, 120)}` };
}
