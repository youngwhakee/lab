# Excel 콘텐츠 업데이트 — 1분 가이드

## 멤버 추가

1. `data/kee_lab_content.xlsx` → Members 시트
2. 새 행 작성
3. `active`를 TRUE로 설정
4. 사진이 있으면 `photo_file`에 `name.jpg` 입력
5. 실제 사진은 `assets/uploads/members/name.jpg`에 업로드
6. 수정한 Excel 파일을 GitHub에 다시 업로드

## Alumni 추가

Alumni 시트에 한 행을 추가하고 `active = TRUE`로 설정합니다.
졸업연도에 따라 페이지가 자동으로 2020s / 2010s / 2000s처럼 묶입니다.

## 논문 추가

Publications 시트에 한 행을 추가합니다.
`type`은 journal / book / chapter / report 중 선택합니다.
대표 논문이면 `featured = TRUE`로 설정합니다.

## 뉴스 추가

News 시트에 날짜, 카테고리, 제목, 요약을 입력합니다.
사진 파일명은 `image_file`에 적고 실제 파일은 `assets/uploads/news/` 폴더에 업로드합니다.

## 갤러리 추가

Gallery 시트에 사진 한 장당 한 행을 사용합니다.
같은 `album` 값을 가진 사진은 같은 앨범으로 자동 묶입니다.
