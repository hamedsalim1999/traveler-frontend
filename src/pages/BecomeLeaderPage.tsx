import { Compass, Map, Wallet } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/lib/auth';

const perks = [
  { icon: Map, text: 'Publish a day-by-day itinerary for free — no listing fees.' },
  { icon: Compass, text: 'Set your own price per follower and a follower cap.' },
  { icon: Wallet, text: 'Resentravel takes a transparent 5% platform fee, shown at checkout — nothing hidden.' },
];

export function BecomeLeaderPage() {
  const { profile } = useAuth();

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
      <h1 className="font-display text-4xl font-bold text-foreground">Lead your own trip</h1>
      <p className="mt-3 text-muted-foreground">
        Turn a route you know well into a trip others can join. Publish the itinerary, set your
        price, and Resentravel handles the rest.
      </p>

      <div className="mt-8 space-y-3 text-left">
        {perks.map((perk) => (
          <Card key={perk.text} className="flex items-start gap-3 p-4">
            <perk.icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <p className="text-sm text-foreground">{perk.text}</p>
          </Card>
        ))}
      </div>

      <Button asChild size="lg" className="mt-8">
        {profile ? (
          <Link to="/trips/new">Publish a trip</Link>
        ) : (
          <Link to="/auth?mode=signup&type=leader&next=/trips/new">Sign up as a leader</Link>
        )}
      </Button>
    </div>
  );
}
