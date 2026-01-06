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

// 응답 인터셉터 (401 에러 시 자동 refresh)
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const status = error.response?.status;
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // 401 에러이고, 아직 재시도하지 않은 요청인 경우
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (process.env.NODE_ENV === "development") {
        console.warn("⚠️ 401 Unauthorized - Access Token 만료, Refresh 시도 중...");
      }

      try {
        // Refresh Token으로 새 Access Token 발급
        const refreshResponse = await fetch(`${BASE_URL}/api/auth/refresh`, {
          method: "POST",
          credentials: "include", // 쿠키 포함 필수
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          const newAccessToken = data.access_token;

          if (newAccessToken) {
            // 새 Access Token을 Zustand에 저장 (10분 유효)
            const { setAccessToken } = useAuthStore.getState();
            setAccessToken(newAccessToken, 10 * 60);

            // 원래 요청을 새 Access Token으로 재시도
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            }

            return apiClient(originalRequest);
          }
        }

        // Refresh 실패 시 로그아웃 처리
        if (isClient()) {
          const { clearAccessToken } = useAuthStore.getState();
          clearAccessToken();
          window.location.href = "/login";
        }
      } catch (refreshError) {
        // Refresh 요청 자체가 실패한 경우
        if (process.env.NODE_ENV === "development") {
          console.error("❌ Refresh Token 요청 실패:", refreshError);
        }

        if (isClient()) {
          const { clearAccessToken } = useAuthStore.getState();
          clearAccessToken();
          window.location.href = "/login";
        }
      }
    }

    // 옵셔널 체이닝으로 AxiosError 안전 처리
    const message =
      (error.response?.data as { message?: string })?.message ||
      error.message ||
      "API 요청 중 오류가 발생했습니다.";

    return Promise.reject(new Error(message));
  }
);
