"use client";
import {motion} from "framer-motion";
export const IV={h:{opacity:0,y:14},s:{opacity:1,y:0}};
export const Stagger=({children,className})=><motion.div className={className} initial="h" animate="s" variants={{s:{transition:{staggerChildren:.05}}}}>{children}</motion.div>;
export const Item=({children,className})=><motion.div className={className} variants={IV}>{children}</motion.div>;
export const Header=({eyebrow,title,sub,action})=><div className="mb-6 flex flex-wrap items-end justify-between gap-3"><div><p className="eyebrow">{eyebrow}</p><h1 className="mt-1 text-4xl font-extrabold">{title}</h1>{sub&&<p className="mt-2 max-w-2xl text-slate-400">{sub}</p>}</div>{action}</div>;
export const Sim=()=><span className="pill border border-amber/40 text-amber">Simulated</span>;
