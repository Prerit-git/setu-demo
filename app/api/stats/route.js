import {NextResponse} from "next/server";import {S} from "@/lib/store";
export const dynamic="force-dynamic";
export const GET=()=>NextResponse.json({replies:S.stats.replies,avgMs:S.stats.replies?Math.round(S.stats.ms/S.stats.replies):0});
