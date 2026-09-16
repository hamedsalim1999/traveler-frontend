import { useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api';
import type { Place } from '@/lib/types';

interface ListResponse {
  places: Place[];
}

export function usePlaces(filters: { continent?: string; tag?: string }) {
  const params = new URLSearchParams();
  if (filters.continent) params.set('continent', filters.continent);
  if (filters.tag) params.set('tag', filters.tag);
  const qs = params.toString();

  return useQuery({
    queryKey: ['places', filters],
    queryFn: () => api.get<ListResponse>(`/places${qs ? `?${qs}` : ''}`),
    select: (data) => data.places,
  });
}

export function usePlace(slug: string | undefined) {
  return useQuery({
    queryKey: ['places', slug],
    queryFn: () => api.get<Place>(`/places/${slug}`),
    enabled: Boolean(slug),
  });
}
