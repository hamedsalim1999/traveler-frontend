import { useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Label, Select, TextArea, TextInput } from '@/components/ui/Field';
import { EmptyView, ErrorView, LoadingView } from '@/components/ui/StatusView';
import { useProfiles } from '@/features/profiles/api';
import { useCreateTrip, useTrips } from '@/features/trips/api';
import { errorMessage } from '@/lib/errors';

export function TripsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const destination = searchParams.get('destination') ?? '';
  const q = searchParams.get('q') ?? '';
  const { data: trips, isLoading, error } = useTrips({ destination, q });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Trips</h1>
        <p className="mt-1 text-muted-foreground">
          Itineraries logged by travelers and the leaders taking them.
        </p>
      </div>

      <CreateTripForm />

      <div className="flex flex-wrap gap-3">
        <TextInput
          placeholder="Search by title…"
          value={q}
          onChange={(e) => setSearchParams((p) => setParam(p, 'q', e.target.value))}
          className="max-w-xs"
        />
        <TextInput
          placeholder="Filter by destination…"
          value={destination}
          onChange={(e) => setSearchParams((p) => setParam(p, 'destination', e.target.value))}
          className="max-w-xs"
        />
      </div>

      {isLoading && <LoadingView label="Loading trips…" />}
      {error && <ErrorView message={errorMessage(error)} />}
      {trips && trips.length === 0 && (
        <EmptyView message="Nothing matches those filters. Log a trip above to get started." />
      )}

      {trips && trips.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {trips.map((trip) => (
            <Link key={trip.id} to={`/trips/${trip.id}`}>
              <Card className="h-full p-5">
                <h2 className="text-lg font-semibold text-foreground">{trip.title}</h2>
                <p className="text-sm text-muted-foreground">{trip.destination}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {trip.start_date} → {trip.end_date}
                </p>
                {trip.notes && (
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{trip.notes}</p>
                )}
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function setParam(params: URLSearchParams, key: string, value: string) {
  const next = new URLSearchParams(params);
  if (value) next.set(key, value);
  else next.delete(key);
  return next;
}

function CreateTripForm() {
  const { data: profiles } = useProfiles();
  const createTrip = useCreateTrip();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [notes, setNotes] = useState('');
  const [profileId, setProfileId] = useState('');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    createTrip.mutate(
      {
        title,
        destination,
        start_date: startDate,
        end_date: endDate,
        notes,
        profile_id: Number(profileId),
      },
      {
        onSuccess: () => {
          setTitle('');
          setDestination('');
          setStartDate('');
          setEndDate('');
          setNotes('');
          setProfileId('');
          setOpen(false);
        },
      },
    );
  }

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} variant="secondary">
        Log a trip
      </Button>
    );
  }

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Log a trip</h2>
        <div>
          <Label htmlFor="trip-title">Title</Label>
          <TextInput
            id="trip-title"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Golden Week in Kyoto"
          />
        </div>
        <div>
          <Label htmlFor="trip-destination">Destination</Label>
          <TextInput
            id="trip-destination"
            required
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="Kyoto"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="trip-start">Departs</Label>
            <TextInput
              id="trip-start"
              type="date"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="trip-end">Returns</Label>
            <TextInput
              id="trip-end"
              type="date"
              required
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
        <div>
          <Label htmlFor="trip-profile">Created by</Label>
          <Select
            id="trip-profile"
            required
            value={profileId}
            onChange={(e) => setProfileId(e.target.value)}
          >
            <option value="" disabled>
              Select a profile…
            </option>
            {profiles?.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.type})
              </option>
            ))}
          </Select>
          {profiles?.length === 0 && (
            <p className="mt-1 text-xs text-muted-foreground">
              No profiles yet — <Link to="/profiles" className="text-primary hover:underline">create one first</Link>.
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="trip-notes">Notes</Label>
          <TextArea
            id="trip-notes"
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Book ryokan early"
          />
        </div>
        {createTrip.isError && <ErrorView message={errorMessage(createTrip.error)} />}
        <div className="flex gap-2">
          <Button type="submit" disabled={createTrip.isPending}>
            {createTrip.isPending ? 'Creating…' : 'Create trip'}
          </Button>
          <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
}
