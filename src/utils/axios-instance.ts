import axios, { type InternalAxiosRequestConfig } from "axios";

import { get } from "idb-keyval";
import type { AuthResponse } from "../pages/types/auth-response";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

// Store requests
const sourceRequest: Record<string, { cancel: (message: string) => void }> = {};

// Add request interceptor
axiosInstance.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await get<AuthResponse>("bearerToken");
    if (token?.accessToken) {
      config.headers.Authorization = `Bearer ${token.accessToken}`;
    }
    config.baseURL = import.meta.env.VITE_API_BASE_URL;

    if (!config.url) return config;

    // if request is already in progress, cancel the previous request
    if (sourceRequest[config.url]) {
      sourceRequest[config.url].cancel("Duplicate request");
    }

    // create a new cancel token
    const axiosSource = axios.CancelToken.source();
    sourceRequest[config.url] = { cancel: axiosSource.cancel };
    config.cancelToken = axiosSource.token;

    return config;
  },
  (error: Error) => {
    return Promise.reject(error);
  },
);

// Add response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (axios.isCancel(error)) {
      console.error("Request canceled", error.message);
    } else {
      return Promise.reject(error);
    }
  },
);

export default axiosInstance;
