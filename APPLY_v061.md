# KEE LAB v0.6.1 Member Modal Fix

이번 패치는 기존 Excel/사진/3:4 카드 비율을 건드리지 않습니다.

## GitHub에서 교체할 파일
1. assets/js/data-pages.js
2. assets/css/site-v06.css

## 교체 후 member/index.html에서 캐시 버전만 변경
현재 아래 두 줄의 `v=0.6.0`을 `v=0.6.1`로 바꾸세요.

<link rel="stylesheet" href="../assets/css/site-v06.css?v=0.6.1">
<script src="../assets/js/data-pages.js?v=0.6.1"></script>

기존에 직접 수정한 3:4 비율 CSS는 그대로 유지하세요.

## 해결되는 문제
- Excel id가 중복되어도 다른 사람 모달이 열리지 않음
- profile_url에 www.example.com 또는 example.com만 적어도 https://로 보정
- Profile 링크는 새 탭에서 열림
- 모달의 PROFILE 글꼴/크기/굵기가 EMAIL COPY와 동일
- bio가 없을 때 "약력은 준비 중입니다." 문구를 더 이상 표시하지 않음

## Excel 약력 입력
현재 사용 중인 `data/kee_lab_content.xlsx`의 `Members` 시트에
아래 헤더를 오른쪽 끝에 추가하세요.

bio
education

헤더명은 영어 소문자로 정확하게 입력하세요.
위치는 꼭 정해져 있지 않습니다. 코드가 열 위치가 아니라 헤더명을 찾아 읽습니다.

예:
bio = 평생교육 정책과 지역사회 학습을 중심으로 연구하고 있습니다.
education = 숭실대학교 평생교육학 박사과정

## Profile 링크 입력
Members 시트의 `profile_url`에 다음처럼 입력하는 것을 권장합니다.

https://example.com/profile

v0.6.1에서는 `www.example.com/profile` 또는 `example.com/profile`도 자동으로 https://를 붙입니다.
