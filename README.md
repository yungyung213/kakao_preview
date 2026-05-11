# Kakao Carousel Preview

카카오톡 캐러셀 피드형 메시지를 발송 전 미리보기 할 수 있는 정적 웹페이지입니다.

## 파일 구성

```txt
index.html
style.css
script.js
```

## GitHub Pages 업로드 방법

1. GitHub 저장소에서 `Add file` 또는 `Upload files` 클릭
2. 아래 3개 파일을 모두 업로드
   - `index.html`
   - `style.css`
   - `script.js`
3. `Commit changes` 클릭
4. 저장소 상단 `Settings` 클릭
5. 왼쪽 메뉴 `Pages` 클릭
6. `Source`를 `Deploy from a branch`로 선택
7. `Branch`를 `main`으로 선택
8. 폴더는 `/root` 선택
9. `Save` 클릭

몇 분 후 아래 형태의 주소로 접속할 수 있습니다.

```txt
https://깃허브아이디.github.io/저장소이름/
```

## 주요 기능

- 기본 카드 2개
- 최대 카드 6개
- 카드 6개 초과 시 안내창
- 이미지 업로드
- 600x800이 아닌 이미지도 카드 가로 사이즈에 맞춰 노출
- 타이틀 20자 제한
- 본문 180자 제한
- 본문 줄바꿈 2회까지 허용
- 본문 줄바꿈 3회 이상 시 흔들림 및 빨간색 경고
- CTA 최대 2개
- CTA 2개 입력 시 카드 하단 라운드 버튼으로 분할
- CTA 클릭 시 입력 링크 새 탭 이동
- 브랜드명 선택: DEFENDER, Range Rover, Discovery
- 한번에 보기 모드
- 모바일 반응형 지원
