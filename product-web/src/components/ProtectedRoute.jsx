import { Navigate } from 'react-router-dom';
import { getUser, hasRole } from '../lib/auth';

export default function ProtectedRoute({ children, roles }) {
  const user = getUser();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !hasRole(user, roles)) return <Navigate to="/dashboard" replace />;
  return children;
}
