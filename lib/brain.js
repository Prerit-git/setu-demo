import { avail } from "./inv";

// ============ AANYA — SETU ki AI sales assistant (soft, warm, ladki ki awaaz) ============
// Har jawab ke 2 roop: `reply` (Hinglish, screen pe dikhane ke liye) aur `speak` (Devanagari Hindi, awaaz ke liye).
// Hindi awaaz Roman text ko English letters ki tarah padhti hai — isi se "bolna nahi aata" lagta tha.
export const AGENT = "Aanya";
const ZN = ["golf course", "dlf", "sohna", "sector 54", "dwarka", "mg road"];
const ZHI = { "golf course": "गोल्फ कोर्स रोड", dlf: "डी एल एफ फेज़ पाँच", sohna: "सोहना रोड", "sector 54": "सेक्टर चौवन", dwarka: "द्वारका एक्सप्रेसवे", "mg road": "एम जी रोड" };

// price ko bolne layak: "₹3.20 Cr" -> "3.2 crore"
const sp = (p) => String(p).replace("₹", "").replace(/(\d+\.\d*?)0+\s*Cr/i, "$1 Cr").replace(/\.\s*Cr/i, " Cr").replace(/\s*Cr/i, " crore");
const NUM = ["शून्य", "एक", "दो", "तीन", "चार", "पाँच", "छह", "सात", "आठ", "नौ", "दस"];
const hiNum = (t) => String(t).replace(/\d+/g, (n) => NUM[+n] ?? n);
const spHi = (p) => hiNum(sp(p).replace("crore", "करोड़").replace(/\./g, " दशमलव "));

export function opener({ name = "", mode = "inbound" } = {}) {
  const f = (name || "").split(" ")[0];
  const has = f && f.toLowerCase() !== "customer";
  const hi = has ? `${f} ji` : "ji", hiD = has ? `${f} जी` : "जी";
  if (mode === "outbound")
    return {
      text: `Namaste ${hi}, main ${AGENT} bol rahi hu, KMA Global Property se. Aapne property ke liye enquiry ki thi. Kya abhi do minute baat kar sakte hain? Ye baat-cheet quality ke liye save ho sakti hai.`,
      speak: `नमस्ते ${hiD}, मैं आन्या बोल रही हूँ, के एम ए ग्लोबल प्रॉपर्टी से। आपने प्रॉपर्टी के लिए इन्क्वायरी की थी। क्या अभी दो मिनट बात कर सकते हैं? यह बातचीत क्वालिटी के लिए सेव हो सकती है।`,
    };
  return {
    text: `Namaste ${hi}! Main ${AGENT} hu, KMA Global Property se. Boliye, kaisi property dhoondh rahe hain? Ye baat-cheet quality ke liye save ho sakti hai.`,
    speak: `नमस्ते ${hiD}! मैं आन्या हूँ, के एम ए ग्लोबल प्रॉपर्टी से। बोलिए, कैसी प्रॉपर्टी ढूँढ रहे हैं? यह बातचीत क्वालिटी के लिए सेव हो सकती है।`,
  };
}

// Fallback (API key na ho): rules + live inventory
function rule(text, name) {
  const x = text.toLowerCase();
  const bhk = +(x.match(/(\d)\s*bhk/) || [])[1] || 0;
  const cr = +(x.match(/(\d+(?:\.\d+)?)\s*(?:cr|crore|करोड़)/) || [])[1] || 0;
  const visit = /visit|site|tour|dekhna|dekh|मिलना|देखना/.test(x);
  const z = ZN.find((k) => x.includes(k));
  let m = avail().filter((p) => (!bhk || p.bhk === bhk) && (!cr || p.cr <= cr * 1.15) && (!z || p.zone.toLowerCase().includes(z))).slice(0, 2);
  const none = !m.length;
  if (none) m = avail().slice(0, 2);
  const f = (name || "").split(" ")[0];
  const has = f && f.toLowerCase() !== "customer";
  const who = has ? `${f} ji` : "ji", whoD = has ? `${f} जी` : "जी";
  const list = m.map((p) => `${p.t}, ${p.bhk} BHK, ${p.zone}, ${sp(p.price)}`).join(" aur ");
  const listD = m.map((p) => `${p.t}, ${hiNum(p.bhk)} बी एच के, ${ZHI[ZN.find((k) => p.zone.toLowerCase().includes(k))] || p.zone}, ${spHi(p.price)}`).join(" और ");
  let reply, speak;
  if (visit) {
    reply = `Zaroor ${who}! Main Saturday subah gyarah baje ka site visit book kar deti hu. Wahan hamare advisor aapko mil jayenge.`;
    speak = `ज़रूर ${whoD}! मैं शनिवार सुबह ग्यारह बजे का साइट विज़िट बुक कर देती हूँ। वहाँ हमारे एडवाइज़र आपको मिल जाएँगे।`;
  } else if (none) {
    reply = `${who}, exact match abhi available nahi hai, lekin ye options hain: ${list}. Kya main inme se dikha dun?`;
    speak = `${whoD}, बिल्कुल यही अभी उपलब्ध नहीं है, लेकिन ये विकल्प हैं: ${listD}। क्या मैं इनमें से दिखा दूँ?`;
  } else {
    reply = `${who}, aapke liye ye available hain: ${list}. Kya main site visit book kar dun?`;
    speak = `${whoD}, आपके लिए ये उपलब्ध हैं: ${listD}। क्या मैं साइट विज़िट बुक कर दूँ?`;
  }
  return { reply, speak, intent: { bhk: bhk || null, budget: cr ? cr + " Cr" : null, zone: z || null, visit }, mode: "rules" };
}

// AI dimaag: Claude + LIVE inventory (sirf Available units recommend karta hai)
export async function think({ text, name, history = [], mode = "inbound", lang = "hi-IN" }) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return rule(text, name);
  try {
    const inv = avail().map((p) => `${p.t} | ${p.bhk} BHK | ${p.zone} | ${sp(p.price)}`).join("\n");
    const system = `You are ${AGENT}, a warm, soft-spoken young woman working as the AI sales assistant of KMA Global Property, a Gurgaon real-estate company. You are on a LIVE PHONE CALL${mode === "outbound" ? ", and YOU called the customer who had enquired earlier, so be extra polite and respect their time" : ""}.

HOW TO SOUND HUMAN (very important):
- Talk like a real, friendly Delhi-NCR sales girl, not like a bot. Short sentences. Natural fillers sparingly ("जी", "अच्छा", "ठीक है", "बिल्कुल").
- Max 2 short sentences, under 30 words. ONE question at a time. Acknowledge what the customer just said before asking the next thing.
- Use FEMININE Hindi grammar for yourself (बता सकती हूँ, कर देती हूँ, बोल रही हूँ). Address the customer respectfully (आप, जी).
- Never read lists. Mention at most 2 properties. Never invent units, prices, availability or discounts: recommend ONLY from the LIVE INVENTORY below. If nothing matches, say so honestly and offer the closest alternatives.
- Flow: understand BHK, budget, zone, timeline (one by one) -> recommend -> offer a site visit when interest is clear. If they say stop / not interested / busy, thank them warmly and end.

OUTPUT: ONLY JSON, no other text:
{"reply":"<Hinglish in Roman script, for the screen>","speak":"${lang.startsWith("en") ? "<same as reply>" : "<the SAME message in Devanagari Hindi script for the voice engine: numbers written as words, prices like 'तीन दशमलव दो करोड़', BHK as 'बी एच के', property names may stay in English letters>"}","intent":{"bhk":number|null,"budget":string|null,"zone":string|null,"visit":boolean,"timeline":string|null,"mood":"happy"|"neutral"|"annoyed","end":boolean}}

LIVE INVENTORY:
${inv}
Customer name: ${name || "unknown"}.`;
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({ model: process.env.ANTHROPIC_MODEL || "claude-sonnet-5-5", max_tokens: 500, system, messages: [...history.slice(-8), { role: "user", content: text }] }),
    });
    const j = await r.json();
    const t = j.content?.[0]?.text || "";
    const o = JSON.parse(t.slice(t.indexOf("{"), t.lastIndexOf("}") + 1));
    return { ...o, speak: o.speak || o.reply, mode: "claude" };
  } catch {
    return rule(text, name);
  }
}
