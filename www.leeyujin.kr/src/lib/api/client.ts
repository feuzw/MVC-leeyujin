import axios, {
  type InternalAxiosRequestConfig,
  type AxiosResponse,
  type AxiosError,
} from "axios";
import { useAuthStore } from "@/features/auth/store/authStore";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8080";

export const apiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  timeout: 10000,
});

// 환경 체크 함수 (SSR에서 window 안전)
const isClient = () => typeof window !== "undefined";

// 요청 인터셉터
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Zustand 스토어에서 Access Token 가져오기
    if (isClient()) {
      const accessToken = useAuthStore.getState().getValidToken();
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken.token}`;
      }
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// 응답 인터셉터
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    const status = error.response?.status;

    if (status === 401) {
      if (process.env.NODE_ENV === "development") {
        console.warn("⚠️ 401 Unauthorized - 인증 만료");
      }

      // 향후 실제 로그아웃 로직 추가
      // if (isClient()) {
      //   window.location.href = "/login";
      // }
    }

    // 옵셔널 체이닝으로 AxiosError 안전 처리
    const message =
      (error.response?.data as { message?: string })?.message ||
      error.message ||
      "API 요청 중 오류가 발생했습니다.";

    return Promise.reject(new Error(message));
  }
);
