import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';
import {
  LayoutDashboard,
  Calendar,
  Clock,
  FileText,
  CreditCard,
  Stethoscope,
  FolderHeart,
  LogOut,
  Menu,
  X,
} from 'lucide-react';

const NAV_LINKS = {
  patient: [
    { to: '/patient/doctors', label: 'Find Doctors', icon: Stethoscope },
    { to: '/patient/appointments', label: 'Appointments', icon: Calendar },
    { to: '/patient/records', label: 'Records', icon: FolderHeart },
    { to: '/patient/prescriptions', label: 'Prescriptions', icon: FileText },
    { to: '/patient/payments', label: 'Payments', icon: CreditCard },
  ],
  doctor: [
    { to: '/doctor/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/doctor/appointments', label: 'Appointments', icon: Calendar },
    { to: '/doctor/availability', label: 'Availability', icon: Clock },
    { to: '/doctor/prescriptions', label: 'Prescriptions', icon: FileText },
    { to: '/doctor/profile', label: 'Profile', icon: Stethoscope },
  ],
  admin: [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/doctors', label: 'Doctors', icon: Stethoscope },
    { to: '/admin/appointments', label: 'Appointments', icon: Calendar },
    { to: '/admin/payments', label: 'Payments', icon: CreditCard },
  ],
};

const ROLE_STYLES = {
  patient: { avatar: 'from-brand-500 to-brand-600', ring: 'ring-brand-200' },
  doctor: { avatar: 'from-mint-500 to-mint-600', ring: 'ring-mint-100' },
  admin: { avatar: 'from-accent-500 to-accent-600', ring: 'ring-accent-100' },
};

const Avatar = ({ user }) => {
  const style = ROLE_STYLES[user.role] || ROLE_STYLES.patient;
  const initials = (user.name || '?')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  return (
    <span
      className={`flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br ${style.avatar} text-[11px] font-bold text-white shadow-sm ring-2 ${style.ring}`}
      aria-hidden="true"
    >
      {initials}
    </span>
  );
};

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = user ? NAV_LINKS[user.role] || [] : [];

  const handleLogout = () => {
    setMobileOpen(false);
    logout();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-40 border-b border-slate-200/60 bg-white/75 backdrop-blur-xl supports-backdrop-filter:bg-white/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Logo to="/" size={34} wordmarkClassName="text-lg" />
          <div className="hidden items-center gap-1 md:flex">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-brand-50 text-brand-700 ring-1 ring-brand-100'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`
                }
              >
                <link.icon size={15} />
                {link.label}
              </NavLink>
            ))}
          </div>

          <div className="hidden items-center gap-3 md:flex">
            {user ? (
              <>
                <div className="flex items-center gap-2.5 rounded-full bg-slate-50 py-1 pl-1 pr-3.5 ring-1 ring-slate-200">
                  <Avatar user={user} />
                  <span className="text-sm leading-tight">
                    <span className="block font-semibold text-slate-800">{user.name}</span>
                    <span className="block text-[11px] font-medium capitalize text-brand-600">
                      {user.role}
                    </span>
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  title="Log out"
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500"
                >
                  <LogOut size={17} />
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
                >
                  Sign In
                </Link>
                <Link to="/register" className="btn-primary px-4 py-2 text-sm">
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 transition-colors hover:bg-slate-100 md:hidden"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="animate-fade-in space-y-1 border-t border-slate-100 pt-3 pb-4 md:hidden">
            {user && (
              <div className="mb-2 flex items-center gap-2.5 px-2">
                <Avatar user={user} />
                <span className="text-sm">
                  <span className="block font-semibold text-slate-800">{user.name}</span>
                  <span className="block text-xs capitalize text-brand-600">{user.role}</span>
                </span>
              </div>
            )}
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium ${
                    isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100'
                  }`
                }
              >
                <link.icon size={16} />
                {link.label}
              </NavLink>
            ))}
            {user ? (
              <button
                onClick={handleLogout}
                className="mt-2 flex w-full items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50"
              >
                <LogOut size={16} />
                Logout
              </button>
            ) : (
              <div className="flex gap-2 pt-2">
                <Link to="/login" onClick={() => setMobileOpen(false)} className="btn-secondary flex-1 py-2 text-sm">
                  Sign In
                </Link>
                <Link to="/register" onClick={() => setMobileOpen(false)} className="btn-primary flex-1 py-2 text-sm">
                  Get Started
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
