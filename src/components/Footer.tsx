import { Link } from 'react-router-dom';

import { Logo } from '@/components/ui/Logo';

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 px-4 py-12 sm:grid-cols-3 sm:px-6">
        <div>
          <Logo />
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            Leader-led hiking, trekking and mountaineering trips. Followers join, leaders lead.
          </p>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">Explore</h3>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link to="/browse" className="hover:text-foreground">
                Find a trip
              </Link>
            </li>
            <li>
              <Link to="/become-a-leader" className="hover:text-foreground">
                Become a leader
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">Coming soon</h3>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>Real card payments (Stripe)</li>
            <li>Live flight &amp; hotel pricing</li>
            <li>ID verification &amp; waivers</li>
            <li>Leader ↔ follower messaging</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Traveler. Platform commission 5%, always shown at checkout.
      </div>
    </footer>
  );
}
