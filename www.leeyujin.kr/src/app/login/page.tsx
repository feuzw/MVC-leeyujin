"use client";

import SocialLoginButtons from "@/features/auth/components/SocialLoginButtons";
import { handleGoogleLogin, handleKakaoLogin, handleNaverLogin } from "@/features/auth/api/mainService";

export default function LoginPage() {
    return (
        <div className="min-h-screen bg-white flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                <div className="text-center mb-8">
                    <h1 className="text-5xl font-bold text-gray-900 mb-4">
                        LOGIN
                    </h1>
                    <p className="text-xl text-gray-600">
                        소셜 계정으로 간편하게 로그인하세요
                    </p>
                </div>
                <div className="bg-white rounded-lg border border-gray-300 p-8 shadow-sm">
                    <SocialLoginButtons
                        onGoogleLogin={handleGoogleLogin}
                        onKakaoLogin={handleKakaoLogin}
                        onNaverLogin={handleNaverLogin}
                    />
                </div>
                <div className="mt-8 text-center">
                    <a
                        href="/"
                        className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        ← 홈으로 돌아가기
                    </a>
                </div>
            </div>
        </div>
    );
}

