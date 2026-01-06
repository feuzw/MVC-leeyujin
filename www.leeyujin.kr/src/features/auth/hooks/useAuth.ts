/**
 * Auth Feature - useAuth Hook
 * 
 * Zustand 스토어를 기반으로 한 인증 상태 관리 훅
 */

import { useAuthStore } from "../store/authStore";

/**
 * 인증 상태를 관리하는 훅
 * 
 * Zustand 스토어를 사용하여 인증 상태를 관리합니다.
 * 
 * @returns 인증 상태 및 토큰 관리 함수들
 */
export function useAuth() {
  // Zustand 스토어에서 상태와 액션 가져오기
  const accessToken = useAuthStore((state) => state.accessToken);
  const setAccessToken = useAuthStore((state) => state.setAccessToken);
  const clearAccessToken = useAuthStore((state) => state.clearAccessToken);
  const isTokenValid = useAuthStore((state) => state.isTokenValid);
  const getValidToken = useAuthStore((state) => state.getValidToken);

  // 인증 상태 계산 (토큰이 있고 유효한 경우)
  const isAuthenticated = isTokenValid();

  // 유효한 토큰 반환
  const token = getValidToken();

  return {
    token,
    isAuthenticated,
    setAccessToken,
    clearAccessToken,
  };
}

