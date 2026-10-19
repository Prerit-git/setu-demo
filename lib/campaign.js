// SETU Bulk Campaign Engine
// - CSV import + phone cleanup + dedupe + opt-out (suppression) list
// - Rate-limited queue (msgs/sec) + daily cap, pause / resume / retry
// - WA_TOKEN + WA_PHONE_ID set hai to REAL Meta WhatsApp Cloud API, warna SIMULATED
const g = globalThis;
if (!g.__camp) g.__camp = { items: [], optout: new Set(), seq: 1, day: "", sentToday: 0 };
export const C = g.__camp;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
export const isLive = () => !!(process.env.WA_TOKEN && process.env.WA_PHONE_ID);
export const dailyCap = () => +process.env.WA_DAILY_CAP || 1000;

// ---------- phone cleanup ----------
export function normPhone(p) {
  let d = String(p || "").replace(/\D/g, "");
  if (d.length === 11 && d[0] === "0") d = d.slice(1);
  if (d.length === 10 && /^[6-9]/.test(d)) return "91" + d;
  if (d.length === 12 && d.startsWith("91") && /^[6-9]/.test(d[2])) return d;
  if (d.length >= 11 && d.length <= 15 && d[0] !== "0") return d; // international (UAE etc.)
  return null;
}

// ---------- CSV ----------
function splitCsv(line) {
  const out = []; let cur = "", q = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') { if (q && line[i + 1] === '"') { cur += '"'; i++; } else q = !q; }
    else if ((ch === "," || ch === "\t" || ch === ";") && !q) { out.push(cur.trim()); cur = ""; }
    else cur += ch;
  }
  out.push(cur.trim());
  return out;
}

export function parseContacts(text) {
  const rows = String(text || "").split(/\r?\n/).map((l) => l.trim()).filter(Boolean).map(splitCsv);
  const res = { contacts: [], bad: [], dupes: 0, optedOut: 0, total: 0 };
  if (!rows.length) return res;
  const isPh = (h) => /^(phone|mobile|number|whatsapp|contact|mob)/.test(h);
  const hdr = rows[0].map((x) => x.toLowerCase());
  const hasHdr = hdr.some(isPh);
  const body = hasHdr ? rows.slice(1) : rows;
  const seen = new Set();
  for (const r of body) {
    res.total++;
    let phone = null, name = "", vars = {};
    if (hasHdr) {
      r.forEach((v, i) => { if (hdr[i]) vars[hdr[i]] = v; });
      const pi = hdr.findIndex(isPh);
      phone = normPhone(r[pi]); name = vars.name || vars.full_name || "";
    } else {
      const pi = r.findIndex((c) => normPhone(c));
      if (pi >= 0) { phone = normPhone(r[pi]); name = r.find((c, i) => i !== pi && c) || ""; }
    }
    if (!phone) { res.bad.push(r.join(" | ")); continue; }
    if (seen.has(phone)) { res.dupes++; continue; }
    seen.add(phone);
    if (C.optout.has(phone)) { res.optedOut++; continue; }
    vars.name = name || vars.name || "";
    vars.first_name = (vars.name || "").split(" ")[0] || "";
    res.contacts.push({ phone, vars, st: "queued", err: "", at: 0 });
  }
  return res;
}

// {{name}} / {{first_name}} / {{zone}} ... (CSV ke column naam). Khali ho to "ji" lagta hai name ki jagah.
export function fill(t, vars) {
  return String(t || "").replace(/\{\{\s*([\w]+)\s*\}\}/g, (_, k) => {
    const v = vars[k.toLowerCase()];
    if (v) return v;
    return k === "name" || k === "first_name" ? "ji" : "";
  });
}

// ---------- opt-out ----------
export const isStop = (text) => /^\s*(stop|unsubscribe|band karo|ruko|opt\s*out)\s*[.!]*\s*$/i.test(text || "");
export function optOut(phone) {
  const p = normPhone(phone); if (!p) return false;
  C.optout.add(p);
  for (const c of C.items) for (const ct of c.contacts) if (ct.phone === p && ct.st === "queued") { ct.st = "skipped"; ct.err = "opted out"; }
  return true;
}

// ---------- campaigns ----------
export function create({ name, text, metaTemplate = "", params = [], lang = "en", rate = 5, contactsText, callFallback = false, callAfterMin = 30 }) {
  const parsed = parseContacts(contactsText);
  const c = {
    id: C.seq++, name: name || `Campaign ${C.seq}`, text: text || "", metaTemplate, params, lang,
    rate: Math.min(Math.max(+rate || 5, 0.2), 20), state: "draft", createdAt: Date.now(),
    contacts: parsed.contacts, report: { total: parsed.total, bad: parsed.bad.slice(0, 20), badCount: parsed.bad.length, dupes: parsed.dupes, optedOut: parsed.optedOut },
    i: 0, note: "", callFallback: !!callFallback, callAfterMin: Math.max(+callAfterMin || 30, 0.1),
  };
  C.items.unshift(c);
  return c;
}
export const get = (id) => C.items.find((x) => x.id === +id);

export function stats(c) {
  const s = { queued: 0, sending: 0, sent: 0, failed: 0, skipped: 0 };
  for (const x of c.contacts) s[x.st]++;
  return { ...s, total: c.contacts.length };
}
export const summary = (c) => ({ id: c.id, name: c.name, state: c.state, rate: c.rate, note: c.note, createdAt: c.createdAt, metaTemplate: c.metaTemplate, callFallback: c.callFallback, callAfterMin: c.callAfterMin, report: c.report, stats: stats(c), text: c.text });

async function deliver(c, ct) {
  if (!isLive()) { await sleep(25); return { ok: true, sim: true }; }
  const body = c.metaTemplate
    ? { messaging_product: "whatsapp", to: ct.phone, type: "template", template: { name: c.metaTemplate, language: { code: c.lang || "en" },
        ...(c.params?.length ? { components: [{ type: "body", parameters: c.params.map((k) => ({ type: "text", text: String(ct.vars[k] || fill(`{{${k}}}`, ct.vars) || "-") })) }] } : {}) } }
    : { messaging_product: "whatsapp", to: ct.phone, type: "text", text: { body: fill(c.text, ct.vars) } };
  const r = await fetch(`https://graph.facebook.com/v20.0/${process.env.WA_PHONE_ID}/messages`, {
    method: "POST", headers: { Authorization: `Bearer ${process.env.WA_TOKEN}`, "content-type": "application/json" }, body: JSON.stringify(body),
  });
  const j = await r.json().catch(() => ({}));
  if (r.ok && j.messages?.[0]?.id) return { ok: true, id: j.messages[0].id };
  return { ok: false, err: j.error?.message || `HTTP ${r.status}` };
}

async function loop(c) {
  while (c.state === "running") {
    const day = new Date().toDateString();
    if (C.day !== day) { C.day = day; C.sentToday = 0; }
    if (C.sentToday >= dailyCap()) { c.state = "paused"; c.note = `Daily cap ${dailyCap()} poora — kal resume karo (quality rating bachane ke liye)`; break; }
    while (c.i < c.contacts.length && c.contacts[c.i].st !== "queued") c.i++;
    if (c.i >= c.contacts.length) { c.state = "done"; c.note = ""; break; }
    const ct = c.contacts[c.i];
    if (C.optout.has(ct.phone)) { ct.st = "skipped"; ct.err = "opted out"; continue; }
    ct.st = "sending";
    let r; try { r = await deliver(c, ct); } catch (e) { r = { ok: false, err: String(e.message || e) }; }
    if (r.ok) { ct.st = "sent"; ct.at = Date.now(); ct.sim = !!r.sim; C.sentToday++; } else { ct.st = "failed"; ct.err = r.err || "error"; }
    await sleep(1000 / c.rate);
  }
}

export function act(id, action) {
  const c = get(id); if (!c) return null;
  if (action === "start" && c.state !== "running" && c.state !== "done") { c.state = "running"; c.note = ""; loop(c); }
  if (action === "pause" && c.state === "running") c.state = "paused";
  if (action === "retry") { c.contacts.forEach((x) => { if (x.st === "failed") { x.st = "queued"; x.err = ""; } }); c.i = 0; if (c.state === "done") c.state = "paused"; }
  if (action === "delete") { c.state = "paused"; C.items = C.items.filter((x) => x !== c); }
  return c;
}
