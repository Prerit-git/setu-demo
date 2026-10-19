export const ZONES=["Golf Course Road","Golf Course Extension","Dwarka Expressway","Sohna Road","Southern Peripheral Road","New Gurgaon","Sector 106-108","MG Road & Cyber City"];
export const SOURCES=["Website","Property Page / QR","Google Ads","Meta Lead Ads","Instagram","WhatsApp","99acres","Housing.com","MagicBricks","Referral","Walk-in"];
export const STATUSES=["New","Contacted","Details Pending","Site Visit Scheduled","Negotiation","Token Booked","Closed Won","Dropped"];
const N=["Aditya Gupta","Ishaan Verma","Rohit Mehra","Saanvi Kapoor","Kabir Reddy","Tanvi Bhatia","Zoya Sethi","Ananya Iyer","Riya Nair","Aarav Shah","Kiara Mehta","Vikram Malik"];
const T=["hot","warm","cold"],A=["Priya Iyer","Neha Agarwal","Meera Gupta","Nikhil Gupta","—"];
export const LEADS=Array.from({length:60},(_,i)=>({id:i+1,name:N[i%12],phone:`+91 9${(81234567+i*7919).toString().slice(0,4)} ${(10000+i*377).toString().slice(0,5)}`,
status:STATUSES[(i*3)%8],type:T[i%3],zone:ZONES[i%ZONES.length],source:SOURCES[i%11],cp:A[i%5],score:15+(i*13)%80,days:i%30+1}));
const U=id=>`https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=80`;
const I=["photo-1545324418-cc1a3fa10c00","photo-1512917774080-9991f1c4c750","photo-1613490493576-7fde63acd811","photo-1600596542815-ffad4c1539a9","photo-1564013799919-ab600027ffc6"];
// SAMPLE inventory (demo). Real KMA listings jodne ke liye yahi array replace karna ya website se sync karna.
const P=(t,zone,sector,bhk,cr,st,sqft,k)=>({t:`${t} — ${bhk} BHK`,zone,loc:`${sector} · ${zone} · Gurgaon`,sector,bhk,cr,price:cr>=10?`₹${cr} Cr`:`₹${cr.toFixed(2)} Cr`,st,sqft,img:U(I[k%5])});
export const PROPS=[
P("DLF The Camellias","Golf Course Road","Sector 42",4,17.5,"Available",5800,0),
P("Smartworld The Edition","Golf Course Extension","Sector 66",3,3.1,"Available",1850,1),
P("Ireo The Grand Arch","Golf Course Extension","Sector 58",4,6.2,"Available",3100,3),
P("M3M Golf Estate","Golf Course Extension","Sector 65",3,4.6,"Available",2450,2),
P("Smartworld One DXP","Dwarka Expressway","Sector 113",3,3.4,"Available",1700,3),
P("Tata La Vida","Dwarka Expressway","Sector 113",2,1.6,"Available",1150,4),
P("Godrej Nature Plus","Sohna Road","Sector 33",3,2.4,"Available",1650,1),
P("Central Park Flower Valley","Sohna Road","Sector 33",2,1.35,"On Hold",1050,0),
P("Whiteland The Aspen","Southern Peripheral Road","Sector 76",3,2.7,"Available",1720,2),
P("Ireo Skyon","Southern Peripheral Road","Sector 60",3,3.8,"Available",2100,3),
P("Godrej Aria","New Gurgaon","Sector 79",2,1.9,"Available",1250,4),
P("Signature Global Daxin Vistas","New Gurgaon","Sector 37D",2,1.1,"Available",980,1),
P("Elan The Presidential","Sector 106-108","Sector 106",3,2.9,"Available",1780,0),
P("Sobha City","Sector 106-108","Sector 108",3,3.2,"Sold",1900,2),
P("Ambience Creacions","MG Road & Cyber City","Sector 22",3,3.9,"Available",2050,3)];
export const NAV=[["Dashboard","dashboard","LayoutDashboard"],["Showtime","live","Sparkles"],["Demo Mode","demo","Rocket"],["Go Live","golive","Radio"],["Connect Channels","connect","Link2"],["Test Lab","lab","FlaskConical"],["Lead Flow Test","flow","Play"],["Leads","leads","Users"],["Properties","properties","Building2"],["Agents & Network","agents","ShieldCheck"],["WhatsApp Inbox","inbox","MessageSquare"],["WhatsApp Triggers","triggers","Send"],["Calls","calls","Phone"],["Integrations","integrations","Plug"],["Module Checklist","checklist","ListChecks"]];
const R=["Agent","CP","Guard","Owner"],PN=["Priya Iyer","Neha Agarwal","Sneha Kulkarni","Rahul Nair","Meera Gupta","Aditya Sethi","Myra Shah","Pooja Menon"];
const AN=["Priya Iyer","Neha Agarwal","Rahul Nair","Meera Gupta","Aditya Sethi","Pooja Menon","Sneha Kulkarni","Karan Malhotra"];
export const AGENTS=Array.from({length:24},(_,i)=>{const role=i<8?"Agent":R[1+i%3];return{name:i<8?AN[i]:PN[i%8].split(" ")[0]+" "+N[(i*5)%12].split(" ")[1],role,phone:`+91 9${7000+i*131} ${10000+i*911}`.slice(0,16),zone:ZONES[i%8],company:role==="CP"?["PropEdge Realty","Anarock Partners","Square Yards CP"][i%3]:"—",leads:role==="Agent"||role==="CP"?8+i%11:0,src:i%3?"Website":"Manual"}});
export const CALLS=Array.from({length:18},(_,i)=>({lead:N[i%12],phone:LEADS[i].phone,agent:PN[i%8],dir:i%2?"incoming":"outgoing",ok:i%3!==0,dur:i%3?`${i%9+1}m ${(i*7)%60}s`:"—",when:`${30-i} Sept, ${(i%12)+1}:${10+i} pm`}));
export const CHATS=[];
export const TRIGGERS=[["Welcome to New Leads","Lead","Namaste {name}! Welcome to KMA Global Property. Your SETU advisor will share curated homes shortly."],["Lead Status Change","Lead","Hi {name}, your enquiry status has been updated."],["Pending Details Gathering","Lead","Hi {name}, to shortlist the right homes, please share your budget, preferred BHK and locality."],["Drop Re-Targeting","Lead","Hi {name}, new homes just matched your search. Want a quick look?"],["Call Back to Leads","Lead","Hi {name}, sorry we missed you. We'll call back within 15 minutes."],["Refer & Earn","Lead","Hi {name}, refer a friend and earn rewards with KMA."],["Property Availability Confirmation","Owner/CP","Hi {name}, is your listed property still available? Reply YES/NO."],["Follow-up Reminder to Lead Owner","Agent","Hi {name}, you have a pending follow-up today."],["5 Featured Properties to Agent","Agent","Hi {name}, here are this week's 5 featured properties."]];
export const CHECK={Leads:["Module's Fields Customisation","For New Leads (WA)","Based on Lead Status Change (WA)","Auto Assignment of Leads based on Zone","Pending Details Gathering (WA)","Dropped Leads Re-targeting (WA)","Country Code auto-formatting","Instant Ingestion — Website Forms","Instant Ingestion — Google Ads","Instant Ingestion — Meta Lead Ads"],Property:["Module's Fields Customisation","Sync Properties from Website","Property Confirmation to CP/Owner","Sending random 5 properties to Agent","Property confirmation after two months"],Agent:["Module's Fields Customisation","Sync Agents, Guards, Owners","Phone number stored with Country Code"],"WhatsApp Triggers":["Refer & Earn","Property Availability Confirmation","Owner Meeting Follow-up","Lead Meeting Follow-up","Welcome to New Leads","Drop Re-Targeting","Two-Way Chat — Auto-Reply","Call Back to Leads"]};
