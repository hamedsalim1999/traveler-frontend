import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api';
import type { CreateTripInput, Difficulty, Trip, UpdateTripInput } from '@/lib/types';

interface ListResponse {
  trips: Trip[];
}

export interface TripFilters {
  destination?: string;
  q?: string;
  leader_id?: number;
  difficulty?: Difficulty;
  from?: string;
  to?: string;
  max_price_cents?: number;
}

export function useTrips(filters: TripFilters) {
  const params = new URLSearchParams();
  if (filters.destination) params.set('destination', filters.destination);
  if (filters.q) params.set('q', filters.q);
  if (filters.leader_id) params.set('leader_id', String(filters.leader_id));
  if (filters.difficulty) params.set('difficulty', filters.difficulty);
  if (filters.from) params.set('from', filters.from);
  if (filters.to) params.set('to', filters.to);
  if (filters.max_price_cents) params.set('max_price_cents', String(filters.max_price_cents));
  const qs = params.toString();

  return useQuery({
    queryKey: ['trips', filters],
    queryFn: () => api.get<ListResponse>(`/trips${qs ? `?${qs}` : ''}`),
    select: (data) => data.trips,
  });
}

export function useTrip(id: number | undefined) {
  return useQuery({
    queryKey: ['trips', id],
    queryFn: () => api.get<Trip>(`/trips/${id}`),
    enabled: id !== undefined,
  });
}

export function useCreateTrip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateTripInput) => api.post<Trip>('/trips', input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trips'] }),
  });
}

export function useUpdateTrip(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateTripInput) => api.put<Trip>(`/trips/${id}`, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
    },
  });
}

export function useDeleteTrip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete<void>(`/trips/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trips'] }),
  });
}
