import axios, {
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from "axios";
import { del, get, set } from "idb-keyval";
import type { AuthResponse } from "../pages/types/auth-response";

// ─── Constants ────────────────────────────────────────────────────────────────
const REFRESH_TOKEN_EXPIRY_DAYS = 3;
const REFRESH_ENDPOINT = "/auth/refresh-token";

// ─── Axios Instance ───────────────────────────────────────────────────────────
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

// ─── Cancel-duplicate-request store ──────────────────────────────────────────
const sourceRequest: Record<string, { cancel: (message: string) => void }> = {};

// ─── Internal flag to prevent infinite refresh loops ─────────────────────────
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

// ─── Helper: logout user entirely ────────────────────────────────────────────
const logoutUser = async () => {
  await del("bearerToken");
  await del("user");
  localStorage.clear();
  // Redirect to sign-in page (hard reload to reset all state)
  window.location.href = "/auth/sign-in";
};

// ─── Helper: check if refresh token is still within its 3-day lifespan ───────
const isRefreshTokenValid = async (): Promise<boolean> => {
  const storedAt = localStorage.getItem("tokenStoredAt");
  if (!storedAt) return false;
  const storedTime = parseInt(storedAt, 10);
  const expiryMs = REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
  return Date.now() - storedTime < expiryMs;
};

// ─── Helper: persist auth tokens ─────────────────────────────────────────────
export const saveTokens = async (tokens: AuthResponse) => {
  await set("bearerToken", tokens);
  localStorage.setItem("tokenStoredAt", Date.now().toString());
};

// ─── Request Interceptor ──────────────────────────────────────────────────────
axiosInstance.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await get<AuthResponse>("bearerToken");
    if (token?.accessToken) {
      config.headers.Authorization = `Bearer ${token.accessToken}`;
    }
    config.baseURL = import.meta.env.VITE_API_BASE_URL;

    if (!config.url) return config;

    // Cancel duplicate in-flight requests to the same URL
    if (sourceRequest[config.url]) {
      sourceRequest[config.url].cancel("Duplicate request");
    }
    const axiosSource = axios.CancelToken.source();
    sourceRequest[config.url] = { cancel: axiosSource.cancel };
    config.cancelToken = axiosSource.token;

    return config;
  },
  (error: Error) => Promise.reject(error),
);

// ─── Response Interceptor ─────────────────────────────────────────────────────
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Silently swallow cancelled duplicate requests
    if (axios.isCancel(error)) {
      console.warn("Request canceled:", error.message);
      return Promise.reject(error);
    }

    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    const status = error.response?.status;

    // Handle 401 Unauthorized (or 403 Forbidden that should be 401)
    if (
      (status === 401 || status === 403) &&
      !originalRequest._retry &&
      originalRequest.url !== REFRESH_ENDPOINT
    ) {
      // Check if the refresh token is still within its 3-day lifespan
      const refreshValid = await isRefreshTokenValid();
      if (!refreshValid) {
        await logoutUser();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // Queue this request until the refresh completes
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((newToken) => {
            if (originalRequest.headers) {
              originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
            } else {
              originalRequest.headers = {
                Authorization: `Bearer ${newToken}`,
              };
            }
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      // Mark that we are in the middle of a refresh
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const stored = await get<AuthResponse>("bearerToken");
        if (!stored?.refreshToken) {
          throw new Error("No refresh token available");
        }

        // Call the refresh-token endpoint (unauthenticated plain axios call to avoid loop)
        const refreshResponse = await axios.post<{ data: AuthResponse }>(
          `${import.meta.env.VITE_API_BASE_URL}${REFRESH_ENDPOINT}`,
          { refreshToken: stored.refreshToken },
        );

        const newTokens: AuthResponse = refreshResponse.data.data;
        await saveTokens(newTokens);

        // Update the Authorization header for the original failed request
        if (originalRequest.headers) {
          originalRequest.headers["Authorization"] =
            `Bearer ${newTokens.accessToken}`;
        } else {
          originalRequest.headers = {
            Authorization: `Bearer ${newTokens.accessToken}`,
          };
        }

        // Resolve all queued requests with the new token
        processQueue(null, newTokens.accessToken);

        // Retry the original request
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Refresh failed — logout the user entirely
        processQueue(refreshError, null);
        await logoutUser();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
