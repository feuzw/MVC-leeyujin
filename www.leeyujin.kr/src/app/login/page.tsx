"use client";

import SocialLoginButtons from "@/features/auth/components/SocialLoginButtons";
import { handleGoogleLogin, handleKakaoLogin, handleNaverLogin } from "@/features/auth/api/mainService";

export default function LoginPage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
            <div className="max-w-md mx-auto py-16 px-4">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                        로그인
                    </h1>
                    <p className="text-gray-600">
                        소셜 계정으로 간편하게 로그인하세요
                    </p>
                </div>
                <SocialLoginButtons
                    onGoogleLogin={handleGoogleLogin}
                    onKakaoLogin={handleKakaoLogin}
                    onNaverLogin={handleNaverLogin}
                />
                <div className="mt-8 text-center">
                    <a
                        href="/"
                        className="text-sm text-gray-600 hover:text-gray-900 transition"
                    >
                        ← 홈으로 돌아가기
                    </a>
                </div>
            </div>
        </div>
    );
}

