// Mirrors the schemas in Resentravel-backend's docs/swagger.json.

export type ProfileType = 'Resentravel' | 'leader' | 'both';
export type ExperienceLevel = 'beginner' | 'medium' | 'expert';

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
  experience_level: ExperienceLevel | null;
  age: number | null;
  avatar_url: string;
  created_at: string;
  updated_at: string;
}

export interface TripSummary {
  id: number;
  title: string;
  destination: string;
  start_date: string;
  end_date: string;
  price_cents: number;
  photo_url: string;
}

export interface ProfileDetail extends Profile {
  travels_created: TripSummary[];
  average_rating: number | null;
  review_count: number;
}

export type Difficulty = 'easy' | 'moderate' | 'hard';
export type Activity = 'hiking' | 'trekking' | 'mountaineering';

export interface Trip {
  id: number;
  title: string;
  destination: string;
  start_date: string;
  end_date: string;
  notes: string;
  difficulty: Difficulty;
  activity: Activity;
  price_cents: number;
  max_followers: number;
  photo_url: string;
  followers_count: number;
  profile_id: number | null;
  created_at: string;
  updated_at: string;
}

export interface TripDay {
  id: number;
  trip_id: number;
  day_number: number;
  title: string;
  description: string;
}

export interface Follow {
  id: number;
  trip_id: number;
  profile: ProfileRef;
  joined_at: string;
}

export interface ProfileRef {
  id: number;
  name: string;
  type: ProfileType;
}

export interface Review {
  id: number;
  trip_id: number;
  profile: ProfileRef;
  rating: number;
  body: string;
  created_at: string;
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
  experience_level?: ExperienceLevel | null;
  age?: number | null;
  avatar_url?: string;
}

export type UpdateProfileInput = Partial<CreateProfileInput>;

export interface CreateTripInput {
  title: string;
  destination: string;
  start_date: string;
  end_date: string;
  notes?: string;
  difficulty: Difficulty;
  activity: Activity;
  price_cents: number;
  max_followers: number;
  photo_url?: string;
  profile_id: number;
}

export type UpdateTripInput = Partial<CreateTripInput>;

export interface CreateTripDayInput {
  day_number: number;
  title: string;
  description?: string;
}

export type UpdateTripDayInput = CreateTripDayInput;

export interface CreateReviewInput {
  rating: number;
  body: string;
}

export interface CreateCommentInput {
  profile_id: number;
  phase: CommentPhase;
  body: string;
}

export interface SignupInput {
  email: string;
  password: string;
  name: string;
  type: ProfileType;
  bio?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface SessionResponse {
  token: string;
  profile: Profile;
}

export interface ApiErrorBody {
  error: string;
}
