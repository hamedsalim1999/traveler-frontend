import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-lg border border-border bg-card text-card-foreground shadow-sm transition-shadow hover:shadow-md',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function Badge({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full bg-accent px-2.5 py-0.5 text-xs font-medium text-accent-foreground',
        className,
      )}
    >
      {children}
    </span>
  );
}
