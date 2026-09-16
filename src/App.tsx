import { Route, Routes } from 'react-router-dom';

import { Layout } from '@/components/Layout';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { PlaceDetailPage } from '@/pages/PlaceDetailPage';
import { PlacesPage } from '@/pages/PlacesPage';
import { ProfileDetailPage } from '@/pages/ProfileDetailPage';
import { ProfilesPage } from '@/pages/ProfilesPage';
import { TripDetailPage } from '@/pages/TripDetailPage';
import { TripsPage } from '@/pages/TripsPage';

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<PlacesPage />} />
        <Route path="places/:slug" element={<PlaceDetailPage />} />
        <Route path="trips" element={<TripsPage />} />
        <Route path="trips/:id" element={<TripDetailPage />} />
        <Route path="profiles" element={<ProfilesPage />} />
        <Route path="profiles/:id" element={<ProfileDetailPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
