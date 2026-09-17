import { Calendar, MapPin, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

import { DifficultyBadge } from '@/components/DifficultyBadge';
import { StarRating } from '@/components/StarRating';
import { TripPhoto } from '@/components/TripPhoto';
import { Card } from '@/components/ui/Card';
import { useProfile } from '@/features/profiles/api';
import { formatPrice } from '@/lib/money';
import type { Trip } from '@/lib/types';

function formatRange(start: string, end: string) {
  const fmt = (d: string) =>
    new Date(d + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  return `${fmt(start)} – ${fmt(end)}`;
}

export function TripCard({ trip }: { trip: Trip }) {
  const { data: leader } = useProfile(trip.profile_id ?? undefined);

  return (
    <Link to={`/trips/${trip.id}`}>
      <Card className="h-full">
        <div className="relative">
          <TripPhoto src={trip.photo_url} className="h-44 w-full" />
          <DifficultyBadge
            difficulty={trip.difficulty}
            activity={trip.activity}
            className="absolute left-3 top-3"
          />
        </div>
        <div className="p-5">
          <h3 className="font-display text-xl font-semibold leading-snug text-foreground">
            {trip.title}
          </h3>
          <div className="mt-2 space-y-1 text-sm text-muted-foreground">
            <p className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              {trip.destination}
            </p>
            <p className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 shrink-0" />
              {formatRange(trip.start_date, trip.end_date)}
            </p>
            <p className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 shrink-0" />
              Max {trip.max_followers} followers
            </p>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
            <div className="flex items-center gap-2">
              {leader?.avatar_url && (
                <img src={leader.avatar_url} alt="" className="h-7 w-7 rounded-full object-cover" />
              )}
              <div>
                <p className="text-sm font-medium text-foreground">{leader?.name ?? '—'}</p>
                {leader?.average_rating != null && <StarRating rating={leader.average_rating} />}
              </div>
            </div>
            <div className="text-right">
              <p className="font-display text-lg font-semibold text-foreground">
                {formatPrice(trip.price_cents)}
              </p>
              <p className="text-xs text-muted-foreground">per follower</p>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
