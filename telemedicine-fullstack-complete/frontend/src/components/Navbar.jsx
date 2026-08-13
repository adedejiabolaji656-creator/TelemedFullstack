import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Stethoscope, LayoutDashboard, Calendar, Clock, FileText, CreditCard, Stethoscope as Stetho, FolderHeart, LogOut } from 'lucide-react';

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
    { to: '/doctor/profile', label: 'Profile', icon: Stetho },
  ],
  admin: [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/doctors', label: 'Doctors', icon: Stethoscope },
    { to: '/admin/appointments', label: 'Appointments', icon: Calendar },
    { to: '/admin/payments', label: 'Payments', icon: CreditCard },
  ],
};

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const links = user ? NAV_LINKS[user.role] || [] : [];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Stethoscope className="text-blue-600" size={28} />
            <span className="text-xl font-bold text-gray-900">TeleMed</span>
          </Link>

          <div className="hidden md:flex items-center space-x-1">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                <link.icon size={16} className="mr-2" />
                {link.label}
              </NavLink>
            ))}
          </div>

          <div className="flex items-center space-x-3">
            {user ? (
              <>
                <span className="text-sm text-gray-600 hidden sm:block">
                  <span className="capitalize">{user.role}</span> · {user.name}
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
                >
                  <LogOut size={16} className="mr-1" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                  Sign In
                </Link>
                <Link to="/register" className="btn-primary px-4 py-2 text-sm">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile nav */}
        {links.length > 0 && (
          <div className="md:hidden pb-3 flex gap-1 overflow-x-auto">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-medium ${
                    isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
