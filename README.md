# Kakao Message Preview v46 CTA Fix

## v46 변경사항

### 문제
툴박스(Toolbox)가 닫혀 있는 상태에서도 `.toolbox-list` 영역이 페이지 위를 덮어
CTA 추가/삭제 버튼 클릭을 가로채는 문제.

스크린샷 기준으로 `a.toolbox-item.active` 요소가 `+ CTA 추가` 버튼 위에 올라와
클릭이 전달되지 않았음.

### 원인
v45에서 추가한 아래 코드가 `.toolbox-list`에 무조건 `pointer-events: auto`를 적용함:

```css
/* ❌ v45 - 문제 코드 */
.toolbox-list,
.toolbox-toggle,
.toolbox-item {
  pointer-events: auto;
}
```

`.toolbox-list`는 툴박스가 닫혀 있을 때도 DOM 상에 존재하며 화면을 덮고 있기 때문에,
`pointer-events: auto`가 적용되면 뒤쪽 버튼 클릭을 가로챔.

### 수정 (style.css)
`.toolbox-list`를 `pointer-events: auto` 목록에서 제거.
이미 상위 규칙에서 올바르게 처리되고 있었음:

```css
/* 기본: 닫힌 상태 → 클릭 차단 */
.toolbox-list {
  pointer-events: none;
}

/* 열린 상태에서만 클릭 허용 */
.toolbox.open .toolbox-list {
  pointer-events: auto;
}
```

v46에서는 아래와 같이 `.toolbox-toggle`과 `.toolbox-item`만 유지:

```css
/* ✅ v46 - 수정 코드 */
.toolbox-toggle {
  pointer-events: auto;
}

.toolbox-item {
  pointer-events: auto;
}
```

### 결과
- 툴박스 닫힌 상태 → CTA 추가/삭제 버튼 정상 클릭 ✅
- 툴박스 열린 상태 → 툴박스 메뉴 정상 클릭 ✅
- 툴박스 토글 버튼 → 항상 정상 클릭 ✅

---

## 업로드 파일
- `style.css` (v46 수정본)
- `index.html` (변경 없음)
- `script.js` (변경 없음)
