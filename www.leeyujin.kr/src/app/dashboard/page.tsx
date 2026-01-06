"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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
            <div className="min-h-screen flex items-center justify-center bg-gradient-dark">
                <div className="text-center space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
                    <p className="text-lg font-medium text-gray-300">로딩 중...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-dark">
            {/* 헤더 */}
            <header className="bg-gray-900/50 backdrop-blur-sm border-b border-gray-800/50 shadow-lg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">대시보드</h1>
                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-800/50 border border-gray-700/50 rounded-lg hover:bg-gray-800 hover:border-purple-500/50 transition-all"
                        >
                            로그아웃
                        </button>
                    </div>
                </div>
            </header>

            {/* 메인 컨텐츠 */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* 환영 메시지 */}
                <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800/50 p-6 mb-6 shadow-lg">
                    <h2 className="text-xl font-semibold text-purple-300 mb-2">
                        환영합니다! 🎉
                    </h2>
                    <p className="text-gray-400">
                        로그인에 성공했습니다. 대시보드에 오신 것을 환영합니다.
                    </p>
                </div>

                {/* 통계 카드 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800/50 p-6 hover:border-purple-500/50 transition-all shadow-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-400">총 사용자</p>
                                <p className="text-2xl font-bold text-gray-200 mt-1">-</p>
                            </div>
                            <div className="p-3 bg-purple-500/20 rounded-lg">
                                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800/50 p-6 hover:border-green-500/50 transition-all shadow-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-400">활성 세션</p>
                                <p className="text-2xl font-bold text-gray-200 mt-1">-</p>
                            </div>
                            <div className="p-3 bg-green-500/20 rounded-lg">
                                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800/50 p-6 hover:border-pink-500/50 transition-all shadow-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-400">오늘 방문</p>
                                <p className="text-2xl font-bold text-gray-200 mt-1">-</p>
                            </div>
                            <div className="p-3 bg-pink-500/20 rounded-lg">
                                <svg className="w-6 h-6 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 최근 활동 */}
                <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800/50 p-6 shadow-lg">
                    <h3 className="text-lg font-semibold text-purple-300 mb-4">최근 활동</h3>
                    <div className="space-y-4">
                        <div className="flex items-center space-x-4 p-4 bg-gray-800/30 rounded-lg border border-gray-700/50">
                            <div className="flex-shrink-0">
                                <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                                    <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-200">로그인 성공</p>
                                <p className="text-sm text-gray-500">방금 전</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

