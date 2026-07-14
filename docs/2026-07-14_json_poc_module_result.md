# Step 1. poc/json-poc.js — JSON 파싱/저장 PoC (Result)

Written at (KST): 2026-07-14 11:52

## 1. 한눈에 보는 요약

- `saveJson`/`loadJson` 두 함수로 JSON 파일 저장·읽기가 가능해졌다.
- 저장된 파일은 사람이 읽기 쉽게 들여쓰기되어 있다.
- JSON 형식이 깨진 파일을 읽으면 "어느 파일이 문제인지" 알 수 있는 에러 메시지를 준다.
- 존재하지 않는 파일을 읽으면 Node 표준 `ENOENT` 예외가 그대로 전달되어 원인을 구분할 수 있다.

## 2. 왜 필요했나

이후 만들 연락처 CRUD 앱(`app/storage.js`)이 JSON 파일을 읽고 쓰는 방식의 기반이 되는
코드다. 여기서 "저장/읽기/예외 처리"의 최소 형태를 먼저 검증해 둔다.

## 3. 이전 vs 이후

- 이전: 저장소에 JSON을 다루는 코드가 전혀 없었다.
- 이후: `saveJson(filePath, data)`로 저장하고 `loadJson(filePath)`로 읽으면, 저장했던 값을
  그대로 돌려받는다(round-trip). 파일이 깨져 있거나 없을 때는 원인을 구분할 수 있는
  예외가 발생한다.

## 4. 대표 시나리오

**정상 저장/읽기**

```js
saveJson('contact.json', { name: '홍길동', phone: '010-1234-5678' });
loadJson('contact.json');
// => { name: '홍길동', phone: '010-1234-5678' }
```

**깨진 JSON 파일을 읽으려는 경우**

```text
파일 내용: { invalid
loadJson('broken.json') 호출 시:
  Error: Invalid JSON in /.../broken.json: Unexpected token ...
```

**존재하지 않는 파일을 읽으려는 경우**

```text
loadJson('missing.json') 호출 시:
  Error: ENOENT: no such file or directory, open '/.../missing.json'
```

## 5. 독자 입장에서 달라진 점

- `poc/json-poc.js` (구현), `poc/json-poc.test.js` (테스트)가 새로 생겼다.
- 앞으로 JSON 파일을 다루는 다른 모듈(`app/storage.js`)은 이 두 함수와 같은 형태
  (파일 경로 + 데이터를 주고받는 순수 함수)를 그대로 따라간다.

## 6. 영향 범위

- 새로 추가된 독립 유틸리티라 기존 코드(아직 없음)에 영향이 없다. 다음 단계인
  `app/storage.js`가 이 함수를 그대로 가져다 쓸 예정이다.

## 7. 제약/후속 작업/한계

- 동기(sync) I/O만 지원한다. 대량 동시 요청이 필요한 서버 환경이 아니라
  단일 사용자 콘솔 앱이므로 현재 범위에서는 문제가 되지 않는다.

## 8. Lessons

- 없음 (계획한 설계와 실제 구현/테스트 결과가 일치했다).

## 참고

- 변경 파일: `poc/json-poc.js`, `poc/json-poc.test.js`
- 검증 명령: `npm test` → `tests 4 / pass 4 / fail 0`
