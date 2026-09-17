import { Link } from 'react-router-dom';

export function Logo({ className = '' }: { className?: string }) {
  return (
    <Link to="/" className={`flex items-center gap-2 ${className}`}>
      <img src="/brand/logo.png" alt="" className="h-7 w-7" />
      <span className="font-display text-xl font-semibold tracking-tight text-foreground">
        Traveler
      </span>
    </Link>
  );
}
