import { Mountain } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Label, Select, TextArea, TextInput } from '@/components/ui/Field';
import { ErrorView } from '@/components/ui/StatusView';
import { useAuth } from '@/lib/auth';
import { errorMessage } from '@/lib/errors';
import type { ProfileType } from '@/lib/types';

export function AuthPage() {
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<'login' | 'signup'>(
    searchParams.get('mode') === 'signup' ? 'signup' : 'login',
  );
  const next = searchParams.get('next') || '/';
  const navigate = useNavigate();
  const { login, signup } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState<ProfileType>(
    searchParams.get('type') === 'leader' ? 'leader' : 'traveler',
  );
  const [bio, setBio] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<unknown>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      if (mode === 'login') {
        await login({ email, password });
      } else {
        await signup({ email, password, name, type, bio });
      }
      navigate(next);
    } catch (err) {
      setError(err);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-16 sm:px-6">
      <Card className="w-full p-8">
        <div className="flex flex-col items-center text-center">
          <Mountain className="h-8 w-8 text-primary" />
          <h1 className="mt-3 font-display text-2xl font-bold text-foreground">
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === 'login'
              ? 'Sign in to manage your trips and bookings.'
              : 'One account, both roles — traveler, leader, or both.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {mode === 'signup' && (
            <div>
              <Label htmlFor="auth-name">Name</Label>
              <TextInput id="auth-name" required value={name} onChange={(e) => setName(e.target.value)} />
            </div>
          )}
          <div>
            <Label htmlFor="auth-email">Email</Label>
            <TextInput
              id="auth-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="auth-password">Password</Label>
            <TextInput
              id="auth-password"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {mode === 'signup' && (
            <>
              <div>
                <Label htmlFor="auth-type">I am a…</Label>
                <Select id="auth-type" value={type} onChange={(e) => setType(e.target.value as ProfileType)}>
                  <option value="traveler">Follower — I want to join trips</option>
                  <option value="leader">Leader — I want to publish trips</option>
                  <option value="both">Both</option>
                </Select>
              </div>
              <div>
                <Label htmlFor="auth-bio">Bio (optional)</Label>
                <TextArea id="auth-bio" rows={2} value={bio} onChange={(e) => setBio(e.target.value)} />
              </div>
            </>
          )}

          {error != null && <ErrorView message={errorMessage(error)} />}

          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Sign up'}
          </Button>
        </form>

        <div className="my-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground">or</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <Button variant="secondary" className="w-full" disabled title="Coming soon">
          Continue with Google
        </Button>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          {mode === 'login' ? (
            <>
              New to Traveler?{' '}
              <button type="button" onClick={() => setMode('signup')} className="font-medium text-primary hover:underline">
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button type="button" onClick={() => setMode('login')} className="font-medium text-primary hover:underline">
                Log in
              </button>
            </>
          )}
        </p>
      </Card>

      <Link to="/" className="mt-6 text-sm text-muted-foreground hover:text-foreground">
        ← Back to Traveler
      </Link>
    </div>
  );
}
