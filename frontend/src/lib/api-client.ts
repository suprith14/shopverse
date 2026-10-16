import axios, { type AxiosRequestConfig } from 'axios';
import type { AuthResponse } from '@/types/api';
import { useAuthStore } from '@/features/auth/auth.store';

// A single axios instance used by every feature's *.api.ts file.
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
  withCredentials: true, // send the httpOnly refresh-token cookie
});

// 1) Attach the access token to every request.
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 2) Silent refresh: when a request fails with 401 (access token expired), get a new
//    access token using the refresh cookie, then retry the original request once.
//    If several requests fail at the same time, they all wait for ONE refresh call.
let refreshPromise: Promise<string | null> | null = null;

export function refreshSession(): Promise<string | null> {
  refreshPromise ??= axios
    .post<AuthResponse>(`${api.defaults.baseURL}/auth/refresh`, null, { withCredentials: true })
    .then(({ data }) => {
      useAuthStore.getState().setSession(data.user, data.accessToken);
      return data.accessToken;
    })
    .catch(() => {
      useAuthStore.getState().clearSession();
      return null;
    })
    .finally(() => {
      refreshPromise = null;
    });
  return refreshPromise;
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config as AxiosRequestConfig & { _retried?: boolean };
    const isAuthCall = original?.url?.startsWith('/auth/');

    if (error.response?.status === 401 && !original._retried && !isAuthCall) {
      original._retried = true;
      const newToken = await refreshSession();
      if (newToken) {
        original.headers = { ...original.headers, Authorization: `Bearer ${newToken}` };
        return api(original);
      }
    }
    return Promise.reject(error);
  },
);
