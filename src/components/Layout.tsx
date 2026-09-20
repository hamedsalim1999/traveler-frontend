import { Compass, Plus } from 'lucide-react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/ui/Logo';
import { Footer } from '@/components/Footer';
import { useAuth } from '@/lib/auth';

export function Layout() {
  const { profile, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <Logo />
          <nav className="flex items-center gap-6">
            <NavLink
              to="/browse"
              className={({ isActive }) =>
                `flex items-center gap-1.5 text-sm font-medium ${
                  isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`
              }
            >
              <Compass className="h-4 w-4" />
              Find a trip
            </NavLink>
          </nav>
          <div className="flex items-center gap-3">
            {profile ? (
              <>
                {profile.type !== 'Resentravel' && (
                  <Link
                    to="/trips/new"
                    className="hidden items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground sm:flex"
                  >
                    <Plus className="h-4 w-4" />
                    Publish a trip
                  </Link>
                )}
                <Link
                  to={`/profiles/${profile.id}`}
                  className="text-sm font-medium text-foreground hover:underline"
                >
                  {profile.name}
                </Link>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                >
                  Log out
                </Button>
              </>
            ) : (
              <>
                <Link to="/auth" className="text-sm font-medium text-foreground hover:underline">
                  Log in
                </Link>
                <Button size="sm" onClick={() => navigate('/auth?mode=signup')}>
                  Get started
                </Button>
              </>
            )}
          </div>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
