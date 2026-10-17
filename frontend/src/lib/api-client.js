import axios from 'axios';
import { useAuthStore } from '@/features/auth/auth.store';
import { track } from './network-status';

// A single axios instance used by every feature's *.api.ts file.
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
  withCredentials: true, // send the httpOnly refresh-token cookie
});

// 1) Attach the access token to every request, and start the "is the server slow?" timer.
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  config._done = track();
  return config;
});

// 2) Silent refresh: when a request fails with 401 (access token expired), get a new
//    access token using the refresh cookie, then retry the original request once.
//    If several requests fail at the same time, they all wait for ONE refresh call.
let refreshPromise = null;

export function refreshSession() {
  const done = track(); // this is the very first request on page load: often the one waking the server
  refreshPromise ??= axios
    .post(`${api.defaults.baseURL}/auth/refresh`, null, { withCredentials: true })
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
  return refreshPromise.finally(done);
}

api.interceptors.response.use(
  (response) => {
    response.config._done?.();
    return response;
  },
  async (error) => {
    const original = error.config;
    original?._done?.();
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
