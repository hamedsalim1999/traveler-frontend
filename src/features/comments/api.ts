import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api';
import type { Comment, CreateCommentInput } from '@/lib/types';

interface ListResponse {
  comments: Comment[];
}

export function useComments(tripId: number | undefined) {
  return useQuery({
    queryKey: ['trips', tripId, 'comments'],
    queryFn: () => api.get<ListResponse>(`/trips/${tripId}/comments`),
    select: (data) => data.comments,
    enabled: tripId !== undefined,
  });
}

export function useCreateComment(tripId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateCommentInput) =>
      api.post<Comment>(`/trips/${tripId}/comments`, input),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['trips', tripId, 'comments'] }),
  });
}
