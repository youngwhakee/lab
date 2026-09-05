# v0.3 배포 방법

## 1. 기존 저장소 파일 교체

이 패키지의 내용물을 기존 `lab` 저장소 최상단에 업로드/교체합니다.

특히 아래 파일이 반드시 있어야 합니다.

`.github/workflows/build-content.yml`

GitHub 저장소의 Code 화면에서 `.github` → `workflows` → `build-content.yml`이 보이는지 확인하세요.

## 2. Pages Source 변경

`Settings` → `Pages` → `Build and deployment` → `Source`를 `GitHub Actions`로 변경합니다.

`Deploy from a branch`로 두면 안 됩니다.

## 3. Actions 확인

`Actions` 탭 → `Build and deploy KEE LAB` → 최신 실행이 초록색 체크인지 확인합니다.

## 4. 테스트 방법

`data/kee_lab_content.xlsx`를 열고 예시 데이터 한 행의 `active`를 `TRUE`로 바꿔 저장한 후 GitHub에 교체 업로드합니다.

Actions가 끝나면 사이트에 해당 항목이 나타나야 합니다.

테스트가 끝나면 다시 `FALSE`로 바꾸거나 실제 데이터로 교체하세요.
