import { Link } from 'react-router-dom';
import Logo from './Logo';
import {
  Mail,
  Twitter,
  Linkedin,
  Instagram,
  MapPin,
  Phone,
} from 'lucide-react';

const FOOTER_COLS = [
  {
    title: 'Platform',
    links: [
      { label: 'Find Doctors', to: '/patient/doctors' },
      { label: 'Book Appointment', to: '/patient/doctors' },
      { label: 'Prescriptions', to: '/patient/prescriptions' },
      { label: 'Medical Records', to: '/medical-records' },
    ],
  },
  {
    title: 'For Providers',
    links: [
      { label: 'Doctor Dashboard', to: '/doctor/dashboard' },
      { label: 'Manage Availability', to: '/doctor/availability' },
      { label: 'Create Prescription', to: '/doctor/dashboard' },
      { label: 'Earnings & Payments', to: '/payments' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Us', to: '/' },
      { label: 'Careers', to: '/' },
      { label: 'Privacy Policy', to: '/' },
      { label: 'Terms of Service', to: '/' },
    ],
  },
];

const Footer = () => {
  return (
    <footer className="relative mt-20 overflow-hidden bg-slate-950 text-slate-300">
      {/* decorative glow */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[42rem] -translate-x-1/2 rounded-full bg-brand-600/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 right-0 h-64 w-96 rounded-full bg-accent-600/15 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 py-14 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Logo
              to="/"
              size={36}
              light
              markClassName="opacity-90"
              wordmarkClassName="text-white"
            />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-400">
              Connecting patients with verified doctors through secure video consultations,
              digital prescriptions, and instant health records — care that travels with you.
            </p>
            <div className="mt-6 space-y-2.5 text-sm text-slate-400">
              <p className="flex items-center gap-2">
                <MapPin size={15} className="text-brand-400" /> 3 Boyle Street, Ogba, Lagos 100261, Nigeria
              </p>
              <p className="flex items-center gap-2">
                <Phone size={15} className="text-brand-400" /> +234 1 555 0170
              </p>
              <p className="flex items-center gap-2">
                <Mail size={15} className="text-brand-400" /> support@telemedicine.com
              </p>
            </div>
            <div className="mt-6 flex gap-3">
              {[Twitter, Linkedin, Instagram].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-slate-400 ring-1 ring-white/10 transition-all hover:bg-brand-600 hover:text-white hover:ring-brand-500"
                  aria-label="Social link"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {FOOTER_COLS.map((col) => (
            <div key={col.title}>
              <h4 className="font-display text-sm font-bold uppercase tracking-wider text-white">
                {col.title}
              </h4>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="group inline-flex items-center text-sm text-slate-400 transition-colors hover:text-brand-300"
                    >
                      <span className="mr-0 h-px w-0 bg-brand-400 transition-all duration-200 group-hover:mr-1.5 group-hover:w-3" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center justify-between gap-3 border-t border-white/10 py-6 sm:flex-row">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} TeleMed Inc. All rights reserved.
          </p>
          <p className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-mint-500 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-mint-500" />
            </span>
            All systems operational · HIPAA compliant
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
