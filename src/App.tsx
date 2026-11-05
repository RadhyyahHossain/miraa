import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useStore } from './lib/store';
import { Shell } from './components/Shell';
import { FamilyHome } from './pages/FamilyHome';
import { Timeline } from './pages/Timeline';
import { EntryForm } from './pages/EntryForm';
import { Appointments } from './pages/Appointments';
import { AppointmentForm } from './pages/AppointmentForm';
import { Health } from './pages/Health';
import { Brief, BriefIndex, BriefPrint } from './pages/Brief';
import { AddChild, Welcome } from './pages/ChildForm';
import { Settings } from './pages/Settings';

// The landing page carries the Remotion player; load it only for the marketing route.
const Landing = lazy(() => import('./landing/Landing'));

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Suspense fallback={null}><Landing /></Suspense>} />
      <Route path="/app/*" element={<AppRoutes />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function AppRoutes() {
  const { state } = useStore();
  if (state.children.length === 0) return <Welcome />;

  return (
    <Routes>
      <Route path="brief/:id/print" element={<BriefPrint />} />
      <Route element={<Shell />}>
        <Route index element={<FamilyHome />} />
        <Route path="timeline" element={<Timeline />} />
        <Route path="timeline/new" element={<EntryForm key="new" />} />
        <Route path="timeline/:id" element={<EntryForm />} />
        <Route path="appointments" element={<Appointments />} />
        <Route path="appointments/new" element={<AppointmentForm key="new" />} />
        <Route path="appointments/:id" element={<AppointmentForm />} />
        <Route path="health" element={<Health />} />
        <Route path="brief" element={<BriefIndex />} />
        <Route path="brief/:id" element={<Brief />} />
        <Route path="children/new" element={<AddChild />} />
        <Route path="settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/app" replace />} />
      </Route>
    </Routes>
  );
}
