"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";

interface UserInfo {
    userId: number;
    provider: string;
    email: string;
    nickname: string;
}

/**
 * 대시보드 페이지
 * 로그인 성공 후 사용자가 접근하는 메인 페이지
 */
export default function DashboardPage() {
    const router = useRouter();
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // TODO: 사용자 정보 조회 API 호출
        // 현재는 JWT 쿠키가 설정되어 있다고 가정
        // 실제로는 백엔드 API를 호출하여 사용자 정보를 가져와야 함
        
        // 임시로 로딩 상태만 표시
        setTimeout(() => {
            setLoading(false);
        }, 500);
    }, []);

    const handleLogout = async () => {
        try {
            // TODO: 로그아웃 API 호출 (쿠키 삭제)
            // 현재는 클라이언트에서만 처리
            router.push("/login");
        } catch (error) {
            console.error("로그아웃 실패:", error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-2 border-border-subtle border-t-accent-primary mx-auto"></div>
                    <p className="text-lg font-light text-text-secondary">로딩 중...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <Header
                title="Dashboard"
                rightContent={
                    <button
                        onClick={handleLogout}
                        className="px-6 py-2.5 text-sm font-light text-text-secondary border border-border-subtle rounded-lg hover:border-border hover:text-text-primary hover:bg-surface-hover transition-all duration-300 bg-surface backdrop-blur-sm"
                    >
                        로그아웃
                    </button>
                }
            />

            {/* 메인 컨텐츠 */}
            <main className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-12 sm:py-16 lg:py-20">
                {/* 환영 메시지 */}
                <div className="bg-surface backdrop-blur-sm rounded-lg border border-border-subtle p-8 mb-8 hover:border-border hover:bg-surface-hover transition-all duration-300">
                    <h2 className="text-2xl font-light text-text-primary mb-3">
                        환영합니다
                    </h2>
                    <p className="text-base font-light text-text-secondary leading-relaxed">
                        로그인에 성공했습니다. 대시보드에 오신 것을 환영합니다.
                    </p>
                </div>

                {/* 통계 카드 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="bg-surface backdrop-blur-sm rounded-lg border border-border-subtle p-6 hover:border-border hover:bg-surface-hover transition-all duration-300">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-light text-text-secondary uppercase tracking-wider mb-2">총 사용자</p>
                                <p className="text-3xl font-light text-text-primary">-</p>
                            </div>
                            <div className="p-2.5 bg-background-soft rounded-lg border border-border-subtle">
                                <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-surface backdrop-blur-sm rounded-lg border border-border-subtle p-6 hover:border-border hover:bg-surface-hover transition-all duration-300">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-light text-text-secondary uppercase tracking-wider mb-2">활성 세션</p>
                                <p className="text-3xl font-light text-text-primary">-</p>
                            </div>
                            <div className="p-2.5 bg-background-soft rounded-lg border border-border-subtle">
                                <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-surface backdrop-blur-sm rounded-lg border border-border-subtle p-6 hover:border-border hover:bg-surface-hover transition-all duration-300">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-light text-text-secondary uppercase tracking-wider mb-2">오늘 방문</p>
                                <p className="text-3xl font-light text-text-primary">-</p>
                            </div>
                            <div className="p-2.5 bg-background-soft rounded-lg border border-border-subtle">
                                <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 최근 활동 */}
                <div className="bg-surface backdrop-blur-sm rounded-lg border border-border-subtle p-8 hover:border-border hover:bg-surface-hover transition-all duration-300">
                    <h3 className="text-lg font-light text-text-primary mb-6">최근 활동</h3>
                    <div className="space-y-3">
                        <div className="flex items-center space-x-4 p-4 bg-background-soft rounded-lg border border-border-subtle hover:border-border hover:bg-surface transition-all duration-300">
                            <div className="flex-shrink-0">
                                <div className="w-10 h-10 bg-background-soft rounded-full flex items-center justify-center border border-border-subtle">
                                    <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-light text-text-primary">로그인 성공</p>
                                <p className="text-xs font-light text-text-secondary mt-0.5">방금 전</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

