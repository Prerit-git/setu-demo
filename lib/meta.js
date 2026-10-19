const V=()=>process.env.WA_GRAPH_VERSION||"v21.0",G=p=>`https://graph.facebook.com/${V()}/${p}`;
export const igLive=()=>!!process.env.IG_ACCESS_TOKEN;
export const fbLive=()=>!!process.env.FB_PAGE_TOKEN;
// Instagram DM bhejna (Page token + IG Messaging permission)
export async function sendIG(igsid,text){
 if(!igLive())return{ok:true,mode:"simulated"};
 try{const r=await fetch(G((process.env.IG_PAGE_ID||"me")+"/messages")+"?access_token="+process.env.IG_ACCESS_TOKEN,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({recipient:{id:igsid},message:{text}})});const j=await r.json();return{ok:r.ok,mode:"live",error:j.error?.message}}catch(e){return{ok:false,mode:"live",error:String(e)}}}
export async function igProfile(igsid){if(!igLive())return{};try{const r=await fetch(G(igsid)+"?fields=name,username&access_token="+process.env.IG_ACCESS_TOKEN);return await r.json()}catch{return{}}}
// Facebook/Instagram Lead Ad ka asli data (leadgen_id se)
export async function fetchLeadgen(id){
 if(!fbLive())return null;
 try{const r=await fetch(G(id)+"?access_token="+process.env.FB_PAGE_TOKEN);const j=await r.json();if(!j.field_data)return null;
 const f={};for(const x of j.field_data)f[x.name]=(x.values||[])[0];
 return{name:f.full_name||[f.first_name,f.last_name].filter(Boolean).join(" ")||"FB Lead",phone:f.phone_number||f.phone||"",email:f.email||"",locality:f.city||f.preferred_location||f.location||"",budget:f.budget||"",message:Object.entries(f).map(([k,v])=>k+": "+v).join(" | ")}}catch{return null}}
