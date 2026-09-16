import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api';
import type {
  CreateProfileInput,
  Profile,
  ProfileDetail,
  ProfileType,
  UpdateProfileInput,
} from '@/lib/types';

interface ListResponse {
  profiles: Profile[];
}

export function useProfiles(type?: ProfileType) {
  const qs = type ? `?type=${type}` : '';
  return useQuery({
    queryKey: ['profiles', { type }],
    queryFn: () => api.get<ListResponse>(`/profiles${qs}`),
    select: (data) => data.profiles,
  });
}

export function useProfile(id: number | undefined) {
  return useQuery({
    queryKey: ['profiles', id],
    queryFn: () => api.get<ProfileDetail>(`/profiles/${id}`),
    enabled: id !== undefined,
  });
}

export function useCreateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateProfileInput) => api.post<Profile>('/profiles', input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['profiles'] }),
  });
}

export function useUpdateProfile(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateProfileInput) => api.put<Profile>(`/profiles/${id}`, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['profiles'] }),
  });
}

export function useDeleteProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete<void>(`/profiles/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['profiles'] }),
  });
}
