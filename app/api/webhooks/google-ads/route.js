import {NextResponse} from "next/server";import {ingest} from "@/lib/flow";
// Google Ads Lead Form webhook: {google_key, user_column_data:[{column_id,string_value}]}
export async function POST(req){const b=await req.json(),k=process.env.GOOGLE_ADS_KEY;
if(k&&b.google_key!==k)return NextResponse.json({error:"bad key"},{status:401});
const f={};for(const c of b.user_column_data||[])f[c.column_id]=c.string_value;
return NextResponse.json(await ingest({name:f.FULL_NAME||b.name||"Google Lead",phone:f.PHONE_NUMBER||b.phone,message:f.CITY||b.message||"Google Ads lead form",locality:f.CITY||b.locality,source:"Google Ads"}))}
