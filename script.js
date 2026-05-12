const MAX_CARDS=6;
const MIN_CARDS=2;
const MAX_TITLE=20;
const MAX_BODY=180;
const MAX_BUTTON=8;
const MAX_BREAKS=2;
const MAX_IMAGE_SIZE=10*1024*1024;

const DEFAULT_TITLE="타이틀을 입력해주세요.";
const DEFAULT_BODY="내용을 입력해주세요.";

const BRANDS={
  DEFENDER:{label:"(광고)DEFENDER",logo:"DEFENDER",cls:""},
  "Range Rover":{label:"(광고)Range Rover",logo:"RANGE ROVER",cls:"range"},
  Discovery:{label:"(광고)Discovery",logo:"DISCOVERY",cls:"discovery"}
};

const TYPES={
  carouselFeed:{name:"캐러셀 피드형",desc:"",titleMax:20,bodyMax:180,imageGuide:"권장 사이즈: 600 × 800px",cards:true},
  wideImage:{name:"와이드 이미지형",desc:"",titleMax:20,bodyMax:76,imageGuide:"권장 사이즈: 800 × 600px",cards:false},
  wideList:{name:"와이드 리스트형",desc:"",titleMax:20,bodyMax:76,imageGuide:"권장 사이즈: 800 × 400px",cards:false}
};

let state={
  type:"carouselFeed",
  brand:"DEFENDER",
  all:false,
  formFocused:false,
  active:0,
  cards:[makeCard(0),makeCard(1)],
  single:makeCard(0),
  toastTimer:null,
  listImageTarget:null
};


state.cards.forEach(card=>{
  card.ctaMode="link";
  if(!Array.isArray(card.ctas)||card.ctas.length===0)card.ctas=[makeCta()];
});

function $(id){return document.getElementById(id)}
function makeId(){return`card-${Date.now()}-${Math.random().toString(36).slice(2)}`}
function makeCta(){return{label:"",url:""}}
function makeList(){return{title:"",desc:"",image:"",url:""}}
function makeCard(index){
  return{
    id:makeId(),
    image:"",
    imageLink:"",
    title:index===0?DEFAULT_TITLE:"",
    body:index===0?DEFAULT_BODY:"",
    price:"",
    ctas:[makeCta()],
    items:[makeList(),makeList(),makeList()],
    share:"no",
    ctaMode:"link"
  }
}
function data(){return state.type==="carouselFeed"?state.cards[state.active]:state.single}
function countBreaks(v){return(String(v||"").match(/\n/g)||[]).length}
function breakLimit(){return state.type==="wideImage"?1:MAX_BREAKS}
function hasBodyError(v){return countBreaks(v)>breakLimit()}
function textLen(v){return Array.from(String(v||"")).length}
function isTooLong(v,max){return textLen(v)>max}
function setOver(el,over){
  if(!el)return;
  el.classList.toggle("over",!!over);
}
function updateCount(el,value,max){
  if(!el)return;
  el.textContent=`${textLen(value)}/${max}자`;
  el.classList.toggle("countError",textLen(value)>max);
}
function esc(v){return String(v??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;")}
function norm(v){v=String(v||"").trim();if(!v)return"#";if(v.startsWith("#")||/^(https?:\/\/|mailto:|tel:)/i.test(v))return v;return`https://${v}`}
function show(msg){$("toast").textContent=msg;$("toast").classList.add("show");clearTimeout(state.toastTimer);state.toastTimer=setTimeout(()=>$("toast").classList.remove("show"),2000)}

function render(){
  renderTypeTabs();
  renderBrand();
  renderPreview();
  renderDots();
  renderTabs();
  renderForm();
  renderMode();
  scrollActive(false);
}

function renderTypeTabs(){
  document.querySelectorAll(".typeTab").forEach(b=>b.classList.toggle("active",b.dataset.type===state.type));
}

function renderBrand(){
  const b=BRANDS[state.brand];
  $("brandName").textContent=b.label;
  $("brandLogo").textContent=b.logo;
  $("brandLogo").className=`brandLogo ${b.cls}`;
  $("brandSelect").value=state.brand;
}

function renderMode(){
  $("layout").classList.toggle("expanded",state.all);
  $("layout").classList.toggle("carouselMode",state.type==="carouselFeed");
  $("layout").classList.toggle("singleMode",state.type==="wideImage");
  $("layout").classList.toggle("listMode",state.type==="wideList");
  ["cards-2","cards-3","cards-4","cards-5","cards-6"].forEach(cls=>$("layout").classList.remove(cls));
  if(state.type==="carouselFeed")$("layout").classList.add(`cards-${state.cards.length}`);
  $("allBtn").classList.toggle("on",state.all);
  $("allBtn").textContent=state.all?"접어보기":"펼쳐보기";
  $("addCardBtn").classList.toggle("hidden",state.type!=="carouselFeed");
  $("allBtn").classList.toggle("hidden",state.type!=="carouselFeed");
  $("formActions").classList.toggle("hidden",state.type!=="carouselFeed");
  $("preview").classList.toggle("wideListMode",state.type==="wideList");
}

function imgHtml(c,wide=false){
  let raw=c.image?`<img src="${c.image}" alt="">`:`▧<br>${wide?"800 × 600":"600 × 800"} 이미지`;
  return c.imageLink?`<a class="imageAnchor" href="${esc(norm(c.imageLink))}" target="_blank" rel="noopener noreferrer">${raw}</a>`:raw;
}

function ctaHtml(c){
  if(!c)return"";
  if(!Array.isArray(c.ctas))c.ctas=[];

  // 캐러셀 피드형은 CTA 버튼 1개를 기본으로 항상 노출
  if(state.type==="carouselFeed"){
    c.ctaMode="link";
    if(c.ctas.length===0)c.ctas.push(makeCta());
    return c.ctas.slice(0,2).map(x=>`<a class="cta ${isTooLong(x.label,MAX_BUTTON)?"previewOverText":""}" href="${esc(norm(x.url))}" target="_blank" rel="noopener noreferrer"><span>${esc(x.label||"버튼명")}</span></a>`).join("");
  }

  if((c.ctaMode||"none")==="none")return"";
  const max=state.type==="wideList"?1:2;
  return c.ctas.slice(0,max).map(x=>`<a class="cta ${isTooLong(x.label,MAX_BUTTON)?"previewOverText":""}" href="${esc(norm(x.url))}" target="_blank" rel="noopener noreferrer"><span>${esc(x.label||"버튼명")}</span></a>`).join("");
}

function renderPreview(){
  const area=$("previewArea");

  if(state.type==="carouselFeed"){
    area.innerHTML=`<div class="track" id="track">${state.cards.map((c,i)=>`<article class="card ${i===state.active?"active":""} ${state.formFocused&&i===state.active?"editing":""}" tabindex="0" data-index="${i}">
      <div class="img">${imgHtml(c)}</div>
      <div class="content">
        <h2 class="title ${isTooLong(c.title,20)?"previewOverText":""}">${esc(c.title||DEFAULT_TITLE)}</h2>
        <div class="line"></div>
        <p class="body ${hasBodyError(c.body)||isTooLong(c.body,180)?"errText previewOverText":""}">${esc(c.body||DEFAULT_BODY)}</p>
      </div>
      <div class="ctas">${ctaHtml(c)}</div>
    </article>`).join("")}</div>`;
    document.querySelectorAll(".card").forEach(el=>{
      el.onclick=e=>{
        if(e.target.closest(".cta"))return;
        if(e.target.closest(".imageAnchor")){setActive(+el.dataset.index,false,true);return}
        setActive(+el.dataset.index,true,true);
      };
      el.onkeydown=e=>{if(e.key==="Enter")setActive(+el.dataset.index,true,true)};
    });
    return;
  }

  const c=state.single;

  if(state.type==="wideImage"){
    area.innerHTML=`<article class="singlePreview ${state.formFocused?"editing":""}">
      <div class="wideImg">${imgHtml(c,true)}</div>
      <div class="singleContent"><p class="body ${isTooLong(c.body,76)?"previewOverText":""}">${esc(c.body||DEFAULT_BODY)}</p></div>
      <div class="ctas">${ctaHtml(c)}</div>
    </article>`;
    return;
  }

  if(state.type==="wideList"){
    const main=c.items[0]||makeList();
    let mainImage=main.image?`<img src="${main.image}" alt="">`:`▧<br>800 × 400 이미지`;
    if(main.url)mainImage=`<a class="imageAnchor" href="${esc(norm(main.url))}" target="_blank" rel="noopener noreferrer">${mainImage}</a>`;
    const ctaPart=(c.ctaMode||"none")==="none"?"":`<div class="ctas">${ctaHtml(c)}</div>`;
    area.innerHTML=`<article class="listCard ${state.formFocused?"editing":""}">
      <div class="wideListPreviewTitle ${isTooLong(c.title,20)?"previewLimitError":""}">${esc(c.title||DEFAULT_TITLE)}</div>
      <div class="listHero">${mainImage}${main.desc?`<div class="listHeroOverlay ${isTooLong(main.desc,25)?"previewOverText":""}">${esc(main.desc)}</div>`:""}</div>
      <div class="listItems">
        ${c.items.slice(1).map(it=>`<div class="listItem ${it.url?"clickable":""}" data-url="${esc(norm(it.url||""))}"><div class="listThumb">${it.image?`<img src="${it.image}" alt="">`:""}</div><div>${it.title?`<strong class="${isTooLong(it.title,20)?"previewOverText":""}">${esc(it.title)}</strong>`:""}</div></div>`).join("")}
      </div>
      ${(c.ctaMode!=="none"||c.share==="yes")?`<div class="listActions">${ctaPart}${c.share==="yes"?`<div class="shareBtn">공유하기</div>`:""}</div>`:""}
    </article>`;
    document.querySelectorAll(".listItem.clickable").forEach(el=>{el.onclick=()=>window.open(el.dataset.url,"_blank")});
  }
}

function renderDots(){
  if(state.type!=="carouselFeed"){$("dots").innerHTML="";return}
  $("dots").innerHTML=state.cards.map((_,i)=>`<button type="button" class="dot ${i===state.active?"active":""}" data-index="${i}"></button>`).join("");
  document.querySelectorAll(".dot").forEach(d=>d.onclick=()=>setActive(+d.dataset.index,false,true));
}

function renderTabs(){
  if(state.type!=="carouselFeed"){$("cardTabs").innerHTML="";return}
  $("cardTabs").innerHTML=state.cards.map((_,i)=>`<button type="button" class="tab ${i===state.active?"active":""}" data-index="${i}">카드 ${i+1}</button>`).join("");
  document.querySelectorAll(".tab").forEach(t=>t.onclick=()=>setActive(+t.dataset.index,false,true));
}

function renderForm(){
  const cfg=TYPES[state.type];
  const c=data();
  $("formTitle").textContent=`${cfg.name} 입력`;
  $("formDesc").textContent=cfg.desc||"";
  $("titleInput").removeAttribute("maxlength");
  $("bodyInput").removeAttribute("maxlength");
  $("titleInput").value=c.title;
  $("bodyInput").value=c.body;
  $("titleCount").textContent=`${textLen(c.title)}/${cfg.titleMax}자`;
  $("bodyCount").textContent=`${textLen(c.body)}/${cfg.bodyMax}자`;
  setOver($("titleInput").closest(".inputBox"),textLen(c.title)>cfg.titleMax);
  setOver($("bodyInput").closest(".textareaBox"),textLen(c.body)>cfg.bodyMax);
  $("bodyField").classList.toggle("isErr",hasBodyError(c.body)||textLen(c.body)>cfg.bodyMax);
  $("breakCount").textContent=`줄바꿈 ${countBreaks(c.body)}/${breakLimit()}회`;

  $("titleField").classList.toggle("hidden",state.type==="wideImage");
  $("imageField").classList.toggle("hidden",state.type==="wideList");
  $("listField").classList.toggle("hidden",state.type!=="wideList");
  $("shareField").classList.toggle("hidden",state.type!=="wideList");
  $("bodyField").classList.toggle("hidden",state.type==="wideList");
  $("removeCardBtn").classList.toggle("hidden",state.type!=="carouselFeed");

  $("shareSelect").value=c.share||"no";
  $("ctaModeSelect").value=c.ctaMode||"none";

  if(state.type==="wideImage"){
    $("imageSizeGuide").innerHTML=`권장 사이즈: <strong>800 × 600px</strong>`;
  }else{
    $("imageSizeGuide").innerHTML=cfg.imageGuide.includes("없음")?`<strong>${cfg.imageGuide}</strong>`:cfg.imageGuide.replace(": ",": <strong>")+"</strong>";
  }

  $("imageLinkInput").value=c.imageLink||"";
  if(c.image){$("imageBtn").classList.add("has");$("thumb").src=c.image}
  else{$("imageBtn").classList.remove("has");$("thumb").removeAttribute("src")}

  renderCtas();
  renderLists();
}

function renderCtas(){
  const c=data();

  // 캐러셀 피드형: v22처럼 CTA 선택 드롭다운 없이 버튼 입력 블록 기본 노출
  if(state.type==="carouselFeed"){
    c.ctaMode="link";
    if(c.ctas.length===0)c.ctas.push(makeCta());
    c.ctas=c.ctas.slice(0,2);
    $("ctaField").classList.remove("ctaFieldNoButton");
    $("ctaModeSelect").value="link";
    $("ctaForms").innerHTML=c.ctas.map((x,i)=>`<div class="ctaBlock">
      <div class="ctaBlockHead"><strong>버튼 ${i+1}</strong><button type="button" class="textBtn" data-remove-cta="${i}">삭제</button></div>
      <div class="ctaGrid">
        <div class="inputBox"><input class="ctaLabel" data-i="${i}" placeholder="버튼명을 입력해주세요" value="${esc(x.label)}"><em>${textLen(x.label)}/${MAX_BUTTON}</em></div>
        <input class="ctaUrl" data-i="${i}" placeholder="https://" value="${esc(x.url)}">
      </div>
    </div>`).join("");
    bindCtaInputs(c);
    bindCtaRemove();
    return;
  }

  // 와이드 이미지형/와이드 리스트형: CTA 없음 가능
  if((c.ctaMode||"none")==="none"){
    $("ctaForms").innerHTML="";
    $("ctaField").classList.add("ctaFieldNoButton");
    $("ctaModeSelect").value="none";
    return;
  }

  $("ctaField").classList.remove("ctaFieldNoButton");
  $("ctaModeSelect").value="link";
  if(c.ctas.length===0)c.ctas.push(makeCta());

  const max=state.type==="wideList"?1:2;
  c.ctas=c.ctas.slice(0,max);

  $("ctaForms").innerHTML=c.ctas.map((x,i)=>`<div class="ctaBlock">
    <div class="ctaBlockHead"><strong>버튼 ${i+1}</strong><button type="button" class="textBtn" data-remove-cta="${i}">삭제</button></div>
    <div class="ctaGrid">
      <div class="inputBox"><input class="ctaLabel" data-i="${i}" placeholder="버튼명을 입력해주세요" value="${esc(x.label)}"><em>${textLen(x.label)}/${MAX_BUTTON}</em></div>
      <input class="ctaUrl" data-i="${i}" placeholder="https://" value="${esc(x.url)}">
    </div>
  </div>`).join("");
  bindCtaInputs(c);
  bindCtaRemove();
}

function bindCtaInputs(c){
document.querySelectorAll(".ctaLabel").forEach(inp=>inp.oninput=()=>{
    c.ctas[+inp.dataset.i].label=inp.value;
    inp.parentElement.querySelector("em").textContent=`${textLen(inp.value)}/${MAX_BUTTON}`;
    inp.closest(".ctaBlock").classList.toggle("over",textLen(inp.value)>MAX_BUTTON);
    renderPreview();
    renderDots();
  });
  document.querySelectorAll(".ctaUrl").forEach(inp=>inp.oninput=()=>{
    c.ctas[+inp.dataset.i].url=inp.value;
    renderPreview();
    renderDots();
  });
}

function bindCtaRemove(){
  // 이벤트 위임: ctaForms 컨테이너에 한 번만 등록, innerHTML 교체 후에도 유지
  const forms=$("ctaForms");
  if(!forms||forms._ctaRemoveBound)return;
  forms._ctaRemoveBound=true;
  forms.addEventListener("click",e=>{
    const btn=e.target.closest("[data-remove-cta]");
    if(btn)removeCta(+btn.dataset.removeCta);
  });
}

function renderLists(){
  const c=data();
  if(state.type!=="wideList"){$("listForms").innerHTML="";return}
  $("listForms").innerHTML=c.items.map((it,i)=>{
    const isMain=i===0;
    const descMax=25;
    const titleMax=20;
    const size=isMain?"800 × 400px":"400 × 400px";
    const label=isMain?"메인 섹션":`하단 리스트 ${i}`;
    const placeholderTitle="항목 타이틀 20자 이내";
    const placeholderDesc="메인 섹션 내용 25자 이내";
    const overDesc=isTooLong(it.desc,descMax);
    const overTitle=isTooLong(it.title,titleMax);
    const guide=isMain?"권장사이즈 800×400px / jpg.png 최대 10MB":"권장사이즈 400×400px / jpg.png 최대 10MB";
    return `<div class="listBlock ${overDesc||overTitle?"error":""}" data-list-block="${i}">
      <div class="listBlockHead">
        <div class="listTitleGroup">
          <strong>${label}</strong>
          <span class="guideBadge">${guide}</span>
        </div>
        <button type="button" class="textBtn" data-list-del="${i}">삭제</button>
      </div>
      <div class="listBlockBody">
        <button type="button" class="listUploadBtn ${it.image?"has":""}" data-list-img="${i}">
          ${it.image?`<img src="${it.image}" alt="">`:`<span>▧<br>${size}<br>10MB 이하</span>`}
        </button>
        <div class="listTextInputs">
          ${isMain?"":
          `<div class="inputWrap titleWrap">
            <input class="listTitle ${overTitle?"charError":""}" data-i="${i}" placeholder="${placeholderTitle}" value="${esc(it.title)}">
            <em class="${overTitle?"countError":""}">${textLen(it.title)}/${titleMax}자</em>
          </div>`}
          ${isMain?`<div class="inputWrap descWrap">
            <input class="listDesc ${overDesc?"charError":""}" data-i="${i}" placeholder="${placeholderDesc}" value="${esc(it.desc)}">
            <em class="${overDesc?"countError":""}">${textLen(it.desc)}/${descMax}자</em>
          </div>`:""}
          <input class="listUrl" data-i="${i}" placeholder="${isMain?"메인 섹션 링크 https://":"항목 링크 https://"}" value="${esc(it.url||"")}">
          <p class="limitMsg ${overDesc||overTitle?"show":""}">${overTitle?"20자를 초과했습니다.":`${descMax}자를 초과했습니다.`}</p>
        </div>
      </div>
    </div>`
  }).join("") + `<button type="button" class="listAddInline" id="inlineAddListBtn">+ 리스트 추가</button>`;

  const inline=$("inlineAddListBtn");
  if(inline)inline.onclick=addListItem;

  document.querySelectorAll("[data-list-del]").forEach(b=>b.onclick=()=>{
    const index=+b.dataset.listDel;
    if(index===0)return show("메인 섹션은 삭제할 수 없습니다.");
    if(c.items.length<=2)return show("리스트 항목은 최소 2개가 필요합니다.");
    c.items.splice(index,1);
    render();
  });
  document.querySelectorAll("[data-list-img]").forEach(b=>b.onclick=()=>{
    state.listImageTarget=+b.dataset.listImg;
    $("listImageInput").click();
  });
  document.querySelectorAll(".listTitle").forEach(i=>i.oninput=()=>{
    const index=+i.dataset.i;
    const max=20;
    c.items[index].title=i.value;
    i.parentElement.querySelector("em").textContent=`${textLen(i.value)}/${max}자`;
    i.parentElement.classList.toggle("over",textLen(i.value)>max);
    renderPreview();
  });
  document.querySelectorAll(".listDesc").forEach(i=>i.oninput=()=>{
    const index=+i.dataset.i;
    const max=25;
    c.items[index].desc=i.value;
    i.parentElement.querySelector("em").textContent=`${textLen(i.value)}/${max}자`;
    i.parentElement.classList.toggle("over",textLen(i.value)>max);
    renderPreview();
  });
  document.querySelectorAll(".listUrl").forEach(i=>i.oninput=()=>{
    c.items[+i.dataset.i].url=i.value;
    renderPreview();
  });
}function setActive(i,move,smooth){
  state.active=Math.max(0,Math.min(i,state.cards.length-1));
  renderPreview();
  renderDots();
  renderTabs();
  renderForm();
  scrollActive(smooth);
  if(move)$("formPanel").scrollIntoView({behavior:"smooth",block:"start"});
}

function scrollActive(smooth){
  if(state.type!=="carouselFeed"||state.all)return;
  const track=document.querySelector(".track");
  const el=document.querySelector(`[data-index="${state.active}"]`);
  if(!track||!el)return;
  track.scrollTo({left:el.offsetLeft-track.offsetLeft,behavior:smooth?"smooth":"auto"});
}

function addCard(){
  if(state.cards.length>=MAX_CARDS)return show("캐러셀은 최대 6개까지 생성할 수 있습니다.");
  state.cards.push(makeCard(state.cards.length));
  state.active=state.cards.length-1;
  render();
}

function removeCard(){
  if(state.cards.length<=MIN_CARDS)return show("캐러셀은 최소 2개가 필요합니다.");
  const target=Math.max(0,state.active-1);
  state.cards.splice(state.active,1);
  state.active=Math.min(target,state.cards.length-1);
  render();
}

function addCta(){
  const c=data();
  if(!c)return;
  if(!Array.isArray(c.ctas))c.ctas=[];

  if(state.type==="carouselFeed"){
    c.ctaMode="link";

    if(c.ctas.length>=2){
      $("ctaField").classList.add("isErr","shake");
      setTimeout(()=>$("ctaField").classList.remove("shake"),420);
      show("CTA는 최대 2개까지 추가할 수 있습니다.");
      return;
    }

    c.ctas.push(makeCta());
    $("ctaField").classList.remove("isErr","shake");
    renderCtas();
    renderPreview();
    renderDots();

    setTimeout(()=>{
      const blocks=document.querySelectorAll("#ctaForms .ctaBlock");
      const last=blocks[blocks.length-1];
      if(last){
        last.scrollIntoView({behavior:"smooth",block:"nearest"});
        const input=last.querySelector(".ctaLabel");
        if(input)input.focus();
      }
    },30);
    return;
  }

  if(state.type==="wideList"){
    c.ctaMode="link";
    c.ctas=[c.ctas[0]||makeCta()];
    render();
    return;
  }

  c.ctaMode="link";
  if(c.ctas.length===0)c.ctas.push(makeCta());
  render();
}

function removeCta(i){
  const c=data();
  if(!c || !Array.isArray(c.ctas))return;

  if(state.type==="carouselFeed"){
    if(c.ctas.length<=1){
      c.ctas=[makeCta()];
    }else{
      c.ctas.splice(i,1);
    }
    c.ctaMode="link";
    renderCtas();
    renderPreview();
    renderDots();
    return;
  }

  c.ctas.splice(i,1);
  if(c.ctas.length===0)c.ctaMode="none";
  render();
}

function addListItem(){
  const c=data();
  if(c.items.length>=4)return show("리스트 항목은 최대 4개까지 추가할 수 있습니다.");
  c.items.push(makeList());
  render();
}

function clearDefault(field){
  const c=data();
  if(field==="title"&&c.title===DEFAULT_TITLE){c.title="";renderForm();renderPreview();$("titleInput").focus()}
  if(field==="body"&&c.body===DEFAULT_BODY){c.body="";renderForm();renderPreview();$("bodyInput").focus()}
}

document.querySelectorAll(".typeTab").forEach(b=>b.onclick=()=>{
  if(b.dataset.type==="basicText")return;
  state.type=b.dataset.type;
  state.all=false;
  state.active=0;
  state.formFocused=false;
  render();
});

$("addCardBtn").onclick=addCard;
$("removeCardBtn").onclick=removeCard;
$("addCtaBtn").onclick=addCta;

$("addListBtn").onclick=addListItem;
$("allBtn").onclick=()=>{state.all=!state.all;render();};

$("brandSelect").onchange=e=>{state.brand=e.target.value;renderBrand()};
$("shareSelect").onchange=e=>{data().share=e.target.value;renderPreview()};
$("ctaModeSelect").onchange=e=>{
  const c=data();
  if(state.type==="carouselFeed")return;
  c.ctaMode=e.target.value;
  if(e.target.value==="none")c.ctas=[];
  else if(c.ctas.length===0)c.ctas.push(makeCta());
  if(state.type==="wideList")c.ctas=c.ctas.slice(0,1);
  render();
};

$("imageBtn").onclick=()=>$("imageInput").click();
$("imageInput").onchange=e=>{
  const f=e.target.files[0];
  if(!f)return;
  if(f.size>MAX_IMAGE_SIZE){show("이미지 용량이 10MB를 초과했습니다. 10MB 이하 파일만 업로드할 수 있습니다.");e.target.value="";return}
  const r=new FileReader();
  r.onload=ev=>{data().image=ev.target.result;render()};
  r.readAsDataURL(f);
  e.target.value="";
};

$("listImageInput").onchange=e=>{
  const f=e.target.files[0];
  if(!f)return;
  if(f.size>MAX_IMAGE_SIZE){show("이미지 용량이 10MB를 초과했습니다. 10MB 이하 파일만 업로드할 수 있습니다.");e.target.value="";return}
  const target=state.listImageTarget;
  if(target===null||!data().items[target]){e.target.value="";return}
  const r=new FileReader();
  r.onload=ev=>{data().items[target].image=ev.target.result;render()};
  r.readAsDataURL(f);
  e.target.value="";
};

$("imageLinkInput").oninput=e=>{data().imageLink=e.target.value;renderPreview()};
$("titleInput").onfocus=()=>{state.formFocused=true;clearDefault("title")};
$("titleInput").onclick=()=>clearDefault("title");
$("bodyInput").onfocus=()=>{state.formFocused=true;clearDefault("body")};
$("bodyInput").onclick=()=>clearDefault("body");

$("titleInput").oninput=e=>{
  const cfg=TYPES[state.type];
  data().title=e.target.value;
  $("titleCount").textContent=`${textLen(data().title)}/${cfg.titleMax}자`;
  setOver($("titleInput").closest(".inputBox"),textLen(data().title)>cfg.titleMax);
  renderPreview();
  renderDots();
};

$("bodyInput").oninput=e=>{
  const cfg=TYPES[state.type];
  let v=e.target.value;
  const limit=breakLimit();
  let seen=0;
  v=Array.from(v).filter(ch=>{
    if(ch==="\n"){
      seen+=1;
      return seen<=limit;
    }
    return true;
  }).join("");
  e.target.value=v;
  data().body=v;
  $("bodyCount").textContent=`${textLen(v)}/${cfg.bodyMax}자`;
  $("breakCount").textContent=`줄바꿈 ${countBreaks(v)}/${limit}회`;
  setOver($("bodyInput").closest(".textareaBox"),textLen(v)>cfg.bodyMax);
  $("bodyField").classList.toggle("isErr",hasBodyError(v)||textLen(v)>cfg.bodyMax);
  renderPreview();
  renderDots();
};

$("formPanel").addEventListener("focusin",()=>{state.formFocused=true;renderPreview()});
document.addEventListener("click",e=>{
  if($("formPanel").contains(e.target)||e.target.closest(".card")||e.target.closest(".dot"))return;
  state.formFocused=false;
  renderPreview();
});

render();


// v32 Toolbox toggle
const toolbox = document.getElementById("toolbox");
const toolboxToggle = document.getElementById("toolboxToggle");

if (toolbox && toolboxToggle) {
  toolboxToggle.addEventListener("click", () => {
    const isOpen = toolbox.classList.toggle("open");
    toolboxToggle.setAttribute("aria-expanded", String(isOpen));
  });

  document.addEventListener("click", (event) => {
    if (!toolbox.contains(event.target)) {
      toolbox.classList.remove("open");
      toolboxToggle.setAttribute("aria-expanded", "false");
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      toolbox.classList.remove("open");
      toolboxToggle.setAttribute("aria-expanded", "false");
    }
  });
}
