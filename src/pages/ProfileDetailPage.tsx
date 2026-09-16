import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { Button } from '@/components/ui/Button';
import { Badge, Card } from '@/components/ui/Card';
import { Label, Select, TextArea, TextInput } from '@/components/ui/Field';
import { EmptyView, ErrorView, LoadingView } from '@/components/ui/StatusView';
import { useDeleteProfile, useProfile, useUpdateProfile } from '@/features/profiles/api';
import { errorMessage } from '@/lib/errors';
import type { ProfileType } from '@/lib/types';

export function ProfileDetailPage() {
  const { id } = useParams<{ id: string }>();
  const profileId = Number(id);
  const navigate = useNavigate();
  const { data: profile, isLoading, error } = useProfile(profileId);
  const deleteProfile = useDeleteProfile();
  const [editing, setEditing] = useState(false);

  if (isLoading) return <LoadingView label="Loading profile…" />;
  if (error) return <ErrorView message={errorMessage(error)} />;
  if (!profile) return null;

  function handleDelete() {
    if (!confirm(`Delete "${profile!.name}"? This can't be undone.`)) return;
    deleteProfile.mutate(profileId, { onSuccess: () => navigate('/profiles') });
  }

  return (
    <div className="max-w-2xl space-y-8">
      <Link to="/profiles" className="text-sm text-primary hover:underline">
        ← Back to profiles
      </Link>

      <Card className="p-6">
        {editing ? (
          <EditProfileForm
            profile={profile}
            onSaved={() => setEditing(false)}
            onCancel={() => setEditing(false)}
          />
        ) : (
          <>
            <div className="flex items-start justify-between gap-4">
              <div>
                <Badge className="capitalize">{profile.type}</Badge>
                <h1 className="mt-2 text-3xl font-bold text-foreground">{profile.name}</h1>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button variant="secondary" onClick={() => setEditing(true)}>
                  Edit
                </Button>
                <Button variant="danger" onClick={handleDelete} disabled={deleteProfile.isPending}>
                  Delete
                </Button>
              </div>
            </div>
            <p className="mt-4 text-foreground/80">{profile.bio}</p>
            {deleteProfile.isError && (
              <div className="mt-3">
                <ErrorView message={errorMessage(deleteProfile.error)} />
              </div>
            )}
          </>
        )}
      </Card>

      <div>
        <h2 className="mb-3 text-lg font-semibold text-foreground">Trips created</h2>
        {profile.travels_created.length === 0 ? (
          <EmptyView message="Nothing logged yet — trips this profile creates will show up here." />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {profile.travels_created.map((trip) => (
              <Link key={trip.id} to={`/trips/${trip.id}`}>
                <Card className="p-4">
                  <h3 className="font-semibold text-foreground">{trip.title}</h3>
                  <p className="text-sm text-muted-foreground">{trip.destination}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {trip.start_date} → {trip.end_date}
                  </p>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function EditProfileForm({
  profile,
  onSaved,
  onCancel,
}: {
  profile: { id: number; name: string; type: ProfileType; bio: string };
  onSaved: () => void;
  onCancel: () => void;
}) {
  const updateProfile = useUpdateProfile(profile.id);
  const [name, setName] = useState(profile.name);
  const [type, setType] = useState<ProfileType>(profile.type);
  const [bio, setBio] = useState(profile.bio);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    updateProfile.mutate({ name, type, bio }, { onSuccess: onSaved });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="edit-name">Name</Label>
        <TextInput id="edit-name" required value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div>
        <Label htmlFor="edit-type">Type</Label>
        <Select id="edit-type" value={type} onChange={(e) => setType(e.target.value as ProfileType)}>
          <option value="traveler">Traveler</option>
          <option value="leader">Leader</option>
          <option value="both">Both</option>
        </Select>
      </div>
      <div>
        <Label htmlFor="edit-bio">Bio</Label>
        <TextArea id="edit-bio" rows={3} value={bio} onChange={(e) => setBio(e.target.value)} />
      </div>
      {updateProfile.isError && <ErrorView message={errorMessage(updateProfile.error)} />}
      <div className="flex gap-2">
        <Button type="submit" disabled={updateProfile.isPending}>
          {updateProfile.isPending ? 'Saving…' : 'Save changes'}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
