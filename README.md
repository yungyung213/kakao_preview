Kakao Message Preview v44 CTA Fix

초기 캐러셀 피드형 미리보기 CTA 1개 기본 노출, + CTA 추가 버튼 직접 실행, CTA 삭제 버튼 직접 실행 방식으로 수정했습니다. Toolbox 메뉴명은 문자 미리보기로 유지됩니다.

v44 변경사항:
- script.js: makeCard()에서 ctaMode를 "none" → "link"로 초기화
  (새 카드 추가 시 CTA 버튼이 즉시 표시되지 않던 문제 해결)
- script.js: bindCtaRemove()를 이벤트 위임(event delegation) 방식으로 교체
  (renderCtas()가 innerHTML을 교체할 때마다 삭제 버튼 바인딩이 끊기던 문제 해결)
  ctaForms 컨테이너에 한 번만 click 리스너를 등록하므로 render 후에도 항상 작동

업로드 파일: index.html, style.css, script.js
