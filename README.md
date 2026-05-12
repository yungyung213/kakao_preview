Kakao Message Preview v45 CTA Fix

v45 변경사항:
- style.css: Toolbox가 페이지 전체를 덮어 CTA 추가/삭제 버튼 클릭을 가로채던 문제 수정
  - .toolbox에 pointer-events: none 추가
  - .toolbox-list, .toolbox-toggle, .toolbox-item은 pointer-events: auto 유지
  (Toolbox 자체 기능은 그대로, 뒤쪽 페이지 버튼 클릭이 정상 작동)

업로드 파일: index.html, style.css, script.js
