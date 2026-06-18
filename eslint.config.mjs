// ESLint flat config — 1차 하네스(lint)
//
// 설계 원칙
//  - error 만 쓴다: "그럴듯하게 틀린 코드"를 *우회 불가능하게* 막을 가치가 있는 룰만 둔다.
//    warn 은 쓰지 않는다 — 쌓이면 아무도 안 보고, 그 순간 하네스가 약해진다.
//  - 포맷은 ESLint가 관여하지 않는다: Prettier가 전담하고, eslint-config-prettier로
//    포맷 관련 ESLint 룰을 전부 끈다. (따옴표/세미콜론 같은 스타일 취향은 룰로 강제 ✗)
//  - 타입 기반(type-aware) 린팅은 이번엔 켜지 않는다: 프로젝트가 작아 비용(전체 타입체크)
//    대비 효용이 낮고, tsconfig(noUnusedLocals 등) + tsc가 타입 1차 하네스를 이미 담당한다.
//  - 베이스 프리셋을 '복붙'하지 않는다: 아래 recommended는 출발점일 뿐, 핵심 룰은
//    의식적으로 골라 error로 승격/재확인한다.

import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  // 소스만 검사 — 빌드 산출물·의존성 제외
  { ignores: ['dist', 'node_modules'] },

  // 베이스 (출발점) — 아래 rules 블록에서 가감한다
  js.configs.recommended,
  ...tseslint.configs.recommended,

  {
    files: ['**/*.{ts,tsx}'],
    plugins: { 'react-hooks': reactHooks },
    rules: {
      // ── React Hooks — 이 과제의 핵심 1차 하네스 ──────────────────────────
      // 조건부/반복문 안 hook 호출 = 런타임 크래시. 타협 불가 → error.
      'react-hooks/rules-of-hooks': 'error',
      // 의존성 배열 누락 = stale closure("그럴듯하게 틀린 코드"의 전형).
      // 플러그인 기본값은 warn이지만, 1차 하네스 취지상 error로 승격(우회 불가). → 리뷰포인트
      'react-hooks/exhaustive-deps': 'error',

      // ── 타입 침묵 차단 ────────────────────────────────────────────────
      // any는 "기계가 경고하려던 자리". 도입은 명시적 결정이어야 한다 → error로 재확인.
      '@typescript-eslint/no-explicit-any': 'error',
      // 미사용 변수 = 죽은 코드/오타 신호. 단, 의도적 무시는 _ 접두사로 표현 허용.
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },

  // 포맷 관련 ESLint 룰 비활성화 — 반드시 마지막(Prettier가 포맷 전담)
  prettier,
);
