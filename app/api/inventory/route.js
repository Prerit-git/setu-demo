import {NextResponse} from "next/server";import {INV,setStatus} from "@/lib/inv";
export const dynamic="force-dynamic";
export const GET=()=>NextResponse.json(INV);
export async function PATCH(req){const {id,st,by}=await req.json();return NextResponse.json({ok:!!setStatus(id,st,by)})}
