import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/context/AuthContext';

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to={ROUTES.LOGIN} replace state={{ from: location.pathname + location.search }} />;
  }
  return children;
};

export default ProtectedRoute;
