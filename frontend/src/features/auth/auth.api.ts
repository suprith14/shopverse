import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type { AuthResponse } from '@/types/api';
import { useAuthStore } from './auth.store';

// Each feature has an *.api.ts file: plain functions that call the backend,
// wrapped in React Query hooks that components use.

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput extends LoginInput {
  name: string;
}

export function useLogin() {
  const setSession = useAuthStore((s) => s.setSession);
  return useMutation({
    mutationFn: async (input: LoginInput) => (await api.post<AuthResponse>('/auth/login', input)).data,
    onSuccess: (data) => setSession(data.user, data.accessToken),
  });
}

export function useRegister() {
  const setSession = useAuthStore((s) => s.setSession);
  return useMutation({
    mutationFn: async (input: RegisterInput) => (await api.post<AuthResponse>('/auth/register', input)).data,
    onSuccess: (data) => setSession(data.user, data.accessToken),
  });
}

// Change password. The server signs out every other device and returns a fresh session for
// this one (new access token here, new refresh cookie set by the response).
export function useChangePassword() {
  const setSession = useAuthStore((s) => s.setSession);
  return useMutation({
    mutationFn: async (input: { currentPassword: string; newPassword: string }) =>
      (await api.post<AuthResponse>('/auth/change-password', input)).data,
    onSuccess: (data) => setSession(data.user, data.accessToken),
  });
}

export function useLogout() {
  const clearSession = useAuthStore((s) => s.clearSession);
  return useMutation({
    mutationFn: () => api.post('/auth/logout'),
    onSettled: () => clearSession(),
  });
}
