"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/features/auth/store/authStore";
import { saveRefreshTokenToCookie } from "@/features/auth/api/mainService";

/**
 * 네이버 OAuth 콜백 페이지
 * 
 * 플로우:
 * [3] 네이버가 백엔드 콜백 호출 /auth/naver/callback?code=xxx (백엔드)
 * [4-5] 백엔드가 토큰/사용자 정보 처리
 * [6] 백엔드가 Access Token과 Refresh Token을 URL 파라미터나 응답으로 전달 → 이 페이지로 리다이렉트
 * [7] Access Token을 메모리에 저장, Refresh Token을 httpOnly 쿠키에 저장하고 대시보드로 리다이렉트
 */
function NaverCallbackContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const code = searchParams.get("code");
    const error = searchParams.get("error");
    const accessToken = searchParams.get("access_token");
    const refreshToken = searchParams.get("refresh_token");
    const expiresIn = searchParams.get("expires_in");
    const provider = searchParams.get("provider") || "naver";

    useEffect(() => {
        const { setAccessToken, clearAccessToken } = useAuthStore.getState();

        const handleLoginSuccess = async () => {
            if (error) {
                // 에러가 있으면 로그인 페이지로 리다이렉트
                alert(`로그인에 실패했습니다: ${error}`);
                clearAccessToken();
                router.push("/");
                return;
            }

            // URL 파라미터에서 access_token이 있으면 Zustand 스토어에 저장
            if (accessToken) {
                const expiresInSeconds = expiresIn
                    ? parseInt(expiresIn, 10)
                    : 15 * 60; // 기본값: 15분

                setAccessToken(accessToken, expiresInSeconds);
            }

            // URL 파라미터에서 refresh_token이 있으면 httpOnly 쿠키에 저장
            if (refreshToken) {
                const success = await saveRefreshTokenToCookie(refreshToken);
                if (!success) {
                    console.warn("[경고] Refresh Token 저장에 실패했습니다. 로그인은 계속 진행됩니다.");
                }
            }

            // 대시보드로 이동
            router.push("/dashboard");
        };

        handleLoginSuccess();
    }, [code, error, accessToken, refreshToken, expiresIn, provider, router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-dark">
            <div className="text-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto"></div>
                <p className="text-lg font-medium text-gray-200">네이버 로그인 처리 중...</p>
                <p className="text-sm text-gray-400">잠시만 기다려주세요</p>
            </div>
        </div>
    );
}

export default function NaverCallback() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gradient-dark">
                <div className="text-center space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto"></div>
                    <p className="text-lg font-medium text-gray-200">로딩 중...</p>
                </div>
            </div>
        }>
            <NaverCallbackContent />
        </Suspense>
    );
}

