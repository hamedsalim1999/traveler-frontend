import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Label, Select, TextArea, TextInput } from '@/components/ui/Field';
import { ErrorView } from '@/components/ui/StatusView';
import { useCreateTrip } from '@/features/trips/api';
import { useAuth } from '@/lib/auth';
import { errorMessage } from '@/lib/errors';
import type { Activity, Difficulty } from '@/lib/types';

export function CreateTripPage() {
  const { profile, isLoading } = useAuth();
  const navigate = useNavigate();
  const createTrip = useCreateTrip();

  const [title, setTitle] = useState('');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [notes, setNotes] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('moderate');
  const [activity, setActivity] = useState<Activity>('hiking');
  const [price, setPrice] = useState(0);
  const [maxFollowers, setMaxFollowers] = useState(8);
  const [photoUrl, setPhotoUrl] = useState('');

  if (!isLoading && !profile) {
    return <Navigate to="/auth?mode=signup&type=leader&next=/trips/new" replace />;
  }
  if (!profile) return null;

  if (profile.type === 'traveler') {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center sm:px-6">
        <h1 className="font-display text-2xl font-bold text-foreground">Become a leader first</h1>
        <p className="mt-2 text-muted-foreground">
          Your profile is set to "traveler". Switch it to "leader" or "both" from your profile
          page to publish a trip.
        </p>
        <Button className="mt-6" onClick={() => navigate(`/profiles/${profile.id}`)}>
          Go to my profile
        </Button>
      </div>
    );
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    createTrip.mutate(
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
        profile_id: profile!.id,
      },
      { onSuccess: (trip) => navigate(`/trips/${trip.id}`) },
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl font-bold text-foreground">Publish a trip</h1>
      <p className="mt-1 text-muted-foreground">
        Publishing is always free — you only pay nothing; followers pay to join.
      </p>

      <Card className="mt-6 p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="new-title">Title</Label>
            <TextInput id="new-title" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Lycian Way Coastal Hike" />
          </div>
          <div>
            <Label htmlFor="new-destination">Destination</Label>
            <TextInput id="new-destination" required value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="Fethiye, Türkiye" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="new-start">Departs</Label>
              <TextInput id="new-start" type="date" required value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="new-end">Returns</Label>
              <TextInput id="new-end" type="date" required value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="new-difficulty">Difficulty</Label>
              <Select id="new-difficulty" value={difficulty} onChange={(e) => setDifficulty(e.target.value as Difficulty)}>
                <option value="easy">Easy</option>
                <option value="moderate">Moderate</option>
                <option value="hard">Hard</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="new-activity">Activity</Label>
              <Select id="new-activity" value={activity} onChange={(e) => setActivity(e.target.value as Activity)}>
                <option value="hiking">Hiking</option>
                <option value="trekking">Trekking</option>
                <option value="mountaineering">Mountaineering</option>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="new-price">Price per follower (€)</Label>
              <TextInput id="new-price" type="number" min={0} required value={price} onChange={(e) => setPrice(Number(e.target.value))} />
            </div>
            <div>
              <Label htmlFor="new-max">Max followers</Label>
              <TextInput id="new-max" type="number" min={1} required value={maxFollowers} onChange={(e) => setMaxFollowers(Number(e.target.value))} />
            </div>
          </div>
          <div>
            <Label htmlFor="new-photo">Photo path</Label>
            <TextInput
              id="new-photo"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              placeholder="/images/trips/your-photo.jpg"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Add the file to <code>public/images/trips/</code> in the frontend and reference it
              here — no external image hosting needed. Leave blank for a placeholder.
            </p>
          </div>
          <div>
            <Label htmlFor="new-notes">Description</Label>
            <TextArea id="new-notes" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Five relaxed days of coastal trail, ruins and swimming stops." />
          </div>
          {createTrip.isError && <ErrorView message={errorMessage(createTrip.error)} />}
          <Button type="submit" disabled={createTrip.isPending}>
            {createTrip.isPending ? 'Publishing…' : 'Publish trip'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
