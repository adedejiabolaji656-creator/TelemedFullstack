import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  Stethoscope,
  Calendar,
  FolderHeart,
  FileText,
  Bell,
  FlaskConical,
  Pill,
  ArrowRightLeft,
  CreditCard,
  UserCog,
  HeartHandshake,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';

const PROFILE_FIELDS = [
  ['dateOfBirth', 'dateOfBirth'],
  ['gender', 'gender'],
  ['bloodType', 'bloodType'],
  ['allergies', 'allergies'],
  ['address.city', 'address.city'],
  ['emergencyContact.name', 'emergencyContact.name'],
  ['insurance.provider', 'insurance.provider'],
];

const completionOf = (profile) => {
  if (!profile) return 0;
  const done = PROFILE_FIELDS.filter(([path]) => {
    const value = path.split('.').reduce((o, k) => (o || {})[k], profile);
    if (Array.isArray(value)) return value.length > 0;
    return Boolean(value);
  }).length;
  return Math.round((done / PROFILE_FIELDS.length) * 100);
};

const Stat = ({ icon: Icon, label, value, to, tint }) => (
  <Link
    to={to}
    className="card group flex items-center gap-4 p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lift"
  >
    <span
      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${tint} text-white shadow-md`}
    >
      <Icon size={22} />
    </span>
    <span className="min-w-0">
      <span className="block font-display text-2xl font-extrabold text-slate-900">{value}</span>
      <span className="block text-xs font-medium text-slate-400">{label}</span>
    </span>
  </Link>
);

const QUICK_LINKS = [
  { label: 'Find a Doctor', desc: 'Search Nigerian specialists by specialty, city or fee', to: '/patient/doctors', icon: Stethoscope },
  { label: 'Lab Results', desc: 'Order, track and view your lab tests', to: '/patient/labs', icon: FlaskConical },
  { label: 'Pharmacy', desc: 'Buy medication from partner pharmacies', to: '/patient/pharmacy', icon: Pill },
  { label: 'Referrals', desc: 'See specialist referrals from your doctors', to: '/patient/referrals', icon: ArrowRightLeft },
  { label: 'Health Profile', desc: 'Blood type, allergies, HMO & emergency contact', to: '/patient/profile', icon: UserCog },
  { label: 'Medical Records', desc: 'Consultations, labs and vaccinations', to: '/patient/records', icon: FolderHeart },
];

const PatientDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ appointments: [], prescriptions: 0, records: 0, unread: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [apts, rx, recs, notif] = await Promise.all([
          axios.get('/api/appointments'),
          axios.get('/api/prescriptions'),
          axios.get('/api/medical-records'),
          axios.get('/api/notifications'),
        ]);
        setStats({
          appointments: apts.data.appointments || [],
          prescriptions: rx.data.count || 0,
          records: recs.data.count || 0,
          unread: notif.data.unreadCount || 0,
        });
      } catch (error) {
        console.error('Dashboard load error:', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const upcoming = stats.appointments.filter((a) => a.status === 'confirmed' && new Date(a.scheduledDate) >= new Date()).slice(0, 3);
  const past = stats.appointments.filter((a) => a.status === 'completed').slice(0, 3);
  const completion = completionOf(user?.profile);

  const firstName = (user?.name || '').split(' ').slice(-1)[0] || '';

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <PageHeader
        title={`Barka, ${firstName}!`}
        subtitle="Welcome back — here is your health at a glance."
        icon={HeartHandshake}
        actions={
          <Link to="/patient/doctors" className="btn-primary px-5 py-2.5 text-sm">
            Book a consultation
            <ChevronRight size={16} />
          </Link>
        }
      />

      {completion < 100 && (
        <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="mt-0.5 shrink-0 text-amber-500" />
            <div>
              <p className="text-sm font-bold text-amber-800">Complete your health profile</p>
              <p className="text-xs text-amber-700">
                {completion}% complete. Your doctor needs your blood type, allergies and HMO
                details to serve you faster.
              </p>
            </div>
          </div>
          <div className="h-2 w-full max-w-xs overflow-hidden rounded-full bg-amber-200">
            <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500" style={{ width: `${completion}%` }} />
          </div>
          <Link to="/patient/profile" className="btn-secondary shrink-0 bg-white px-4 py-2 text-xs font-semibold">
            Complete now
          </Link>
        </div>
      )}

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat icon={Calendar} label="Upcoming visits" value={upcoming.length} to="/patient/appointments" tint="from-teal-500 to-cyan-600" />
        <Stat icon={Bell} label="Unread notifications" value={stats.unread} to="/notifications" tint="from-brand-500 to-indigo-500" />
        <Stat icon={FileText} label="Prescriptions" value={stats.prescriptions} to="/patient/prescriptions" tint="from-violet-500 to-purple-600" />
        <Stat icon={FolderHeart} label="Medical records" value={stats.records} to="/patient/records" tint="from-mint-500 to-teal-500" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="card p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-lg font-bold text-slate-900">Quick actions</h3>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {QUICK_LINKS.map((q) => (
                <Link
                  key={q.to}
                  to={q.to}
                  className="group flex items-center gap-3 rounded-2xl border border-slate-100 p-4 transition-all duration-200 hover:border-teal-200 hover:bg-teal-50/50"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-600 transition-colors group-hover:bg-teal-100">
                    <q.icon size={18} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-bold text-slate-800">{q.label}</span>
                    <span className="block truncate text-xs text-slate-400">{q.desc}</span>
                  </span>
                </Link>
              ))}
            </div>
          </div>

          <div className="card p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-lg font-bold text-slate-900">Upcoming consultations</h3>
              <Link to="/patient/appointments" className="text-xs font-semibold text-teal-600 hover:text-teal-700">
                View all
              </Link>
            </div>
            {loading ? (
              <p className="py-6 text-center text-sm text-slate-400">Loading appointments...</p>
            ) : upcoming.length === 0 ? (
              <p className="rounded-xl bg-slate-50 p-6 text-center text-sm text-slate-400">
                No upcoming visits. Find a specialist and book today.
              </p>
            ) : (
              <div className="space-y-3">
                {upcoming.map((apt) => (
                  <Link
                    key={apt._id}
                    to={`/appointments/${apt._id}`}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 p-4 transition-colors hover:border-teal-200 hover:bg-teal-50/50"
                  >
                    <div>
                      <p className="text-sm font-bold text-slate-800">
                        Dr. {apt.doctor?.user?.name}
                        <span className="ml-2 text-xs font-medium text-teal-600">
                          {apt.doctor?.specialization}
                        </span>
                      </p>
                      <p className="mt-0.5 text-xs text-slate-400">
                        {format(new Date(apt.scheduledDate), 'EEE, MMM d')} · {apt.startTime} – {apt.endTime} · {apt.type}
                      </p>
                    </div>
                    <StatusBadge status={apt.status} />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="mb-4 font-display text-lg font-bold text-slate-900">Recent activity</h3>
            {past.length === 0 && stats.appointments.length === 0 ? (
              <p className="rounded-xl bg-slate-50 p-5 text-center text-sm text-slate-400">
                Your consultations will show up here.
              </p>
            ) : (
              <div className="space-y-3">
                {past.map((apt) => (
                  <Link
                    key={apt._id}
                    to={`/appointments/${apt._id}`}
                    className="flex items-center gap-3 rounded-2xl border border-slate-100 p-3 transition-colors hover:bg-slate-50"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                      <Calendar size={15} />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-700">
                        Dr. {apt.doctor?.user?.name}
                      </p>
                      <p className="text-xs text-slate-400">
                        {format(new Date(apt.scheduledDate), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="card bg-gradient-to-br from-teal-500 to-cyan-700 p-6 text-white shadow-lift">
            <FlaskConical className="mb-3" size={24} />
            <h3 className="font-display text-lg font-bold">Need a lab test?</h3>
            <p className="mt-1 text-sm text-teal-50">
              Book samples with partner labs across Lagos, Abuja, Ibadan & Port Harcourt.
            </p>
            <Link
              to="/patient/labs"
              className="mt-4 inline-flex items-center gap-1 rounded-xl bg-white/20 px-4 py-2 text-sm font-semibold backdrop-blur transition-colors hover:bg-white/30"
            >
              View lab orders <ChevronRight size={15} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;