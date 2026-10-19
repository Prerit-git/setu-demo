/* SETU website capture — kisi bhi site (kmaglobalproperty.com) pe ek line se:
   <script src="https://YOUR-SETU-URL/setu.js" data-key="optional"></script>
   Har form jisme phone field hai, submit pe lead SETU me chali jayegi (form ka normal submit rukta nahi). */
(function(){var s=document.currentScript,base=s.src.replace(/\/setu\.js.*$/,""),key=s.getAttribute("data-key")||"";
function pick(f,re){for(var i=0;i<f.elements.length;i++){var e=f.elements[i],h=((e.name||"")+" "+(e.id||"")+" "+(e.placeholder||"")+" "+(e.type||"")).toLowerCase();if(re.test(h)&&e.value)return e.value}return""}
document.addEventListener("submit",function(ev){var f=ev.target;if(!f||!f.elements)return;var phone=pick(f,/phone|mobile|whatsapp|contact|tel/);if(!phone)return;
var b={name:pick(f,/name/),phone:phone,email:pick(f,/mail/),locality:pick(f,/locat|area|zone|city|sector/),budget:pick(f,/budget|price/),message:pick(f,/message|query|requirement|comment|note/)||("Form: "+location.pathname),source:"Website"};
try{fetch(base+"/api/webhooks/website",{method:"POST",keepalive:true,headers:{"Content-Type":"application/json","X-SETU-Key":key},body:JSON.stringify(b)})}catch(e){}},true)})();
