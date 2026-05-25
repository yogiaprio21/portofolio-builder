import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './useAuth.js';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, status } = useAuth();
  const location = useLocation();

  if (status === 'checking') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-white">
        <div className="h-10 w-10 rounded-full border-2 border-white/20 border-t-blue-400 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    const next = encodeURIComponent(`${location.pathname}${location.search}`);
    return <Navigate to={`/app/login?next=${next}`} replace />;
  }

  return children;
}
