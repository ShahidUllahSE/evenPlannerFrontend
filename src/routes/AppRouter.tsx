import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import PanelLayout from '@/components/layout/PanelLayout';
import { ROUTES } from '@/constants/routes';
import ProtectedRoute from './ProtectedRoute';

// Pages are code-split so the login screen loads fast and the editor bundle
// is only fetched when the email composer is opened.
const Login = lazy(() => import('@/pages/Login'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Events = lazy(() => import('@/pages/Events'));
const EventDetails = lazy(() => import('@/pages/EventDetails'));
const AllUsers = lazy(() => import('@/pages/AllUsers'));
const ComposeEmail = lazy(() => import('@/pages/ComposeEmail'));
const NotFound = lazy(() => import('@/pages/NotFound'));

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
          <Route index element={<Navigate to={ROUTES.DASHBOARD} replace />} />
          <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
          <Route path={ROUTES.EVENTS} element={<Events />} />
          <Route path={ROUTES.EVENT_DETAILS} element={<EventDetails />} />
          <Route path={ROUTES.USERS} element={<AllUsers />} />
          <Route path={ROUTES.COMPOSE} element={<ComposeEmail />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  </BrowserRouter>
);

export default AppRouter;
