/**
 * Auth Feature - Zustand Store (Memory-based)
 * 
 * Access Token을 브라우저 메모리에만 저장하는 Zustand 스토어
 * 
 * 보안 원칙:
 * - localStorage, sessionStorage 등 XSS에 노출될 수 있는 저장소 사용 금지
 * - Zustand는 기본적으로 메모리에 저장되므로 페이지 새로고침 시 자동으로 사라짐
 * - Access Token은 짧은 수명(5~15분)을 가지므로 메모리 저장이 적합
 */

import { create } from "zustand";
import type { AccessToken } from "../types";

/**
 * Auth Store State 인터페이스
 */
interface AuthState {
  /** 현재 저장된 Access Token (없으면 null) */
  accessToken: AccessToken | null;
  
  /**
   * Access Token 저장
   * 
   * @param token - JWT Access Token 문자열
   * @param expiresInSeconds - 토큰 만료 시간 (초 단위, 기본값: 15분)
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
 * Zustand 기반 Auth Store
 * 
 * 이 스토어는 메모리에만 저장되므로:
 * - 페이지 새로고침 시 자동으로 초기화됨
 * - XSS 공격에 노출되지 않음
 * - 모든 컴포넌트에서 접근 가능
 */
export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: null,

  setAccessToken: (token: string, expiresInSeconds: number = 15 * 60) => {
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

