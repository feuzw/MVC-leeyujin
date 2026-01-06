/**
 * Auth Feature - Type Definitions
 * 
 * 인증 관련 타입 정의
 */

/**
 * Access Token 정보 인터페이스
 * 
 * Access Token은 브라우저 메모리에만 저장되며,
 * 페이지 새로고침 시 자동으로 사라집니다.
 * XSS 공격에 노출될 수 있는 localStorage 등을 사용하지 않습니다.
 */
export interface AccessToken {
  /** JWT Access Token 문자열 */
  token: string;
  /** 토큰 만료 시간 (Unix timestamp, milliseconds) */
  expiresAt: number;
}

/**
 * Token Store 인터페이스
 * 
 * 메모리 기반 토큰 저장소의 인터페이스
 */
export interface TokenStore {
  /** 현재 저장된 Access Token (없으면 null) */
  getToken(): AccessToken | null;
  /** Access Token 저장 */
  setToken(token: string, expiresInSeconds?: number): void;
  /** Access Token 삭제 */
  clearToken(): void;
  /** 토큰이 유효한지 확인 (만료 시간 체크) */
  isValid(): boolean;
}

