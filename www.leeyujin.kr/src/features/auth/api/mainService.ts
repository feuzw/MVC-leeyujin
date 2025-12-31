/**
 * OAuth 2.0 로그인 핸들러 모듈 (클로저)
 * 
 * 하나의 클로저 스코프 안에서 공통 로직을 공유하며,
 * 각 제공자별 핸들러를 이너 함수로 제공합니다.
 */
export const { handleGoogleLogin, handleKakaoLogin, handleNaverLogin } = (() => {
    // 클로저 스코프 - 모든 핸들러가 공유하는 변수
    const API_BASE_URL = "http://localhost:9080/api/auth";

    /**
     * OAuth 로그인 공통 처리 함수 (이너 함수)
     * 
     * [1] 프론트 로그인 버튼 클릭 → GET 요청으로 인가 URL 받기
     * [2] OAuth 제공자 로그인 페이지로 리다이렉트
     * [3-6] 백엔드가 콜백 처리 후 JWT 쿠키 설정하고 프론트로 리다이렉트
     * [7] 대시보드 페이지로 이동 (JWT 쿠키 자동 포함)
     * 
     * @param provider - OAuth 제공자 이름 (google, kakao, naver)
     */
    const processOAuthLogin = async (provider: string) => {
        try {
            // [1] GET 요청으로 인가 URL 받기
            const response = await fetch(`${API_BASE_URL}/${provider}/login`, {
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
            console.error(error);
            alert("서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인해주세요.");
        }
    };

    /**
     * 구글 OAuth 2.0 로그인 핸들러 (이너 함수)
     */
    const handleGoogleLogin = async () => {
        try {
            console.log("[구글 인가 URL 요청]");

            // [1] GET 요청으로 구글 인가 URL 받기
            const response = await fetch(`${API_BASE_URL}/google/login`, {
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
            alert("서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인해주세요.");
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

