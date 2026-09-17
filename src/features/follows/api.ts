import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api';
import type { Follow } from '@/lib/types';

interface ListResponse {
  follows: Follow[];
}

export function useFollowers(tripId: number | undefined) {
  return useQuery({
    queryKey: ['trips', tripId, 'follows'],
    queryFn: () => api.get<ListResponse>(`/trips/${tripId}/follows`),
    select: (data) => data.follows,
    enabled: tripId !== undefined,
  });
}

export function useJoinTrip(tripId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.post<Follow>(`/trips/${tripId}/follows`, undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips', tripId, 'follows'] });
      queryClient.invalidateQueries({ queryKey: ['trips', tripId] });
    },
  });
}

export function useLeaveTrip(tripId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.delete<void>(`/trips/${tripId}/follows/me`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips', tripId, 'follows'] });
      queryClient.invalidateQueries({ queryKey: ['trips', tripId] });
    },
  });
}
