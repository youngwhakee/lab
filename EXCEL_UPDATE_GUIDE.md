# Excel 콘텐츠 관리 — v0.6.0

기존 사용법은 동일합니다. `data/kee_lab_content.xlsx`를 수정하고 Commit하면 GitHub Actions가 JSON을 생성해 사이트를 배포합니다.

## Members
권장 열: `active`, `id`, `sort_order`, `name_ko`, `name_en`, `role_group`, `role_label`, `research_interests`, `email`, `profile_url`, `photo_file`, `bio`, `education`

- `active=TRUE`: 공개
- `photo_file`: `assets/uploads/members/`의 실제 파일명
- `bio`: 멤버 카드를 클릭했을 때 모달에 표시되는 짧은 약력
- `education`: 모달에 표시할 학력/소속 이력의 짧은 문장
- `email`: 화면에서 클릭하면 메일 앱으로 이동하지 않고 클립보드에 복사
- 사진은 카드/모달 모두 상단 중앙을 기준으로 표시

기존 Excel에 `bio`, `education` 열이 없어도 오류 없이 작동하며, 필요할 때 열을 추가하면 됩니다.
