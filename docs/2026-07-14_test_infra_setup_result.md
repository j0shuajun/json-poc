# Step 0. 테스트 실행 인프라 준비 (Result)

Written at (KST): 2026-07-14 11:24

## 1. 한눈에 보는 요약

- `npm test` 한 줄로 테스트를 실행할 수 있는 환경이 갖춰졌다.
- 외부 테스트 프레임워크 설치 없이 Node.js 표준 내장 테스트 러너(`node:test`)만 사용한다.
- ES Module(`import`/`export`) 문법을 별도 설정 없이 바로 쓸 수 있다.
- 아직 실제 코드/테스트가 없어 "0 tests" 상태이며, 다음 단계부터 여기에 테스트가 쌓인다.

## 2. 왜 필요했나

이후 모든 단계(JSON PoC, Quick Sort PoC, storage, contactStore, cli)를 TDD(Red → Green →
Refactor)로 진행하기로 했기 때문에, 실패하는 테스트를 실행할 방법이 먼저 있어야 한다.

## 3. 이전 vs 이후

- 이전: 저장소에 `package.json`이 없어 `npm` 명령 자체를 쓸 수 없었다.
- 이후: `npm test`로 저장소 내 모든 `*.test.js` 파일을 자동 탐색해 실행한다.

## 4. 대표 시나리오

```text
$ npm test

> json-poc@1.0.0 test
> node --test

ℹ tests 0
ℹ suites 0
ℹ pass 0
...
```

테스트 파일이 하나도 없는 지금은 "0 tests"로 끝나고, 다음 단계에서
`poc/json-poc.test.js`를 추가하면 이 명령이 그대로 그 테스트를 찾아 실행한다.

## 5. 독자 입장에서 달라진 점

- `package.json`, `.gitignore`가 새로 생겼다.
- 이제부터 `<대상 파일>.js` 옆에 `<대상 파일>.test.js`를 추가하기만 하면
  별도 설정 변경 없이 `npm test`가 인식한다.

## 6. 영향 범위

- 아직 다른 코드가 없으므로 영향받는 기존 동작은 없다. 이후 모든 개발 단계의 전제 조건이 된다.

## 7. 제약/후속 작업/한계

- 테스트 프레임워크로 Jest 등 대신 `node:test`를 선택했다. 향후 모킹(mocking) 등
  더 풍부한 기능이 필요해지면 재검토가 필요할 수 있으나, 현재 PoC/CRUD 앱 범위에서는
  충분하다고 판단했다.

## 8. Lessons

- 없음 (인프라 설정 단계라 특별한 교훈은 발생하지 않음).

## 참고

- 변경 파일: `package.json`, `.gitignore`
- 검증 명령: `npm test` → `tests 0 / pass 0 / fail 0` 정상 출력 확인
