import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api';
import type { CreateTripDayInput, TripDay, UpdateTripDayInput } from '@/lib/types';

interface ListResponse {
  days: TripDay[];
}

export function useTripDays(tripId: number | undefined) {
  return useQuery({
    queryKey: ['trips', tripId, 'days'],
    queryFn: () => api.get<ListResponse>(`/trips/${tripId}/days`),
    select: (data) => data.days,
    enabled: tripId !== undefined,
  });
}

export function useCreateTripDay(tripId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateTripDayInput) => api.post<TripDay>(`/trips/${tripId}/days`, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trips', tripId, 'days'] }),
  });
}

export function useUpdateTripDay(tripId: number, dayId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateTripDayInput) =>
      api.put<TripDay>(`/trips/${tripId}/days/${dayId}`, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trips', tripId, 'days'] }),
  });
}

export function useDeleteTripDay(tripId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dayId: number) => api.delete<void>(`/trips/${tripId}/days/${dayId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trips', tripId, 'days'] }),
  });
}
