import {NextResponse} from "next/server";import {ingest} from "@/lib/flow";
const H={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"Content-Type,X-SETU-Key","Access-Control-Allow-Methods":"POST,OPTIONS"};
export const OPTIONS=()=>new Response(null,{headers:H});
// Website form se POST JSON: {name,phone,email,locality,budget,message,source?}
export async function POST(req){const k=process.env.WEBSITE_WEBHOOK_KEY;
if(k&&req.headers.get("x-setu-key")!==k)return NextResponse.json({error:"bad key"},{status:401,headers:H});
const b=await req.json();return NextResponse.json(await ingest({source:"Website",...b}),{headers:H})}
