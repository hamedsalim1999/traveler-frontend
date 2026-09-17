import { Mountain } from 'lucide-react';

import { cn } from '@/lib/utils';

export function TripPhoto({ src, className }: { src: string; className?: string }) {
  if (!src) {
    return (
      <div className={cn('ridge-gradient flex items-center justify-center', className)}>
        <Mountain className="h-8 w-8 text-white/70" />
      </div>
    );
  }
  return <img src={src} alt="" loading="lazy" className={cn('photo-soft object-cover', className)} />;
}
