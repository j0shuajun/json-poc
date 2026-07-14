# CLAUDE.md (프로젝트 전용)

이 문서는 `~/.claude/CLAUDE.md`(전역 규칙) 전체를 그대로 가져오지 않습니다.
아래 두 가지만 차용합니다.

- TDD 개발 방법론 (Red → Green → Refactor)
- 작업 단위별로 plan/result 문서를 작성하는 관행 — 단, 저장 위치는 전역 규칙의
  `docs/tasks/`가 아니라 **`docs/` 바로 아래**로 변경합니다 (예: `docs/2026-07-14_xxx_plan.md`).

그 외 전역 CLAUDE.md의 세부 규칙(CONCEPTS/DETAILS/TROUBLESHOOTING/LESSONS/CHANGELOG 문서 세트,
커밋 바디 형식, 아키텍처 원칙 등)은 이 프로젝트에 강제하지 않습니다.

## 1) 프로젝트 개요

이 프로젝트는 두 단계로 구성된 학습 과제입니다.

**1단계 — PoC(Proof of Concept) 만들기**

- JSON PoC: JSON 데이터를 파싱(parse)하고 파일로 저장(stringify + 파일 쓰기)하는 기본 동작을
  직접 실습하며 라이브러리 사용법을 익힌다.
- Quick Sort PoC: 알고리즘을 모른다고 가정하고, 분할정복(pivot 선택 → partition → 재귀)의
  동작 원리를 직접 구현하며 이해한다.

**2단계 — PoC를 활용한 CRUD 콘솔 앱 개발**

- 1단계 PoC에서 사용한 코드 구조(함수/모듈 구성 방식)를 그대로 유지한 상태로,
  JSON 파일을 데이터 저장소로 쓰는 CRUD 콘솔 앱을 만든다.
- 기능 범위:
  - Create: 새 데이터를 입력받아 JSON 파일에 저장
  - Read: 전체 목록 조회 + 특정 ID/키로 검색
  - Update: 기존 데이터를 선택해 특정 필드만 수정
  - Delete: 특정 데이터를 안전하게 삭제(존재 확인 후 삭제, 삭제 전 확인 절차 등)

## 2) 확정된 결정 사항 (사용자 확인 완료)

과제 설명 자체에는 명시되어 있지 않아 사용자에게 직접 확인한 사항들입니다.

| 항목 | 결정 |
|---|---|
| 구현 언어 | JavaScript (Node.js) |
| JSON 라이브러리 PoC 범위 | 서드파티 라이브러리 비교 없이, Node 표준 내장 `JSON` 객체 + `fs` 모듈만 사용 |
| CRUD 앱 데이터 도메인 | 연락처(이름 / 전화번호 / 이메일) |
| 폴더 구조 | PoC와 CRUD 앱을 이 폴더 하나에 함께 둔다 (`car`처럼 별도 프로젝트로 분리하지 않음) |

## 3) 목표 디렉토리 구조 (제안, 구현 착수 시 plan 문서에서 확정)

```text
json-poc/
├── poc/
│   ├── json-poc.js         # JSON 파싱/저장 PoC (load/save, 예외 처리, indent 옵션 등)
│   └── quicksort-poc.js     # Quick Sort PoC (pivot 선택, partition, 재귀 분할)
├── app/
│   ├── contacts.json        # CRUD 앱 데이터 저장 파일 (런타임 생성)
│   ├── storage.js           # JSON 파일 read/write 담당 (poc/json-poc.js 구조 재사용)
│   ├── contactStore.js       # Create/Read/Update/Delete 로직 (순수 로직, I/O 분리)
│   └── cli.js                 # 메뉴 출력 + 입력 처리 + main() 진입점
├── index.js                    # app/cli.js 진입점만 호출
└── docs/
    └── (yyyy-mm-dd_<summary>_plan.md / _result.md)
```

설계 원칙:

- PoC 단계에서 검증한 "JSON 읽기/쓰기" 코드 구조를 `app/storage.js`가 그대로 재사용한다.
- 데이터(파일 I/O)와 로직(CRUD 판단)과 화면(CLI 입출력)을 분리한다.
- 전역 변수 대신 함수 인자/반환값으로 상태를 주고받아 테스트 격리를 보장한다.

TDD 진행 순서(의존성이 적은 순수 로직부터): `poc(json/quicksort)` → `storage` → `contactStore` → `cli`.

## 4) TDD 커밋 컨벤션

이 프로젝트도 TDD(Red → Green → Refactor)로 진행하며, 각 단계마다 별도 커밋을 만들고
커밋 제목 앞에 아래 태그를 붙인다.

| 단계 | 태그 | 의미 |
|---|---|---|
| Red | `test:` | 실패하는 테스트를 먼저 작성 |
| Green | `feat:` | 테스트를 통과시키는 최소 구현 |
| Refactor | `refactor:` | 동작 변경 없이 구조 개선 |

예시:

- `test: add failing test for partition pivot selection`
- `feat: implement quicksort partition and recursive sort`
- `refactor: extract JSON file read/write helpers`

테스트 파일명 규칙: 대상 파일과 같은 이름에 `.test.js` 접미사를 붙인다
(예: `app/contactStore.js` → `app/contactStore.test.js`). 테스트 러너는 구현 착수 시
plan 문서에서 확정한다(현재 미확정).

## 5) plan/result 문서 규칙

- 코드 변경을 동반하는 작업은 구현 착수 전에 `docs/yyyy-mm-dd_<summary>_plan.md`를 작성하고,
  검증 후 `docs/yyyy-mm-dd_<summary>_result.md`를 작성한다. (전역 규칙과 달리 `docs/tasks/`
  하위가 아니라 `docs/` 바로 아래에 둔다.)
- 코드 변경이 없는 작업(예: 이 문서 자체의 수정, 설계 논의)은 plan/result 문서를 만들지 않는다.
- plan/result 문서 본문은 한국어로 작성하고, 기술 용어는 원어를 유지해도 된다.
