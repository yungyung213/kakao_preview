
const MAX_CARDS=6,MIN_CARDS=2,MAX_TITLE=20,MAX_BODY=180,MAX_BUTTON=8,MAX_BREAKS=2;
const DEFAULT_TITLE="타이틀을 입력해주세요.", DEFAULT_BODY="내용을 입력해주세요.";
const BRANDS={DEFENDER:{label:"(광고)DEFENDER",logo:"DEFENDER",cls:""},"Range Rover":{label:"(광고)Range Rover",logo:"RANGE ROVER",cls:"range"},Discovery:{label:"(광고)Discovery",logo:"DISCOVERY",cls:"discovery"}};
const S={brand:"DEFENDER",all:false,active:0,cards:[card(0),card(1)],toast:null,shake:null};
function id(){return `c-${Date.now()}-${Math.random().toString(36).slice(2)}`}
function cta(){return{label:"",url:""}}
function card(i){return{id:id(),image:"",title:i===0?DEFAULT_TITLE:"",body:i===0?DEFAULT_BODY:"",ctas:[cta()]}}
function br(v){return (v.match(/\n/g)||[]).length}
function bodyErr(v){return br(v)>MAX_BREAKS}
function esc(v){return String(v).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;")}
function url(v){v=String(v||"").trim(); if(!v)return "#"; if(v.startsWith("#")||/^(https?:\/\/|mailto:|tel:)/i.test(v))return v; return `https://${v}`}
function active(){return S.cards[S.active]}
function render(){renderBrand();renderCards();renderDots();renderTabs();renderForm();renderMode();if(!S.all)scrollActive(false)}
function renderBrand(){let b=BRANDS[S.brand],l=document.getElementById("brandLogo");document.getElementById("brandName").textContent=b.label;l.textContent=b.logo;l.className=`brandLogo ${b.cls}`;document.getElementById("brandSelect").value=S.brand}
function renderMode(){document.getElementById("layout").classList.toggle("all",S.all);let b=document.getElementById("allBtn");b.classList.toggle("on",S.all);b.textContent=S.all?"스크롤 보기":"한번에 보기"}
function renderCards(){document.getElementById("track").innerHTML=S.cards.map((c,i)=>`<article class="card" tabindex="0" data-i="${i}">
<div class="img">${c.image?`<img src="${c.image}">`:`▧<br>600 × 800 이미지`}</div>
<div class="content"><h2 class="title">${esc(c.title||DEFAULT_TITLE)}</h2><div class="line"></div><p class="body ${bodyErr(c.body)?"errText":""}">${esc(c.body||DEFAULT_BODY)}</p></div>
<div class="ctas">${c.ctas.map(x=>`<a class="cta" href="${esc(url(x.url))}" target="_blank" rel="noopener noreferrer"><span>${esc(x.label||"버튼명")}</span></a>`).join("")}</div>
</article>`).join("");
document.querySelectorAll(".card").forEach(el=>{el.onclick=e=>{if(e.target.closest("a"))return;select(+el.dataset.i,true)};el.onkeydown=e=>{if(e.key==="Enter")select(+el.dataset.i,true)}})}
function renderDots(){document.getElementById("dots").innerHTML=S.cards.map((_,i)=>`<button class="dot ${i===S.active?"active":""}" data-i="${i}"></button>`).join("");document.querySelectorAll(".dot").forEach(b=>b.onclick=()=>select(+b.dataset.i,false))}
function renderTabs(){document.getElementById("tabs").innerHTML=S.cards.map((_,i)=>`<button class="tab ${i===S.active?"active":""}" data-i="${i}">카드 ${i+1}</button>`).join("");document.querySelectorAll(".tab").forEach(b=>b.onclick=()=>select(+b.dataset.i,false))}
function renderForm(){let c=active();document.getElementById("formTitle").textContent=`카드 ${S.active+1} 입력`;
let ib=document.getElementById("imageBtn"),th=document.getElementById("thumb");if(c.image){ib.classList.add("has");th.src=c.image}else{ib.classList.remove("has");th.removeAttribute("src")}
titleInput.value=c.title;titleCount.textContent=`${c.title.length}/${MAX_TITLE}자`;
bodyInput.value=c.body;bodyCount.textContent=`${c.body.length}/${MAX_BODY}자`;breakCount.textContent=`줄바꿈 ${br(c.body)}/${MAX_BREAKS}회`;bodyField.classList.toggle("isErr",bodyErr(c.body));
renderCtas()}
function renderCtas(){let c=active();ctaForms.innerHTML=c.ctas.map((x,i)=>`<div class="ctaBlock"><div class="ctaBlockHead"><strong>버튼 ${i+1}</strong><button class="textBtn" data-del="${i}">삭제</button></div><div class="ctaGrid"><div class="inputBox"><input class="ctaLabel" data-i="${i}" maxlength="${MAX_BUTTON}" placeholder="버튼명을 입력해주세요" value="${esc(x.label)}"><em>${x.label.length}/${MAX_BUTTON}</em></div><input class="ctaUrl" data-i="${i}" placeholder="https://" value="${esc(x.url)}"></div></div>`).join("");
document.querySelectorAll("[data-del]").forEach(b=>b.onclick=()=>removeCta(+b.dataset.del));
document.querySelectorAll(".ctaLabel").forEach(inp=>inp.oninput=()=>{active().ctas[+inp.dataset.i].label=inp.value.slice(0,MAX_BUTTON);renderCards();inp.parentElement.querySelector("em").textContent=`${inp.value.length}/${MAX_BUTTON}`});
document.querySelectorAll(".ctaUrl").forEach(inp=>inp.oninput=()=>{active().ctas[+inp.dataset.i].url=inp.value;renderCards()})}
function select(i,move){S.active=i;renderDots();renderTabs();renderForm();if(!S.all)scrollActive(true);if(move)formPanel.scrollIntoView({behavior:"smooth",block:"start"})}
function scrollActive(smooth){let tr=track, el=tr.querySelector(`[data-i="${S.active}"]`);if(!el)return;tr.scrollTo({left:el.offsetLeft-tr.offsetLeft,behavior:smooth?"smooth":"auto"})}
function show(msg){toast.textContent=msg;toast.classList.add("show");clearTimeout(S.toast);S.toast=setTimeout(()=>toast.classList.remove("show"),2000)}
function addCard(){if(S.cards.length>=MAX_CARDS)return show("캐러셀은 최대 6개까지 생성할 수 있습니다.");S.cards.push(card(S.cards.length));S.active=S.cards.length-1;render()}
function removeCard(){if(S.cards.length<=MIN_CARDS)return show("캐러셀은 최소 2개가 필요합니다.");S.cards.splice(S.active,1);S.active=Math.max(0,Math.min(S.active,S.cards.length-1));render()}
function showCtaErr(){ctaField.classList.add("isErr","shake");setTimeout(()=>ctaField.classList.remove("shake"),420)}
function addCta(){if(active().ctas.length>=2)return showCtaErr();active().ctas.push(cta());ctaField.classList.remove("isErr");render()}
function removeCta(i){if(active().ctas.length<=1)return show("CTA 버튼은 최소 1개가 필요합니다.");active().ctas.splice(i,1);ctaField.classList.remove("isErr");render()}
function clearDefault(kind){let c=active(); if(kind==="title"&&c.title===DEFAULT_TITLE){c.title="";renderForm();renderCards();titleInput.focus()} if(kind==="body"&&c.body===DEFAULT_BODY){c.body="";renderForm();renderCards();bodyInput.focus()}}
addCard.onclick=addCard;removeCard.onclick=removeCard;addCta.onclick=addCta;
allBtn.onclick=()=>{S.all=!S.all;renderMode();if(!S.all)scrollActive(true)};
brandSelect.onchange=e=>{S.brand=e.target.value;renderBrand()};
imageBtn.onclick=()=>imageInput.click();imageInput.onchange=e=>{let f=e.target.files[0];if(!f)return;let r=new FileReader();r.onload=ev=>{active().image=ev.target.result;render()};r.readAsDataURL(f);e.target.value=""};
titleInput.onfocus=()=>clearDefault("title");titleInput.onclick=()=>clearDefault("title");bodyInput.onfocus=()=>clearDefault("body");bodyInput.onclick=()=>clearDefault("body");
titleInput.oninput=e=>{active().title=e.target.value.slice(0,MAX_TITLE);titleCount.textContent=`${active().title.length}/${MAX_TITLE}자`;renderCards();renderDots()};
bodyInput.oninput=e=>{let v=e.target.value.slice(0,MAX_BODY);active().body=v;bodyCount.textContent=`${v.length}/${MAX_BODY}자`;breakCount.textContent=`줄바꿈 ${br(v)}/${MAX_BREAKS}회`;bodyField.classList.toggle("isErr",bodyErr(v));if(bodyErr(v)){bodyField.classList.add("shake");setTimeout(()=>bodyField.classList.remove("shake"),420)}renderCards();renderDots()};
track.onscroll=()=>{if(S.all)return;clearTimeout(window.__t);window.__t=setTimeout(()=>{let cards=[...track.querySelectorAll(".card")],left=track.scrollLeft,best=0,dist=1e9;cards.forEach((c,i)=>{let d=Math.abs(c.offsetLeft-track.offsetLeft-left);if(d<dist){dist=d;best=i}});if(best!==S.active){S.active=best;renderDots();renderTabs();renderForm()}},80)};
render();
