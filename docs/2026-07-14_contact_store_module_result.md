# Step 4. app/contactStore.js — 연락처 CRUD 순수 로직 (Result)

Written at (KST): 2026-07-14 12:45

## 1. 한눈에 보는 요약

- 연락처 생성/조회/검색/수정/삭제 로직이 파일 I/O 없는 순수 함수로 완성됐다.
- id는 자동으로 매겨지며, 존재하지 않는 id를 수정/삭제하려 하면 에러가 발생해
  조용히 무시되지 않는다("안전한 삭제").
- 모든 함수가 원본 배열을 바꾸지 않고 새 배열/값을 돌려준다.

## 2. 왜 필요했나

"어떻게 저장하는지"(`storage.js`)와 "무엇을 어떻게 바꾸는지"(CRUD 판단)를 분리해,
화면(`cli.js`) 없이도 이 로직만 독립적으로 검증할 수 있게 하기 위함이다.

## 3. 이전 vs 이후

- 이전: 연락처 하나를 추가/검색/수정/삭제하는 로직이 전혀 없었다.
- 이후: 5개 함수(`createContact`, `findById`, `search`, `updateContact`, `deleteContact`)로
  요구사항의 Create/Read/Update/Delete를 모두 표현할 수 있다.

## 4. 대표 시나리오

```js
// Create
createContact([], { name: '홍길동', phone: '010-1234-5678', email: 'hong@example.com' });
// => { contacts: [{ id: 1, name: '홍길동', ... }], contact: { id: 1, name: '홍길동', ... } }

// Read (검색)
search(contacts, '홍'); // 이름에 '홍'이 포함된 연락처만

// Update
updateContact(contacts, 1, { phone: '010-9999-0000' });
// => id 1의 phone만 바뀐 새 배열

// Delete (안전한 삭제)
deleteContact(contacts, 999); // 존재하지 않는 id
// => Error: Contact not found: id=999 (아무것도 지워지지 않음)
```

## 5. 독자 입장에서 달라진 점

- `app/contactStore.js` (구현), `app/contactStore.test.js` (테스트)가 새로 생겼다.
- id는 기존 최댓값 + 1로 자동 채번되고, `search`는 이름/전화/이메일 어디든
  대소문자 구분 없이 부분 일치하면 찾아낸다.

## 6. 영향 범위

- 새로 추가된 모듈이라 기존 코드에 영향이 없다. 다음 단계인 `app/cli.js`가
  `storage.js` + `contactStore.js`를 조합해 실제 메뉴 흐름을 완성할 예정이다.

## 7. 제약/후속 작업/한계

- `name`만 필수 항목으로 검증하고, `phone`/`email`은 선택 항목으로 취급한다
  (형식 검증은 하지 않음 — 전화번호/이메일 형식 검사는 이번 과제 범위 밖으로 판단).

## 8. Lessons

- 없음 (계획한 설계와 실제 구현/테스트 결과가 일치했다).

## 참고

- 변경 파일: `app/contactStore.js`, `app/contactStore.test.js`
- 검증 명령: `npm test` → `tests 26 / pass 26 / fail 0`
