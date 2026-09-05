# KEE LAB v0.4 — Direct Excel

이 버전은 GitHub Actions 없이 동작합니다.

홈페이지가 `data/kee_lab_content.xlsx`를 브라우저에서 직접 읽어
Members / Alumni / Publications / News / Gallery를 자동으로 표시합니다.

## 앞으로 콘텐츠 수정 방법

1. `data/kee_lab_content.xlsx`를 컴퓨터에서 엽니다.
2. 원하는 시트에서 내용을 추가/수정합니다.
3. 공개할 행은 `active`를 `TRUE`로 설정합니다.
4. Excel 파일을 저장합니다.
5. GitHub의 `data/kee_lab_content.xlsx` 파일을 새 파일로 교체합니다.
6. GitHub Pages가 일반적인 branch 배포 방식으로 다시 배포되면 반영됩니다.

HTML 수정은 필요 없습니다.

## 사진

Excel의 `photo_file` / `image_file` 열에는 파일명만 적습니다.

- Members: `assets/uploads/members/`
- News: `assets/uploads/news/`
- Gallery: `assets/uploads/gallery/`

예:
- Excel: `hong.jpg`
- GitHub: `assets/uploads/members/hong.jpg`

## 중요

- 현재 저장소가 Public이면 Excel 파일의 내용도 공개됩니다.
- 공개 가능한 정보만 입력하세요.
- API Key, 비밀번호, 비공개 개인정보는 절대 넣지 마세요.
- `active = FALSE`인 행은 웹페이지에서 숨겨집니다.
- `featured = TRUE`인 News/Publications/Gallery 항목은 대표 콘텐츠로 우선 표시됩니다.

## GitHub Pages 설정

이 버전에서는 복잡한 GitHub Actions가 필요 없습니다.

`Settings → Pages`
- Source: `Deploy from a branch`
- Branch: `main`
- Folder: `/ (root)`

이면 됩니다.

## 참고

브라우저에서 Excel을 읽기 위해 SheetJS(xlsx) 0.18.5를 jsDelivr CDN에서 불러옵니다.
따라서 방문자의 브라우저가 해당 CDN에 접근할 수 있어야 Excel 데이터가 표시됩니다.
