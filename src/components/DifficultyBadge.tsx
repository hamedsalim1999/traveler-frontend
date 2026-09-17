import { Mountain, Signpost, Tent } from 'lucide-react';

import { cn } from '@/lib/utils';
import type { Activity, Difficulty } from '@/lib/types';

const activityIcon: Record<Activity, typeof Signpost> = {
  hiking: Signpost,
  trekking: Tent,
  mountaineering: Mountain,
};

const difficultyClass: Record<Difficulty, string> = {
  easy: 'bg-card text-foreground border border-border',
  moderate: 'bg-moderate text-moderate-foreground',
  hard: 'bg-hard text-hard-foreground',
};

export function DifficultyBadge({
  difficulty,
  activity,
  className,
}: {
  difficulty: Difficulty;
  activity: Activity;
  className?: string;
}) {
  const Icon = activityIcon[activity];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium capitalize shadow-sm',
        difficultyClass[difficulty],
        className,
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {difficulty} · {activity}
    </span>
  );
}
