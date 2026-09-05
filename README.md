# KEE LAB v0.6.0 — 1차 구조/UI 개편

GitHub Pages용 정적 사이트 + Excel 자동 데이터 빌드 구조입니다.

## 이번 변경
- 상단 메뉴: ABOUT / MEMBER / PUBLICATIONS / NEWS / CONTACT
- Research 독립 메뉴 제거, Research Areas는 About the Lab 내부로 이동
- About 하위: About the Lab / Professor
- Member 최상위 신설: Member / Alumni
- 모바일 햄버거 메뉴 동작 수정
- 검색 버튼 제거
- AI 챗봇 UI 숨김/비활성화
- 홈 상단: 랩실소개 + 게시판형 NEWS
- 홈 순서: 랩실소개+NEWS → Research Areas → Professor → Publications → Contact
- 홈 교수 사진 및 멤버 사진: 상단 중앙 기준 표시
- Member 카드 클릭 시 프로필 모달
- 이메일 클릭 시 mailto 대신 클립보드 복사 + 안내 토스트
- 기존 Excel → JSON → GitHub Pages Actions 구조 유지

## 라이브 사이트에 적용할 때
기존에 실제 데이터가 들어 있는 `data/kee_lab_content.xlsx`는 덮어쓰지 않는 것을 권장합니다.
`kee-lab-v0.6.0-live-safe-patch.zip`에는 Excel과 업로드 사진을 제외했습니다.

## Member 모달의 선택 입력 항목
현재 Excel의 Members 시트에 `bio`, `education` 열이 있으면 모달에 표시됩니다. 열이 없더라도 사이트는 정상 동작합니다.

## 레거시 URL
`/research/`, `/about/members.html`, `/about/alumni.html`은 기존 링크 보호를 위해 새 위치로 자동 이동하는 redirect 파일만 남겨두었습니다.
