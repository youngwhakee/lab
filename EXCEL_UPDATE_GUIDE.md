# Excel 업데이트 방법 — KEE LAB v0.4

## Members
`Members` 시트에서 한 행을 추가합니다.
`active = TRUE`로 하면 사이트에 표시됩니다.

사진 파일은:
`assets/uploads/members/`

## Alumni
`Alumni` 시트에서 이름, 학위, 졸업연도, 현재 소속/직위를 입력합니다.
연대별 분류는 홈페이지가 자동으로 처리합니다.

## Publications
`Publications` 시트에서 논문/저서 정보를 입력합니다.
`featured = TRUE`이면 Featured Works에 우선 표시됩니다.

## News
`News` 시트에서 날짜, 카테고리, 제목, 요약 등을 입력합니다.

뉴스 사진은:
`assets/uploads/news/`

## Gallery
`Gallery` 시트에서 사진 한 장당 한 행을 입력합니다.
같은 `album` 이름을 사용하면 같은 앨범으로 묶입니다.

사진은:
`assets/uploads/gallery/`

## 실제 반영
Excel 수정 후 GitHub의
`data/kee_lab_content.xlsx`
파일만 교체하면 됩니다.

이 버전은 `.github/workflows`나 Python 변환 과정이 없습니다.
