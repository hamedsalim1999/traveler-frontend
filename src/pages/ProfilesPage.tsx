import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/Button';
import { Badge, Card } from '@/components/ui/Card';
import { Label, Select, TextArea, TextInput } from '@/components/ui/Field';
import { EmptyView, ErrorView, LoadingView } from '@/components/ui/StatusView';
import { TabsBtn, TabsProvider, useTabs } from '@/components/ui/tabs';
import { useCreateProfile, useProfiles } from '@/features/profiles/api';
import { errorMessage } from '@/lib/errors';
import type { ProfileType } from '@/lib/types';

const typeFilters: Array<{ label: string; value: ProfileType | 'all' }> = [
  { label: 'All', value: 'all' },
  { label: 'Traveler', value: 'traveler' },
  { label: 'Leader', value: 'leader' },
  { label: 'Both', value: 'both' },
];

export function ProfilesPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Profiles</h1>
        <p className="mt-1 text-muted-foreground">
          Travelers who go, and leaders who take others with them.
        </p>
      </div>

      <CreateProfileForm />

      <TabsProvider defaultValue="all" hover={false}>
        <div className="flex w-fit gap-1 rounded-lg bg-muted p-1">
          {typeFilters.map((f) => (
            <TabsBtn key={f.value} value={f.value}>
              <span className="relative z-10 block px-1 text-sm font-medium">{f.label}</span>
            </TabsBtn>
          ))}
        </div>
        <ProfileGrid />
      </TabsProvider>
    </div>
  );
}

function ProfileGrid() {
  const { activeTab } = useTabs();
  const typeFilter = activeTab === 'all' ? undefined : (activeTab as ProfileType);
  const { data: profiles, isLoading, error } = useProfiles(typeFilter);

  return (
    <div className="space-y-8">
      {isLoading && <LoadingView label="Loading profiles…" />}
      {error && <ErrorView message={errorMessage(error)} />}
      {profiles && profiles.length === 0 && <EmptyView message="No profiles yet." />}

      {profiles && profiles.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {profiles.map((profile) => (
            <Link key={profile.id} to={`/profiles/${profile.id}`}>
              <Card className="h-full p-5">
                <Badge className="capitalize">{profile.type}</Badge>
                <h2 className="mt-3 text-lg font-semibold text-foreground">{profile.name}</h2>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{profile.bio}</p>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function CreateProfileForm() {
  const createProfile = useCreateProfile();
  const [name, setName] = useState('');
  const [type, setType] = useState<ProfileType>('traveler');
  const [bio, setBio] = useState('');
  const [open, setOpen] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    createProfile.mutate(
      { name, type, bio },
      {
        onSuccess: () => {
          setName('');
          setBio('');
          setType('traveler');
          setOpen(false);
        },
      },
    );
  }

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} variant="secondary">
        New profile
      </Button>
    );
  }

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">New profile</h2>
        <div>
          <Label htmlFor="profile-name">Name</Label>
          <TextInput
            id="profile-name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ana Souza"
          />
        </div>
        <div>
          <Label htmlFor="profile-type">Type</Label>
          <Select
            id="profile-type"
            value={type}
            onChange={(e) => setType(e.target.value as ProfileType)}
          >
            <option value="traveler">Traveler</option>
            <option value="leader">Leader</option>
            <option value="both">Both</option>
          </Select>
        </div>
        <div>
          <Label htmlFor="profile-bio">Bio</Label>
          <TextArea
            id="profile-bio"
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Leads food tours across South America."
          />
        </div>
        {createProfile.isError && <ErrorView message={errorMessage(createProfile.error)} />}
        <div className="flex gap-2">
          <Button type="submit" disabled={createProfile.isPending}>
            {createProfile.isPending ? 'Creating…' : 'Create profile'}
          </Button>
          <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
}
