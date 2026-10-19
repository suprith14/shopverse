import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { useAuthStore } from './auth.store';

// Each feature has an *.api.ts file: plain functions that call the backend,
// wrapped in React Query hooks that components use.

export function useLogin() {
  const setSession = useAuthStore((s) => s.setSession);
  return useMutation({
    mutationFn: async (input) => (await api.post('/auth/login', input)).data,
    onSuccess: (data) => setSession(data.user, data.accessToken),
  });
}

export function useRegister() {
  const setSession = useAuthStore((s) => s.setSession);
  return useMutation({
    mutationFn: async (input) => (await api.post('/auth/register', input)).data,
    onSuccess: (data) => setSession(data.user, data.accessToken),
  });
}

// Change password. The server signs out every other device and returns a fresh session for
// this one (new access token here, new refresh cookie set by the response).
export function useChangePassword() {
  const setSession = useAuthStore((s) => s.setSession);
  return useMutation({
    mutationFn: async (input) => (await api.post('/auth/change-password', input)).data,
    onSuccess: (data) => setSession(data.user, data.accessToken),
  });
}

// Forgot password, step 1: email me a code. The server answers the same way whether or not
// the account exists, so the page can't (and doesn't) say "no such account".
export function useForgotPassword() {
  return useMutation({
    mutationFn: async (input) => (await api.post('/auth/forgot-password', input)).data,
  });
}

// Step 2: code + new password. Success logs you straight in on this device.
export function useResetPassword() {
  const setSession = useAuthStore((s) => s.setSession);
  return useMutation({
    mutationFn: async (input) => (await api.post('/auth/reset-password', input)).data,
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
