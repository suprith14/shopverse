import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { useAuthStore } from '@/features/auth/auth.store';

// "My account" data: profile details, photo and address book. Every endpoint returns the
// whole updated profile, which goes straight into the cache (no extra GET needed).

function useProfileKey() {
  const userId = useAuthStore((s) => s.user?.id);
  return ['profile', userId];
}

export function useProfile() {
  const status = useAuthStore((s) => s.status);
  return useQuery({
    queryKey: useProfileKey(),
    queryFn: async () => (await api.get('/profile')).data.profile,
    enabled: status === 'authenticated',
  });
}

function useProfileMutation(request) {
  const queryClient = useQueryClient();
  const key = useProfileKey();
  const setSession = useAuthStore((s) => s.setSession);
  const accessToken = useAuthStore((s) => s.accessToken);
  return useMutation({
    mutationFn: async (input) => (await request(input)).data.profile,
    onSuccess: (profile) => {
      queryClient.setQueryData(key, profile);
      // Keep the name shown in the header in sync after a rename.
      if (accessToken)
        setSession({ id: profile.id, name: profile.name, email: profile.email, role: profile.role }, accessToken);
    },
  });
}

export function useUpdateProfile() {
  return useProfileMutation((input) => api.patch('/profile', input));
}

export function useAddAddress() {
  return useProfileMutation((input) => api.post('/profile/addresses', input));
}

export function useUpdateAddress() {
  return useProfileMutation(({ id, ...input }) => api.patch(`/profile/addresses/${id}`, input));
}

export function useSetDefaultAddress() {
  return useProfileMutation((id) => api.post(`/profile/addresses/${id}/default`));
}

export function useDeleteAddress() {
  return useProfileMutation((id) => api.delete(`/profile/addresses/${id}`));
}

// Profile photo, in 3 steps:
//  1. ask OUR API for a signed upload permission
//  2. upload the file DIRECTLY to Cloudinary (plain fetch: we must not send our auth token to another site)
//  3. tell our API the resulting URL
export function useUploadAvatar() {
  return useProfileMutation(async (file) => {
    const { data: signed } = await api.post('/profile/avatar/signature');
    const form = new FormData();
    for (const [key, value] of Object.entries(signed.fields)) form.append(key, String(value));
    form.append('file', file);
    const res = await fetch(signed.uploadUrl, { method: 'POST', body: form });
    const uploaded = await res.json();
    if (!res.ok || !uploaded.secure_url) throw new Error(uploaded.error?.message ?? 'Upload failed');
    return api.put('/profile/avatar', { url: uploaded.secure_url });
  });
}

export function useRemoveAvatar() {
  return useProfileMutation(() => api.delete('/profile/avatar'));
}
