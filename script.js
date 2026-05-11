
const MAX_CARDS = 6;
const MIN_CARDS = 2;
const MAX_TITLE = 20;
const MAX_BODY = 180;
const MAX_BUTTON = 8;
const MAX_BREAKS = 2;
const DEFAULT_TITLE = "타이틀을 입력해주세요.";
const DEFAULT_BODY = "내용을 입력해주세요.";

const BRANDS = {
  DEFENDER: { label: "(광고)DEFENDER", logo: "DEFENDER", cls: "" },
  "Range Rover": { label: "(광고)Range Rover", logo: "RANGE ROVER", cls: "range" },
  Discovery: { label: "(광고)Discovery", logo: "DISCOVERY", cls: "discovery" },
};

const S = {
  brand: "DEFENDER",
  all: false,
  active: 0,
  cards: [makeCard(0), makeCard(1)],
  toastTimer: null,
};

function uid() {
  return `c-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function makeCta() {
  return { label: "", url: "" };
}

function makeCard(index) {
  return {
    id: uid(),
    image: "",
    title: index === 0 ? DEFAULT_TITLE : "",
    body: index === 0 ? DEFAULT_BODY : "",
    ctas: [makeCta()],
  };
}

const $ = (id) => document.getElementById(id);

function countBreaks(value) {
  return (value.match(/\n/g) || []).length;
}

function hasBodyError(value) {
  return countBreaks(value) > MAX_BREAKS;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function normalizeUrl(value) {
  const v = String(value || "").trim();
  if (!v) return "#";
  if (v.startsWith("#") || /^(https?:\/\/|mailto:|tel:)/i.test(v)) return v;
  return `https://${v}`;
}

function activeCard() {
  return S.cards[S.active];
}

function render() {
  renderBrand();
  renderCards();
  renderDots();
  renderTabs();
  renderForm();
  renderMode();
  if (!S.all) scrollToActive(false);
}

function renderBrand() {
  const brand = BRANDS[S.brand];
  $("brandName").textContent = brand.label;
  $("brandLogo").textContent = brand.logo;
  $("brandLogo").className = `brandLogo ${brand.cls}`;
  $("brandSelect").value = S.brand;
}

function renderMode() {
  $("layout").classList.toggle("all", S.all);
  $("allBtn").classList.toggle("on", S.all);
  $("allBtn").textContent = S.all ? "스크롤 보기" : "한번에 보기";
}

function renderCards() {
  $("track").innerHTML = S.cards
    .map((card, index) => {
      const imageHtml = card.image
        ? `<img src="${card.image}" alt="">`
        : `▧<br>600 × 800 이미지`;

      const ctas = card.ctas
        .map(
          (cta) =>
            `<a class="cta" href="${escapeHtml(normalizeUrl(cta.url))}" target="_blank" rel="noopener noreferrer"><span>${escapeHtml(cta.label || "버튼명")}</span></a>`
        )
        .join("");

      return `
        <article class="card ${index === S.active ? "active" : ""}" tabindex="0" data-index="${index}">
          <div class="img">${imageHtml}</div>
          <div class="content">
            <h2 class="title">${escapeHtml(card.title || DEFAULT_TITLE)}</h2>
            <div class="line"></div>
            <p class="body ${hasBodyError(card.body) ? "errText" : ""}">${escapeHtml(card.body || DEFAULT_BODY)}</p>
          </div>
          <div class="ctas">${ctas}</div>
        </article>
      `;
    })
    .join("");

  document.querySelectorAll(".card").forEach((cardEl) => {
    cardEl.addEventListener("click", (event) => {
      if (event.target.closest("a")) return;
      selectCard(Number(cardEl.dataset.index), true);
    });
    cardEl.addEventListener("keydown", (event) => {
      if (event.key === "Enter") selectCard(Number(cardEl.dataset.index), true);
    });
  });
}

function renderDots() {
  $("dots").innerHTML = S.cards
    .map((_, index) => `<button type="button" class="dot ${index === S.active ? "active" : ""}" data-index="${index}"></button>`)
    .join("");

  document.querySelectorAll(".dot").forEach((dot) => {
    dot.addEventListener("click", () => selectCard(Number(dot.dataset.index), false));
  });
}

function renderTabs() {
  $("tabs").innerHTML = S.cards
    .map((_, index) => `<button type="button" class="tab ${index === S.active ? "active" : ""}" data-index="${index}">카드 ${index + 1}</button>`)
    .join("");

  document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", () => selectCard(Number(tab.dataset.index), false));
  });
}

function renderForm() {
  const card = activeCard();

  $("formTitle").textContent = `카드 ${S.active + 1} 입력`;

  if (card.image) {
    $("imageBtn").classList.add("has");
    $("thumb").src = card.image;
  } else {
    $("imageBtn").classList.remove("has");
    $("thumb").removeAttribute("src");
  }

  $("titleInput").value = card.title;
  $("titleCount").textContent = `${card.title.length}/${MAX_TITLE}자`;

  $("bodyInput").value = card.body;
  $("bodyCount").textContent = `${card.body.length}/${MAX_BODY}자`;
  $("breakCount").textContent = `줄바꿈 ${countBreaks(card.body)}/${MAX_BREAKS}회`;
  $("bodyField").classList.toggle("isErr", hasBodyError(card.body));

  renderCtas();
}

function renderCtas() {
  const card = activeCard();

  $("ctaForms").innerHTML = card.ctas
    .map(
      (cta, index) => `
        <div class="ctaBlock">
          <div class="ctaBlockHead">
            <strong>버튼 ${index + 1}</strong>
            <button type="button" class="textBtn" data-delete="${index}">삭제</button>
          </div>
          <div class="ctaGrid">
            <div class="inputBox">
              <input class="ctaLabel" data-index="${index}" maxlength="${MAX_BUTTON}" placeholder="버튼명을 입력해주세요" value="${escapeHtml(cta.label)}">
              <em>${cta.label.length}/${MAX_BUTTON}</em>
            </div>
            <input class="ctaUrl" data-index="${index}" placeholder="https://" value="${escapeHtml(cta.url)}">
          </div>
        </div>
      `
    )
    .join("");

  document.querySelectorAll("[data-delete]").forEach((button) => {
    button.addEventListener("click", () => removeCta(Number(button.dataset.delete)));
  });

  document.querySelectorAll(".ctaLabel").forEach((input) => {
    input.addEventListener("input", () => {
      const index = Number(input.dataset.index);
      activeCard().ctas[index].label = input.value.slice(0, MAX_BUTTON);
      input.parentElement.querySelector("em").textContent = `${input.value.length}/${MAX_BUTTON}`;
      renderCards();
      renderDots();
    });
  });

  document.querySelectorAll(".ctaUrl").forEach((input) => {
    input.addEventListener("input", () => {
      const index = Number(input.dataset.index);
      activeCard().ctas[index].url = input.value;
      renderCards();
      renderDots();
    });
  });
}

function selectCard(index, moveToForm) {
  S.active = index;
  renderCards();
  renderDots();
  renderTabs();
  renderForm();
  if (!S.all) scrollToActive(true);
  if (moveToForm) $("formPanel").scrollIntoView({ behavior: "smooth", block: "start" });
}

function scrollToActive(smooth) {
  const card = $("track").querySelector(`[data-index="${S.active}"]`);
  if (!card) return;
  $("track").scrollTo({
    left: card.offsetLeft - $("track").offsetLeft,
    behavior: smooth ? "smooth" : "auto",
  });
}

function showToast(message) {
  $("toast").textContent = message;
  $("toast").classList.add("show");
  clearTimeout(S.toastTimer);
  S.toastTimer = setTimeout(() => $("toast").classList.remove("show"), 2000);
}

function addCard() {
  if (S.cards.length >= MAX_CARDS) {
    showToast("캐러셀은 최대 6개까지 생성할 수 있습니다.");
    return;
  }
  S.cards.push(makeCard(S.cards.length));
  S.active = S.cards.length - 1;
  render();
track.onscroll=()=>{};
}

function removeCard() {
  if (S.cards.length <= MIN_CARDS) {
    showToast("캐러셀은 최소 2개가 필요합니다.");
    return;
  }
  S.cards.splice(S.active, 1);
  S.active = Math.max(0, Math.min(S.active, S.cards.length - 1));
  render();
track.onscroll=()=>{};
}

function showCtaError() {
  $("ctaField").classList.add("isErr", "shake");
  setTimeout(() => $("ctaField").classList.remove("shake"), 420);
}

function addCta() {
  if (activeCard().ctas.length >= 2) {
    showCtaError();
    return;
  }
  activeCard().ctas.push(makeCta());
  $("ctaField").classList.remove("isErr");
  render();
track.onscroll=()=>{};
}

function removeCta(index) {
  if (activeCard().ctas.length <= 1) {
    showToast("CTA 버튼은 최소 1개가 필요합니다.");
    return;
  }
  activeCard().ctas.splice(index, 1);
  $("ctaField").classList.remove("isErr");
  render();
track.onscroll=()=>{};
}

function clearDefault(field) {
  if (field === "title" && activeCard().title === DEFAULT_TITLE) {
    activeCard().title = "";
    renderForm();
    renderCards();
    $("titleInput").focus();
  }

  if (field === "body" && activeCard().body === DEFAULT_BODY) {
    activeCard().body = "";
    renderForm();
    renderCards();
    $("bodyInput").focus();
  }
}

$("addCardBtn").addEventListener("click", addCard);
$("removeCardBtn").addEventListener("click", removeCard);
$("addCtaBtn").addEventListener("click", addCta);

$("allBtn").addEventListener("click", () => {
  S.all = !S.all;
  renderMode();
  if (!S.all) scrollToActive(true);
});

$("brandSelect").addEventListener("change", (event) => {
  S.brand = event.target.value;
  renderBrand();
});

$("imageBtn").addEventListener("click", () => $("imageInput").click());
$("imageInput").addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (readerEvent) => {
    activeCard().image = readerEvent.target.result;
    render();
track.onscroll=()=>{};
  };
  reader.readAsDataURL(file);
  event.target.value = "";
});

$("titleInput").addEventListener("focus", () => clearDefault("title"));
$("titleInput").addEventListener("click", () => clearDefault("title"));
$("bodyInput").addEventListener("focus", () => clearDefault("body"));
$("bodyInput").addEventListener("click", () => clearDefault("body"));

$("titleInput").addEventListener("input", (event) => {
  activeCard().title = event.target.value.slice(0, MAX_TITLE);
  $("titleCount").textContent = `${activeCard().title.length}/${MAX_TITLE}자`;
  renderCards();
  renderDots();
});

$("bodyInput").addEventListener("input", (event) => {
  const value = event.target.value.slice(0, MAX_BODY);
  activeCard().body = value;

  $("bodyCount").textContent = `${value.length}/${MAX_BODY}자`;
  $("breakCount").textContent = `줄바꿈 ${countBreaks(value)}/${MAX_BREAKS}회`;

  const error = hasBodyError(value);
  $("bodyField").classList.toggle("isErr", error);
  if (error) {
    $("bodyField").classList.add("shake");
    setTimeout(() => $("bodyField").classList.remove("shake"), 420);
  }

  renderCards();
  renderDots();
});

$("track").addEventListener("scroll", () => {
  if (S.all) return;
  clearTimeout(window.__trackTimer);
  window.__trackTimer = setTimeout(() => {
    const cards = Array.from($("track").querySelectorAll(".card"));
    let best = 0;
    let min = Infinity;
    cards.forEach((card, index) => {
      const distance = Math.abs(card.offsetLeft - $("track").offsetLeft - $("track").scrollLeft);
      if (distance < min) {
        min = distance;
        best = index;
      }
    });

    if (best !== S.active) {
      S.active = best;
      renderCards();
      renderDots();
      renderTabs();
      renderForm();
    }
  }, 80);
});

render();
track.onscroll=()=>{};
