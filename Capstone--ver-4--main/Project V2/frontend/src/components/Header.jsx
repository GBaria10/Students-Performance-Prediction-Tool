import { useNavigate, NavLink } from 'react-router-dom';
import { LogOut, Sparkles } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinkClass =
    'text-sm font-medium text-slate-200 hover:text-white transition px-3 py-2 rounded-lg hover:bg-white/5';

  return (
    <header className="flex items-center justify-between rounded-3xl border border-white/10 bg-white/5 px-6 py-4 text-white shadow-subtle">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 backdrop-blur">
          <Sparkles className="h-6 w-6 text-white" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-200">
            Student Performance AI
          </p>
          <p className="text-lg font-semibold text-white">Forecasting Studio</p>
        </div>
      </div>

      <nav className="hidden items-center gap-1 md:flex">
        <NavLink to="/dashboard" className={navLinkClass}>
          Dashboard
        </NavLink>
        <NavLink to="/predict" className={navLinkClass}>
          New Prediction
        </NavLink>
        <NavLink to="/history" className={navLinkClass}>
          History
        </NavLink>
      </nav>

      <div className="flex items-center gap-4">
        {user ? (
          <div className="hidden text-right text-sm leading-tight text-slate-200 sm:block">
            <p className="font-semibold text-white">{user.name}</p>
            <p className="text-slate-200/80">{user.email}</p>
          </div>
        ) : null}
        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2 text-sm font-semibold text-white backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/25"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;
