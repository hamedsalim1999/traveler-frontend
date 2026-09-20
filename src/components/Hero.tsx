import { Compass, Map, Users, Wallet } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/Button';

const stars = [
  [8, 12], [15, 28], [22, 8], [31, 40], [38, 15], [46, 32], [53, 6], [61, 22],
  [68, 44], [74, 12], [82, 35], [89, 18], [94, 48], [5, 55], [18, 60], [28, 70],
  [40, 62], [50, 75], [60, 58], [70, 68], [80, 60], [90, 72], [12, 85], [35, 90],
  [58, 88], [78, 92], [96, 82],
].map(([x, y]) => ({ x, y }));

export function Hero() {
  return (
    <section className="ridge-gradient relative overflow-hidden">
      <svg
        className="absolute inset-0 h-full w-full"
        preserveAspectRatio="none"
        viewBox="0 0 100 100"
        aria-hidden="true"
      >
        {stars.map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r={0.25 + (i % 3) * 0.1} fill="white" opacity={0.5 + (i % 4) * 0.12} />
        ))}
        <line x1="70" y1="10" x2="86" y2="22" stroke="white" strokeWidth="0.3" opacity="0.8" />

        <polygon points="0,100 0,62 18,38 34,58 46,30 62,55 78,34 100,60 100,100" fill="black" opacity="0.16" />
        <polygon points="0,100 0,75 22,48 40,68 55,42 72,64 88,46 100,66 100,100" fill="black" opacity="0.22" />
      </svg>

      <div className="relative mx-auto max-w-5xl px-4 py-20 sm:px-6 sm:py-28">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium uppercase tracking-wide text-white backdrop-blur-sm">
          <Compass className="h-3.5 w-3.5" />
          Hiking · Trekking · Mountaineering
        </span>

        <h1 className="mt-6 max-w-2xl font-display text-5xl font-bold leading-[1.05] text-white sm:text-6xl">
          Go higher with someone who knows the route.
        </h1>

        <p className="mt-5 max-w-xl text-lg text-white/85">
          Resentravel connects experienced trip leaders with followers who want to join real,
          day-by-day mountain itineraries. Leaders publish for free — followers pay only to join.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90">
            <Link to="/browse">
              <Compass className="h-4 w-4" />
              Find a trip
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="secondary"
            className="border-white/40 bg-transparent text-white hover:bg-white/10"
          >
            <Link to="/become-a-leader">Become a leader</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

const steps = [
  {
    icon: Map,
    title: 'Leaders build the itinerary',
    body: 'Day by day: travel legs, hikes, camps, summit pushes. Publishing a trip is always free.',
  },
  {
    icon: Compass,
    title: 'Followers get matched',
    body: 'Filter by leader, destination, dates or budget — or use AI-assisted recommendations tuned to your profile.',
  },
  {
    icon: Wallet,
    title: 'Transparent 5% commission',
    body: "Followers see the leader's fee and Resentravel's 5% platform fee separately at checkout. No hidden extras.",
  },
];

export function HowItWorks() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      <h2 className="font-display text-3xl font-bold text-foreground">How Resentravel works</h2>
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
        {steps.map((step) => (
          <div key={step.title} className="rounded-lg border border-border bg-card p-6">
            <step.icon className="h-6 w-6 text-primary" />
            <h3 className="mt-4 font-semibold text-foreground">{step.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{step.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function LeadOrJoinCta() {
  return (
    <section className="mx-auto max-w-5xl px-4 pb-16 sm:px-6">
      <div className="rounded-2xl bg-secondary px-6 py-14 text-center">
        <Users className="mx-auto h-8 w-8 text-primary" />
        <h2 className="mt-4 font-display text-3xl font-bold text-foreground">
          Lead one trip, or join ten
        </h2>
        <p className="mx-auto mt-3 max-w-md text-muted-foreground">
          One account, both roles. Choose leader, follower, or both when you sign up — and change
          your mind any time from your profile.
        </p>
        <Button asChild size="lg" className="mt-6">
          <Link to="/auth?mode=signup">Create your account</Link>
        </Button>
      </div>
    </section>
  );
}
