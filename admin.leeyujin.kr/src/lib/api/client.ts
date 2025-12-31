import axios from "axios";
import { useAuthStore } from "@/features/auth/store";

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  withCredentials: true, // 추후 쿠키 인증 대비
  timeout: 10000,
});

// 요청 인터셉터 (토큰 자동 첨부)
apiClient.interceptors.request.use(
  (config) => {
    // Zustand store에서 동기적으로 token 가져오기
    const token = useAuthStore.getState().token;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터 (에러 처리 통일)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    
    if (status === 401) {
      console.warn("⚠️ 인증 만료: 401 Unauthorized");
      
      // Zustand store의 logout 호출
      useAuthStore.getState().logout();
      
      // 클라이언트 사이드에서만 리다이렉트
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
    
    return Promise.reject(error);
  }
);
