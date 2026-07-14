# 안전성 테스트에서 발견한 취약점 수정 (Plan)

Written at (KST): 2026-07-14 14:20

## 1. 작업 목적

직전 작업(`docs/2026-07-14_safety_and_regression_tests_result.md`)에서 "이상한
타입/값"을 넣는 안전성 테스트를 추가하면서, 코드를 고치지 않고 3가지 취약점을
발견 사항(Findings)으로만 남겨 두었다. 사용자가 이 발견 사항을 전부 고쳐 달라고
요청했으므로, 이번 작업은 그 3가지를 실제로 수정하는 것이다.

## 2. 현재 상태 (문제점)

| 위치 | 문제 |
|---|---|
| `contactStore.createContact` | `name`이 문자열이 아니면(예: 숫자) `TypeError: name.trim is not a function`이라는, 원인을 바로 알기 어려운 예외가 발생한다. |
| `contactStore.search` | `keyword`가 문자열이 아니면(예: 숫자) `TypeError: keyword.toLowerCase is not a function`이 발생한다. |
| `storage.loadContacts` | 연락처 파일 내용이 배열이 아니어도(객체/숫자 등) 검증 없이 그대로 반환하고, 문제는 한참 뒤 `contactStore`가 배열 메서드를 호출하는 시점에야 드러난다. |
| `poc/json-poc.saveJson` | 순환 참조 객체를 저장하려 하면 `TypeError: Converting circular structure to JSON`을 감싸지 않은 원본 그대로 던진다. 같은 파일의 `loadJson`은 이미 파일 경로를 포함해 에러를 감싸고 있는 것과 비대칭이다. |

## 3. 목표 상태

- 위 4곳 모두, 문제가 발생했을 때 **원인을 바로 알 수 있는 에러 메시지**를
  던지도록 만든다. 동작 자체(예외를 던진다는 사실)는 바뀌지 않고, 에러의
  종류/메시지만 명확해진다.
- 기존에 "현재 동작은 이렇다"를 그대로 단언하던 안전성 테스트들은, 고쳐진 이후의
  기대 동작을 단언하도록 함께 갱신한다.

## 4. 대표 시나리오 (수정 전 → 후)

```text
createContact([], { name: 123 })
  전: TypeError: name.trim is not a function
  후: Error: name is required               (기존 "이름 없음" 에러와 동일하게 처리)

search(contacts, 123)
  전: TypeError: keyword.toLowerCase is not a function
  후: TypeError: keyword must be a string

loadContacts(filePath)  // 파일 내용이 {"a":1}
  전: { a: 1 } 을 검증 없이 그대로 반환
  후: Error: Contacts file must contain an array: <파일 경로>

saveJson(filePath, circularObject)
  전: TypeError: Converting circular structure to JSON
  후: Error: Failed to serialize JSON for <파일 경로>: Converting circular structure to JSON
```

## 5. 제안하는 변경 방식

- `createContact`: 기존의 `!name || !name.trim()` 가드를
  `typeof name !== 'string' || !name.trim()`으로 확장한다. 별도의 새 에러 메시지를
  만들지 않고 기존 "name is required" 메시지를 재사용한다(이름이 없다는 것과
  이름이 문자열이 아니라는 것은 사용자 입장에서 같은 "유효한 이름을 넣지 않음"
  범주로 취급).
- `search`: 함수 맨 앞에 `typeof keyword !== 'string'` 가드를 추가해
  `TypeError('keyword must be a string')`를 던진다.
- `loadContacts`: `loadJson`으로 읽은 값이 배열인지 `Array.isArray`로 확인하고,
  아니면 파일 경로를 포함한 에러를 던진다. 기존 `loadJson`의 "파일 경로를
  포함한 에러" 관례를 그대로 따른다.
- `saveJson`: `JSON.stringify` 호출을 try/catch로 감싸고, 실패 시 파일 경로와
  원본 에러 메시지를 포함한 에러로 다시 던진다. `loadJson`이 이미 이런 방식으로
  파일 경로를 포함해 에러를 감싸고 있으므로 동일한 패턴을 따른다.
- TDD로 진행한다: 기존 안전성 테스트 중 "현재의 불친절한 동작"을 단언하던
  4개 테스트를 먼저 "고쳐진 이후의 기대 동작"으로 수정(Red) → 최소 구현으로
  통과시킨다(Green). 순수 리팩터는 없다.

## 6. 예상 설명 구조 (result 문서)

- Before/After 표(4개 항목)
- 테스트 갱신 내역: 어떤 테스트가 "버그를 문서화하던 것"에서 "고쳐진 동작을
  검증하는 것"으로 바뀌었는지
- 영향 범위: CLI를 통한 정상 사용 흐름에는 영향 없음(입력은 항상 문자열이므로).
  영향은 순수 함수를 직접 호출하거나 파일이 손상된 경우에 한정됨.

## 7. 모호한 점 / 가정 / 트레이드오프

- `search`에 새 에러 메시지("keyword must be a string")를 도입하는 것은 기존에
  없던 문구를 새로 만드는 것이다. `createContact`처럼 재사용할 기존 도메인
  메시지가 없으므로 최소한의 새 메시지를 추가하는 것이 가장 단순한 해법이라고
  판단했다.
- `name`이 문자열이 아닌 경우를 "name is required"로 통합하는 것은, 별도로
  "name must be a string" 같은 문구를 새로 만들기보다 기존 에러를 재사용하는
  편이 더 단순하다고 판단한 선택이다(사용자에게는 결국 "유효한 이름을 입력하라"는
  같은 의미).
- 이번 수정은 발견된 4곳에 한정한다. 그 밖의 함수(`updateContact`, `deleteContact`
  등)에 대한 타입 검증 추가는 이번에 요청받은 범위가 아니므로 하지 않는다.

## 8. 검증 방법

- 테스트 갱신 직후 `npm test` 실행 → 갱신된 4개 테스트가 실패하는 것을 확인(Red).
- 구현 수정 후 `npm test` 재실행 → 전체 테스트 통과 확인(Green).
