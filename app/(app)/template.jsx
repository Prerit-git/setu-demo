"use client";
import {motion} from "framer-motion";
export default function T({children}){return <motion.div initial={{opacity:0,y:18}} animate={{opacity:1,y:0}} transition={{duration:.45,ease:"easeOut"}}>{children}</motion.div>}
