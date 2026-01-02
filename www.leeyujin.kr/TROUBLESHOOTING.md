# 문제 해결 가이드

## ERR_CONNECTION_REFUSED 에러 해결 방법

### 1. 환경 변수 파일 생성

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```bash
# API Gateway URL (서버 사이드용)
API_BASE_URL=http://localhost:8080

# Next.js Configuration
NEXT_PUBLIC_API_URL=http://localhost:8080

# Client-side API Base URL (모든 클라이언트 API 요청의 기준)
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

**중요:** `.env.local` 파일은 Git에 커밋하지 마세요 (이미 .gitignore에 포함되어 있음)

### 2. 백엔드 서버 실행 확인

백엔드 서버(`api.leeyujin.kr`)가 실행 중인지 확인하세요:

```bash
# api.leeyujin.kr 디렉토리에서
./gradlew bootRun
# 또는
./gradlew build && java -jar build/libs/api-*.jar
```

서버가 정상적으로 실행되면 `http://localhost:8080`에서 응답해야 합니다.

### 3. 포트 확인

- 프론트엔드: `http://localhost:3000`
- 백엔드: `http://localhost:8080`

포트가 다르다면 `.env.local` 파일의 URL을 수정하세요.

### 4. CORS 설정 확인

백엔드 서버의 CORS 설정이 프론트엔드 도메인(`http://localhost:3000`)을 허용하는지 확인하세요.

### 5. 네트워크 확인

브라우저 개발자 도구(F12) → Network 탭에서:
- 요청 URL 확인
- 요청 상태 확인 (Failed, Pending 등)
- 에러 메시지 확인

### 6. 개발 서버 재시작

환경 변수를 변경한 후에는 Next.js 개발 서버를 재시작해야 합니다:

```bash
# Ctrl+C로 서버 중지 후
pnpm dev
```

## 일반적인 문제

### 문제: 환경 변수가 적용되지 않음
**해결:** Next.js 개발 서버를 재시작하세요. 환경 변수는 서버 시작 시에만 로드됩니다.

### 문제: 백엔드 서버가 다른 포트에서 실행 중
**해결:** `.env.local` 파일의 포트 번호를 수정하세요.

### 문제: CORS 에러
**해결:** 백엔드 서버의 `SecurityConfig`에서 프론트엔드 도메인을 허용하도록 설정하세요.

