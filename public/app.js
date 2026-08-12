(()=>{const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];const nav=$("#navLinks"),menu=$("#menuBtn"),theme=$("#themeBtn");menu?.addEventListener("click",()=>{nav?.classList.toggle("open");menu.textContent=nav?.classList.contains("open")?"✕":"☰"});$$(".navLinks a").forEach(a=>a.addEventListener("click",()=>{nav?.classList.remove("open");if(menu)menu.textContent="☰"}));if(localStorage.getItem("daniel-theme")==="light")document.body.classList.add("light");theme?.addEventListener("click",()=>{document.body.classList.toggle("light");localStorage.setItem("daniel-theme",document.body.classList.contains("light")?"light":"dark");toast(document.body.classList.contains("light")?"Light mode enabled":"Dark mode enabled")});const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add("visible");io.unobserve(e.target)}}),{threshold:.1});$$(".reveal").forEach(x=>io.observe(x));const top=$("#top");addEventListener("scroll",()=>top?.classList.toggle("show",scrollY>500),{passive:true});top?.addEventListener("click",()=>scrollTo({top:0,behavior:"smooth"}));$$("[data-copy]").forEach(b=>b.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(b.dataset.copy);toast("Email copied ✓")}catch{toast(b.dataset.copy)}}));window.toast=m=>{let t=$("#toast");if(!t){t=document.createElement("div");t.id="toast";t.className="toast";document.body.append(t)}t.textContent=m;t.classList.add("show");clearTimeout(window.__tt);window.__tt=setTimeout(()=>t.classList.remove("show"),2800)};const form=$("#reviewForm");if(form){let rating=0;const stars=$$(".star",form),ri=$("#ratingValue",form),notice=$("#reviewNotice",form),btn=$("#reviewBtn",form);stars.forEach(s=>s.addEventListener("click",()=>{rating=+s.dataset.value;ri.value=rating;stars.forEach(x=>x.classList.toggle("on",+x.dataset.value<=rating))}));form.addEventListener("submit",async e=>{e.preventDefault();if(!rating){notice.textContent="Please choose a star rating first.";notice.classList.add("show");return}btn.disabled=true;btn.textContent="Sending…";try{const r=await fetch("/api/reviews",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(Object.fromEntries(new FormData(form)))});const d=await r.json();notice.textContent=d.message;notice.classList.add("show");if(d.ok){form.reset();rating=0;stars.forEach(s=>s.classList.remove("on"));ri.value=0}}catch{notice.textContent="Could not connect. Make sure npm start is running.";notice.classList.add("show")}finally{btn.disabled=false;btn.textContent="Send Review →"}})}})();
// Global touch/click animation
document.addEventListener("pointerdown", e=>{
  if(e.pointerType==="mouse" && e.button!==0) return;
  const ripple=document.createElement("span");
  ripple.className="touch-ripple";
  ripple.style.left=e.clientX+"px"; ripple.style.top=e.clientY+"px";
  document.body.appendChild(ripple);
  const symbols=["✦","•","✧","＋"];
  for(let i=0;i<3;i++){
    const spark=document.createElement("span");
    spark.className="touch-spark";
    spark.textContent=symbols[Math.floor(Math.random()*symbols.length)];
    spark.style.left=e.clientX+"px"; spark.style.top=e.clientY+"px";
    spark.style.setProperty("--dx",`${(Math.random()-.5)*70}px`);
    spark.style.setProperty("--dy",`${(Math.random()-.5)*70}px`);
    document.body.appendChild(spark);
    setTimeout(()=>spark.remove(),700);
  }
  setTimeout(()=>ripple.remove(),700);
},{passive:true});

// Load public reviews
async function loadReviews(){
  const list=document.querySelector("#reviewList");
  const count=document.querySelector("#reviewCount");
  if(!list) return;
  try{
    const response=await fetch("/api/reviews");
    const data=await response.json();
    const reviews=data.reviews||[];
    if(count) count.textContent=`${reviews.length} review${reviews.length===1?"":"s"}`;
    if(!reviews.length){
      list.innerHTML='<div class="emptyReviews">No reviews yet. Be the first to leave one! ⭐</div>';
      return;
    }
    list.innerHTML=reviews.map(r=>{
      const stars="★".repeat(Number(r.rating))+"☆".repeat(5-Number(r.rating));
      const date=new Date(r.date).toLocaleDateString(undefined,{year:"numeric",month:"short",day:"numeric"});
      return `<article class="reviewCard"><div class="reviewTop"><strong>${escapeHtml(r.name)}</strong><span class="reviewStars">${stars}</span></div><div class="reviewDate">${date}</div><p class="reviewText">${escapeHtml(r.message)}</p></article>`;
    }).join("");
  }catch{
    list.innerHTML='<div class="emptyReviews">Reviews are temporarily unavailable.</div>';
  }
}
function escapeHtml(value){
  return String(value).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
}
loadReviews();

// StreamFlix screenshot gallery/lightbox
(()=>{
 const shots=[...document.querySelectorAll(".shot")],box=document.querySelector("#streamflixLightbox"),img=document.querySelector("#lightboxImage"),count=document.querySelector("#lightboxCount");
 if(!shots.length||!box||!img)return;
 let current=0;
 const setShot=(n,open=false)=>{
   current=(n+shots.length)%shots.length;
   shots.forEach((b,i)=>b.classList.toggle("active",i===current));
   const source=shots[current].querySelector("img");
   img.src=source.src; img.alt=source.alt;
   if(count)count.textContent=`${current+1} / ${shots.length}`;
   if(open)box.classList.add("open"),box.setAttribute("aria-hidden","false");
 };
 shots.forEach((b,i)=>b.addEventListener("click",()=>setShot(i,true)));
 document.querySelector("#streamflixGalleryBtn")?.addEventListener("click",()=>setShot(current,true));
 document.querySelector("#lightboxClose")?.addEventListener("click",()=>{box.classList.remove("open");box.setAttribute("aria-hidden","true")});
 document.querySelector("#lightboxPrev")?.addEventListener("click",()=>setShot(current-1));
 document.querySelector("#lightboxNext")?.addEventListener("click",()=>setShot(current+1));
 box.addEventListener("click",e=>{if(e.target===box){box.classList.remove("open");box.setAttribute("aria-hidden","true")}});
 document.addEventListener("keydown",e=>{
   if(!box.classList.contains("open"))return;
   if(e.key==="Escape")document.querySelector("#lightboxClose")?.click();
   if(e.key==="ArrowLeft")setShot(current-1);
   if(e.key==="ArrowRight")setShot(current+1);
 });
})();
// SolarPulse screenshot gallery/lightbox
(()=>{
 const shots=[...document.querySelectorAll("[data-solar-shot]")],box=document.querySelector("#solarpulseLightbox"),img=document.querySelector("#solarLightboxImage"),count=document.querySelector("#solarLightboxCount");
 if(!shots.length||!box||!img)return;
 let current=0;
 const setShot=(n,open=false)=>{
   current=(n+shots.length)%shots.length;
   shots.forEach((b,i)=>b.classList.toggle("active",i===current));
   const source=shots[current].querySelector("img");
   img.src=source.src; img.alt=source.alt;
   if(count)count.textContent=`${current+1} / ${shots.length}`;
   if(open){box.classList.add("open");box.setAttribute("aria-hidden","false")}
 };
 shots.forEach((b,i)=>b.addEventListener("click",()=>setShot(i,true)));
 document.querySelector("#solarpulseGalleryBtn")?.addEventListener("click",()=>setShot(current,true));
 document.querySelector("#solarLightboxClose")?.addEventListener("click",()=>{box.classList.remove("open");box.setAttribute("aria-hidden","true")});
 document.querySelector("#solarLightboxPrev")?.addEventListener("click",()=>setShot(current-1));
 document.querySelector("#solarLightboxNext")?.addEventListener("click",()=>setShot(current+1));
 box.addEventListener("click",e=>{if(e.target===box){box.classList.remove("open");box.setAttribute("aria-hidden","true")}});
 document.addEventListener("keydown",e=>{
   if(!box.classList.contains("open"))return;
   if(e.key==="Escape")document.querySelector("#solarLightboxClose")?.click();
   if(e.key==="ArrowLeft")setShot(current-1);
   if(e.key==="ArrowRight")setShot(current+1);
 });
})();
