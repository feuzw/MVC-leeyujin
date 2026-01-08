/**
 * Auth Feature - Zustand Store (Ducks Pattern)
 * 
 * Ducks 패턴: Types, Store Creator, Actions, Selectors를 하나의 파일에 모듈화
 * 
 * 보안 원칙:
 * - Access Token만 메모리에 저장 (Zustand)
 * - Refresh Token은 HttpOnly 쿠키에 저장 (백엔드에서 관리)
 * - localStorage, sessionStorage 등 XSS에 노출될 수 있는 저장소 사용 금지
 * - 페이지 새로고침 시 Access Token은 자동으로 사라짐
 */

import { create, type StoreApi, type UseBoundStore } from "zustand";
import type { AccessToken } from "../types";

// ============================================================
// Types (타입 정의)
// ============================================================

/**
 * Auth State 타입
 */
export interface AuthState {
  /** 현재 저장된 Access Token (없으면 null) */
  accessToken: AccessToken | null;
}

/**
 * Auth Actions 타입
 */
export interface AuthActions {
  /**
   * Access Token 저장
   * 
   * @param token - JWT Access Token 문자열
   * @param expiresInSeconds - 토큰 만료 시간 (초 단위, 기본값: 10분)
   */
  setAccessToken: (token: string, expiresInSeconds?: number) => void;

  /**
   * Access Token 삭제
   */
  clearAccessToken: () => void;

  /**
   * 토큰이 유효한지 확인 (만료 시간 체크)
   * 
   * @returns 토큰이 존재하고 만료되지 않았으면 true
   */
  isTokenValid: () => boolean;

  /**
   * 현재 유효한 Access Token 반환
   * 
   * @returns AccessToken 또는 null
   */
  getValidToken: () => AccessToken | null;
}

/**
 * Auth Store 전체 타입
 */
export type AuthStore = AuthState & AuthActions;

// ============================================================
// Initial State (초기 상태)
// ============================================================

const initialState: AuthState = {
  accessToken: null,
};

// ============================================================
// Store Creator (스토어 생성 함수)
// ============================================================

/**
 * Auth Store 생성 함수
 * 
 * @returns Zustand 스토어 인스턴스
 */
export const createAuthStore = (): AuthStore => {
  return {
    // State
    ...initialState,

    // Actions
    setAccessToken: (token: string, expiresInSeconds: number = 10 * 60) => {
      const expiresAt = Date.now() + expiresInSeconds * 1000;
      // Note: 실제 구현은 Zustand의 set 함수를 사용하므로
      // 이 함수는 타입 정의용입니다.
      return { accessToken: { token, expiresAt } };
    },

    clearAccessToken: () => {
      // Note: 실제 구현은 Zustand의 set 함수를 사용
      return { accessToken: null };
    },

    isTokenValid: () => {
      // Note: 실제 구현은 Zustand의 get 함수를 사용
      return false;
    },

    getValidToken: () => {
      // Note: 실제 구현은 Zustand의 get 함수를 사용
      return null;
    },
  };
};

// ============================================================
// Store Implementation (스토어 구현)
// ============================================================

/**
 * Zustand Auth Store 인스턴스
 */
export const useAuthStore = create<AuthStore>((set, get) => ({
  // State
  ...initialState,

  // Actions
  setAccessToken: (token: string, expiresInSeconds: number = 10 * 60) => {
    const expiresAt = Date.now() + expiresInSeconds * 1000;

    set({
      accessToken: {
        token,
        expiresAt,
      },
    });
  },

  clearAccessToken: () => {
    set({ accessToken: null });
  },

  isTokenValid: () => {
    const { accessToken } = get();

    if (!accessToken) {
      return false;
    }

    // 현재 시간이 만료 시간보다 이전이면 유효
    const isValid = Date.now() < accessToken.expiresAt;

    // 만료된 토큰은 자동으로 삭제
    if (!isValid) {
      set({ accessToken: null });
    }

    return isValid;
  },

  getValidToken: () => {
    const { accessToken, isTokenValid } = get();

    if (accessToken && isTokenValid()) {
      return accessToken;
    }

    return null;
  },
}));

// ============================================================
// Selectors (셀렉터 함수)
// ============================================================

/**
 * Access Token 셀렉터
 * 
 * @param state - Auth Store 상태
 * @returns AccessToken 또는 null
 */
export const selectAccessToken = (state: AuthStore): AccessToken | null => {
  return state.accessToken;
};

/**
 * Access Token 문자열만 반환하는 셀렉터
 * 
 * @param state - Auth Store 상태
 * @returns Access Token 문자열 또는 null
 */
export const selectAccessTokenString = (state: AuthStore): string | null => {
  return state.accessToken?.token ?? null;
};

/**
 * 토큰 유효성 셀렉터
 * 
 * @param state - Auth Store 상태
 * @returns 토큰이 유효하면 true
 */
export const selectIsTokenValid = (state: AuthStore): boolean => {
  return state.isTokenValid();
};

/**
 * 유효한 Access Token 셀렉터
 * 
 * @param state - Auth Store 상태
 * @returns 유효한 AccessToken 또는 null
 */
export const selectValidToken = (state: AuthStore): AccessToken | null => {
  return state.getValidToken();
};

/**
 * 인증 상태 셀렉터 (토큰이 있는지 여부)
 * 
 * @param state - Auth Store 상태
 * @returns 토큰이 있으면 true
 */
export const selectIsAuthenticated = (state: AuthStore): boolean => {
  return state.accessToken !== null && state.isTokenValid();
};

