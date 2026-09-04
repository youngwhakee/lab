# KEE LAB v0.1

이 폴더는 GitHub Pages에 바로 업로드할 수 있는 KEE LAB 공개용 초안입니다.

## 포함된 페이지

- `index.html` — HOME
- `about/index.html` — About the Lab
- `about/professor.html` — Professor
- `about/members.html` — Members
- `about/alumni.html` — Alumni
- `research/index.html` — Research
- `publications/index.html` — Publications
- `news/index.html` — News
- `gallery/index.html` — Photo / Gallery
- `contact/index.html` — Contact

## GitHub Pages에 공개하는 방법

1. GitHub에서 새 Public repository를 만듭니다. 예: `kee-lab`
2. 이 ZIP의 **내용물 전체**를 저장소 최상단에 업로드합니다.
   - 저장소 최상단에 `index.html`이 보여야 합니다.
3. GitHub 저장소의 `Settings` → `Pages`로 이동합니다.
4. `Build and deployment`에서:
   - Source: `Deploy from a branch`
   - Branch: `main`
   - Folder: `/ (root)`
5. Save를 누릅니다.
6. 잠시 뒤 Pages 화면에 공개 URL이 표시됩니다.

주소는 보통 아래 형식입니다.

`https://GITHUB-USERNAME.github.io/kee-lab/`

## 현재 v0.1에서 의도적으로 미완성인 부분

- 실제 교수/구성원/Alumni 데이터
- 실제 Publications 데이터와 DOI/PDF 링크
- News 및 Gallery의 실제 사진
- Contact의 공식 이메일/연구실 위치
- 문의 폼 실제 전송
- 사이트 전체 검색
- Gemini 기반 AI 챗봇

현재 각 페이지의 샘플/placeholder는 레이아웃 확인을 위한 것입니다.
실제 자료가 준비되는 순서대로 교체하면 됩니다.

## 로고

상단 숭실대학교 심벌은 현재 숭실대학교 공식 웹사이트의 이미지 URL을 참조합니다.
최종 운영 전에는 학교의 공식 UI 사용 지침에 맞는 원본 로고 파일을 확보해
`assets/images/`에 저장한 뒤 로컬 파일로 교체하는 것을 권장합니다.

## 다음 단계

사이트가 공개된 다음 실제 URL을 보면서:
1. 교수 프로필
2. Members
3. Publications
4. Alumni
5. News/Gallery
6. Contact
7. CMS
8. AI 챗봇

순서로 채워가면 됩니다.
