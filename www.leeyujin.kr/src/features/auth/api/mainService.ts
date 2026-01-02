import { API_ENDPOINTS } from "@/lib/constants";

/**
 * OAuth 2.0 로그인 핸들러 모듈 (클로저)
 * 
 * 하나의 클로저 스코프 안에서 공통 로직을 공유하며,
 * 각 제공자별 핸들러를 이너 함수로 제공합니다.
 */
export const { handleGoogleLogin, handleKakaoLogin, handleNaverLogin } = (() => {
    // 클로저 스코프 - 모든 핸들러가 공유하는 변수
    // 환경 변수에서 API Base URL 가져오기 (기본값: http://localhost:8080)
    const API_BASE_URL =
        process.env.NEXT_PUBLIC_API_BASE_URL ||
        process.env.NEXT_PUBLIC_API_URL ||
        "http://localhost:8080";

    /**
     * OAuth 로그인 공통 처리 함수 (이너 함수)
     * 
     * [1] 프론트 로그인 버튼 클릭 → GET 요청으로 인가 URL 받기
     * [2] OAuth 제공자 로그인 페이지로 리다이렉트
     * [3-6] 백엔드가 콜백 처리 후 JWT 쿠키 설정하고 프론트로 리다이렉트
     * [7] 대시보드 페이지로 이동 (JWT 쿠키 자동 포함)
     * 
     * @param provider - OAuth 제공자 이름 ("kakao" | "naver")
     */
    const processOAuthLogin = async (provider: "kakao" | "naver") => {
        try {
            // [1] GET 요청으로 인가 URL 받기
            const endpointMap = {
                kakao: API_ENDPOINTS.AUTH.KAKAO.LOGIN,
                naver: API_ENDPOINTS.AUTH.NAVER.LOGIN,
            };
            const endpoint = `${API_BASE_URL}${endpointMap[provider]}`;
            const response = await fetch(endpoint, {
                method: "GET",
                credentials: "include", // 쿠키 자동 전송
            });

            if (response.ok) {
                const data = await response.json();

                if (data.authUrl) {
                    // [2] OAuth 제공자 로그인 페이지로 리다이렉트
                    window.location.href = data.authUrl;
                } else {
                    alert("로그인 URL을 받아오지 못했습니다.");
                }
            } else {
                const errorData = await response.json().catch(() => ({}));
                alert(errorData.message || `로그인에 실패했습니다. (상태: ${response.status})`);
            }
        } catch (error) {
            console.error("[오류] OAuth 로그인 중 예외 발생:", error);
            console.error("  - Provider:", provider);
            console.error("  - API Base URL:", API_BASE_URL);

            const errorMessage = error instanceof Error ? error.message : String(error);

            if (errorMessage.includes("Failed to fetch") || errorMessage.includes("ERR_CONNECTION_REFUSED")) {
                alert(
                    `백엔드 서버에 연결할 수 없습니다.\n\n` +
                    `확인 사항:\n` +
                    `1. 백엔드 서버가 실행 중인지 확인 (포트: ${API_BASE_URL.replace(/^https?:\/\//, '').split(':')[1] || '8080'})\n` +
                    `2. 환경 변수 설정 확인 (.env.local 파일)\n` +
                    `3. 서버 URL: ${API_BASE_URL}\n\n` +
                    `개발자 도구 콘솔에서 자세한 정보를 확인하세요.`
                );
            } else {
                alert(`서버에 연결할 수 없습니다: ${errorMessage}`);
            }
        }
    };

    /**
     * 구글 OAuth 2.0 로그인 핸들러 (이너 함수)
     */
    const handleGoogleLogin = async () => {
        try {
            // [1] GET 요청으로 구글 인가 URL 받기
            const endpoint = `${API_BASE_URL}${API_ENDPOINTS.AUTH.GOOGLE.LOGIN}`;

            console.log("[구글 인가 URL 요청]");
            console.log("  - API Base URL:", API_BASE_URL);
            console.log("  - Endpoint:", endpoint);
            console.log("  - Full URL:", endpoint);

            const response = await fetch(endpoint, {
                method: "GET",
                credentials: "include", // 쿠키 자동 전송
            });

            if (response.ok) {
                const data = await response.json();

                // 백엔드 응답: { success: true, authUrl: "..." }
                if (data.authUrl) {
                    console.log("[성공] 구글 인가 URL 받음:", data.authUrl);
                    // [2] 구글 로그인 페이지로 리다이렉트
                    window.location.href = data.authUrl;
                } else {
                    console.error("[실패] 구글 로그인 URL을 받지 못함");
                    alert("로그인 URL을 받아오지 못했습니다.");
                }
            } else {
                const errorData = await response.json().catch(() => ({}));
                console.error("[실패] 구글 로그인 실패:", errorData);
                alert(errorData.message || `로그인에 실패했습니다. (상태: ${response.status})`);
            }
        } catch (error) {
            console.error("[오류] 구글 로그인 중 예외 발생:", error);
            console.error("  - API Base URL:", API_BASE_URL);
            console.error("  - Endpoint:", `${API_BASE_URL}${API_ENDPOINTS.AUTH.GOOGLE.LOGIN}`);

            const errorMessage = error instanceof Error ? error.message : String(error);

            if (errorMessage.includes("Failed to fetch") || errorMessage.includes("ERR_CONNECTION_REFUSED")) {
                alert(
                    `백엔드 서버에 연결할 수 없습니다.\n\n` +
                    `확인 사항:\n` +
                    `1. 백엔드 서버가 실행 중인지 확인 (포트: ${API_BASE_URL.replace(/^https?:\/\//, '').split(':')[1] || '8080'})\n` +
                    `2. 환경 변수 설정 확인 (.env.local 파일)\n` +
                    `3. 서버 URL: ${API_BASE_URL}\n\n` +
                    `개발자 도구 콘솔에서 자세한 정보를 확인하세요.`
                );
            } else {
                alert(`서버에 연결할 수 없습니다: ${errorMessage}`);
            }
        }
    };

    /**
     * 카카오 OAuth 2.0 로그인 핸들러 (이너 함수)
     */
    const handleKakaoLogin = async () => {
        await processOAuthLogin("kakao");
    };

    /**
     * 네이버 OAuth 2.0 로그인 핸들러 (이너 함수)
     */
    const handleNaverLogin = async () => {
        await processOAuthLogin("naver");
    };

    // 세 개의 이너 함수를 반환
    return {
        handleGoogleLogin,
        handleKakaoLogin,
        handleNaverLogin,
    };
})(); // 즉시 실행 함수 (람다)

