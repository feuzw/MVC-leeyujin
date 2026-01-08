"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
    const [isDark, setIsDark] = useState(true);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // 현재 html 요소의 클래스를 읽어서 동기화
        const root = document.documentElement;
        const currentTheme = root.classList.contains("light") ? "light" : "dark";
        setIsDark(currentTheme === "dark");
    }, []);

    const applyTheme = (theme: "dark" | "light") => {
        const root = document.documentElement;
        root.classList.remove("dark", "light");
        root.classList.add(theme);
        localStorage.setItem("theme", theme);

        // CSS 변수 강제 적용 (새로운 컬러 시스템)
        if (theme === "light") {
            // Light Mode
            root.style.setProperty("--background", "#F8F9FB");
            root.style.setProperty("--background-soft", "#FFFFFF");
            root.style.setProperty("--surface", "#F1F3F7");
            root.style.setProperty("--surface-hover", "#E9ECF2");
            root.style.setProperty("--text-primary", "#1A1D26");
            root.style.setProperty("--text-secondary", "#4A5160");
            root.style.setProperty("--text-muted", "#7A8190");
            root.style.setProperty("--border", "#D9DDE6");
            root.style.setProperty("--border-subtle", "#E6E9F0");
            root.style.setProperty("--accent-primary", "#4F7CFF");
            root.style.setProperty("--accent-secondary", "#7C8DFF");
            root.style.setProperty("--accent-glow", "rgba(79,124,255,0.12)");
        } else {
            // Dark Mode (Default)
            root.style.setProperty("--background", "#0B0D10");
            root.style.setProperty("--background-soft", "#0F1115");
            root.style.setProperty("--surface", "#14161B");
            root.style.setProperty("--surface-hover", "#181B21");
            root.style.setProperty("--text-primary", "#EDEFF2");
            root.style.setProperty("--text-secondary", "#A6ADBB");
            root.style.setProperty("--text-muted", "#7C8496");
            root.style.setProperty("--border", "#232633");
            root.style.setProperty("--border-subtle", "#1A1D26");
            root.style.setProperty("--accent-primary", "#4F7CFF");
            root.style.setProperty("--accent-secondary", "#7C8DFF");
            root.style.setProperty("--accent-glow", "rgba(79,124,255,0.15)");
        }
    };

    const toggleTheme = () => {
        const newTheme = isDark ? "light" : "dark";
        setIsDark(!isDark);
        applyTheme(newTheme);
    };

    if (!mounted) {
        return (
            <button
                className="w-8 h-8 rounded-lg border border-border-subtle bg-surface hover:bg-surface-hover flex items-center justify-center transition-all duration-300"
                aria-label="테마 전환"
            >
                <div className="w-4 h-4 rounded-full bg-text-muted animate-pulse" />
            </button>
        );
    }

    return (
        <button
            onClick={toggleTheme}
            className="w-8 h-8 rounded-lg border border-border-subtle bg-surface hover:bg-surface-hover flex items-center justify-center transition-all duration-300 group"
            aria-label={isDark ? "라이트 모드로 전환" : "다크 모드로 전환"}
        >
            {isDark ? (
                // Moon icon (Dark mode)
                <svg
                    className="w-4 h-4 text-text-primary transition-transform duration-300 group-hover:rotate-12"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                    />
                </svg>
            ) : (
                // Sun icon (Light mode)
                <svg
                    className="w-4 h-4 text-text-primary transition-transform duration-300 group-hover:rotate-90"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                </svg>
            )}
        </button>
    );
}

