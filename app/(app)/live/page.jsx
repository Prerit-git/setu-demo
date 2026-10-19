// "use client";
// import { useState, useEffect, useRef } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import QRCode from "qrcode";
// import { Bell, BellOff } from "lucide-react";
// function Qr({ text, title, sub, warn }) {
//   const [u, setU] = useState("");
//   useEffect(() => {
//     if (text)
//       QRCode.toDataURL(text, {
//         margin: 1,
//         width: 260,
//         color: { dark: "#04130a", light: "#ffffff" },
//       }).then(setU);
//   }, [text]);
//   return (
//     <div className="card text-center">
//       <div className="eyebrow">{title}</div>
//       <div className="mx-auto mt-3 grid h-[200px] w-[200px] place-items-center rounded-xl bg-white p-2">
//         {u ? (
//           <img src={u} alt="QR" className="h-full w-full" />
//         ) : (
//           <span className="px-3 text-xs text-slate-600">{warn || "…"}</span>
//         )}
//       </div>
//       <p className="mt-3 text-sm text-slate-300">{sub}</p>
//       {u && warn && <p className="mt-1 text-[11px] text-amber">{warn}</p>}
//     </div>
//   );
// }
// const ago = (t) => {
//   const s = Math.floor((Date.now() - t) / 1000);
//   return s < 5
//     ? "abhi"
//     : s < 60
//       ? s + "s pehle"
//       : Math.floor(s / 60) + "m pehle";
// };
// export default function Live() {
//   const [d, setD] = useState({
//       leads: [],
//       events: [],
//       avgMs: 0,
//       replies: 0,
//       live: false,
//     }),
//     [chats, setChats] = useState([]),
//     [info, setInfo] = useState({}),
//     [pub, setPub] = useState(""),
//     [origin, setOrigin] = useState(""),
//     [snd, setSnd] = useState(false),
//     max = useRef(null),
//     sndRef = useRef(false),
//     [, tick] = useState(0);
//   useEffect(() => {
//     sndRef.current = snd;
//   }, [snd]);
//   useEffect(() => {
//     setOrigin(window.location.origin);
//     try {
//       setPub(localStorage.getItem("setu_pub") || "");
//     } catch {}
//     fetch("/api/public-info")
//       .then((r) => r.json())
//       .then(setInfo);
//   }, []);
//   const beep = () => {
//     try {
//       const a = new (window.AudioContext || window.webkitAudioContext)(),
//         o = a.createOscillator(),
//         g = a.createGain();
//       o.connect(g);
//       g.connect(a.destination);
//       o.type = "sine";
//       o.frequency.setValueAtTime(660, a.currentTime);
//       o.frequency.setValueAtTime(990, a.currentTime + 0.12);
//       g.gain.setValueAtTime(0.15, a.currentTime);
//       g.gain.exponentialRampToValueAtTime(0.001, a.currentTime + 0.4);
//       o.start();
//       o.stop(a.currentTime + 0.4);
//     } catch {}
//   };
//   useEffect(() => {
//     const f = async () => {
//       try {
//         const [l, c] = await Promise.all([
//           fetch("/api/leads").then((r) => r.json()),
//           fetch("/api/chat").then((r) => r.json()),
//         ]);
//         setD(l);
//         setChats(c.chats);
//         const m = Math.max(...l.leads.map((x) => x.id));
//         if (max.current !== null && m > max.current && sndRef.current) beep();
//         max.current = m;
//       } catch {}
//       tick((x) => x + 1);
//     };
//     f();
//     const i = setInterval(f, 1000);
//     return () => clearInterval(i);
//   }, []);
//   const base = (pub || origin).replace(/\/$/, ""),
//     local = !!base && /localhost|127\.0\.0\.1/.test(base);
//   const waLink = info.wa
//     ? `https://wa.me/${info.wa}?text=${encodeURIComponent("Hi, 3BHK chahiye Golf Course Extension me, budget 3 Cr")}`
//     : "";
//   const fresh = d.leads.filter((l) => l.id > 1000).slice(0, 6),
//     real = d.leads.filter((l) => l.id > 1000 && !l.demo).length;
//   const chat = chats.find((c) => !c.demo && c.msgs.length) || chats[0],
//     msgs = chat?.msgs || [],
//     last = msgs.at(-1),
//     typing = last && last.dir === "in" && Date.now() - last.at < 1800;
//   const K = [
//     ["Leads (session)", d.leads.filter((l) => l.id > 1000).length],
//     ["Real leads", real],
//     ["AI replies", d.replies],
//     ["Avg reply", d.replies ? (d.avgMs / 1000).toFixed(1) + "s" : "—"],
//   ];
//   return (
//     <div>
//       <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
//         <div>
//           <p className="eyebrow">Showtime</p>
//           <h1 className="mt-1 text-4xl font-extrabold">
//             Scan karo — lead khud ban jayegi
//           </h1>
//           <p className="mt-1 text-slate-400">
//             QR scan karke message bhejo. Neeche screen pe tumhari lead 1 second
//             me aayegi, aur AI ka reply tumhare phone pe.
//           </p>
//         </div>
//         <div className="flex items-center gap-2">
//           <span
//             className={`pill border ${d.live ? "border-brand text-brand" : "border-amber/40 text-amber"}`}
//           >
//             WhatsApp {d.live ? "LIVE" : "simulated"}
//           </span>
//           <button
//             onClick={() => {
//               setSnd(!snd);
//               if (!snd) beep();
//             }}
//             className="btn flex items-center gap-2 !bg-transparent border border-line !text-slate-200"
//           >
//             {snd ? <Bell size={14} /> : <BellOff size={14} />}
//             {snd ? "Sound on" : "Sound off"}
//           </button>
//         </div>
//       </div>
//       <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
//         {K.map(([a, b]) => (
//           <div key={a} className="card !p-4">
//             <div className="font-mono text-[11px] uppercase text-slate-500">
//               {a}
//             </div>
//             <div className="text-3xl font-bold text-brand">{b}</div>
//           </div>
//         ))}
//       </div>
//       <div className="grid gap-5 xl:grid-cols-[260px_1fr_340px]">
//         <div className="space-y-5">
//           <Qr
//             title="WhatsApp pe chat"
//             text={waLink}
//             sub={
//               waLink
//                 ? "Scan → WhatsApp khulega → Send"
//                 : "Business number set nahi"
//             }
//             warn={waLink ? "" : "Go Live page pe WhatsApp keys daalo"}
//           />
//           <Qr
//             title="Enquiry form"
//             text={base ? base + "/enquire" : ""}
//             sub="Scan → form bharo → WhatsApp pe reply"
//             warn={
//               local
//                 ? "Abhi localhost hai — phone pe tab chalega jab Go Live me public URL paste karo"
//                 : ""
//             }
//           />
//         </div>
//         <div className="space-y-3">
//           <h3 className="font-semibold">Live leads</h3>
//           {!fresh.length && (
//             <div className="card text-sm text-slate-500">
//               Abhi koi lead nahi. QR scan karo ya Demo Mode chalao…
//             </div>
//           )}
//           <AnimatePresence initial={false}>
//             {fresh.map((l) => (
//               <motion.div
//                 key={l.id}
//                 layout
//                 initial={{ opacity: 0, y: -24, scale: 0.96 }}
//                 animate={{ opacity: 1, y: 0, scale: 1 }}
//                 className={`card !p-4 ${!l.demo && Date.now() - l.at < 8000 ? "border-brand shadow-[0_0_40px_-12px_rgba(34,211,238,.7)]" : ""}`}
//               >
//                 <div className="flex items-start justify-between gap-3">
//                   <div>
//                     <div className="flex items-center gap-2 text-lg font-bold">
//                       {l.name}
//                       {!l.demo && (
//                         <span className="pill bg-brand text-black">REAL</span>
//                       )}
//                     </div>
//                     <div className="text-xs text-slate-400">
//                       {l.source} · {l.zone} · {ago(l.at)}
//                     </div>
//                   </div>
//                   <div className="text-right">
//                     <div className="font-mono text-2xl font-bold text-brand">
//                       {l.score}
//                     </div>
//                     <div className="text-[10px] uppercase text-slate-500">
//                       AI score
//                     </div>
//                   </div>
//                 </div>
//                 <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
//                   <span className="pill bg-sky-500/15 text-sky-400">
//                     {l.status}
//                   </span>
//                   <span
//                     className={`pill ${l.type === "hot" ? "bg-red-500/15 text-red-400" : l.type === "warm" ? "bg-amber/15 text-amber" : "bg-sky-500/15 text-sky-400"}`}
//                   >
//                     {l.type}
//                   </span>
//                   <span className="text-slate-400">→ {l.cp}</span>
//                   {l.prefs?.bhk && (
//                     <span className="text-slate-400">
//                       {l.prefs.bhk} BHK
//                       {l.prefs.cr ? ` · ~₹${+l.prefs.cr.toFixed(2)} Cr` : ""}
//                     </span>
//                   )}
//                   {l.respMs && (
//                     <span className="ml-auto text-brand">
//                       ⚡ reply {(l.respMs / 1000).toFixed(1)}s
//                     </span>
//                   )}
//                 </div>
//               </motion.div>
//             ))}
//           </AnimatePresence>
//         </div>
//         <div className="space-y-4">
//           <div className="mx-auto w-[320px] overflow-hidden rounded-[2.2rem] border-4 border-slate-700 bg-[#0b141a] shadow-2xl">
//             <div className="flex items-center gap-3 bg-[#202c33] p-4">
//               <span className="grid h-9 w-9 place-items-center rounded-full bg-brand text-sm font-bold text-black">
//                 K
//               </span>
//               <div>
//                 <div className="text-sm font-semibold">
//                   {chat ? chat.name : "KMA Global Property"}
//                 </div>
//                 <div className="text-[11px] text-brand">
//                   {typing ? "typing…" : "SETU AI · online"}
//                 </div>
//               </div>
//             </div>
//             <div className="h-[380px] space-y-2 overflow-y-auto p-3">
//               {!msgs.length && (
//                 <p className="mt-24 text-center text-xs text-slate-500">
//                   Chat yahan live dikhegi
//                 </p>
//               )}
//               {msgs.slice(-6).map((m) => (
//                 <div
//                   key={m.id}
//                   className={`max-w-[85%] whitespace-pre-line rounded-xl px-3 py-2 text-[12px] ${m.dir === "in" ? "ml-auto bg-[#005c4b]" : "bg-[#202c33]"}`}
//                 >
//                   {m.img && (
//                     <img src={m.img} alt="" className="mb-1 rounded-lg" />
//                   )}
//                   {m.cap && (
//                     <div className="text-[11px] text-slate-300">{m.cap}</div>
//                   )}
//                   {m.t}
//                 </div>
//               ))}
//               {typing && (
//                 <div className="flex w-14 gap-1 rounded-xl bg-[#202c33] p-3">
//                   {[0, 1, 2].map((x) => (
//                     <span
//                       key={x}
//                       className="dot h-2 w-2 rounded-full bg-slate-400"
//                       style={{ animationDelay: x * 0.2 + "s" }}
//                     />
//                   ))}
//                 </div>
//               )}
//             </div>
//           </div>
//           <div className="card max-h-56 overflow-y-auto !p-3">
//             <div className="eyebrow mb-2">Automation stream</div>
//             {d.events.slice(0, 8).map((e) => (
//               <div key={e.id} className="mb-1 text-xs">
//                 <span
//                   className={`mr-1 ${e.tag === "err" ? "text-red-400" : "text-brand"}`}
//                 >
//                   ●
//                 </span>
//                 {e.m}
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import QRCode from "qrcode";
import { Bell, BellOff } from "lucide-react";

// Storage keys
const STORAGE_KEYS = {
  LEADS_DATA: "setu_leads_data",
  CHATS_DATA: "setu_chats_data",
};

// Helper: Leads aur events merge karne ke liye (sorted newest first)
const mergeById = (existing = [], incoming = []) => {
  const map = new Map();
  [...existing, ...incoming].forEach((item) => {
    if (item && item.id != null) {
      map.set(item.id, { ...(map.get(item.id) || {}), ...item });
    }
  });
  return Array.from(map.values()).sort((a, b) => (Number(b.at) || 0) - (Number(a.at) || 0));
};

// Helper: Chats aur nested messages ko safely merge karne ke liye
const mergeChats = (existing = [], incoming = []) => {
  const getChatKey = (c, idx) =>
    c?.id ?? c?.phone ?? c?.waId ?? c?.number ?? `chat_${idx}`;
  const getMsgKey = (m, idx) =>
    m?.id ?? `${m?.at}_${m?.dir}_${m?.t?.slice?.(0, 10)}` ?? `msg_${idx}`;

  const chatMap = new Map();

  existing.forEach((c, idx) => {
    if (!c) return;
    const key = getChatKey(c, idx);
    chatMap.set(key, { ...c, msgs: c.msgs || [] });
  });

  incoming.forEach((c, idx) => {
    if (!c) return;
    const key = getChatKey(c, idx);
    const prev = chatMap.get(key);

    if (!prev) {
      chatMap.set(key, { ...c, msgs: c.msgs || [] });
    } else {
      const msgMap = new Map();
      (prev.msgs || []).forEach((m, mIdx) =>
        msgMap.set(getMsgKey(m, mIdx), m)
      );
      (c.msgs || []).forEach((m, mIdx) =>
        msgMap.set(getMsgKey(m, mIdx), {
          ...(msgMap.get(getMsgKey(m, mIdx)) || {}),
          ...m,
        })
      );

      chatMap.set(key, {
        ...prev,
        ...c,
        msgs: Array.from(msgMap.values()),
      });
    }
  });

  return Array.from(chatMap.values());
};

function Qr({ text, title, sub, warn }) {
  const [u, setU] = useState("");
  useEffect(() => {
    if (text)
      QRCode.toDataURL(text, {
        margin: 1,
        width: 260,
        color: { dark: "#04130a", light: "#ffffff" },
      }).then(setU);
  }, [text]);
  return (
    <div className="card text-center">
      <div className="eyebrow">{title}</div>
      <div className="mx-auto mt-3 grid h-[200px] w-[200px] place-items-center rounded-xl bg-white p-2">
        {u ? (
          <img src={u} alt="QR" className="h-full w-full" />
        ) : (
          <span className="px-3 text-xs text-slate-600">{warn || "…"}</span>
        )}
      </div>
      <p className="mt-3 text-sm text-slate-300">{sub}</p>
      {u && warn && <p className="mt-1 text-[11px] text-amber">{warn}</p>}
    </div>
  );
}

const ago = (t) => {
  const s = Math.floor((Date.now() - t) / 1000);
  return s < 5
    ? "abhi"
    : s < 60
      ? s + "s pehle"
      : Math.floor(s / 60) + "m pehle";
};

export default function Live() {
  const [d, setD] = useState({
    leads: [],
    events: [],
    avgMs: 0,
    replies: 0,
    live: false,
  });
  const [chats, setChats] = useState([]);
  const [info, setInfo] = useState({});
  const [pub, setPub] = useState("");
  const [origin, setOrigin] = useState("");
  const [snd, setSnd] = useState(false);
  const [, tick] = useState(0);

  const max = useRef(null);
  const sndRef = useRef(false);

  useEffect(() => {
    sndRef.current = snd;
  }, [snd]);

  // Relative timestamp refresh timer (e.g. "abhi" -> "5s pehle")
  useEffect(() => {
    const timer = setInterval(() => tick((x) => x + 1), 2000);
    return () => clearInterval(timer);
  }, []);

  // Initial load: localStorage se data hydrate karna
  useEffect(() => {
    setOrigin(window.location.origin);
    try {
      setPub(localStorage.getItem("setu_pub") || "");

      const cachedD = localStorage.getItem(STORAGE_KEYS.LEADS_DATA);
      if (cachedD) {
        const parsed = JSON.parse(cachedD);
        setD(parsed);
        const initialMax = Math.max(
          0,
          ...(parsed.leads || []).map((l) => Number(l.id) || 0)
        );
        max.current = initialMax;
      }

      const cachedChats = localStorage.getItem(STORAGE_KEYS.CHATS_DATA);
      if (cachedChats) {
        setChats(JSON.parse(cachedChats));
      }
    } catch (err) {
      console.warn("Storage hydration error:", err);
    }

    fetch("/api/public-info")
      .then((r) => r.json())
      .then(setInfo)
      .catch(() => {});
  }, []);

  const beep = () => {
    try {
      const a = new (window.AudioContext || window.webkitAudioContext)(),
        o = a.createOscillator(),
        g = a.createGain();
      o.connect(g);
      g.connect(a.destination);
      o.type = "sine";
      o.frequency.setValueAtTime(660, a.currentTime);
      o.frequency.setValueAtTime(990, a.currentTime + 0.12);
      g.gain.setValueAtTime(0.15, a.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, a.currentTime + 0.4);
      o.start();
      o.stop(a.currentTime + 0.4);
    } catch {}
  };

  // Polling, merging aur localStorage sync
  useEffect(() => {
    let active = true;
    let timer;
    const controller = new AbortController();

    const fetchData = async () => {
      try {
        const [leadsRes, chatRes] = await Promise.all([
          fetch("/api/leads", {
            signal: controller.signal,
            cache: "no-store",
          }),
          fetch("/api/chat", {
            signal: controller.signal,
            cache: "no-store",
          }),
        ]);

        if (!leadsRes.ok || !chatRes.ok) {
          throw new Error("Failed to fetch live data");
        }

        const [leadsData, chatData] = await Promise.all([
          leadsRes.json(),
          chatRes.json(),
        ]);

        if (!active) return;

        // Leads merge & sync
        setD((prev) => {
          const mergedLeads = mergeById(prev.leads, leadsData.leads || []);
          const mergedEvents = mergeById(prev.events, leadsData.events || []);

          const updated = {
            ...leadsData,
            leads: mergedLeads,
            events: mergedEvents,
            replies: Math.max(prev.replies || 0, leadsData.replies || 0),
          };

          if (JSON.stringify(prev) !== JSON.stringify(updated)) {
            try {
              localStorage.setItem(STORAGE_KEYS.LEADS_DATA, JSON.stringify(updated));
            } catch {}
            return updated;
          }
          return prev;
        });

        // Chats merge & sync
        const incomingRawChats = Array.isArray(chatData)
          ? chatData
          : chatData?.chats || [];

        setChats((prev) => {
          const merged = mergeChats(prev, incomingRawChats);

          if (JSON.stringify(prev) !== JSON.stringify(merged)) {
            try {
              localStorage.setItem(STORAGE_KEYS.CHATS_DATA, JSON.stringify(merged));
            } catch (err) {
              console.error("Chats save error:", err);
            }
            return merged;
          }
          return prev;
        });

        // Beep sound trigger for new leads
        const incomingMax = Math.max(
          0,
          ...(leadsData.leads || []).map((lead) => Number(lead.id) || 0)
        );

        if (max.current !== null && incomingMax > max.current && sndRef.current) {
          beep();
        }
        if (incomingMax > (max.current || 0)) {
          max.current = incomingMax;
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Live dashboard polling failed:", error);
        }
      } finally {
        if (active) {
          timer = setTimeout(fetchData, 5000);
        }
      }
    };

    fetchData();

    return () => {
      active = false;
      clearTimeout(timer);
      controller.abort();
    };
  }, []);

  const base = (pub || origin).replace(/\/$/, ""),
    local = !!base && /localhost|127\.0\.0\.1/.test(base);
  const waLink = info.wa
    ? `https://wa.me/${info.wa}?text=${encodeURIComponent("Hi, 3BHK chahiye Golf Course Extension me, budget 3 Cr")}`
    : "";
  const fresh = d.leads.filter((l) => l.id > 1000).slice(0, 6),
    real = d.leads.filter((l) => l.id > 1000 && !l.demo).length;

  // Active chat dhundne ka safe logic
  const chat =
    chats.find((c) => !c.demo && c.msgs?.length) ||
    chats.find((c) => c.msgs?.length) ||
    chats[0] ||
    null;
  const msgs = chat?.msgs || [],
    last = msgs.at(-1),
    typing = last && last.dir === "in" && Date.now() - last.at < 1800;

  const K = [
    ["Leads (session)", d.leads.filter((l) => l.id > 1000).length],
    ["Real leads", real],
    ["AI replies", d.replies],
    ["Avg reply", d.replies ? (d.avgMs / 1000).toFixed(1) + "s" : "—"],
  ];

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Showtime</p>
          <h1 className="mt-1 text-4xl font-extrabold">
            Scan karo — lead khud ban jayegi
          </h1>
          <p className="mt-1 text-slate-400">
            QR scan karke message bhejo. Neeche screen pe tumhari lead 1 second
            me aayegi, aur AI ka reply tumhare phone pe.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`pill border ${d.live ? "border-brand text-brand" : "border-amber/40 text-amber"}`}
          >
            WhatsApp {d.live ? "LIVE" : "simulated"}
          </span>
          <button
            onClick={() => {
              setSnd(!snd);
              if (!snd) beep();
            }}
            className="btn flex items-center gap-2 !bg-transparent border border-line !text-slate-200"
          >
            {snd ? <Bell size={14} /> : <BellOff size={14} />}
            {snd ? "Sound on" : "Sound off"}
          </button>
        </div>
      </div>
      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        {K.map(([a, b]) => (
          <div key={a} className="card !p-4">
            <div className="font-mono text-[11px] uppercase text-slate-500">
              {a}
            </div>
            <div className="text-3xl font-bold text-brand">{b}</div>
          </div>
        ))}
      </div>
      <div className="grid gap-5 xl:grid-cols-[260px_1fr_340px]">
        <div className="space-y-5">
          <Qr
            title="WhatsApp pe chat"
            text={waLink}
            sub={
              waLink
                ? "Scan → WhatsApp khulega → Send"
                : "Business number set nahi"
            }
            warn={waLink ? "" : "Go Live page pe WhatsApp keys daalo"}
          />
          <Qr
            title="Enquiry form"
            text={base ? base + "/enquire" : ""}
            sub="Scan → form bharo → WhatsApp pe reply"
            warn={
              local
                ? "Abhi localhost hai — phone pe tab chalega jab Go Live me public URL paste karo"
                : ""
            }
          />
        </div>
        <div className="space-y-3">
          <h3 className="font-semibold">Live leads</h3>
          {!fresh.length && (
            <div className="card text-sm text-slate-500">
              Abhi koi lead nahi. QR scan karo ya Demo Mode chalao…
            </div>
          )}
          <AnimatePresence initial={false}>
            {fresh.map((l) => (
              <motion.div
                key={l.id}
                layout
                initial={{ opacity: 0, y: -24, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`card !p-4 ${!l.demo && Date.now() - l.at < 8000 ? "border-brand shadow-[0_0_40px_-12px_rgba(34,197,94,.7)]" : ""}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 text-lg font-bold">
                      {l.name}
                      {!l.demo && (
                        <span className="pill bg-brand text-black">REAL</span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400">
                      {l.source} · {l.zone} · {ago(l.at)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-2xl font-bold text-brand">
                      {l.score}
                    </div>
                    <div className="text-[10px] uppercase text-slate-500">
                      AI score
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                  <span className="pill bg-sky-500/15 text-sky-400">
                    {l.status}
                  </span>
                  <span
                    className={`pill ${l.type === "hot" ? "bg-red-500/15 text-red-400" : l.type === "warm" ? "bg-amber/15 text-amber" : "bg-sky-500/15 text-sky-400"}`}
                  >
                    {l.type}
                  </span>
                  <span className="text-slate-400">→ {l.cp}</span>
                  {l.prefs?.bhk && (
                    <span className="text-slate-400">
                      {l.prefs.bhk} BHK
                      {l.prefs.cr ? ` · ~₹${+l.prefs.cr.toFixed(2)} Cr` : ""}
                    </span>
                  )}
                  {l.respMs && (
                    <span className="ml-auto text-brand">
                      ⚡ reply {(l.respMs / 1000).toFixed(1)}s
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        <div className="space-y-4">
          <div className="mx-auto w-[320px] overflow-hidden rounded-[2.2rem] border-4 border-slate-700 bg-[#0b141a] shadow-2xl">
            <div className="flex items-center gap-3 bg-[#202c33] p-4">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-brand text-sm font-bold text-black">
                K
              </span>
              <div>
                <div className="text-sm font-semibold">
                  {chat ? chat.name : "KMA Global Property"}
                </div>
                <div className="text-[11px] text-brand">
                  {typing ? "typing…" : "SETU AI · online"}
                </div>
              </div>
            </div>
            <div className="h-[380px] space-y-2 overflow-y-auto p-3">
              {!msgs.length && (
                <p className="mt-24 text-center text-xs text-slate-500">
                  Chat yahan live dikhegi
                </p>
              )}
              {msgs.slice(-6).map((m, idx) => (
                <div
                  key={m.id || idx}
                  className={`max-w-[85%] whitespace-pre-line rounded-xl px-3 py-2 text-[12px] ${m.dir === "in" ? "ml-auto bg-[#005c4b]" : "bg-[#202c33]"}`}
                >
                  {m.img && (
                    <img src={m.img} alt="" className="mb-1 rounded-lg" />
                  )}
                  {m.cap && (
                    <div className="text-[11px] text-slate-300">{m.cap}</div>
                  )}
                  {m.t}
                </div>
              ))}
              {typing && (
                <div className="flex w-14 gap-1 rounded-xl bg-[#202c33] p-3">
                  {[0, 1, 2].map((x) => (
                    <span
                      key={x}
                      className="dot h-2 w-2 rounded-full bg-slate-400"
                      style={{ animationDelay: x * 0.2 + "s" }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="card max-h-56 overflow-y-auto !p-3">
            <div className="eyebrow mb-2">Automation stream</div>
            {d.events.slice(0, 8).map((e) => (
              <div key={e.id} className="mb-1 text-xs">
                <span
                  className={`mr-1 ${e.tag === "err" ? "text-red-400" : "text-brand"}`}
                >
                  ●
                </span>
                {e.m}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}