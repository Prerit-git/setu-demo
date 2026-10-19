import {NextResponse} from "next/server";import {S,ev} from "@/lib/store";
export const dynamic="force-dynamic";
export const GET=()=>NextResponse.json(S.channels);
export async function POST(req){const {key,value}=await req.json();S.channels[key]=value;ev(`Channel connected: ${key} ${value}`,"Integrations");return NextResponse.json(S.channels)}
