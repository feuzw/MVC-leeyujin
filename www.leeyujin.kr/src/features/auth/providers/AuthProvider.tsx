"use client";

/**
 * Auth Store Provider Component
 * 
 * Next.js 16 App Router에서 Context API를 활용한 전역 상태 관리
 * 
 * 역할:
 * - Context API를 통해 스토어 인스턴스를 제공
 * - 하위 컴포넌트들이 useAuthStore를 사용할 수 있도록 함
 * - 타입 안정성 보장
 * - 테스트 시 Mock Provider 사용 가능
 */

import { createContext, useContext, ReactNode } from "react";
import { useAuthStore } from "../store/authStore";
import type { UseBoundStore, StoreApi } from "zustand";
import type { AuthStore } from "../store/authStore";

// ============================================================
// Context 정의
// ============================================================

/**
 * Auth Store Context
 */
const AuthStoreContext = createContext<UseBoundStore<StoreApi<AuthStore>> | null>(null);

// ============================================================
// Provider Component
// ============================================================

interface AuthStoreProviderProps {
    children: ReactNode;
}

/**
 * Auth Store Provider
 * 
 * Context API를 통해 스토어 인스턴스를 제공합니다.
 */
export function AuthStoreProvider({ children }: AuthStoreProviderProps) {
    // Zustand 스토어 인스턴스를 Context에 제공
    return (
        <AuthStoreContext.Provider value={useAuthStore}>
            {children}
        </AuthStoreContext.Provider>
    );
}

// ============================================================
// Hook for using Auth Store
// ============================================================

/**
 * Auth Store를 사용하는 Hook
 * 
 * @returns Auth Store 인스턴스
 * @throws Error - Provider 외부에서 사용 시 에러 발생
 */
export function useAuthStoreContext(): UseBoundStore<StoreApi<AuthStore>> {
    const store = useContext(AuthStoreContext);

    if (!store) {
        throw new Error(
            "useAuthStoreContext must be used within AuthStoreProvider"
        );
    }

    return store;
}

// ============================================================
// Default Export (기존 호환성 유지)
// ============================================================

/**
 * 기본 AuthProvider (기존 코드 호환성 유지)
 * 
 * @deprecated AuthStoreProvider를 사용하세요
 */
export default function AuthProvider({ children }: AuthStoreProviderProps) {
    return <AuthStoreProvider>{children}</AuthStoreProvider>;
}

