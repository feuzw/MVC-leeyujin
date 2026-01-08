"use client";

import { useEffect } from "react";

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // 초기 테마 설정
    const savedTheme = localStorage.getItem("theme");
    
    // 기본값은 다크모드 (primary design)
    // 저장된 테마가 있으면 사용, 없으면 다크모드
    const initialTheme = savedTheme === "light" ? "light" : savedTheme === "dark" ? "dark" : "dark";
    
    const root = document.documentElement;
    root.classList.remove("dark", "light");
    root.classList.add(initialTheme);
    
    // CSS 변수 강제 적용 (새로운 컬러 시스템)
    if (initialTheme === "light") {
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
    
    // localStorage에도 저장 (없는 경우만)
    if (!savedTheme) {
      localStorage.setItem("theme", initialTheme);
    }

    // prefers-color-scheme 변경 감지 (사용자가 시스템 설정 변경 시)
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      // localStorage에 명시적 설정이 없을 때만 시스템 설정 반영
      if (!localStorage.getItem("theme")) {
        const theme = e.matches ? "dark" : "light";
        root.classList.remove("dark", "light");
        root.classList.add(theme);
        
        // CSS 변수도 업데이트 (새로운 컬러 시스템)
        if (theme === "light") {
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
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return <>{children}</>;
}

