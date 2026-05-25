import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './useAuth.js';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, status } = useAuth();
  const location = useLocation();

  if (status === 'checking') {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-slate-950">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    const next = encodeURIComponent(`${location.pathname}${location.search}`);
    return <Navigate to={`/app/login?next=${next}`} replace />;
  }

  return children;
}
