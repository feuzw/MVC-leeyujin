/**
 * Constants
 * 
 * 프로젝트 전역에서 사용하는 상수들을 여기에 정의하세요.
 */

/**
 * API 엔드포인트 상수
 */
export const API_ENDPOINTS = {
    AUTH: {
        BASE: "/api/auth",
        GOOGLE: {
            LOGIN: "/api/auth/google/login",
            CALLBACK: "/api/auth/google/callback",
        },
        KAKAO: {
            LOGIN: "/api/auth/kakao/login",
            CALLBACK: "/api/auth/kakao/callback",
        },
        NAVER: {
            LOGIN: "/api/auth/naver/login",
            CALLBACK: "/api/auth/naver/callback",
        },
        REFRESH_TOKEN: "/api/auth/refresh-token",
    },
} as const;

/**
 * 라우트 경로 상수
 */
export const ROUTES = {
    HOME: "/",
    LOGIN: "/login",
    DASHBOARD: "/dashboard",
    AUTH: {
        GOOGLE_CALLBACK: "/auth/google/callback",
        KAKAO_CALLBACK: "/auth/kakao/callback",
        NAVER_CALLBACK: "/auth/naver/callback",
    },
} as const;

