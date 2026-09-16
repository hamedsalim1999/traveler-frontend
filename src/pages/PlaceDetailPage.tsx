import { Link, useParams } from 'react-router-dom';

import { Badge, Card } from '@/components/ui/Card';
import { ErrorView, LoadingView } from '@/components/ui/StatusView';
import { usePlace } from '@/features/places/api';
import { errorMessage } from '@/lib/errors';

export function PlaceDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: place, isLoading, error } = usePlace(slug);

  if (isLoading) return <LoadingView label="Loading place…" />;
  if (error) return <ErrorView message={errorMessage(error)} />;
  if (!place) return null;

  return (
    <div className="max-w-2xl space-y-6">
      <Link to="/" className="text-sm text-primary hover:underline">
        ← Back to places
      </Link>

      <Card className="p-8">
        <Badge>
          {place.continent} · {place.country}
        </Badge>
        <h1 className="mt-3 text-4xl font-bold text-foreground">{place.name}</h1>
        <p className="mt-4 text-foreground/80">{place.description}</p>
        {place.tags.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-1.5">
            {place.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </Card>

      <Link
        to={`/trips?destination=${encodeURIComponent(place.name)}`}
        className="inline-block text-sm font-medium text-primary hover:underline"
      >
        See trips to {place.name} →
      </Link>
    </div>
  );
}
