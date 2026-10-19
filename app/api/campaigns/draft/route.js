import { NextResponse } from "next/server";

// AI se 3 message variants (Hinglish). Key na ho to ready-made variants.
const fallback = (goal) => [
  `Namaste {{name}} ji! ${goal}. Details ke liye reply karein ya call karein. Band karne ke liye STOP likhein.`,
  `Hi {{name}}, ${goal}. Kya aap interested hain? Reply YES, hum aapko details bhej denge. (STOP = unsubscribe)`,
  `{{name}} ji, ek khaas update: ${goal}. Site visit book karni ho to bas reply karein. STOP likhein to band.`,
];

export async function POST(req) {
  const { goal = "" } = await req.json();
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return NextResponse.json({ variants: fallback(goal), mode: "rules" });
  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || "claude-sonnet-5-5", max_tokens: 700,
        system: `You write WhatsApp broadcast messages for KMA Global Property, a Gurgaon real-estate company. Write 3 DIFFERENT variants in natural Hinglish, each under 280 characters, warm and non-spammy, no fake urgency, no false claims or invented prices. Use {{name}} for the contact's name. End every variant with a short opt-out line like "Band karne ke liye STOP likhein". Output ONLY a JSON array of 3 strings.`,
        messages: [{ role: "user", content: goal }],
      }),
    });
    const j = await r.json(); const t = j.content?.[0]?.text || "";
    const arr = JSON.parse(t.slice(t.indexOf("["), t.lastIndexOf("]") + 1));
    return NextResponse.json({ variants: arr.slice(0, 3), mode: "claude" });
  } catch {
    return NextResponse.json({ variants: fallback(goal), mode: "rules" });
  }
}
