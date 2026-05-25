import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../auth/useAuth.js';
import Button from './ui/Button.jsx';
import BrandLogo from './BrandLogo.jsx';

export default function Navbar() {
  const { isAuthenticated, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    setOpen(false);
    navigate('/app/login');
  };

  const navClass = ({ isActive }) =>
    `min-h-10 px-3 py-2 rounded-lg transition-colors font-medium text-sm ${
      isActive ? 'bg-white/12 text-white' : 'text-white/70 hover:text-white hover:bg-white/10'
    }`;

  const authLinks = (
    <>
      <NavLink to="/app" end className={navClass} onClick={() => setOpen(false)}>
        Dashboard
      </NavLink>
      <NavLink to="/app/portfolios" className={navClass} onClick={() => setOpen(false)}>
        Koleksi CV
      </NavLink>
      <Button as={Link} to="/app/create" size="sm" onClick={() => setOpen(false)}>
        Buat CV
      </Button>
      <button
        type="button"
        onClick={handleLogout}
        className="min-h-10 rounded-lg px-3 py-2 text-sm font-medium text-red-300 transition hover:bg-red-400/10 hover:text-red-200"
      >
        Logout
      </button>
    </>
  );

  const guestLinks = (
    <>
      <Button
        as={Link}
        to="/app/login"
        variant="ghostDark"
        size="sm"
        onClick={() => setOpen(false)}
      >
        Masuk
      </Button>
      <Button as={Link} to="/app/register" size="sm" onClick={() => setOpen(false)}>
        Daftar
      </Button>
    </>
  );

  return (
    <>
      <header className="fixed left-0 top-0 z-40 w-full border-b border-white/10 bg-slate-950/90 shadow-lg backdrop-blur-xl">
        <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <BrandLogo to={isAuthenticated ? '/app' : '/'} />

          <nav className="hidden items-center gap-2 md:flex">
            {isAuthenticated ? authLinks : guestLinks}
          </nav>

          <button
            type="button"
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white md:hidden"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-label="Buka navigasi"
          >
            <span className="text-xl">{open ? '×' : '☰'}</span>
          </button>
        </div>

        {open && (
          <div className="border-t border-white/10 bg-slate-950 px-4 py-4 md:hidden">
            <nav className="grid gap-2">{isAuthenticated ? authLinks : guestLinks}</nav>
          </div>
        )}
      </header>

      {isAuthenticated && (
        <nav className="fixed bottom-0 left-0 right-0 z-40 grid grid-cols-3 border-t border-white/10 bg-slate-950/95 px-2 py-2 text-xs text-white shadow-2xl backdrop-blur-xl md:hidden">
          <NavLink to="/app" end className={navClass}>
            Dashboard
          </NavLink>
          <NavLink to="/app/portfolios" className={navClass}>
            Koleksi
          </NavLink>
          <NavLink to="/app/create" className={navClass}>
            Buat CV
          </NavLink>
        </nav>
      )}
    </>
  );
}
