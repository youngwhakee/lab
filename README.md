# KEE LAB v0.5 — Excel-managed GitHub Pages

이 패키지는 **HTML을 직접 수정하지 않고 Excel 파일로 Members / Alumni / Publications / News / Gallery를 관리**하도록 바꾼 버전입니다.

## 운영자가 수정하는 파일

`data/kee_lab_content.xlsx`

엑셀 안에는 다음 시트가 있습니다.

- `Members`
- `Alumni`
- `Publications`
- `News`
- `Gallery`

`README` 시트에 입력 규칙이 들어 있습니다.

## 자동 반영 원리

1. Excel을 수정합니다.
2. 필요하면 사진을 정해진 폴더에 업로드합니다.
3. GitHub에서 `data/kee_lab_content.xlsx`를 새 파일로 교체합니다.
4. `.github/workflows/build-content.yml`이 자동 실행됩니다.
5. Excel → JSON 변환이 자동으로 이루어집니다.
6. GitHub Pages가 갱신됩니다.

HTML은 수정하지 않습니다.

## 이미지 폴더

- 멤버 사진: `assets/uploads/members/`
- 뉴스 사진: `assets/uploads/news/`
- 갤러리 사진: `assets/uploads/gallery/`

Excel에는 전체 경로가 아니라 **파일명만** 적으면 됩니다.

예: `honggildong.jpg`

## 매우 중요 — 공개 정보만 입력

현재 저장소가 Public이면 `data/kee_lab_content.xlsx`도 누구나 열어볼 수 있습니다.
따라서 개인 전화번호, 비공개 이메일, 개인정보, API 키 등은 절대 넣지 마세요.

## 처음 GitHub에 교체 업로드한 뒤

`Actions` 탭에서 **Build site content from Excel** 작업이 초록색 체크로 완료되는지 확인하세요.
실패한다면 저장소 `Settings → Actions → General → Workflow permissions`에서 Actions 쓰기 권한 설정을 확인해야 할 수 있습니다.

## active / featured

- `active = TRUE`: 홈페이지에 공개
- `active = FALSE`: 데이터는 Excel에 있지만 홈페이지에는 숨김
- `featured = TRUE`: Featured 영역에 우선 표시

처음 들어 있는 예시 행은 모두 `active = FALSE`라 공개 페이지에는 나타나지 않습니다.


## Professor 사진/정보 관리 (v0.5)

교수님 정보도 이제 `data/kee_lab_content.xlsx`의 `Professor` 시트에서 관리합니다.

- `active`: TRUE인 첫 행을 사용
- `name_ko`, `name_en`: 이름
- `title`, `university`, `department`: 직위/소속
- `email`, `office`: 공개 연락 정보
- `photo_file`: 교수님 사진 파일명
- `home_bio`: HOME 교수 카드용 짧은 소개
- `biography`: Professor 페이지 Biography
- `research_interests`: `|` 문자로 여러 연구분야 구분

사진은 아래 폴더에 업로드합니다.

`assets/uploads/professor/`

예를 들어 Excel에 `photo_file = youngwha-kee.jpg`라고 적었다면 실제 파일도 정확히:

`assets/uploads/professor/youngwha-kee.jpg`

이어야 합니다. 커밋하면 GitHub Actions가 Excel을 읽어 HOME과 Professor 페이지에 자동 반영합니다.
