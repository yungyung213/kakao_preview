const MAX_CARDS = 6;
const MIN_CARDS = 2;
const MAX_TITLE = 20;
const MAX_BODY = 180;
const MAX_BUTTON = 8;
const MAX_BODY_LINE_BREAKS = 2;

const BRAND_OPTIONS = {
  DEFENDER: {
    label: "(광고)DEFENDER",
    logo: "DEFENDER",
    className: "defender",
  },
  "Range Rover": {
    label: "(광고)Range Rover",
    logo: "RANGE ROVER",
    className: "range",
  },
  Discovery: {
    label: "(광고)Discovery",
    logo: "DISCOVERY",
    className: "discovery",
  },
};

const state = {
  brand: "DEFENDER",
  isAllView: false,
  cards: [createEmptyCard(0), createEmptyCard(1)],
  activeIndex: 0,
  toastTimer: null,
  shakeTimer: null,
};

function makeId() {
  return `card-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function createEmptyCta() {
  return { label: "", url: "" };
}

function createEmptyCard(index) {
  return {
    id: makeId(),
    image: "",
    title: index === 0 ? "타이틀을 입력해주세요." : "",
    body: index === 0 ? "내용을 입력해주세요." : "",
    ctas: [createEmptyCta()],
  };
}

function getLineBreakCount(value) {
  return (value.match(/\n/g) || []).length;
}

function hasBodyLineBreakError(value) {
  return getLineBreakCount(value) > MAX_BODY_LINE_BREAKS;
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");

  if (state.toastTimer) clearTimeout(state.toastTimer);
  state.toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2200);
}

function getActiveCard() {
  return state.cards[state.activeIndex];
}

function render() {
  renderBrand();
  renderPreview();
  renderDots();
  renderTabs();
  renderForm();
  renderViewMode();
  if (!state.isAllView) syncCarouselPosition();
}

function renderBrand() {
  const brand = BRAND_OPTIONS[state.brand];
  const logo = document.getElementById("brandLogo");

  document.getElementById("previewBrandName").textContent = brand.label;
  logo.textContent = brand.logo;
  logo.className = `brand-logo ${brand.className}`;
  document.getElementById("brandSelect").value = state.brand;
}

function renderViewMode() {
  const previewPanel = document.querySelector(".preview-panel");
  const toggleButton = document.getElementById("toggleAllViewBtn");

  previewPanel.classList.toggle("all-view", state.isAllView);
  toggleButton.classList.toggle("active", state.isAllView);
  toggleButton.textContent = state.isAllView ? "스크롤 보기" : "한번에 보기";
}

function renderPreview() {
  const carousel = document.getElementById("previewCarousel");

  carousel.innerHTML = state.cards
    .map((card, index) => {
      const bodyError = hasBodyLineBreakError(card.body);
      const imageHtml = card.image
        ? `<img src="${card.image}" alt="carousel-${index + 1}" />`
        : `<div class="preview-empty"><div class="image-icon">▧</div><strong>600 × 800 이미지</strong></div>`;

      const ctaHtml = card.ctas
        .map((cta) => {
          const safeUrl = normalizeUrl(cta.url);
          return `
            <a class="preview-cta" href="${escapeAttribute(safeUrl)}" target="_blank" rel="noopener noreferrer">
              <span>${escapeHtml(cta.label || "버튼명")}</span>
            </a>
          `;
        })
        .join("");

      return `
        <article class="preview-card" data-card-index="${index}">
          <div class="preview-image">${imageHtml}</div>
          <div class="preview-content">
            <h2 class="preview-title">${escapeHtml(card.title || "타이틀을 입력해주세요.")}</h2>
            <div class="preview-divider"></div>
            <p class="preview-body ${bodyError ? "is-error" : ""}">${escapeHtml(
              card.body || "내용을 입력해주세요."
            )}</p>
          </div>
          <div class="preview-ctas ${card.ctas.length === 2 ? "two" : ""}">
            ${ctaHtml}
          </div>
        </article>
      `;
    })
    .join("");
}

function renderDots() {
  const dots = document.getElementById("dots");
  dots.innerHTML = state.cards
    .map(
      (_, index) => `
        <button type="button" class="dot ${index === state.activeIndex ? "active" : ""}" data-dot-index="${index}" aria-label="카드 ${
        index + 1
      } 보기"></button>
      `
    )
    .join("");

  dots.querySelectorAll(".dot").forEach((button) => {
    button.addEventListener("click", () => {
      state.activeIndex = Number(button.dataset.dotIndex);
      renderTabs();
      renderForm();
      renderDots();
      if (!state.isAllView) scrollToActiveCard();
    });
  });
}

function renderTabs() {
  const tabs = document.getElementById("cardTabs");
  tabs.innerHTML = state.cards
    .map(
      (_, index) => `
        <button type="button" class="card-tab ${index === state.activeIndex ? "active" : ""}" data-card-index="${index}">
          카드 ${index + 1}
        </button>
      `
    )
    .join("");

  tabs.querySelectorAll(".card-tab").forEach((button) => {
    button.addEventListener("click", () => {
      state.activeIndex = Number(button.dataset.cardIndex);
      renderTabs();
      renderForm();
      renderDots();
      if (!state.isAllView) scrollToActiveCard();
    });
  });
}

function renderForm() {
  const card = getActiveCard();
  const bodyError = hasBodyLineBreakError(card.body);
  const lineBreakCount = getLineBreakCount(card.body);

  document.getElementById("formTitle").textContent = `카드 ${state.activeIndex + 1} 입력`;

  const imageUpload = document.getElementById("imageUploadBtn");
  const imageThumb = document.getElementById("imageThumb");

  if (card.image) {
    imageUpload.classList.add("has-image");
    imageThumb.src = card.image;
  } else {
    imageUpload.classList.remove("has-image");
    imageThumb.removeAttribute("src");
  }

  document.getElementById("titleInput").value = card.title;
  document.getElementById("titleCount").textContent = `${card.title.length}/${MAX_TITLE}자`;

  const bodyField = document.getElementById("bodyField");
  const bodyInput = document.getElementById("bodyInput");
  bodyInput.value = card.body;
  document.getElementById("bodyCount").textContent = `${card.body.length}/${MAX_BODY}자`;
  document.getElementById("lineBreakCount").textContent = `줄바꿈 ${lineBreakCount}/${MAX_BODY_LINE_BREAKS}회`;

  bodyField.classList.toggle("is-error", bodyError);

  renderCtaForms();
}

function renderCtaForms() {
  const card = getActiveCard();
  const ctaForms = document.getElementById("ctaForms");

  ctaForms.innerHTML = card.ctas
    .map(
      (cta, index) => `
        <div class="cta-form">
          <div class="cta-form-head">
            <strong>버튼 ${index + 1}</strong>
            <button type="button" class="text-btn cta-remove-btn" data-cta-index="${index}">삭제</button>
          </div>
          <div class="cta-grid">
            <div class="input-wrap">
              <input type="text" class="cta-label-input" maxlength="${MAX_BUTTON}" placeholder="버튼명을 입력해주세요" value="${escapeAttribute(
        cta.label
      )}" data-cta-index="${index}" />
              <em>${cta.label.length}/${MAX_BUTTON}</em>
            </div>
            <input type="text" class="cta-url-input" placeholder="https://" value="${escapeAttribute(
              cta.url
            )}" data-cta-index="${index}" />
          </div>
        </div>
      `
    )
    .join("");

  ctaForms.querySelectorAll(".cta-remove-btn").forEach((button) => {
    button.addEventListener("click", () => {
      removeCta(Number(button.dataset.ctaIndex));
    });
  });

  ctaForms.querySelectorAll(".cta-label-input").forEach((input) => {
    input.addEventListener("input", () => {
      const index = Number(input.dataset.ctaIndex);
      getActiveCard().ctas[index].label = input.value.slice(0, MAX_BUTTON);
      renderPreview();
      renderDots();
      updateCtaCounter(input);
    });
  });

  ctaForms.querySelectorAll(".cta-url-input").forEach((input) => {
    input.addEventListener("input", () => {
      const index = Number(input.dataset.ctaIndex);
      getActiveCard().ctas[index].url = input.value;
      renderPreview();
      renderDots();
    });
  });
}

function updateCtaCounter(input) {
  const counter = input.parentElement.querySelector("em");
  if (counter) counter.textContent = `${input.value.length}/${MAX_BUTTON}`;
}

function addCard() {
  if (state.cards.length >= MAX_CARDS) {
    showToast("캐러셀은 최대 6개까지 생성할 수 있습니다.");
    return;
  }

  state.cards.push(createEmptyCard(state.cards.length));
  state.activeIndex = state.cards.length - 1;
  render();
}

function removeCard() {
  if (state.cards.length <= MIN_CARDS) {
    showToast("캐러셀은 최소 2개가 필요합니다.");
    return;
  }

  state.cards.splice(state.activeIndex, 1);
  state.activeIndex = Math.max(0, Math.min(state.activeIndex, state.cards.length - 1));
  render();
}

function addCta() {
  const card = getActiveCard();

  if (card.ctas.length >= 2) {
    showToast("CTA 버튼은 최대 2개까지 추가할 수 있습니다.");
    return;
  }

  card.ctas.push(createEmptyCta());
  render();
}

function removeCta(index) {
  const card = getActiveCard();

  if (card.ctas.length <= 1) {
    showToast("CTA 버튼은 최소 1개가 필요합니다.");
    return;
  }

  card.ctas.splice(index, 1);
  render();
}

function triggerBodyShake() {
  const bodyField = document.getElementById("bodyField");
  bodyField.classList.remove("shake");
  void bodyField.offsetWidth;
  bodyField.classList.add("shake");

  if (state.shakeTimer) clearTimeout(state.shakeTimer);
  state.shakeTimer = setTimeout(() => {
    bodyField.classList.remove("shake");
  }, 450);
}

function handleImageUpload(file) {
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    getActiveCard().image = event.target.result || "";
    render();
  };
  reader.readAsDataURL(file);
}

function scrollToActiveCard() {
  const carousel = document.getElementById("previewCarousel");
  const card = carousel.querySelector(`[data-card-index="${state.activeIndex}"]`);
  if (!card) return;

  carousel.scrollTo({
    left: card.offsetLeft - carousel.offsetLeft,
    behavior: "smooth",
  });
}

function syncCarouselPosition() {
  requestAnimationFrame(() => {
    const carousel = document.getElementById("previewCarousel");
    const card = carousel.querySelector(`[data-card-index="${state.activeIndex}"]`);
    if (!card) return;
    carousel.scrollLeft = card.offsetLeft - carousel.offsetLeft;
  });
}

function moveCard(direction) {
  const nextIndex = Math.max(0, Math.min(state.cards.length - 1, state.activeIndex + direction));
  if (nextIndex === state.activeIndex) return;

  state.activeIndex = nextIndex;
  renderTabs();
  renderForm();
  renderDots();
  scrollToActiveCard();
}

function handleCarouselScroll() {
  if (state.isAllView) return;

  const carousel = document.getElementById("previewCarousel");
  const cards = Array.from(carousel.querySelectorAll(".preview-card"));
  if (!cards.length) return;

  const left = carousel.scrollLeft;
  let nearestIndex = 0;
  let nearestDistance = Infinity;

  cards.forEach((card, index) => {
    const distance = Math.abs(card.offsetLeft - carousel.offsetLeft - left);
    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearestIndex = index;
    }
  });

  if (nearestIndex !== state.activeIndex) {
    state.activeIndex = nearestIndex;
    renderTabs();
    renderForm();
    renderDots();
  }
}

function normalizeUrl(url) {
  const value = String(url || "").trim();

  if (!value) return "#";
  if (value.startsWith("#")) return value;
  if (/^(https?:\/\/|mailto:|tel:)/i.test(value)) return value;

  return `https://${value}`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttribute(value) {
  return escapeHtml(value).replaceAll("\n", "&#10;");
}

document.getElementById("addCardBtn").addEventListener("click", addCard);
document.getElementById("removeCardBtn").addEventListener("click", removeCard);
document.getElementById("addCtaBtn").addEventListener("click", addCta);
document.getElementById("prevCardBtn").addEventListener("click", () => moveCard(-1));
document.getElementById("nextCardBtn").addEventListener("click", () => moveCard(1));

document.getElementById("toggleAllViewBtn").addEventListener("click", () => {
  state.isAllView = !state.isAllView;
  renderViewMode();
  if (!state.isAllView) scrollToActiveCard();
});

document.getElementById("brandSelect").addEventListener("change", (event) => {
  state.brand = event.target.value;
  renderBrand();
});

document.getElementById("imageUploadBtn").addEventListener("click", () => {
  document.getElementById("imageInput").click();
});

document.getElementById("imageInput").addEventListener("change", (event) => {
  handleImageUpload(event.target.files[0]);
  event.target.value = "";
});

document.getElementById("titleInput").addEventListener("input", (event) => {
  getActiveCard().title = event.target.value.slice(0, MAX_TITLE);
  document.getElementById("titleCount").textContent = `${getActiveCard().title.length}/${MAX_TITLE}자`;
  renderPreview();
  renderDots();
});

document.getElementById("bodyInput").addEventListener("input", (event) => {
  const value = event.target.value.slice(0, MAX_BODY);

  if (getLineBreakCount(value) > MAX_BODY_LINE_BREAKS) {
    triggerBodyShake();
  }

  getActiveCard().body = value;
  renderPreview();
  renderDots();

  const bodyField = document.getElementById("bodyField");
  const bodyError = hasBodyLineBreakError(value);
  bodyField.classList.toggle("is-error", bodyError);
  document.getElementById("bodyCount").textContent = `${value.length}/${MAX_BODY}자`;
  document.getElementById("lineBreakCount").textContent = `줄바꿈 ${getLineBreakCount(value)}/${MAX_BODY_LINE_BREAKS}회`;
});

document.getElementById("previewCarousel").addEventListener("scroll", () => {
  window.clearTimeout(window.__carouselTimer);
  window.__carouselTimer = window.setTimeout(handleCarouselScroll, 80);
});

render();

/*
수동 테스트 케이스

1. 전체 크기
- 기존보다 전체 글자 크기와 브랜드명 크기가 작아져야 한다.
- 미리보기 카드가 레퍼런스처럼 과하게 크지 않아야 한다.

2. 미리보기 형태
- 브랜드 로고는 원 안에 들어가야 한다.
- 브랜드명은 로고 오른쪽에 배치되어야 한다.
- 카드들은 메시지 영역 내부에 여백을 두고 노출되어야 한다.

3. 캐러셀
- 좌우 화살표가 과하게 크지 않아야 한다.
- 좌우 화살표 클릭 시 카드가 한 장씩 이동한다.
- 하단 dot 클릭 시 해당 카드로 이동한다.
- 직접 가로 스크롤 시 가장 가까운 카드 기준으로 탭과 dot이 갱신된다.

4. 한번에 보기
- "한번에 보기" 클릭 시 스크롤 없이 전체 카드가 그리드로 보인다.
- 다시 클릭하면 "스크롤 보기" 상태로 돌아간다.

5. 이미지
- 600x800이 아닌 이미지도 카드 영역에 꽉 차게 노출된다.
- 이미지 외곽에 흰색 라인이 보이지 않는다.

6. 타이틀/본문
- 타이틀은 기존보다 볼드가 약해야 한다.
- 본문 줄바꿈은 2회까지 정상, 3회 이상부터 빨간색 경고와 흔들림이 발생한다.

7. CTA
- CTA는 실제 미리보기처럼 카드 하단 내부에 라운드 버튼으로 보인다.
- CTA 버튼명 입력과 링크 입력이 정상 반영된다.
- CTA 버튼 클릭 시 입력한 링크가 새 탭으로 열린다.
- 링크에 https://를 입력하지 않아도 자동으로 https://가 붙는다.

8. 브랜드 선택
- DEFENDER, Range Rover, Discovery 중 선택 가능하다.
- 상단 브랜드명이 선택값에 따라 변경된다.
- 원형 로고 안 텍스트가 원 밖으로 크게 넘치지 않는다.

9. 반응형
- 모바일 화면에서는 미리보기와 입력 영역이 위아래로 쌓인다.
- 데스크톱 화면에서는 미리보기와 입력 영역이 좌우로 배치된다.
*/
