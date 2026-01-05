"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

/**
 * 네이버 OAuth 콜백 페이지
 * 
 * 플로우:
 * [3] 네이버가 백엔드 콜백 호출 /auth/naver/callback?code=xxx (백엔드)
 * [4-5] 백엔드가 토큰/사용자 정보 처리
 * [6] 백엔드가 JWT 쿠키 설정 후 프론트로 리다이렉트 → 이 페이지로 이동
 * [7] 대시보드로 리다이렉트 (JWT 쿠키 자동 포함)
 * 
 * 백엔드가 이 페이지로 리다이렉트했다면, JWT 쿠키는 이미 설정되어 있습니다.
 */
export default function NaverCallback() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const code = searchParams.get("code");
    const error = searchParams.get("error");
    const provider = searchParams.get("provider") || "naver";

    useEffect(() => {
        if (error) {
            // 에러가 있으면 로그인 페이지로 리다이렉트
            alert(`로그인에 실패했습니다: ${error}`);
            router.push("/");
            return;
        }

        // 백엔드가 이미 처리했으므로 대시보드로 이동
        // JWT 쿠키는 이미 설정되어 있음
        router.push("/dashboard");
    }, [code, error, provider, router]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-gray-100 mx-auto"></div>
                <p className="text-lg font-medium">네이버 로그인 처리 중...</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">잠시만 기다려주세요</p>
            </div>
        </div>
    );
}

