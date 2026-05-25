import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/useAuth.js';

export default function Navbar() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/app/login');
  };

  const navClass = ({ isActive }) =>
    `px-4 py-2 rounded-xl transition-colors font-medium text-sm ${
      isActive ? 'bg-white/12 text-white' : 'text-white/75 hover:text-white hover:bg-white/10'
    }`;

  return (
    <header className="fixed top-0 left-0 w-full z-40 bg-slate-900/80 backdrop-blur-xl border-b border-white/10 shadow-lg">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/app" className="text-2xl font-extrabold tracking-tight">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400 hover:from-blue-300 hover:to-indigo-300 transition-all duration-300">
            PortoBuilder
          </span>
        </Link>

        <nav className="flex gap-3 items-center">
          {isAuthenticated ? (
            <>
              <NavLink to="/app" end className={navClass}>
                Dashboard
              </NavLink>
              <NavLink
                to="/app/portfolios"
                className={navClass}
              >
                Koleksi CV
              </NavLink>
              <NavLink
                to="/app/create"
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transform hover:-translate-y-0.5 transition-all duration-300 font-medium text-sm"
              >
                Buat CV
              </NavLink>
              <button
                onClick={handleLogout}
                className="ml-2 px-4 py-2 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-colors font-medium text-sm"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/app/login"
                className="px-5 py-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors font-medium text-sm"
              >
                Masuk
              </Link>
              <Link
                to="/app/register"
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transform hover:-translate-y-0.5 transition-all duration-300 font-medium text-sm"
              >
                Daftar
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
