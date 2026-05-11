
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

let state = {
  brand: "DEFENDER",
  all: false,
  active: 0,
  cards: [makeCard(0), makeCard(1)],
  toastTimer: null,
};

function $(id) {
  return document.getElementById(id);
}

function makeId() {
  return `card-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function makeCta() {
  return { label: "", url: "" };
}

function makeCard(index) {
  return {
    id: makeId(),
    image: "",
    title: index === 0 ? DEFAULT_TITLE : "",
    body: index === 0 ? DEFAULT_BODY : "",
    ctas: [makeCta()],
  };
}

function activeCard() {
  return state.cards[state.active];
}

function countBreaks(value) {
  return (String(value || "").match(/\n/g) || []).length;
}

function hasBodyError(value) {
  return countBreaks(value) > MAX_BREAKS;
}

function textLen(value) {
  return Array.from(String(value || "")).length;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function normalizeUrl(value) {
  const url = String(value || "").trim();
  if (!url) return "#";
  if (url.startsWith("#") || /^(https?:\/\/|mailto:|tel:)/i.test(url)) return url;
  return `https://${url}`;
}

function showToast(message) {
  $("toast").textContent = message;
  $("toast").classList.add("show");
  clearTimeout(state.toastTimer);
  state.toastTimer = setTimeout(() => $("toast").classList.remove("show"), 2000);
}

function renderAll() {
  renderBrand();
  renderCards();
  renderDots();
  renderTabs();
  renderForm();
  renderMode();
  scrollToActive(false);
}

function renderBrand() {
  const brand = BRANDS[state.brand];
  $("brandName").textContent = brand.label;
  $("brandLogo").textContent = brand.logo;
  $("brandLogo").className = `brandLogo ${brand.cls}`;
  $("brandSelect").value = state.brand;
}

function renderMode() {
  $("layout").classList.toggle("all", state.all);
  $("allBtn").classList.toggle("on", state.all);
  $("allBtn").textContent = state.all ? "스크롤 보기" : "한번에 보기";
}

function renderCards() {
  $("track").innerHTML = state.cards
    .map((card, index) => {
      const imageHtml = card.image
        ? `<img src="${card.image}" alt="">`
        : `▧<br>600 × 800 이미지`;

      const ctaHtml = card.ctas
        .map((cta) => {
          return `
            <a class="cta" href="${escapeHtml(normalizeUrl(cta.url))}" target="_blank" rel="noopener noreferrer">
              <span>${escapeHtml(cta.label || "버튼명")}</span>
            </a>
          `;
        })
        .join("");

      return `
        <article class="card ${index === state.active ? "active" : ""}" tabindex="0" data-index="${index}">
          <div class="img">${imageHtml}</div>
          <div class="content">
            <h2 class="title">${escapeHtml(card.title || DEFAULT_TITLE)}</h2>
            <div class="line"></div>
            <p class="body ${hasBodyError(card.body) ? "errText" : ""}">${escapeHtml(card.body || DEFAULT_BODY)}</p>
          </div>
          <div class="ctas">${ctaHtml}</div>
        </article>
      `;
    })
    .join("");

  document.querySelectorAll(".card").forEach((cardEl) => {
    cardEl.addEventListener("click", (event) => {
      if (event.target.closest("a")) return;
      setActive(Number(cardEl.dataset.index), { moveToForm: true, smooth: true });
    });
    cardEl.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        setActive(Number(cardEl.dataset.index), { moveToForm: true, smooth: true });
      }
    });
  });
}

function renderDots() {
  $("dots").innerHTML = state.cards
    .map((_, index) => {
      return `<button type="button" class="dot ${index === state.active ? "active" : ""}" data-index="${index}" aria-label="카드 ${index + 1} 보기"></button>`;
    })
    .join("");

  document.querySelectorAll(".dot").forEach((dot) => {
    dot.addEventListener("click", () => {
      setActive(Number(dot.dataset.index), { moveToForm: false, smooth: true });
    });
  });
}

function renderTabs() {
  $("tabs").innerHTML = state.cards
    .map((_, index) => {
      return `<button type="button" class="tab ${index === state.active ? "active" : ""}" data-index="${index}">카드 ${index + 1}</button>`;
    })
    .join("");

  document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      setActive(Number(tab.dataset.index), { moveToForm: false, smooth: true });
    });
  });
}

function renderForm() {
  const card = activeCard();

  $("formTitle").textContent = `카드 ${state.active + 1} 입력`;

  if (card.image) {
    $("imageBtn").classList.add("has");
    $("thumb").src = card.image;
  } else {
    $("imageBtn").classList.remove("has");
    $("thumb").removeAttribute("src");
  }

  $("titleInput").value = card.title;
  $("titleCount").textContent = `${textLen(card.title)}/${MAX_TITLE}자`;

  $("bodyInput").value = card.body;
  $("bodyCount").textContent = `${textLen(card.body)}/${MAX_BODY}자`;
  $("breakCount").textContent = `줄바꿈 ${countBreaks(card.body)}/${MAX_BREAKS}회`;
  $("bodyField").classList.toggle("isErr", hasBodyError(card.body));

  renderCtas();
}

function renderCtas() {
  const card = activeCard();

  $("ctaForms").innerHTML = card.ctas
    .map((cta, index) => {
      return `
        <div class="ctaBlock">
          <div class="ctaBlockHead">
            <strong>버튼 ${index + 1}</strong>
            <button type="button" class="textBtn" data-delete="${index}">삭제</button>
          </div>
          <div class="ctaGrid">
            <div class="inputBox">
              <input class="ctaLabel" data-index="${index}" maxlength="${MAX_BUTTON}" placeholder="버튼명을 입력해주세요" value="${escapeHtml(cta.label)}">
              <em>${textLen(cta.label)}/${MAX_BUTTON}</em>
            </div>
            <input class="ctaUrl" data-index="${index}" placeholder="https://" value="${escapeHtml(cta.url)}">
          </div>
        </div>
      `;
    })
    .join("");

  document.querySelectorAll("[data-delete]").forEach((button) => {
    button.addEventListener("click", () => {
      removeCta(Number(button.dataset.delete));
    });
  });

  document.querySelectorAll(".ctaLabel").forEach((input) => {
    input.addEventListener("input", () => {
      const index = Number(input.dataset.index);
      activeCard().ctas[index].label = input.value.slice(0, MAX_BUTTON);
      input.parentElement.querySelector("em").textContent = `${textLen(input.value)}/${MAX_BUTTON}`;
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

function setActive(index, options = {}) {
  const safeIndex = Math.max(0, Math.min(index, state.cards.length - 1));
  state.active = safeIndex;

  renderCards();
  renderDots();
  renderTabs();
  renderForm();
  scrollToActive(options.smooth);

  if (options.moveToForm) {
    $("formPanel").scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function scrollToActive(smooth = false) {
  if (state.all) return;

  const card = $("track").querySelector(`[data-index="${state.active}"]`);
  if (!card) return;

  $("track").scrollTo({
    left: card.offsetLeft - $("track").offsetLeft,
    behavior: smooth ? "smooth" : "auto",
  });
}

function addCard() {
  if (state.cards.length >= MAX_CARDS) {
    showToast("캐러셀은 최대 6개까지 생성할 수 있습니다.");
    return;
  }

  state.cards.push(makeCard(state.cards.length));
  state.active = state.cards.length - 1;
  renderAll();

  requestAnimationFrame(() => {
    state.active = state.cards.length - 1;
    renderCards();
    renderDots();
    renderTabs();
    renderForm();
    scrollToActive(true);
  });
}

function removeCard() {
  if (state.cards.length <= MIN_CARDS) {
    showToast("캐러셀은 최소 2개가 필요합니다.");
    return;
  }

  const targetIndex = Math.max(0, state.active - 1);
  state.cards.splice(state.active, 1);
  state.active = Math.min(targetIndex, state.cards.length - 1);
  renderAll();

  requestAnimationFrame(() => {
    state.active = Math.min(targetIndex, state.cards.length - 1);
    renderCards();
    renderDots();
    renderTabs();
    renderForm();
    scrollToActive(true);
  });
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
  renderAll();
}

function removeCta(index) {
  if (activeCard().ctas.length <= 1) {
    showToast("CTA 버튼은 최소 1개가 필요합니다.");
    return;
  }

  activeCard().ctas.splice(index, 1);
  $("ctaField").classList.remove("isErr");
  renderAll();
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
  state.all = !state.all;
  renderMode();
  scrollToActive(true);
});

$("brandSelect").addEventListener("change", (event) => {
  state.brand = event.target.value;
  renderBrand();
});

$("imageBtn").addEventListener("click", () => $("imageInput").click());
$("imageInput").addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (readerEvent) => {
    activeCard().image = readerEvent.target.result;
    renderAll();
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
  $("titleCount").textContent = `${textLen(activeCard().title)}/${MAX_TITLE}자`;
  renderCards();
  renderDots();
});

$("bodyInput").addEventListener("input", (event) => {
  const value = event.target.value.slice(0, MAX_BODY);
  activeCard().body = value;

  $("bodyCount").textContent = `${textLen(value)}/${MAX_BODY}자`;
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

renderAll();

/*
수동 테스트 케이스

1. 카드 추가
- 카드 1 상태에서 추가 → 카드 3 입력으로 이동
- 카드 2 상태에서 추가 → 카드 3 입력으로 이동
- 카드 3 상태에서 추가 → 카드 4 입력으로 이동
- 어떤 위치에서 추가하든 새로 추가된 마지막 카드가 선택되어야 함

2. 카드 삭제
- 카드 4 삭제 → 카드 3 입력으로 이동
- 카드 3 삭제 → 카드 2 입력으로 이동
- 카드 2 삭제 → 카드 1 입력으로 이동
- 카드 1 삭제 → 카드 1 입력 유지
- 카드가 2개일 때 삭제 클릭 → 최소 2개 안내

3. 스크롤
- 사용자가 미리보기 영역을 직접 가로 스크롤해도 현재 선택 카드가 임의로 바뀌지 않아야 함
- 카드 이동은 카드 클릭, dot 클릭, 탭 클릭으로만 바뀌어야 함
*/
