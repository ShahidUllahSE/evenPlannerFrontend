import { lazy, Suspense, type ReactNode } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import PanelLayout from '@/components/layout/PanelLayout';
import { homeFor, ROUTES } from '@/constants/routes';
import { useAuth } from '@/context/AuthContext';
import type { Role } from '@/types/user';
import ProtectedRoute from './ProtectedRoute';

// Pages are code-split so the login screen loads fast and the editor bundle
// is only fetched when the email composer is opened.
const Login = lazy(() => import('@/pages/Login'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Events = lazy(() => import('@/pages/Events'));
const EventDetails = lazy(() => import('@/pages/EventDetails'));
const AllUsers = lazy(() => import('@/pages/AllUsers'));
const ComposeEmail = lazy(() => import('@/pages/ComposeEmail'));
const Team = lazy(() => import('@/pages/Team'));
const EmailSettings = lazy(() => import('@/pages/EmailSettings'));
const TwilioSettings = lazy(() => import('@/pages/TwilioSettings'));
const Scanner = lazy(() => import('@/pages/Scanner'));
const ScanHistory = lazy(() => import('@/pages/ScanHistory'));
const NotFound = lazy(() => import('@/pages/NotFound'));

const MANAGERS: Role[] = ['admin', 'planner'];
const ADMINS: Role[] = ['admin'];

const only = (roles: Role[], page: ReactNode) => <ProtectedRoute roles={roles}>{page}</ProtectedRoute>;

const Home = () => {
  const { user } = useAuth();
  return <Navigate to={user ? homeFor(user.role) : ROUTES.LOGIN} replace />;
};

const AppRouter = () => (
  <BrowserRouter>
    <Suspense fallback={null}>
      <Routes>
        <Route path={ROUTES.LOGIN} element={<Login />} />
        <Route
          element={
            <ProtectedRoute>
              <PanelLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Home />} />
          <Route path={ROUTES.DASHBOARD} element={only(MANAGERS, <Dashboard />)} />
          <Route path={ROUTES.EVENTS} element={only(MANAGERS, <Events />)} />
          <Route path={ROUTES.EVENT_DETAILS} element={only(MANAGERS, <EventDetails />)} />
          <Route path={ROUTES.USERS} element={only(MANAGERS, <AllUsers />)} />
          <Route path={ROUTES.COMPOSE} element={only(MANAGERS, <ComposeEmail />)} />
          <Route path={ROUTES.TEAM} element={only(MANAGERS, <Team />)} />
          <Route path={ROUTES.EMAIL_SETTINGS} element={only(ADMINS, <EmailSettings />)} />
          <Route path={ROUTES.TWILIO_SETTINGS} element={only(ADMINS, <TwilioSettings />)} />
          <Route path={ROUTES.SCAN} element={<Scanner />} />
          <Route path={ROUTES.SCAN_HISTORY} element={<ScanHistory />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  </BrowserRouter>
);

export default AppRouter;
