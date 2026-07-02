import { Navigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

export default function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (roles && !roles.includes(user?.role)) {
    // Redirect to correct dashboard based on role
    if (user?.role === 'superadmin') return <Navigate to="/superadmin/dashboard" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
