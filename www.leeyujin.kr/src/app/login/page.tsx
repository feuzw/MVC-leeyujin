"use client";

import Header from "@/components/Header";
import SocialLoginButtons from "@/features/auth/components/SocialLoginButtons";
import { handleGoogleLogin, handleKakaoLogin, handleNaverLogin } from "@/features/auth/api/mainService";

export default function LoginPage() {
    return (
        <div className="min-h-screen bg-background">
            <Header />
            <div className="flex items-center justify-center p-4 sm:p-6 lg:p-8 min-h-[calc(100vh-4rem)]">
                <div className="max-w-md w-full space-y-8">
                    {/* Hero Section */}
                    <div className="text-center space-y-4">
                        <h1 className="text-4xl sm:text-5xl font-light tracking-tight text-text-primary">
                            Login
                        </h1>
                        <p className="text-lg font-light text-text-secondary leading-relaxed">
                            소셜 계정으로 간편하게 로그인하세요
                        </p>
                    </div>

                    {/* Login Card */}
                    <div className="bg-surface backdrop-blur-sm rounded-lg border border-border-subtle p-8 sm:p-10 hover:border-border hover:bg-surface-hover transition-all duration-300">
                        <SocialLoginButtons
                            onGoogleLogin={handleGoogleLogin}
                            onKakaoLogin={handleKakaoLogin}
                            onNaverLogin={handleNaverLogin}
                        />
                    </div>

                    {/* Back Link */}
                    <div className="text-center">
                        <a
                            href="/"
                            className="text-sm font-light text-text-secondary hover:text-text-primary transition-colors duration-300 inline-flex items-center gap-2"
                        >
                            <span>←</span>
                            <span>홈으로 돌아가기</span>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}

