import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { homeFor, ROUTES } from '@/constants/routes';
import { useAuth } from '@/context/AuthContext';
import type { Role } from '@/types/user';

interface ProtectedRouteProps {
  children: ReactNode;
  /** Omit to allow every signed-in user. */
  roles?: Role[];
}

const ProtectedRoute = ({ children, roles }: ProtectedRouteProps) => {
  const { user, checking } = useAuth();
  const location = useLocation();

  if (checking) return null;
  if (!user) {
    return <Navigate to={ROUTES.LOGIN} replace state={{ from: location.pathname + location.search }} />;
  }
  if (roles && !roles.includes(user.role)) return <Navigate to={homeFor(user.role)} replace />;
  return children;
};

export default ProtectedRoute;
