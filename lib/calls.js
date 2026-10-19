// AI call log: transcript + auto lead profile + score + summary
const g = globalThis;
if (!g.__calls) g.__calls = { items: [], seq: 1 };
export const CALLS = g.__calls;

export function score(p = {}) {
  let s = 10;
  if (p.bhk) s += 15;
  if (p.budget) s += 20;
  if (p.zone) s += 15;
  if (p.timeline) s += 10;
  if (p.visit) s += 30;
  if (p.mood === "annoyed") s -= 20;
  s = Math.max(0, Math.min(100, s));
  return { score: s, label: s >= 70 ? "HOT" : s >= 40 ? "WARM" : "COLD" };
}

function ruleSummary(p, tr) {
  const bits = [p.bhk && `${p.bhk} BHK`, p.budget && `budget ${p.budget}`, p.zone && p.zone, p.timeline].filter(Boolean).join(", ");
  return {
    summary: bits ? `Customer ne bataya: ${bits}. Site visit: ${p.visit ? "haan, ruchi hai" : "abhi confirm nahi"}.` : `Baat-cheet me ${tr.length} messages hue, requirement abhi clear nahi.`,
    next: p.visit ? "Site visit confirm karo aur advisor assign karo" : p.bhk || p.zone ? "WhatsApp pe 2 matching options bhejo, 1 din baad follow-up" : "WhatsApp pe welcome + requirement poochne wala template bhejo",
  };
}

async function aiSummary(p, tr) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key || tr.length < 2) return ruleSummary(p, tr);
  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || "claude-sonnet-5-5", max_tokens: 300,
        system: `Summarise this real-estate sales call for the sales team. Output ONLY JSON {"summary":"<=30 words English/Hinglish","next":"<=15 words best next action"}. Do not invent facts that are not in the transcript.`,
        messages: [{ role: "user", content: tr.map((m) => `${m.r === "user" ? "Customer" : "AI"}: ${m.t}`).join("\n") }],
      }),
    });
    const j = await r.json(); const t = j.content?.[0]?.text || "";
    return JSON.parse(t.slice(t.indexOf("{"), t.lastIndexOf("}") + 1));
  } catch { return ruleSummary(p, tr); }
}

export async function saveCall({ name = "Customer", phone = "", transcript = [], profile = {}, duration = 0, mode = "inbound" }) {
  const sc = score(profile);
  const s = await aiSummary(profile, transcript);
  const c = { id: CALLS.seq++, at: Date.now(), name, phone, mode, duration, transcript, profile, ...sc, ...s };
  CALLS.items.unshift(c);
  CALLS.items.length = Math.min(CALLS.items.length, 200);
  return c;
}
