import { Link } from 'react-router-dom';

import { Hero, HowItWorks, LeadOrJoinCta } from '@/components/Hero';
import { TripCard } from '@/components/TripCard';
import { CardGridSkeleton } from '@/components/ui/Skeleton';
import { ErrorView } from '@/components/ui/StatusView';
import { useTrips } from '@/features/trips/api';
import { errorMessage } from '@/lib/errors';

export function LandingPage() {
  const { data: trips, isLoading, error } = useTrips({});

  return (
    <div>
      <Hero />
      <HowItWorks />

      <section className="mx-auto max-w-5xl px-4 pb-16 sm:px-6">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-3xl font-bold text-foreground">
            Trips looking for followers
          </h2>
          <Link to="/browse" className="text-sm font-medium text-primary hover:underline">
            Browse all
          </Link>
        </div>

        <div className="mt-8">
          {isLoading && <CardGridSkeleton count={3} withPhoto />}
          {error && <ErrorView message={errorMessage(error)} />}
          {trips && (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {trips.slice(0, 3).map((trip) => (
                <TripCard key={trip.id} trip={trip} />
              ))}
            </div>
          )}
        </div>
      </section>

      <LeadOrJoinCta />
    </div>
  );
}
