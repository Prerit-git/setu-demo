// Lead timeline + follow-up tasks (voice updates yahin jama hote hain)
const g = globalThis;
if (!g.__tl) g.__tl = { entries: [], tasks: [], seq: 1 };
export const TL = g.__tl;

export function applyUpdate({ leadId, leadName, update, by = "Team", transcript = "" }) {
  const e = {
    id: TL.seq++, at: Date.now(), leadId, leadName, by, transcript,
    summary: update.summary || "", stage: update.stage || null, siteVisit: update.siteVisit || null, followUp: update.followUp || null,
    budget: update.budget || null, bhk: update.bhk || null, zone: update.zone || null, objections: update.objections || [],
    temperature: update.temperature || null, sentiment: update.sentiment || null,
  };
  TL.entries.unshift(e);
  TL.entries.length = Math.min(TL.entries.length, 500);
  const tasks = (update.tasks || []).filter((t) => t?.title);
  for (const t of tasks) TL.tasks.unshift({ id: TL.seq++, leadId, leadName, title: t.title, due: t.due || null, time: t.time || null, done: false, from: e.id });
  return { entry: e, tasksAdded: tasks.length };
}

export function setTask(id, done) { const t = TL.tasks.find((x) => x.id === id); if (t) t.done = !!done; return !!t; }
