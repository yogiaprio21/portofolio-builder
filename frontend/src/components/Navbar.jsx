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
    `inline-flex min-h-10 items-center justify-center rounded-lg px-3 py-2 text-sm font-bold transition ${
      isActive
        ? 'bg-blue-50 text-blue-700'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
    }`;

  const mobileNavClass = ({ isActive }) =>
    `flex min-h-12 flex-col items-center justify-center rounded-xl px-2 text-[11px] font-bold transition ${
      isActive
        ? 'bg-blue-50 text-blue-700'
        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-950'
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
        className="min-h-10 rounded-lg px-3 py-2 text-sm font-bold text-red-600 transition hover:bg-red-50"
      >
        Logout
      </button>
    </>
  );

  const guestLinks = (
    <>
      <Button as={Link} to="/app/login" variant="ghost" size="sm" onClick={() => setOpen(false)}>
        Masuk
      </Button>
      <Button as={Link} to="/app/register" size="sm" onClick={() => setOpen(false)}>
        Daftar
      </Button>
    </>
  );

  return (
    <>
      <header className="fixed left-0 top-0 z-40 w-full border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur-xl">
        <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <BrandLogo to={isAuthenticated ? '/app' : '/'} markClassName="h-9 w-9" />

          <nav className="hidden items-center gap-2 md:flex">
            {isAuthenticated ? authLinks : guestLinks}
          </nav>

          <button
            type="button"
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-900 md:hidden"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-label="Buka navigasi"
          >
            <span className="text-xl leading-none">{open ? '×' : '☰'}</span>
          </button>
        </div>

        {open && (
          <div className="border-t border-slate-200 bg-white px-4 py-4 shadow-lg md:hidden">
            <nav className="grid gap-2">{isAuthenticated ? authLinks : guestLinks}</nav>
          </div>
        )}
      </header>

      {isAuthenticated && (
        <nav className="fixed bottom-0 left-0 right-0 z-40 grid grid-cols-3 border-t border-slate-200 bg-white/95 px-2 py-2 text-slate-700 shadow-2xl backdrop-blur-xl md:hidden">
          <NavLink to="/app" end className={mobileNavClass}>
            Dashboard
          </NavLink>
          <NavLink to="/app/portfolios" className={mobileNavClass}>
            Koleksi
          </NavLink>
          <NavLink to="/app/create" className={mobileNavClass}>
            Buat CV
          </NavLink>
        </nav>
      )}
    </>
  );
}
