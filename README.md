# JSON PoC → 연락처 CRUD 콘솔 앱

JSON 파일을 읽고 쓰는 방법과 Quick Sort 알고리즘을 PoC(Proof of Concept)로 직접
실습한 뒤, 그 코드 구조를 그대로 이어받아 연락처(이름/전화/이메일)를 JSON 파일로
관리하는 CRUD 콘솔 프로그램입니다.

## 실행 방법

```bash
npm start
```

번호로 된 메뉴에서 원하는 동작의 번호를 입력하면 됩니다. `0`을 입력하면 언제든 종료됩니다.

## 고수준 동작 흐름

```text
[메뉴 표시]  1.전체 목록  2.ID 검색  3.키워드 검색  4.추가  5.수정  6.삭제  0.종료
        │
        ├─ 1 → 저장된 연락처 전체 출력 (없으면 안내 문구)
        ├─ 2 → ID 입력 받아 해당 연락처 출력
        ├─ 3 → 검색어 입력 받아 이름/전화/이메일에 포함된 연락처 출력
        ├─ 4 → 이름/전화/이메일 입력 받아 새 연락처 추가 후 파일에 저장
        ├─ 5 → ID 입력 받아 현재 값 표시, 바꿀 필드만 입력(Enter 시 유지) 후 파일에 저장
        └─ 6 → ID 입력 받아 대상 내용 표시, y/n 확인 후 삭제 및 파일에 저장
```

## 대표 예시

**연락처 추가**

```text
선택 > 4
이름 > 홍길동
전화번호 > 010-1111-2222
이메일 > hong@test.com
추가되었습니다: [1] 홍길동 | 010-1111-2222 | hong@test.com
```

**안전한 삭제 (확인 절차 포함)**

```text
선택 > 6
삭제할 ID > 1
정말 삭제할까요? ([1] 홍길동 | 010-1111-2222 | hong@test.com) y/n > y
삭제되었습니다.
```

## 프로젝트 구조

```text
json-poc/
├── poc/                 # 1단계: JSON 파싱/저장, Quick Sort PoC
├── app/                 # 2단계: 이 PoC 구조를 재사용한 연락처 CRUD 앱
│   ├── storage.js        # JSON 파일 read/write
│   ├── contactStore.js    # Create/Read/Update/Delete 순수 로직
│   └── cli.js              # 메뉴 출력 + 입력 처리
└── index.js                 # 실제 실행 진입점
```

## 더 자세한 내용

- 작업 규칙(TDD, plan/result 문서 관행): [CLAUDE.md](CLAUDE.md)
- 단계별 변경 상세: [docs/](docs/) 아래 `*_plan.md` / `*_result.md`
