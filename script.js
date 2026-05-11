const MAX_CARDS = 6;
const MIN_CARDS = 2;
const MAX_TITLE = 20;
const MAX_BODY = 180;
const MAX_BUTTON = 8;
const MAX_BODY_LINE_BREAKS = 2;

const state = {
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
  renderPreview();
  renderDots();
  renderTabs();
  renderForm();
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
        .map(
          (cta) => `
            <a class="preview-cta" href="${cta.url || "#"}" onclick="return false;">
              <span>${escapeHtml(cta.label || "버튼명")}</span>
            </a>
          `
        )
        .join("");

      return `
        <article class="preview-card">
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
    .map((_, index) => `<span class="dot ${index === state.activeIndex ? "active" : ""}"></span>`)
    .join("");
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
      render();
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
      render();
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

document.getElementById("imageUploadBtn").addEventListener("click", () => {
  document.getElementById("imageInput").click();
});

document.getElementById("imageInput").addEventListener("change", (event) => {
  handleImageUpload(event.target.files[0]);
  event.target.value = "";
});

document.getElementById("titleInput").addEventListener("input", (event) => {
  getActiveCard().title = event.target.value.slice(0, MAX_TITLE);
  render();
});

document.getElementById("bodyInput").addEventListener("input", (event) => {
  const value = event.target.value.slice(0, MAX_BODY);

  if (getLineBreakCount(value) > MAX_BODY_LINE_BREAKS) {
    triggerBodyShake();
  }

  getActiveCard().body = value;
  render();
});

render();

/*
수동 테스트 케이스

1. 최초 진입
- 카드가 2개 보인다.
- 첫 번째 카드는 기본 플레이스홀더 문구가 보인다.
- 두 번째 카드도 탭에서 선택 가능하다.

2. 카드 추가
- "캐러셀 추가" 클릭 시 카드가 1개씩 늘어난다.
- 6개까지는 정상 추가된다.
- 6개 상태에서 한 번 더 누르면 "최대 6개" 안내가 뜬다.

3. 카드 삭제
- 카드가 3개 이상일 때 삭제하면 정상 삭제된다.
- 카드가 2개일 때 삭제하려고 하면 "최소 2개" 안내가 뜬다.

4. 이미지 업로드
- 카드별로 이미지 업로드가 가능하다.
- 업로드 후 미리보기 이미지 영역에 반영된다.
- 이미지 영역은 600x800 비율로 보인다.

5. 타이틀/본문 입력
- 타이틀 최대 20자 카운트가 동작한다.
- 본문 최대 180자 카운트가 동작한다.
- 입력한 값이 미리보기에 즉시 반영된다.

6. 본문 줄바꿈 제한
- 줄바꿈이 0~2회일 때 본문 입력창과 미리보기 본문은 일반 색상으로 보인다.
- 줄바꿈이 3회 이상이면 본문 입력 영역이 살짝 흔들린다.
- 줄바꿈이 3회 이상이면 본문 입력창, 안내 문구, 미리보기 본문이 빨간색으로 보인다.
- 줄바꿈을 다시 2회 이하로 줄이면 빨간색 표시가 사라지고 일반 색상으로 돌아온다.

7. CTA 버튼
- 기본 1개 CTA가 존재한다.
- CTA 추가 클릭 시 최대 2개까지 생성된다.
- 2개일 때 버튼이 좌우 반반으로 분할된다.
- 2개 상태에서 더 추가하면 "최대 2개" 안내가 뜬다.

8. CTA 삭제
- CTA가 2개일 때 하나 삭제 가능하다.
- CTA가 1개일 때 삭제하려고 하면 "최소 1개" 안내가 뜬다.

9. 반응형 화면
- 모바일 화면에서는 미리보기와 입력 영역이 위아래로 쌓인다.
- 데스크톱 화면에서는 미리보기와 입력 영역이 좌우로 배치된다.
- 카드 탭과 캐러셀 미리보기는 작은 화면에서 가로 스크롤로 확인 가능하다.
*/
