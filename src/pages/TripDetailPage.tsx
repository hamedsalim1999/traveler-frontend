import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { Accordion, AccordionHeader, AccordionItem, AccordionPanel } from '@/components/ui/accordion';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Label, Select, TextArea, TextInput } from '@/components/ui/Field';
import { EmptyView, ErrorView, LoadingView } from '@/components/ui/StatusView';
import { useCreateComment, useComments } from '@/features/comments/api';
import { useProfiles } from '@/features/profiles/api';
import { useDeleteTrip, useTrip, useUpdateTrip } from '@/features/trips/api';
import { errorMessage } from '@/lib/errors';
import type { CommentPhase, Trip } from '@/lib/types';

export function TripDetailPage() {
  const { id } = useParams<{ id: string }>();
  const tripId = Number(id);
  const navigate = useNavigate();
  const { data: trip, isLoading, error } = useTrip(tripId);
  const deleteTrip = useDeleteTrip();
  const [editing, setEditing] = useState(false);

  if (isLoading) return <LoadingView label="Loading trip…" />;
  if (error) return <ErrorView message={errorMessage(error)} />;
  if (!trip) return null;

  function handleDelete() {
    if (!confirm(`Delete "${trip!.title}"? This can't be undone.`)) return;
    deleteTrip.mutate(tripId, { onSuccess: () => navigate('/trips') });
  }

  return (
    <div className="max-w-2xl space-y-8">
      <Link to="/trips" className="text-sm text-primary hover:underline">
        ← Back to trips
      </Link>

      <Card className="p-6">
        {editing ? (
          <EditTripForm trip={trip} onSaved={() => setEditing(false)} onCancel={() => setEditing(false)} />
        ) : (
          <>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground">{trip.title}</h1>
                <p className="text-muted-foreground">{trip.destination}</p>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button variant="secondary" onClick={() => setEditing(true)}>
                  Edit
                </Button>
                <Button variant="danger" onClick={handleDelete} disabled={deleteTrip.isPending}>
                  Delete
                </Button>
              </div>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {trip.start_date} → {trip.end_date}
            </p>
            {trip.notes && <p className="mt-3 text-foreground/80">{trip.notes}</p>}
            {deleteTrip.isError && (
              <div className="mt-3">
                <ErrorView message={errorMessage(deleteTrip.error)} />
              </div>
            )}
          </>
        )}
      </Card>

      <CommentsSection tripId={tripId} />
    </div>
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

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    updateTrip.mutate(
      { title, destination, start_date: startDate, end_date: endDate, notes },
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
          <TextInput
            id="edit-trip-start"
            type="date"
            required
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="edit-trip-end">Returns</Label>
          <TextInput
            id="edit-trip-end"
            type="date"
            required
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>
      <div>
        <Label htmlFor="edit-trip-notes">Notes</Label>
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

function CommentsSection({ tripId }: { tripId: number }) {
  const { data: comments, isLoading, error } = useComments(tripId);
  const before = comments?.filter((c) => c.phase === 'before') ?? [];
  const after = comments?.filter((c) => c.phase === 'after') ?? [];

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-foreground">Comments</h2>

      <AddCommentForm tripId={tripId} />

      {isLoading && <LoadingView label="Loading comments…" />}
      {error && <ErrorView message={errorMessage(error)} />}

      {comments && (
        <Accordion multiple defaultValue={['before', 'after']}>
          <AccordionItem value="before">
            <AccordionHeader>Before the trip ({before.length})</AccordionHeader>
            <AccordionPanel>
              {before.length === 0 ? (
                <EmptyView message="No comments yet." />
              ) : (
                before.map((c) => <CommentRow key={c.id} body={c.body} profileId={c.profile_id} />)
              )}
            </AccordionPanel>
          </AccordionItem>
          <AccordionItem value="after">
            <AccordionHeader>After the trip ({after.length})</AccordionHeader>
            <AccordionPanel>
              {after.length === 0 ? (
                <EmptyView message="No comments yet." />
              ) : (
                after.map((c) => <CommentRow key={c.id} body={c.body} profileId={c.profile_id} />)
              )}
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      )}
    </div>
  );
}

function CommentRow({ body, profileId }: { body: string; profileId: number }) {
  return (
    <div className="rounded-md border border-border bg-card p-3">
      <p className="text-sm text-foreground">{body}</p>
      <p className="mt-1.5 text-xs text-muted-foreground">Profile #{profileId}</p>
    </div>
  );
}

function AddCommentForm({ tripId }: { tripId: number }) {
  const { data: profiles } = useProfiles();
  const createComment = useCreateComment(tripId);
  const [profileId, setProfileId] = useState('');
  const [phase, setPhase] = useState<CommentPhase>('before');
  const [body, setBody] = useState('');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    createComment.mutate(
      { profile_id: Number(profileId), phase, body },
      { onSuccess: () => setBody('') },
    );
  }

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="comment-profile">Profile</Label>
            <Select
              id="comment-profile"
              required
              value={profileId}
              onChange={(e) => setProfileId(e.target.value)}
            >
              <option value="" disabled>
                Select a profile…
              </option>
              {profiles?.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="comment-phase">Phase</Label>
            <Select
              id="comment-phase"
              value={phase}
              onChange={(e) => setPhase(e.target.value as CommentPhase)}
            >
              <option value="before">Before</option>
              <option value="after">After</option>
            </Select>
          </div>
        </div>
        <div>
          <Label htmlFor="comment-body">Comment</Label>
          <TextArea
            id="comment-body"
            rows={2}
            required
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Can't wait for this one!"
          />
        </div>
        {createComment.isError && <ErrorView message={errorMessage(createComment.error)} />}
        <Button type="submit" disabled={createComment.isPending}>
          {createComment.isPending ? 'Posting…' : 'Post comment'}
        </Button>
      </form>
    </Card>
  );
}
