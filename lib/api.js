const BASE=process.env.NEXT_PUBLIC_API_URL||"";
// GET: API na ho ya fail ho to fallback (mock) data milta hai
export async function get(path,fallback){if(!BASE)return fallback;try{const r=await fetch(BASE+path,{cache:"no-store"});if(!r.ok)throw 0;return await r.json()}catch{return fallback}}
export async function post(path,body){if(!BASE)return{ok:true,mock:true};try{const r=await fetch(BASE+path,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});return await r.json()}catch{return{ok:false}}}
