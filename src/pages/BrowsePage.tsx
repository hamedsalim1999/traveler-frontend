import { Sparkles } from 'lucide-react';
import { useState } from 'react';

import { TripCard } from '@/components/TripCard';
import { Label, TextInput } from '@/components/ui/Field';
import { CardGridSkeleton } from '@/components/ui/Skeleton';
import { EmptyView, ErrorView } from '@/components/ui/StatusView';
import { TabsBtn, TabsProvider, useTabs } from '@/components/ui/tabs';
import { useTrips } from '@/features/trips/api';
import { useAuth } from '@/lib/auth';
import { errorMessage } from '@/lib/errors';
import type { Trip } from '@/lib/types';

const MAX_BUDGET_CENTS = 250000;

export function BrowsePage() {
  const [destination, setDestination] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [budget, setBudget] = useState(MAX_BUDGET_CENTS);

  const { data: trips, isLoading, error } = useTrips({
    destination: destination || undefined,
    from: from || undefined,
    to: to || undefined,
    max_price_cents: budget < MAX_BUDGET_CENTS ? budget : undefined,
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-4xl font-bold text-foreground">Find your next trip</h1>
      <p className="mt-2 text-muted-foreground">
        Filter by destination, dates or budget — the ways followers search.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 rounded-lg border border-border bg-card p-5 sm:grid-cols-4">
        <div>
          <Label htmlFor="browse-destination">Destination</Label>
          <TextInput
            id="browse-destination"
            placeholder="Chamonix, Nepal…"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="browse-from">From</Label>
          <TextInput id="browse-from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="browse-to">To</Label>
          <TextInput id="browse-to" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="browse-budget">Budget up to €{(budget / 100).toLocaleString()}</Label>
          <input
            id="browse-budget"
            type="range"
            min={0}
            max={MAX_BUDGET_CENTS}
            step={5000}
            value={budget}
            onChange={(e) => setBudget(Number(e.target.value))}
            className="mt-3 w-full accent-primary"
          />
        </div>
      </div>

      <TabsProvider defaultValue="all" hover={false}>
        <div className="mt-6 flex w-fit gap-1 rounded-lg bg-muted p-1">
          <TabsBtn value="all">
            <span className="relative z-10 block px-1 text-sm font-medium">
              All trips {trips ? `(${trips.length})` : ''}
            </span>
          </TabsBtn>
          <TabsBtn value="for-you">
            <span className="relative z-10 flex items-center gap-1.5 px-1 text-sm font-medium">
              <Sparkles className="h-3.5 w-3.5" />
              For you
            </span>
          </TabsBtn>
        </div>

        <div className="mt-6">
          {isLoading && <CardGridSkeleton withPhoto />}
          {error && <ErrorView message={errorMessage(error)} />}
          {trips && trips.length === 0 && (
            <EmptyView message="Nothing matches those filters yet." />
          )}
          {trips && trips.length > 0 && <ResultsGrid trips={trips} />}
        </div>
      </TabsProvider>
    </div>
  );
}

function ResultsGrid({ trips }: { trips: Trip[] }) {
  const { activeTab } = useTabs();
  const { profile } = useAuth();

  if (activeTab === 'for-you' && !profile) {
    return (
      <EmptyView message="Sign in to get trips matched to your profile. Showing all trips for now." />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {trips.map((trip) => (
        <TripCard key={trip.id} trip={trip} />
      ))}
    </div>
  );
}
