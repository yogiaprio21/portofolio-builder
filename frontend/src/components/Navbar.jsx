import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Check authentication status whenever the route changes
  useEffect(() => {
    const token = window.localStorage.getItem('ACCESS_TOKEN');
    setIsLoggedIn(!!token);
  }, [location.pathname]);

  const handleLogout = () => {
    window.localStorage.removeItem('ACCESS_TOKEN');
    window.localStorage.removeItem('USER');
    setIsLoggedIn(false);
    navigate('/app/login');
  };

  return (
    <header className="fixed top-0 left-0 w-full z-40 bg-slate-900/80 backdrop-blur-xl border-b border-white/10 shadow-lg">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* LOGO */}
        <Link to="/app" className="text-2xl font-extrabold tracking-tight">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400 hover:from-blue-300 hover:to-indigo-300 transition-all duration-300">
            PortoBuilder
          </span>
        </Link>

        {/* NAV */}
        <nav className="flex gap-3 items-center">
          {isLoggedIn ? (
            <>
              <Link
                to="/app/portfolios"
                className="px-4 py-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors font-medium text-sm"
              >
                My Portfolios
              </Link>
              <Link
                to="/app/create"
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transform hover:-translate-y-0.5 transition-all duration-300 font-medium text-sm"
              >
                Buat CV
              </Link>
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
