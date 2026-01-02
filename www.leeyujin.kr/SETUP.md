# 환경 설정 가이드

## 문제 해결: ERR_CONNECTION_REFUSED 및 CORS 에러

### 1. 환경 변수 파일 생성 (필수)

프로젝트 루트(`www.leeyujin.kr`)에 `.env.local` 파일을 생성하세요:

```bash
# API Gateway URL (서버 사이드용)
API_BASE_URL=http://localhost:8080

# Next.js Configuration
NEXT_PUBLIC_API_URL=http://localhost:8080

# Client-side API Base URL (모든 클라이언트 API 요청의 기준)
# ⚠️ 중요: 반드시 8080으로 설정하세요 (8000이 아님!)
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

**중요 사항:**
- 파일명은 반드시 `.env.local`이어야 합니다 (`.env` 아님)
- `NEXT_PUBLIC_API_BASE_URL`는 `http://localhost:8080`으로 설정
- `8000` 포트가 아닌 `8080` 포트 사용

### 2. Next.js 개발 서버 재시작 (필수)

환경 변수를 추가하거나 수정한 후에는 **반드시** Next.js 개발 서버를 재시작해야 합니다:

```bash
# 1. 현재 실행 중인 서버 중지 (Ctrl+C)
# 2. 서버 재시작
pnpm dev
```

**왜 재시작이 필요한가요?**
- Next.js는 서버 시작 시에만 환경 변수를 로드합니다
- 코드를 수정해도 환경 변수는 자동으로 다시 로드되지 않습니다

### 3. 백엔드 서버 실행 확인

`api.leeyujin.kr` 디렉토리에서 백엔드 서버를 실행하세요:

```bash
cd ../api.leeyujin.kr
./gradlew bootRun
```

서버가 정상 실행되면:
- 콘솔에 "Started ApiApplication" 메시지 확인
- `http://localhost:8080/health` 접속 시 응답 확인

### 4. CORS 설정 확인

백엔드 서버의 `SecurityConfig.java`에 CORS 설정이 추가되었는지 확인하세요.
프론트엔드 도메인(`http://localhost:3000`)이 허용되어야 합니다.

## 체크리스트

문제 해결 전 확인 사항:

- [ ] `.env.local` 파일이 프로젝트 루트에 존재하는가?
- [ ] `.env.local` 파일의 `NEXT_PUBLIC_API_BASE_URL`가 `http://localhost:8080`인가?
- [ ] Next.js 개발 서버를 재시작했는가?
- [ ] 백엔드 서버가 8080 포트에서 실행 중인가?
- [ ] 브라우저 콘솔에서 API URL이 `8080`으로 표시되는가?

## 포트 정리

| 서비스 | 포트 | 용도 |
|--------|------|------|
| 프론트엔드 (Next.js) | 3000 | 웹 애플리케이션 |
| 백엔드 (Spring Boot) | **8080** | API 서버 (OAuth 로그인) |
| FastAPI (별도 서비스) | 8000 | 이미지 처리 서버 |

**중요:** OAuth 로그인은 백엔드(8080)를 사용하므로 반드시 `8080`으로 설정해야 합니다.

## 디버깅 팁

### 환경 변수가 적용되지 않는 경우

1. `.env.local` 파일 위치 확인: `www.leeyujin.kr/.env.local`
2. 파일명 확인: `.env.local` (앞에 점 포함)
3. 서버 재시작 확인
4. 브라우저 콘솔에서 실제 사용 중인 URL 확인:
   ```javascript
   console.log("API Base URL:", process.env.NEXT_PUBLIC_API_BASE_URL);
   ```

### 여전히 8000 포트를 사용하는 경우

1. 브라우저 캐시 삭제 (Ctrl+Shift+Delete)
2. 하드 리프레시 (Ctrl+Shift+R)
3. 개발 서버 완전히 종료 후 재시작

