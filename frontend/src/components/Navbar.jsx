import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import axios from 'axios';
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
  UserCog,
  FlaskConical,
  Pill,
  ArrowRightLeft,
  Bell,
} from 'lucide-react';

const NAV_LINKS = {
  patient: [
    { to: '/patient', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/patient/doctors', label: 'Find Doctors', icon: Stethoscope },
    { to: '/patient/appointments', label: 'Appointments', icon: Calendar },
    { to: '/patient/records', label: 'Records', icon: FolderHeart },
    { to: '/patient/labs', label: 'Labs', icon: FlaskConical },
    { to: '/patient/pharmacy', label: 'Pharmacy', icon: Pill },
    { to: '/patient/profile', label: 'Profile', icon: UserCog },
  ],
  doctor: [
    { to: '/doctor/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/doctor/appointments', label: 'Appointments', icon: Calendar },
    { to: '/doctor/labs', label: 'Labs', icon: FlaskConical },
    { to: '/doctor/pharmacy', label: 'Pharmacy', icon: Pill },
    { to: '/doctor/referrals', label: 'Referrals', icon: ArrowRightLeft },
    { to: '/doctor/availability', label: 'Availability', icon: Clock },
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

const NotificationBell = () => {
  const { user } = useAuth();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!user) return;
    let active = true;
    const fetchCount = async () => {
      try {
        const res = await axios.get('/api/notifications');
        if (active) setUnread(res.data.unreadCount || 0);
      } catch (error) {
        /* ignore */
      }
    };
    fetchCount();
    const timer = setInterval(fetchCount, 30000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [user?._id]);

  return (
    <Link
      to="/notifications"
      title="Notifications"
      className="relative flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
    >
      <Bell size={18} />
      {unread > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
          {unread > 9 ? '9+' : unread}
        </span>
      )}
    </Link>
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

          {user && (
            <div className="hidden items-center gap-1 lg:flex">
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/patient' || link.to === '/doctor' || link.to === '/admin' || link.to === '/doctor/dashboard' || link.to === '/admin/dashboard'}
                  className={({ isActive }) =>
                    `flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-[13px] font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-brand-50 text-brand-700 ring-1 ring-brand-100'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`
                  }
                >
                  <link.icon size={15} />
                  <span className="whitespace-nowrap">{link.label}</span>
                </NavLink>
              ))}
            </div>
          )}

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <NotificationBell />
                <div className="hidden items-center gap-2.5 rounded-full bg-slate-50 py-1 pl-1 pr-3.5 ring-1 ring-slate-200">
                  <Avatar user={user} />
                  <span className="hidden text-sm leading-tight md:block">
                    <span className="block font-semibold text-slate-800">{user.name}</span>
                    <span className="block text-[11px] font-medium capitalize text-brand-600">
                      {user.role}
                    </span>
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  title="Log out"
                  className="hidden h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500 md:flex"
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

            {/* Mobile toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 transition-colors hover:bg-slate-100 md:hidden"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
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
            {user && (
              <NavLink
                to="/notifications"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100"
              >
                <Bell size={16} />
                Notifications
              </NavLink>
            )}
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