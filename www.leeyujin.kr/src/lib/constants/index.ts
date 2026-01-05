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
        BASE: "/auth",
        GOOGLE: {
            LOGIN: "/api/auth/google/login",
            CALLBACK: "/auth/google/callback",
        },
        KAKAO: {
            LOGIN: "/auth/kakao/login",
            CALLBACK: "/auth/kakao/callback",
        },
        NAVER: {
            LOGIN: "/auth/naver/login",
            CALLBACK: "/auth/naver/callback",
        },
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

