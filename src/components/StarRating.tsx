import { Star } from 'lucide-react';

import { cn } from '@/lib/utils';

export function StarRating({ rating, className }: { rating: number; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-0.5', className)}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={cn(
            'h-3.5 w-3.5',
            n <= Math.round(rating) ? 'fill-star text-star' : 'fill-none text-border',
          )}
        />
      ))}
    </span>
  );
}
