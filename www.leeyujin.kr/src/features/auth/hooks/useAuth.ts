/**
 * Auth Feature - Custom Hooks
 * 
 * 인증 관련 커스텀 훅
 * 
 * Selector 함수를 사용한 타입 안전한 접근
 */

import { useAuthStoreContext } from "../providers";
import {
  selectAccessToken,
  selectAccessTokenString,
  selectIsTokenValid,
  selectValidToken,
  selectIsAuthenticated,
  type AuthStore,
} from "../store/authStore";

// ============================================================
// Selector-based Hooks (타입 안전한 접근)
// ============================================================

/**
 * Access Token을 가져오는 Hook
 * 
 * @returns AccessToken 또는 null
 */
export function useAccessToken(): AuthStore["accessToken"] {
  const store = useAuthStoreContext();
  return store(selectAccessToken);
}

/**
 * Access Token 문자열만 가져오는 Hook
 * 
 * @returns Access Token 문자열 또는 null
 */
export function useAccessTokenString(): string | null {
  const store = useAuthStoreContext();
  return store(selectAccessTokenString);
}

/**
 * 토큰 유효성을 확인하는 Hook
 * 
 * @returns 토큰이 유효하면 true
 */
export function useIsTokenValid(): boolean {
  const store = useAuthStoreContext();
  return store(selectIsTokenValid);
}

/**
 * 유효한 Access Token을 가져오는 Hook
 * 
 * @returns 유효한 AccessToken 또는 null
 */
export function useValidToken(): AuthStore["accessToken"] {
  const store = useAuthStoreContext();
  return store(selectValidToken);
}

/**
 * 인증 상태를 확인하는 Hook
 * 
 * @returns 인증되어 있으면 true
 */
export function useIsAuthenticated(): boolean {
  const store = useAuthStoreContext();
  return store(selectIsAuthenticated);
}

/**
 * Auth Actions를 가져오는 Hook
 * 
 * @returns Auth Actions 객체
 */
export function useAuthActions() {
  const store = useAuthStoreContext();
  return {
    setAccessToken: store.getState().setAccessToken,
    clearAccessToken: store.getState().clearAccessToken,
  };
}

/**
 * 전체 Auth Store를 가져오는 Hook
 * 
 * @returns 전체 Auth Store
 */
export function useAuthStore() {
  return useAuthStoreContext();
}
