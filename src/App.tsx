import { Route, Routes } from 'react-router-dom';

import { Layout } from '@/components/Layout';
import { AuthPage } from '@/pages/AuthPage';
import { BecomeLeaderPage } from '@/pages/BecomeLeaderPage';
import { BrowsePage } from '@/pages/BrowsePage';
import { CreateTripPage } from '@/pages/CreateTripPage';
import { LandingPage } from '@/pages/LandingPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { ProfileDetailPage } from '@/pages/ProfileDetailPage';
import { TripDetailPage } from '@/pages/TripDetailPage';

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<LandingPage />} />
        <Route path="browse" element={<BrowsePage />} />
        <Route path="become-a-leader" element={<BecomeLeaderPage />} />
        <Route path="auth" element={<AuthPage />} />
        <Route path="trips/new" element={<CreateTripPage />} />
        <Route path="trips/:id" element={<TripDetailPage />} />
        <Route path="profiles/:id" element={<ProfileDetailPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
