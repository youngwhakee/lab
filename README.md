# KEE LAB v0.3 — Excel-managed GitHub Pages

이 버전은 **HTML을 직접 수정하지 않고 Excel 파일로 Members / Alumni / Publications / News / Gallery를 관리**하고, GitHub Actions가 Excel을 읽어 사이트를 직접 배포하도록 구성되어 있습니다.

## 운영자가 수정하는 핵심 파일

`data/kee_lab_content.xlsx`

시트:
- `Members`
- `Alumni`
- `Publications`
- `News`
- `Gallery`

`README` 시트에 입력 규칙이 들어 있습니다.

## 자동 반영 원리

1. Excel을 수정합니다.
2. 사진이 있으면 정해진 업로드 폴더에 올립니다.
3. GitHub에서 수정된 파일을 `main` 브랜치에 반영합니다.
4. GitHub Actions의 `Build and deploy KEE LAB`이 실행됩니다.
5. Excel → JSON 변환이 실행됩니다.
6. 생성된 JSON과 사이트 파일을 하나의 Pages artifact로 묶습니다.
7. 같은 workflow가 그 artifact를 GitHub Pages에 바로 배포합니다.

**중간에 JSON을 GitHub 저장소에 다시 커밋하지 않습니다.** 따라서 branch 기반 Pages 재빌드 문제를 피합니다.

## GitHub Pages 설정 — 중요

저장소에서 한 번만 다음 설정을 해주세요.

`Settings → Pages → Build and deployment → Source → GitHub Actions`

기존 `Deploy from a branch`가 선택되어 있으면 `GitHub Actions`로 변경해야 합니다.

## 이미지 폴더

- 멤버: `assets/uploads/members/`
- 뉴스: `assets/uploads/news/`
- 갤러리: `assets/uploads/gallery/`

Excel에는 파일명만 적으면 됩니다.

예: `honggildong.jpg`

## active / featured

- `active = TRUE` → 공개
- `active = FALSE` → Excel에는 있지만 사이트에는 숨김
- `featured = TRUE` → Featured 영역 우선 표시

처음 들어 있는 예시 데이터는 전부 `active = FALSE`입니다. 따라서 처음 배포하면 해당 목록은 비어 있는 것이 정상입니다.

## 자동 빌드 확인

GitHub의 `Actions` 탭에서 `Build and deploy KEE LAB` workflow가 초록색 체크로 끝나는지 확인합니다.

배포된 사이트의 아래 파일을 열어 빌드 결과도 확인할 수 있습니다.

`/assets/data/build-status.json`

여기에 마지막 빌드 시각과 공개된 데이터 개수가 기록됩니다.

## 공개 정보 주의

Public 저장소라면 Excel 원본도 GitHub에서 누구나 볼 수 있습니다. 홈페이지에 공개해도 되는 정보만 입력하세요. 비밀번호, API 키, 개인 전화번호, 비공개 개인정보는 넣지 마세요.
