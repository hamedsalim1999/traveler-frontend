import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api';
import type { CreateReviewInput, Review } from '@/lib/types';

interface ListResponse {
  reviews: Review[];
}

export function useReviews(tripId: number | undefined) {
  return useQuery({
    queryKey: ['trips', tripId, 'reviews'],
    queryFn: () => api.get<ListResponse>(`/trips/${tripId}/reviews`),
    select: (data) => data.reviews,
    enabled: tripId !== undefined,
  });
}

export function useCreateReview(tripId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateReviewInput) => api.post<Review>(`/trips/${tripId}/reviews`, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips', tripId, 'reviews'] });
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
    },
  });
}
