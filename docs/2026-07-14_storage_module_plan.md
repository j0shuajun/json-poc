# Step 3. app/storage.js — 연락처 JSON 파일 저장소 (Plan)

Written at (KST): 2026-07-14 12:20

## 1. 작업 목적

CRUD 앱이 연락처 데이터를 어떤 JSON 파일에 어떻게 읽고 쓸지 담당하는 계층을 만든다.
`poc/json-poc.js`에서 검증한 "파일 경로 + 데이터를 주고받는 순수 함수" 구조를 그대로
재사용해, PoC와 앱의 코드 구조를 일치시킨다.

## 2. 현재 상태 (리더 관점)

- `poc/json-poc.js`는 파일이 이미 존재한다고 가정하고 읽는다.
- CRUD 앱을 처음 실행하는 시점에는 연락처 데이터 파일이 아직 없을 수 있는데,
  이 경우를 어떻게 처리할지 정해진 바가 없다.

## 3. 목표 상태

- `loadContacts(filePath)` — 파일이 있으면 그 내용을(연락처 배열) 읽어 돌려주고,
  파일이 아직 없으면(첫 실행) 빈 배열을 돌려준다.
- `saveContacts(filePath, contacts)` — 연락처 배열을 JSON 파일로 저장한다.
- JSON 형식이 깨진 파일을 읽으려 하면, `poc/json-poc.js`가 이미 제공하는
  "파일 경로가 포함된 에러"가 그대로 전달된다 (에러 처리를 중복 구현하지 않는다).

## 4. 대표 시나리오

- 앱을 처음 실행해 연락처 파일이 없는 상태에서 `loadContacts('contacts.json')`을
  호출하면 빈 배열 `[]`을 돌려받는다.
- `saveContacts('contacts.json', [{ id: 1, name: '홍길동' }])` 호출 후
  `loadContacts('contacts.json')`을 호출하면 저장했던 배열을 그대로 돌려받는다.
- `contacts.json` 내용이 깨져 있으면, `loadContacts`는 `poc/json-poc.js`의
  `loadJson`이 던지는 것과 동일한 에러(파일 경로 포함)를 그대로 전달한다.

## 5. 변경 접근 방식

- `app/storage.js`는 `poc/json-poc.js`의 `saveJson`/`loadJson`을 import해서 그대로 사용한다
  (JSON 저장/읽기 로직을 다시 작성하지 않는다).
- `loadContacts`는 `fs.existsSync`로 파일 존재 여부만 먼저 확인하고, 없으면 빈 배열을
  돌려준다. 있으면 `loadJson`에 위임한다.
- `saveContacts`는 `saveJson`을 그대로 감싼 얇은 wrapper다.

## 6. 예상 설명 구조

- 별도 다이어그램 없이, "파일 없음 / 정상 저장·읽기 / 깨진 파일" 세 시나리오 중심으로
  result 문서를 작성한다.

## 7. 가정 및 리스크

- 가정: "파일이 없다"는 것은 오류가 아니라 "아직 연락처가 하나도 없는 정상 상태"로
  취급한다 (콘솔 CRUD 앱을 처음 실행하는 사용자를 위한 자연스러운 동작).
- 리스크: 낮음. `poc/json-poc.js`를 그대로 재사용하는 얇은 계층이라 새로운 로직이 적다.

## 8. 검증 방법

- TDD로 진행: 파일 없음 → 빈 배열, 저장 후 읽기 round-trip, 깨진 파일 에러 전파에 대한
  테스트를 먼저 작성해 실패를 확인한 뒤, 최소 구현으로 통과시킨다.
- `npm test`로 전체 테스트 통과를 확인한다.
