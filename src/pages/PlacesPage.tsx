import { useState } from 'react';
import { Link } from 'react-router-dom';

import { Badge, Card } from '@/components/ui/Card';
import { TextInput } from '@/components/ui/Field';
import { ScrollMarquee } from '@/components/ui/scroll-marquee';
import { EmptyView, ErrorView, LoadingView } from '@/components/ui/StatusView';
import { usePlaces } from '@/features/places/api';
import { errorMessage } from '@/lib/errors';

export function PlacesPage() {
  const [continent, setContinent] = useState('');
  const [tag, setTag] = useState('');
  const { data: places, isLoading, error } = usePlaces({ continent, tag });

  return (
    <div className="space-y-10">
      <div className="-mx-4 sm:-mx-6">
        <ScrollMarquee baseVelocity={-2} className="font-bold text-foreground">
          Where to next?
        </ScrollMarquee>
      </div>

      <p className="max-w-xl text-muted-foreground">
        Five places worth the trip, picked out by travelers who've already gone.
      </p>

      <div className="flex flex-wrap gap-3">
        <TextInput
          placeholder="Filter by continent…"
          value={continent}
          onChange={(e) => setContinent(e.target.value)}
          className="max-w-xs"
        />
        <TextInput
          placeholder="Filter by tag…"
          value={tag}
          onChange={(e) => setTag(e.target.value)}
          className="max-w-xs"
        />
      </div>

      {isLoading && <LoadingView label="Loading places…" />}
      {error && <ErrorView message={errorMessage(error)} />}
      {places && places.length === 0 && (
        <EmptyView message="Nothing matches those filters. Try a different continent or tag." />
      )}

      {places && places.length > 0 && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {places.map((place) => (
            <Link key={place.slug} to={`/places/${place.slug}`}>
              <Card className="h-full p-5">
                <Badge>{place.continent}</Badge>
                <h2 className="mt-3 text-lg font-semibold text-foreground">{place.name}</h2>
                <p className="text-sm text-muted-foreground">{place.country}</p>
                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                  {place.description}
                </p>
                {place.tags.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {place.tags.map((t) => (
                      <span
                        key={t}
                        className="rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
