# 안전성 테스트에서 발견한 취약점 수정 (Result)

Written at (KST): 2026-07-14 14:35

## 1. 한눈에 보는 요약

- 직전 안전성 테스트 작업에서 발견 사항으로만 남겨 두었던 4곳을 전부 수정했다.
- 이상한 입력을 넣었을 때의 "예외를 던진다"는 동작 자체는 그대로지만, 예외
  메시지가 원인을 바로 알 수 있도록 명확해졌다.
- 정상 사용 흐름(CLI를 통한 사용)에는 영향이 없다 — CLI 입력은 항상 문자열이고,
  정상 저장 파일은 항상 배열이기 때문이다.
- 관련 테스트 4개를 먼저 "고쳐진 이후의 기대 동작"으로 수정해 실패시킨 뒤(Red),
  최소 구현으로 통과시켰다(Green). 전체 54개 테스트가 통과한다.

## 2. 왜 이 변경이 필요했나

이전 작업에서 안전성 테스트를 추가하는 과정에 발견된 4가지 지점은 모두 "무너지긴
하지만 왜 무너졌는지 알기 어려운" 형태였다. 사용자가 이 발견 사항을 전부 고쳐
달라고 요청해, 각 지점에서 원인을 바로 알 수 있는 에러로 바꿨다.

## 3. Before / After

| 위치 | Before | After |
|---|---|---|
| `createContact({ name: 123 })` | `TypeError: name.trim is not a function` | `Error: name is required` |
| `search(contacts, 123)` | `TypeError: keyword.toLowerCase is not a function` | `TypeError: keyword must be a string` |
| `loadContacts(filePath)` (파일 내용이 배열 아님) | 검증 없이 그대로 반환 | `Error: Contacts file must contain an array: <경로>` |
| `saveJson(filePath, 순환참조객체)` | `TypeError: Converting circular structure to JSON` (경로 정보 없음) | `Error: Failed to serialize JSON for <경로>: Converting circular structure to JSON` |

## 4. 대표 시나리오

```text
createContact([], { name: 123 })
→ Error: name is required
  (이름이 없을 때와 같은 메시지로 통합 — 사용자 입장에서는 둘 다 "유효한
   이름을 넣지 않음"이라는 같은 상황)

search(contacts, 123)
→ TypeError: keyword must be a string
  (내부 구현 세부사항(toLowerCase) 대신 무엇이 잘못됐는지 바로 드러남)

loadContacts(filePath)  // 파일 내용: {"a":1}
→ Error: Contacts file must contain an array: /tmp/.../contacts.json
  (연락처 파일이 손상됐다는 사실과 어느 파일인지 즉시 알 수 있음)

saveJson(filePath, circularObject)
→ Error: Failed to serialize JSON for /tmp/.../circular.json:
  Converting circular structure to JSON
  (loadJson과 동일하게 파일 경로를 포함해 감싼 에러)
```

## 5. 독자 입장에서 달라진 점

- 위 4가지 상황에서 이제 에러 메시지만 보고도 "무엇이 잘못됐는지"와(파일 관련
  에러의 경우) "어느 파일인지"를 바로 알 수 있다.
- 정상적인 CLI 사용 흐름, 정상 저장/조회 동작에는 눈에 보이는 변화가 없다.

## 6. 영향 범위

- `app/contactStore.js`(`createContact`, `search`), `app/storage.js`
  (`loadContacts`), `poc/json-poc.js`(`saveJson`) 4개 함수의 예외 발생 조건이
  거의 그대로 유지되면서 메시지만 명확해졌다.
- CLI(`app/cli.js`)를 통한 정상 사용자 입력 흐름은 항상 문자열/정상 배열이므로
  동작 변화가 없다. 영향은 순수 함수를 직접 호출하거나 연락처 파일이 손상된
  경우에 한정된다.

## 7. 제약 / 후속 작업

- 이번 수정은 직전 작업에서 발견된 4곳에 한정했다. `updateContact`,
  `deleteContact` 등 다른 함수에 대한 타입 검증 추가는 이번 요청 범위 밖이다.
- 회귀 기준선이 되는 테스트 스위트는 여전히 `npm test`(54개) 하나로 확인한다.

## 8. Lessons

- 안전성 테스트가 "현재의 버그를 그대로 단언"하는 형태로 작성된 경우, 이후 그
  버그를 고치면 해당 테스트 자체도 "고쳐진 기대 동작"으로 함께 갱신해야 한다.
  이번에는 TDD 순서(테스트를 새 기대치로 먼저 바꿔 Red를 확인한 뒤 구현)를 그대로
  따라 이 갱신이 누락 없이 이루어졌다.
- 여러 지점에서 비슷한 유형의 문제(문자열이 아닌 입력에 대한 불친절한 TypeError,
  파일 경로 정보가 없는 에러)가 반복됐다. 새 에러 메시지를 만들 때는 기존
  코드베이스에 이미 있는 관례(예: `loadJson`의 "파일 경로 포함" 패턴)를 그대로
  재사용하는 것이 가장 단순하고 일관성 있는 선택이었다.

## 참고

- 변경 파일: `app/contactStore.js`, `app/storage.js`, `poc/json-poc.js`
  (구현 수정), `tests/app/contactStore.test.js`, `tests/app/storage.test.js`,
  `tests/poc/json-poc.test.js` (기대 동작 갱신)
- 검증 명령: `npm test` → 수정 전 `tests 54 / pass 49 / fail 5`(Red) →
  수정 후 `tests 54 / pass 54 / fail 0`(Green)
