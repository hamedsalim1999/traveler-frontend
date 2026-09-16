// Mirrors the schemas in traveler-backend's docs/swagger.json.

export type ProfileType = 'traveler' | 'leader' | 'both';

export interface Place {
  slug: string;
  name: string;
  country: string;
  continent: string;
  description: string;
  tags: string[];
}

export interface Profile {
  id: number;
  name: string;
  type: ProfileType;
  bio: string;
  created_at: string;
  updated_at: string;
}

export interface TripSummary {
  id: number;
  title: string;
  destination: string;
  start_date: string;
  end_date: string;
}

export interface ProfileDetail extends Profile {
  travels_created: TripSummary[];
}

export interface Trip {
  id: number;
  title: string;
  destination: string;
  start_date: string;
  end_date: string;
  notes: string;
  profile_id: number | null;
  created_at: string;
  updated_at: string;
}

export type CommentPhase = 'before' | 'after';

export interface Comment {
  id: number;
  trip_id: number;
  profile_id: number;
  phase: CommentPhase;
  body: string;
  created_at: string;
}

export interface CreateProfileInput {
  name: string;
  type: ProfileType;
  bio: string;
}

export type UpdateProfileInput = Partial<CreateProfileInput>;

export interface CreateTripInput {
  title: string;
  destination: string;
  start_date: string;
  end_date: string;
  notes?: string;
  profile_id: number;
}

export type UpdateTripInput = Partial<CreateTripInput>;

export interface CreateCommentInput {
  profile_id: number;
  phase: CommentPhase;
  body: string;
}

export interface ApiErrorBody {
  error: string;
}
