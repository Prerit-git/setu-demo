// Voice note / bolke likhi gayi baat -> structured lead update.
// Claude (key ho to) warna rules. Output hamesha ek "proposal" hota hai jo apply hone se pehle edit ho sakta hai.
export const STAGES = ["new", "contacted", "interested", "site_visit_scheduled", "site_visit_done", "negotiation", "booked", "lost"];
export const STAGE_LABEL = { new: "New", contacted: "Contacted", interested: "Interested", site_visit_scheduled: "Site visit scheduled", site_visit_done: "Site visit done", negotiation: "Negotiation", booked: "Booked", lost: "Lost" };

const pad = (n) => String(n).padStart(2, "0");
export const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const WD = { sunday: 0, ravivar: 0, monday: 1, somvar: 1, tuesday: 2, mangalvar: 2, wednesday: 3, budhvar: 3, thursday: 4, guruvar: 4, friday: 5, shukravar: 5, saturday: 6, shanivar: 6 };
const ZN = ["golf course", "dlf", "sohna", "sector 54", "dwarka", "mg road"];

function findDate(x, now) {
  if (/parso|परसों/.test(x)) return ymd(addDays(now, 2));
  if (/\bkal\b|कल|tomorrow/.test(x)) return ymd(addDays(now, 1));
  if (/\baaj\b|आज|today/.test(x)) return ymd(now);
  for (const [k, v] of Object.entries(WD)) if (x.includes(k)) { let diff = (v - now.getDay() + 7) % 7; if (diff === 0) diff = 7; return ymd(addDays(now, diff)); }
  const m = x.match(/(\d{1,2})\s*(?:tarikh|tareekh|th|st|nd|rd)\b/); if (m) { const d = new Date(now.getFullYear(), now.getMonth(), +m[1]); if (d < now) d.setMonth(d.getMonth() + 1); return ymd(d); }
  return null;
}
function findTime(x) {
  const m = x.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm|baje|bje)/);
  if (!m) return null;
  let h = +m[1]; const mi = m[2] || "00";
  if (m[3] === "pm" && h < 12) h += 12;
  if ((m[3] === "baje" || m[3] === "bje") && h >= 1 && h <= 7) h += 12; // "4 baje" = shaam
  return `${pad(h)}:${mi}`;
}

export function ruleExtract({ transcript, leads = [], leadId, now = new Date() }) {
  const raw = String(transcript || ""), x = raw.toLowerCase();
  const out = { leadId: leadId || null, summary: raw.replace(/\s+/g, " ").trim().slice(0, 200), stage: null, siteVisit: null, followUp: null, budget: null, bhk: null, zone: null, objections: [], tasks: [], temperature: null, sentiment: null, confidence: 0.5, missing: [], mode: "rules" };
  if (!out.leadId) { const hit = leads.find((l) => l.name && x.includes(l.name.toLowerCase().split(" ")[0]) && l.name.split(" ")[0].length > 2); if (hit) { out.leadId = hit.id; out.confidence += 0.15; } }
  const d = findDate(x, now), t = findTime(x);
  const sched = /(fix|book|schedule|tay|confirm|rakh|rakhi|rakha|plan)/.test(x) && /(visit|site)/.test(x) && (d || t);
  if (sched) { out.stage = "site_visit_scheduled"; out.siteVisit = { date: d, time: t, done: false }; }
  else if (/(visit|site).*(ho gay|ho gai|kar li|kar liya|hua|complete|dekh li|dekhi)|(dekh li|dekhi).*(site|property)/.test(x)) { out.stage = "site_visit_done"; out.siteVisit = { date: ymd(now), time: null, done: true }; }
  else if (/(visit|site|dekhne|dikhane|aane)/.test(x) && (d || t) && !/nahi/.test(x)) { out.stage = "site_visit_scheduled"; out.siteVisit = { date: d, time: t, done: false }; }
  if (/booking|token (de|diya|mil)|book kar (li|liya)|final ho gay/.test(x)) out.stage = "booked";
  else if (/negotiat|discount|rate kam|price kam|bargain|best price/.test(x)) out.stage = out.stage || "negotiation";
  if (/nahi lena|not interested|interested nahi|cancel|band karo|mana kar|drop/.test(x)) out.stage = "lost";
  if (!out.stage && /interested|pasand aa|acha laga|achha laga|positive|serious/.test(x)) out.stage = "interested";
  if (!out.stage && /baat hui|call (kiya|ki)|phone (kiya|pe)|connect hua|pick/.test(x)) out.stage = "contacted";
  const fu = x.match(/(follow ?up|call back|callback|phir call|dobara call|wapas call|reminder|yaad)[^.]*?/);
  if (fu && (d || t) && out.stage !== "site_visit_scheduled") out.followUp = { date: d, time: t, action: "Follow-up call" };
  if (!out.followUp && out.stage === "site_visit_done") out.followUp = { date: ymd(addDays(now, 1)), time: null, action: "Visit ke baad feedback lo" };
  const cr = x.match(/(\d+(?:\.\d+)?)\s*(?:cr|crore|करोड़)/); if (cr) out.budget = cr[1] + " Cr";
  const lk = x.match(/(\d+(?:\.\d+)?)\s*(?:lakh|lac|लाख)/); if (!out.budget && lk) out.budget = lk[1] + " Lakh";
  const bk = x.match(/(\d)\s*bhk/); if (bk) out.bhk = +bk[1];
  out.zone = ZN.find((k) => x.includes(k)) || null;
  if (/mehenga|costly|expensive|budget (se )?(jyada|zyada|upar)|price high/.test(x)) out.objections.push("Price zyada lag raha hai");
  if (/location|door|far/.test(x) && /dikkat|problem|nahi pasand|door hai/.test(x)) out.objections.push("Location issue");
  if (/family|wife|patni|papa|ghar wale|husband/.test(x) && /puch|discuss|decide|baat kar/.test(x)) out.objections.push("Family se discuss karna hai");
  out.temperature = out.stage === "booked" || out.stage === "negotiation" || out.stage === "site_visit_scheduled" ? "hot" : out.stage === "lost" ? "cold" : out.stage ? "warm" : null;
  if (out.followUp) out.tasks.push({ title: out.followUp.action, due: out.followUp.date, time: out.followUp.time });
  if (out.siteVisit && !out.siteVisit.done) out.tasks.push({ title: "Site visit reminder + advisor assign", due: out.siteVisit.date, time: out.siteVisit.time });
  if (!out.leadId) out.missing.push("lead");
  if (!out.stage) out.missing.push("stage");
  return out;
}

export async function extract({ transcript, leads = [], leadId, now = new Date() }) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return ruleExtract({ transcript, leads, leadId, now });
  try {
    const wd = now.toLocaleDateString("en-US", { weekday: "long" });
    const list = leads.slice(0, 80).map((l) => `${l.id} | ${l.name} | ${l.status || ""}`).join("\n");
    const system = `You turn a real-estate salesperson's spoken field update (Hindi/Hinglish/English, possibly messy speech-to-text) into a structured CRM update. Today is ${ymd(now)} (${wd}), India time. Resolve relative dates (kal, parso, Saturday, next week) into YYYY-MM-DD and times into 24h HH:MM.
RULES: Only use facts present in the update. Never invent budgets, dates or names. If something is not mentioned use null / []. If the salesperson sounds unsure, lower the confidence. A scheduled future visit => stage "site_visit_scheduled"; a visit that already happened => "site_visit_done".
${leadId ? `The update is about lead id ${leadId}.` : `Match the lead from this list by the name spoken (fuzzy, Hindi/English spelling differences allowed); if unsure leave leadId null:\n${list}`}
Output ONLY JSON: {"leadId":string|number|null,"summary":"<=40 words English/Hinglish, what happened","stage":${JSON.stringify(STAGES)}|null,"siteVisit":{"date":"YYYY-MM-DD"|null,"time":"HH:MM"|null,"done":boolean}|null,"followUp":{"date":"YYYY-MM-DD"|null,"time":"HH:MM"|null,"action":string}|null,"budget":string|null,"bhk":number|null,"zone":string|null,"objections":string[],"tasks":[{"title":string,"due":"YYYY-MM-DD"|null,"time":"HH:MM"|null}],"temperature":"hot"|"warm"|"cold"|null,"sentiment":"positive"|"neutral"|"negative"|null,"confidence":number between 0 and 1,"missing":string[]}`;
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST", headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({ model: process.env.ANTHROPIC_MODEL || "claude-sonnet-5-5", max_tokens: 800, system, messages: [{ role: "user", content: transcript }] }),
    });
    const j = await r.json(), t = j.content?.[0]?.text || "";
    const o = JSON.parse(t.slice(t.indexOf("{"), t.lastIndexOf("}") + 1));
    return { ...o, leadId: leadId || o.leadId || null, objections: o.objections || [], tasks: o.tasks || [], missing: o.missing || [], mode: "claude" };
  } catch {
    return ruleExtract({ transcript, leads, leadId, now });
  }
}
