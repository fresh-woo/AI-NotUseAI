# AI Design - 관심 주제 선택 및 목표 관리 웹사이트

AI에 의존하지 않고 사용자가 직접 검색할 수 있도록 관심 주제를 선택하고, 목표를 설정하여 학습을 점검하며 포인트를 획득하는 웹사이트입니다.

## 기술 스택

- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Router DOM

## 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build

# 빌드 미리보기
npm run preview
```

## 주요 기능

### 1. 주제 선택 및 검색
- 관심 주제 선택 (기본 11개 + 사용자 추가)
- 선택한 주제에 대한 검색 링크 제공
- 주제 제안 및 직접 검색 기능
- 검색 시 포인트 자동 지급 (검색당 10포인트)

### 2. 목표 관리 시스템
- 목표 설정 및 관리
- 목표별 점검 기능
- 점검 시 학습 내용 기록 및 평가 (1-5점)
- 평가에 따른 포인트 지급 (기본 50점 + 보너스)

### 3. 포인트 시스템
- 검색 포인트: 검색당 10포인트
- 점검 포인트: 기본 50포인트 + 평가 보너스
- 포인트 통계 및 거래 내역 관리
- 로컬 스토리지에 자동 저장

### 4. 상점
- 포인트로 아이템 구매
- 배지, 테마, 쿠폰 등 다양한 아이템
- 구매 내역 관리

### 5. 반응형 디자인
- 모바일, 태블릿, 데스크톱 지원
- 반응형 그리드 레이아웃 (3개 → 2개 → 1개)

## 프로젝트 구조

```
src/
  ├── components/      # React 컴포넌트
  │   ├── TopicCard.tsx
  │   ├── TopicSelection.tsx
  │   ├── Sidebar.tsx
  │   └── Navigation.tsx
  ├── pages/          # 페이지 컴포넌트
  │   ├── GoalsPage.tsx
  │   ├── GoalCheckPage.tsx
  │   └── ShopPage.tsx
  ├── hooks/          # Custom Hooks
  │   ├── usePoints.ts
  │   └── useGoals.ts
  ├── data/           # 데이터 파일
  │   └── topics.ts
  ├── types/          # TypeScript 타입 정의
  │   ├── topic.ts
  │   ├── goal.ts
  │   └── point.ts
  ├── App.tsx         # 메인 앱 컴포넌트 (라우터 설정)
  ├── main.tsx        # 진입점
  └── index.css       # 전역 스타일
```

## 라우팅

- `/` - 메인 페이지 (주제 선택)
- `/goals` - 목표 관리 페이지
- `/goals/:id/check` - 목표 점검 페이지
- `/shop` - 상점 페이지

## Custom Hooks

### usePoints
포인트 시스템 관리
- `stats`: 포인트 통계
- `earnPoints`: 포인트 획득
- `spendPoints`: 포인트 사용
- `addSearchPoint`: 검색 포인트 지급
- `addCheckPoint`: 점검 포인트 지급

### useGoals
목표 관리
- `goals`: 목표 목록
- `addGoal`: 목표 추가
- `updateGoal`: 목표 업데이트
- `deleteGoal`: 목표 삭제
- `addCheck`: 점검 추가
- `getChecksByGoal`: 목표별 점검 목록

