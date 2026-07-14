# Step 3. app/storage.js — 연락처 JSON 파일 저장소 (Result)

Written at (KST): 2026-07-14 12:26

## 1. 한눈에 보는 요약

- `loadContacts`/`saveContacts` 두 함수로 연락처 JSON 파일을 읽고 쓸 수 있다.
- 파일이 아직 없을 때는 오류 대신 빈 배열을 돌려줘, 앱 첫 실행을 자연스럽게 지원한다.
- `poc/json-poc.js`를 그대로 재사용해, JSON이 깨진 경우의 에러 메시지도 동일하게 유지된다.

## 2. 왜 필요했나

CRUD 앱이 연락처 데이터를 어디에 어떻게 저장할지 결정하는 계층이 필요했다.
JSON PoC에서 검증한 저장/읽기 구조를 그대로 이어받아 코드 스타일을 일치시켰다.

## 3. 이전 vs 이후

- 이전: 연락처를 JSON 파일로 관리하는 코드가 전혀 없었다.
- 이후: 앱을 처음 실행해도(`contacts.json`이 없어도) 오류 없이 빈 목록으로 시작할 수 있고,
  `saveContacts`로 저장한 뒤 `loadContacts`로 읽으면 그대로 돌려받는다.

## 4. 대표 시나리오

```js
loadContacts('contacts.json'); // 파일이 없는 첫 실행
// => []

saveContacts('contacts.json', [
  { id: 1, name: '홍길동', phone: '010-1234-5678', email: 'hong@example.com' },
]);
loadContacts('contacts.json');
// => [{ id: 1, name: '홍길동', phone: '010-1234-5678', email: 'hong@example.com' }]
```

## 5. 독자 입장에서 달라진 점

- `app/storage.js` (구현), `app/storage.test.js` (테스트)가 새로 생겼다.
- `poc/json-poc.js`의 `saveJson`/`loadJson`을 그대로 가져다 쓰기 때문에, JSON 저장/읽기
  로직이 두 곳에 중복되지 않는다.

## 6. 영향 범위

- 새로 추가된 모듈이라 기존 코드에 영향이 없다. 다음 단계인 `app/contactStore.js`가
  이 모듈을 통해 데이터를 읽고 쓸 예정이다.

## 7. 제약/후속 작업/한계

- 파일 경로는 호출하는 쪽(다음 단계의 `cli.js`)이 정한다. 이 모듈 자체는 기본 경로를
  갖지 않는다.

## 8. Lessons

- 없음 (계획한 설계와 실제 구현/테스트 결과가 일치했다).

## 참고

- 변경 파일: `app/storage.js`, `app/storage.test.js`
- 검증 명령: `npm test` → `tests 14 / pass 14 / fail 0`
