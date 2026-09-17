import { Info, MapPin, Pencil, Plane, Plus, Trash2, Users } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { DifficultyBadge } from '@/components/DifficultyBadge';
import { StarRating } from '@/components/StarRating';
import { TripPhoto } from '@/components/TripPhoto';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Label, Select, TextArea, TextInput } from '@/components/ui/Field';
import { EmptyView, ErrorView, LoadingView } from '@/components/ui/StatusView';
import { useFollowers, useJoinTrip, useLeaveTrip } from '@/features/follows/api';
import { useProfile } from '@/features/profiles/api';
import { useCreateReview, useReviews } from '@/features/reviews/api';
import {
  useCreateTripDay,
  useDeleteTripDay,
  useTripDays,
  useUpdateTripDay,
} from '@/features/tripdays/api';
import { useDeleteTrip, useTrip, useUpdateTrip } from '@/features/trips/api';
import { useAuth } from '@/lib/auth';
import { errorMessage } from '@/lib/errors';
import { formatPrice } from '@/lib/money';
import type { Activity, Difficulty, Trip, TripDay } from '@/lib/types';

export function TripDetailPage() {
  const { id } = useParams<{ id: string }>();
  const tripId = Number(id);
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { data: trip, isLoading, error } = useTrip(tripId);
  const deleteTrip = useDeleteTrip();
  const [editing, setEditing] = useState(false);

  if (isLoading) return <LoadingView label="Loading trip…" />;
  if (error) return <ErrorView message={errorMessage(error)} />;
  if (!trip) return null;

  const isLeader = profile != null && trip.profile_id === profile.id;

  function handleDelete() {
    if (!confirm(`Delete "${trip!.title}"? This can't be undone.`)) return;
    deleteTrip.mutate(tripId, { onSuccess: () => navigate('/browse') });
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <Card className="overflow-hidden">
            <TripPhoto src={trip.photo_url} className="h-72 w-full sm:h-96" />
          </Card>

          {editing ? (
            <Card className="p-6">
              <EditTripForm trip={trip} onSaved={() => setEditing(false)} onCancel={() => setEditing(false)} />
            </Card>
          ) : (
            <Card className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <DifficultyBadge difficulty={trip.difficulty} activity={trip.activity} />
                  <h1 className="mt-3 font-display text-4xl font-bold text-foreground">{trip.title}</h1>
                </div>
                {isLeader && (
                  <div className="flex shrink-0 gap-2">
                    <Button variant="secondary" size="sm" onClick={() => setEditing(true)}>
                      <Pencil className="h-4 w-4" />
                      Edit
                    </Button>
                    <Button variant="danger" size="sm" onClick={handleDelete} disabled={deleteTrip.isPending}>
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                )}
              </div>
              <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  {trip.destination}
                </span>
                <span>
                  {trip.start_date} – {trip.end_date}
                </span>
                <span className="flex items-center gap-1.5">
                  <Users className="h-4 w-4" />
                  Max {trip.max_followers} followers
                </span>
              </div>
              {trip.notes && <p className="mt-4 text-foreground/80">{trip.notes}</p>}
              {deleteTrip.isError && (
                <div className="mt-3">
                  <ErrorView message={errorMessage(deleteTrip.error)} />
                </div>
              )}
            </Card>
          )}

          <ItinerarySection trip={trip} isLeader={isLeader} />
          <ReviewsSection tripId={tripId} />
        </div>

        <div className="space-y-6">
          <PriceBreakdown trip={trip} />
          <FlightStayEstimate destination={trip.destination} />
          {trip.profile_id != null && <LeaderCard leaderId={trip.profile_id} />}
        </div>
      </div>
    </div>
  );
}

function PriceBreakdown({ trip }: { trip: Trip }) {
  const { profile } = useAuth();
  const { data: followers } = useFollowers(trip.id);
  const joinTrip = useJoinTrip(trip.id);
  const leaveTrip = useLeaveTrip(trip.id);
  const navigate = useNavigate();

  const platformFee = Math.round(trip.price_cents * 0.05);
  const total = trip.price_cents + platformFee;
  const isLeader = profile != null && trip.profile_id === profile.id;
  const hasJoined = profile != null && followers?.some((f) => f.profile.id === profile.id);
  const isFull = trip.followers_count >= trip.max_followers;

  return (
    <Card className="p-6">
      <h2 className="font-display text-xl font-semibold text-foreground">Price breakdown</h2>
      <dl className="mt-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Leader's trip fee</dt>
          <dd className="text-foreground">{formatPrice(trip.price_cents)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Traveler platform fee (5%)</dt>
          <dd className="text-foreground">{formatPrice(platformFee)}</dd>
        </div>
        <div className="flex justify-between border-t border-border pt-2 font-semibold">
          <dt className="text-foreground">Total to join</dt>
          <dd className="text-foreground">{formatPrice(total)}</dd>
        </div>
      </dl>

      {joinTrip.isError && (
        <div className="mt-3">
          <ErrorView message={errorMessage(joinTrip.error)} />
        </div>
      )}

      {isLeader ? (
        <p className="mt-4 text-xs text-muted-foreground">You lead this trip.</p>
      ) : !profile ? (
        <Button className="mt-4 w-full" onClick={() => navigate(`/auth?next=/trips/${trip.id}`)}>
          Sign in to join this trip
        </Button>
      ) : hasJoined ? (
        <Button
          variant="secondary"
          className="mt-4 w-full"
          onClick={() => leaveTrip.mutate()}
          disabled={leaveTrip.isPending}
        >
          {leaveTrip.isPending ? 'Leaving…' : 'Leave this trip'}
        </Button>
      ) : (
        <Button
          className="mt-4 w-full"
          onClick={() => joinTrip.mutate()}
          disabled={joinTrip.isPending || isFull}
        >
          {isFull ? 'Trip is full' : joinTrip.isPending ? 'Joining…' : 'Join this trip'}
        </Button>
      )}
    </Card>
  );
}

// Flights/hotels aren't wired to a real pricing API (Traveler's own roadmap
// lists this as "coming soon"); numbers are a deterministic estimate from
// the destination string, clearly labeled as such.
function FlightStayEstimate({ destination }: { destination: string }) {
  const [origin, setOrigin] = useState('Stockholm');
  const seed = [...destination + origin].reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  const flight = 120 + (seed % 25) * 10;
  const stay = 4 * (35 + (seed % 15) * 4);
  const transport = 40 + (seed % 8) * 6;

  return (
    <Card className="p-6">
      <h2 className="flex items-center gap-2 font-display text-xl font-semibold text-foreground">
        <Plane className="h-4 w-4" />
        Estimated flight &amp; stay
      </h2>
      <div className="mt-4">
        <Label htmlFor="origin-city">From</Label>
        <Select id="origin-city" value={origin} onChange={(e) => setOrigin(e.target.value)}>
          {['Stockholm', 'London', 'Berlin', 'Madrid', 'New York'].map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
      </div>
      <dl className="mt-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Return flight</dt>
          <dd className="text-foreground">{formatPrice(flight * 100)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Stay (4 nights)</dt>
          <dd className="text-foreground">{formatPrice(stay * 100)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Local transport</dt>
          <dd className="text-foreground">{formatPrice(transport * 100)}</dd>
        </div>
        <div className="flex justify-between border-t border-border pt-2 font-semibold">
          <dt className="text-foreground">Estimated extra</dt>
          <dd className="text-foreground">{formatPrice((flight + stay + transport) * 100)}</dd>
        </div>
      </dl>
      <p className="mt-3 flex items-start gap-1.5 text-xs text-muted-foreground">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        Estimated cost — actual prices vary. Live flight &amp; hotel pricing coming soon.
      </p>
    </Card>
  );
}

function LeaderCard({ leaderId }: { leaderId: number }) {
  const { data: leader } = useProfile(leaderId);
  if (!leader) return null;

  return (
    <Card className="p-6">
      <h2 className="font-display text-xl font-semibold text-foreground">Your leader</h2>
      <div className="mt-4 flex items-center gap-3">
        {leader.avatar_url && (
          <img src={leader.avatar_url} alt="" className="h-12 w-12 rounded-full object-cover" />
        )}
        <div>
          <p className="font-medium text-foreground">{leader.name}</p>
          {(leader.experience_level || leader.age) && (
            <p className="text-sm capitalize text-muted-foreground">
              {[leader.experience_level, leader.age].filter(Boolean).join(' · ')}
            </p>
          )}
          {leader.average_rating != null && <StarRating rating={leader.average_rating} className="mt-1" />}
        </div>
      </div>
      {leader.bio && <p className="mt-4 text-sm text-muted-foreground">{leader.bio}</p>}
      <Button asChild variant="secondary" className="mt-4 w-full">
        <Link to={`/profiles/${leader.id}`}>View full profile</Link>
      </Button>
    </Card>
  );
}

function ItinerarySection({ trip, isLeader }: { trip: Trip; isLeader: boolean }) {
  const { data: days, isLoading } = useTripDays(trip.id);
  const [adding, setAdding] = useState(false);

  return (
    <section>
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-semibold text-foreground">Day-by-day itinerary</h2>
        {isLeader && !adding && (
          <Button variant="secondary" size="sm" onClick={() => setAdding(true)}>
            <Plus className="h-4 w-4" />
            Add day
          </Button>
        )}
      </div>

      {isLoading && <LoadingView label="Loading itinerary…" />}

      {adding && (
        <div className="mt-4">
          <DayForm
            tripId={trip.id}
            nextDayNumber={(days?.length ?? 0) + 1}
            onDone={() => setAdding(false)}
          />
        </div>
      )}

      {days && days.length === 0 && !adding && (
        <div className="mt-4">
          <EmptyView message="The leader hasn't published days yet." />
        </div>
      )}

      {days && days.length > 0 && (
        <ol className="mt-4 space-y-3">
          {days.map((day) => (
            <DayRow key={day.id} tripId={trip.id} day={day} isLeader={isLeader} />
          ))}
        </ol>
      )}
    </section>
  );
}

function DayRow({ tripId, day, isLeader }: { tripId: number; day: TripDay; isLeader: boolean }) {
  const [editing, setEditing] = useState(false);
  const deleteDay = useDeleteTripDay(tripId);

  if (editing) {
    return (
      <li>
        <DayForm
          tripId={tripId}
          day={day}
          nextDayNumber={day.day_number}
          onDone={() => setEditing(false)}
        />
      </li>
    );
  }

  return (
    <li className="flex gap-4 rounded-lg border border-border bg-card p-4">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary font-display text-sm font-semibold text-foreground">
        {day.day_number}
      </span>
      <div className="min-w-0 flex-1">
        <h3 className="font-medium text-foreground">{day.title}</h3>
        {day.description && <p className="mt-1 text-sm text-muted-foreground">{day.description}</p>}
      </div>
      {isLeader && (
        <div className="flex shrink-0 gap-1">
          <button
            onClick={() => setEditing(true)}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
            aria-label="Edit day"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={() => deleteDay.mutate(day.id)}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-destructive"
            aria-label="Delete day"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )}
    </li>
  );
}

function DayForm({
  tripId,
  day,
  nextDayNumber,
  onDone,
}: {
  tripId: number;
  day?: TripDay;
  nextDayNumber: number;
  onDone: () => void;
}) {
  const createDay = useCreateTripDay(tripId);
  const updateDay = useUpdateTripDay(tripId, day?.id ?? 0);
  const [dayNumber, setDayNumber] = useState(day?.day_number ?? nextDayNumber);
  const [title, setTitle] = useState(day?.title ?? '');
  const [description, setDescription] = useState(day?.description ?? '');

  const mutation = day ? updateDay : createDay;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    mutation.mutate(
      { day_number: dayNumber, title, description },
      { onSuccess: onDone },
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-lg border border-border bg-card p-4">
      <div className="grid grid-cols-[5rem_1fr] gap-3">
        <div>
          <Label htmlFor="day-number">Day</Label>
          <TextInput
            id="day-number"
            type="number"
            min={1}
            required
            value={dayNumber}
            onChange={(e) => setDayNumber(Number(e.target.value))}
          />
        </div>
        <div>
          <Label htmlFor="day-title">Title</Label>
          <TextInput
            id="day-title"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Fethiye to Ölüdeniz"
          />
        </div>
      </div>
      <div>
        <Label htmlFor="day-description">Description</Label>
        <TextArea
          id="day-description"
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Coastal path, lunch in the cove, swim at the lagoon."
        />
      </div>
      {mutation.isError && <ErrorView message={errorMessage(mutation.error)} />}
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={mutation.isPending}>
          {mutation.isPending ? 'Saving…' : 'Save'}
        </Button>
        <Button type="button" size="sm" variant="secondary" onClick={onDone}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

function ReviewsSection({ tripId }: { tripId: number }) {
  const { profile } = useAuth();
  const { data: reviews, isLoading } = useReviews(tripId);
  const { data: followers } = useFollowers(tripId);
  const createReview = useCreateReview(tripId);
  const [rating, setRating] = useState(5);
  const [body, setBody] = useState('');

  const hasJoined = profile != null && followers?.some((f) => f.profile.id === profile.id);
  const alreadyReviewed = profile != null && reviews?.some((r) => r.profile.id === profile.id);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    createReview.mutate({ rating, body }, { onSuccess: () => setBody('') });
  }

  return (
    <section>
      <h2 className="font-display text-2xl font-semibold text-foreground">Reviews</h2>

      {isLoading && <LoadingView label="Loading reviews…" />}

      {reviews && reviews.length === 0 && (
        <div className="mt-4">
          <EmptyView message="No reviews for this trip yet." />
        </div>
      )}

      {reviews && reviews.length > 0 && (
        <div className="mt-4 space-y-3">
          {reviews.map((r) => (
            <div key={r.id} className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <p className="font-medium text-foreground">{r.profile.name}</p>
                <StarRating rating={r.rating} />
              </div>
              {r.body && <p className="mt-2 text-sm text-muted-foreground">{r.body}</p>}
            </div>
          ))}
        </div>
      )}

      {hasJoined && !alreadyReviewed && (
        <form onSubmit={handleSubmit} className="mt-4 space-y-3 rounded-lg border border-border bg-card p-4">
          <div>
            <Label htmlFor="review-rating">Rating</Label>
            <Select id="review-rating" value={rating} onChange={(e) => setRating(Number(e.target.value))}>
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>
                  {n} star{n > 1 ? 's' : ''}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="review-body">Your review</Label>
            <TextArea
              id="review-body"
              rows={2}
              required
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="How was it?"
            />
          </div>
          {createReview.isError && <ErrorView message={errorMessage(createReview.error)} />}
          <Button type="submit" size="sm" disabled={createReview.isPending}>
            {createReview.isPending ? 'Posting…' : 'Post review'}
          </Button>
        </form>
      )}
    </section>
  );
}

function EditTripForm({
  trip,
  onSaved,
  onCancel,
}: {
  trip: Trip;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const updateTrip = useUpdateTrip(trip.id);
  const [title, setTitle] = useState(trip.title);
  const [destination, setDestination] = useState(trip.destination);
  const [startDate, setStartDate] = useState(trip.start_date);
  const [endDate, setEndDate] = useState(trip.end_date);
  const [notes, setNotes] = useState(trip.notes);
  const [difficulty, setDifficulty] = useState<Difficulty>(trip.difficulty);
  const [activity, setActivity] = useState<Activity>(trip.activity);
  const [price, setPrice] = useState(trip.price_cents / 100);
  const [maxFollowers, setMaxFollowers] = useState(trip.max_followers);
  const [photoUrl, setPhotoUrl] = useState(trip.photo_url);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    updateTrip.mutate(
      {
        title,
        destination,
        start_date: startDate,
        end_date: endDate,
        notes,
        difficulty,
        activity,
        price_cents: Math.round(price * 100),
        max_followers: maxFollowers,
        photo_url: photoUrl,
        profile_id: trip.profile_id ?? 0,
      },
      { onSuccess: onSaved },
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="edit-trip-title">Title</Label>
        <TextInput id="edit-trip-title" required value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div>
        <Label htmlFor="edit-trip-destination">Destination</Label>
        <TextInput
          id="edit-trip-destination"
          required
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="edit-trip-start">Departs</Label>
          <TextInput id="edit-trip-start" type="date" required value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="edit-trip-end">Returns</Label>
          <TextInput id="edit-trip-end" type="date" required value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="edit-trip-difficulty">Difficulty</Label>
          <Select id="edit-trip-difficulty" value={difficulty} onChange={(e) => setDifficulty(e.target.value as Difficulty)}>
            <option value="easy">Easy</option>
            <option value="moderate">Moderate</option>
            <option value="hard">Hard</option>
          </Select>
        </div>
        <div>
          <Label htmlFor="edit-trip-activity">Activity</Label>
          <Select id="edit-trip-activity" value={activity} onChange={(e) => setActivity(e.target.value as Activity)}>
            <option value="hiking">Hiking</option>
            <option value="trekking">Trekking</option>
            <option value="mountaineering">Mountaineering</option>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="edit-trip-price">Price per follower (€)</Label>
          <TextInput
            id="edit-trip-price"
            type="number"
            min={0}
            required
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
          />
        </div>
        <div>
          <Label htmlFor="edit-trip-max">Max followers</Label>
          <TextInput
            id="edit-trip-max"
            type="number"
            min={0}
            required
            value={maxFollowers}
            onChange={(e) => setMaxFollowers(Number(e.target.value))}
          />
        </div>
      </div>
      <div>
        <Label htmlFor="edit-trip-photo">Photo path</Label>
        <TextInput
          id="edit-trip-photo"
          value={photoUrl}
          onChange={(e) => setPhotoUrl(e.target.value)}
          placeholder="/images/trips/your-photo.jpg"
        />
      </div>
      <div>
        <Label htmlFor="edit-trip-notes">Description</Label>
        <TextArea id="edit-trip-notes" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>
      {updateTrip.isError && <ErrorView message={errorMessage(updateTrip.error)} />}
      <div className="flex gap-2">
        <Button type="submit" disabled={updateTrip.isPending}>
          {updateTrip.isPending ? 'Saving…' : 'Save changes'}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
