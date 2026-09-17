import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { StarRating } from '@/components/StarRating';
import { Button } from '@/components/ui/Button';
import { Badge, Card } from '@/components/ui/Card';
import { Label, Select, TextArea, TextInput } from '@/components/ui/Field';
import { EmptyView, ErrorView, LoadingView } from '@/components/ui/StatusView';
import { useDeleteProfile, useProfile, useUpdateProfile } from '@/features/profiles/api';
import { useAuth } from '@/lib/auth';
import { errorMessage } from '@/lib/errors';
import { formatPrice } from '@/lib/money';
import type { ExperienceLevel, ProfileType } from '@/lib/types';

export function ProfileDetailPage() {
  const { id } = useParams<{ id: string }>();
  const profileId = Number(id);
  const navigate = useNavigate();
  const { profile: signedInProfile } = useAuth();
  const { data: profile, isLoading, error } = useProfile(profileId);
  const deleteProfile = useDeleteProfile();
  const [editing, setEditing] = useState(false);

  if (isLoading) return <LoadingView label="Loading profile…" />;
  if (error) return <ErrorView message={errorMessage(error)} />;
  if (!profile) return null;

  const isOwnProfile = signedInProfile?.id === profile.id;

  function handleDelete() {
    if (!confirm(`Delete "${profile!.name}"? This can't be undone.`)) return;
    deleteProfile.mutate(profileId, { onSuccess: () => navigate('/') });
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8 px-4 py-10 sm:px-6">
      <Link to="/browse" className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
        <ArrowLeft className="h-4 w-4" />
        Back to trips
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
              <div className="flex items-center gap-4">
                {profile.avatar_url && (
                  <img src={profile.avatar_url} alt="" className="h-16 w-16 rounded-full object-cover" />
                )}
                <div>
                  <Badge className="capitalize">{profile.type}</Badge>
                  <h1 className="mt-2 font-display text-3xl font-bold text-foreground">{profile.name}</h1>
                  {(profile.experience_level || profile.age) && (
                    <p className="text-sm capitalize text-muted-foreground">
                      {[profile.experience_level, profile.age].filter(Boolean).join(' · ')}
                    </p>
                  )}
                  {profile.average_rating != null && (
                    <div className="mt-1 flex items-center gap-1.5">
                      <StarRating rating={profile.average_rating} />
                      <span className="text-xs text-muted-foreground">
                        {profile.average_rating.toFixed(1)} ({profile.review_count})
                      </span>
                    </div>
                  )}
                </div>
              </div>
              {isOwnProfile && (
                <div className="flex shrink-0 gap-2">
                  <Button variant="secondary" size="sm" onClick={() => setEditing(true)}>
                    <Pencil className="h-4 w-4" />
                    Edit
                  </Button>
                  <Button variant="danger" size="sm" onClick={handleDelete} disabled={deleteProfile.isPending}>
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </div>
              )}
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
        <h2 className="mb-3 font-display text-2xl font-semibold text-foreground">Trips led</h2>
        {profile.travels_created.length === 0 ? (
          <EmptyView message="Nothing published yet — trips this profile leads will show up here." />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {profile.travels_created.map((trip) => (
              <Link key={trip.id} to={`/trips/${trip.id}`}>
                <Card className="p-4">
                  <h3 className="font-semibold text-foreground">{trip.title}</h3>
                  <p className="text-sm text-muted-foreground">{trip.destination}</p>
                  <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      {trip.start_date} → {trip.end_date}
                    </span>
                    <span className="font-medium text-foreground">{formatPrice(trip.price_cents)}</span>
                  </div>
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
  profile: {
    id: number;
    name: string;
    type: ProfileType;
    bio: string;
    experience_level: ExperienceLevel | null;
    age: number | null;
    avatar_url: string;
  };
  onSaved: () => void;
  onCancel: () => void;
}) {
  const updateProfile = useUpdateProfile(profile.id);
  const [name, setName] = useState(profile.name);
  const [type, setType] = useState<ProfileType>(profile.type);
  const [bio, setBio] = useState(profile.bio);
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel | ''>(
    profile.experience_level ?? '',
  );
  const [age, setAge] = useState(profile.age ?? '');
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    updateProfile.mutate(
      {
        name,
        type,
        bio,
        experience_level: experienceLevel || null,
        age: age === '' ? null : Number(age),
        avatar_url: avatarUrl,
      },
      { onSuccess: onSaved },
    );
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
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="edit-experience">Experience level</Label>
          <Select
            id="edit-experience"
            value={experienceLevel}
            onChange={(e) => setExperienceLevel(e.target.value as ExperienceLevel | '')}
          >
            <option value="">Not set</option>
            <option value="beginner">Beginner</option>
            <option value="medium">Medium</option>
            <option value="expert">Expert</option>
          </Select>
        </div>
        <div>
          <Label htmlFor="edit-age">Age</Label>
          <TextInput
            id="edit-age"
            type="number"
            min={13}
            max={120}
            value={age}
            onChange={(e) => setAge(e.target.value === '' ? '' : Number(e.target.value))}
          />
        </div>
      </div>
      <div>
        <Label htmlFor="edit-avatar">Avatar URL</Label>
        <TextInput id="edit-avatar" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} />
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
