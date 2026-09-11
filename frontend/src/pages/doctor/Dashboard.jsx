import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  Calendar,
  Clock,
  AlertCircle,
  Banknote,
  Star,
  TrendingUp,
  Video,
  CalendarClock,
  CheckCircle2,
  Award,
  ArrowRight,
  ChevronRight,
} from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '../../context/AuthContext';
import PageHeader, { Avatar } from '../../components/PageHeader';
import { Spinner } from '../../components/Spinner';
import StatusBadge from '../../components/StatusBadge';
import { naira } from '../../utils/format';

const StatCard = ({ label, value, icon: Icon, tint, sub }) => (
  <div className="card relative overflow-hidden">
    <div
      className={`pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br ${tint} opacity-[0.12] blur-2xl`}
    />
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
        <p className="mt-2 font-display text-2xl font-extrabold text-slate-900">{value}</p>
        {sub && <p className="mt-1 text-xs text-slate-400">{sub}</p>}
      </div>
      <span
        className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${tint} text-white shadow-md`}
      >
        <Icon size={18} />
      </span>
    </div>
  </div>
);

const DoctorDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalAppointments: 0,
    todayAppointments: 0,
    pendingAppointments: 0,
    totalEarnings: 0,
    rating: 0,
    reviewCount: 0,
  });
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [profileRes, aptRes] = await Promise.all([
        axios.get('/api/doctors/me'),
        axios.get('/api/appointments'),
      ]);

      const profile = profileRes.data.doctor;
      const appointments = aptRes.data.appointments;
      const today = new Date().toISOString().split('T')[0];

      setStats({
        totalAppointments: appointments.length,
        todayAppointments: appointments.filter(
          (a) => new Date(a.scheduledDate).toISOString().split('T')[0] === today
        ).length,
        pendingAppointments: appointments.filter((a) => a.status === 'pending').length,
        totalEarnings: appointments
          .filter((a) => a.status === 'completed')
          .reduce((sum, a) => sum + (a.payment?.amount || 0), 0),
        rating: profile.rating,
        reviewCount: profile.reviewCount,
        verificationStatus: profile.verificationStatus,
      });

      setRecentAppointments(appointments.slice(0, 5));
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Spinner label="Loading your dashboard..." />;
  }

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  })();

  const firstName = (user?.name || 'Doctor').split(' ')[0];
  const todayLabel = format(new Date(), 'EEEE, MMMM d');

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <PageHeader
        title={`${greeting}, Dr. ${firstName}`}
        subtitle={`${todayLabel} · Here's what's happening in your practice today.`}
        icon={CalendarClock}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard
          label="Total appts"
          value={stats.totalAppointments}
          icon={Calendar}
          tint="from-teal-500 to-cyan-600"
        />
        <StatCard
          label="Today"
          value={stats.todayAppointments}
          icon={Clock}
          tint="from-brand-500 to-indigo-500"
          sub={stats.todayAppointments ? 'on schedule' : 'no visits yet'}
        />
        <StatCard
          label="Awaiting confirm"
          value={stats.pendingAppointments}
          icon={AlertCircle}
          tint="from-amber-400 to-orange-500"
          sub={stats.pendingAppointments ? 'needs review' : 'all clear'}
        />
        <StatCard
          label="Earnings"
          value={naira(stats.totalEarnings)}
          icon={Banknote}
          tint="from-mint-500 to-emerald-600"
          sub="completed visits"
        />
        <StatCard
          label="Rating"
          value={stats.rating || '—'}
          icon={Star}
          tint="from-yellow-400 to-amber-500"
          sub={`${stats.reviewCount} reviews`}
        />
        <StatCard
          label="Profile"
          value={stats.verificationStatus === 'verified' ? 'Live' : 'Pending'}
          icon={Award}
          tint="from-violet-500 to-purple-600"
          sub={stats.verificationStatus === 'verified' ? 'verified & public' : 'under review'}
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* Recent appointments */}
        <div className="lg:col-span-2">
          <div className="card p-0">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div>
                <h2 className="font-display text-lg font-bold text-slate-900">Recent appointments</h2>
                <p className="text-xs text-slate-400">Your latest patient bookings</p>
              </div>
              <Link
                to="/doctor/appointments"
                className="flex items-center gap-1 text-sm font-semibold text-teal-600 transition-colors hover:text-teal-700"
              >
                View all
                <ArrowRight size={14} />
              </Link>
            </div>

            {recentAppointments.length === 0 ? (
              <div className="px-6 py-14 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-slate-300 ring-1 ring-slate-100">
                  <Calendar size={26} />
                </div>
                <p className="font-semibold text-slate-700">No appointments yet</p>
                <p className="mt-1 text-sm text-slate-400">They'll appear here as patients book you.</p>
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {recentAppointments.map((apt) => (
                  <li
                    key={apt._id}
                    className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-slate-50/80"
                  >
                    <Avatar name={apt.patient?.user?.name} className="h-10 w-10 text-xs" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-semibold text-slate-800">
                          {apt.patient?.user?.name}
                        </p>
                        <span className="flex items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-semibold capitalize text-brand-700">
                          {apt.type === 'video' ? <Video size={11} /> : <Clock size={11} />}
                          {apt.type}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-slate-400">
                        {format(new Date(apt.scheduledDate), 'MMM d, yyyy')} at {apt.startTime}
                      </p>
                    </div>
                    <StatusBadge status={apt.status} />
                    <ChevronRight size={16} className="text-slate-300" />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          <Link
            to="/doctor/availability"
            className="group card relative overflow-hidden border-teal-100 bg-gradient-to-br from-teal-50 to-cyan-50 p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift"
          >
            <div className="flex items-center gap-3.5">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 text-white shadow-md transition-transform duration-300 group-hover:scale-105">
                <CalendarClock size={20} />
              </span>
              <div>
                <h3 className="font-display font-bold text-slate-900">Set availability</h3>
                <p className="text-xs text-slate-500">Manage your weekly schedule</p>
              </div>
              <ArrowRight size={16} className="ml-auto text-teal-500 transition-transform group-hover:translate-x-0.5" />
            </div>
          </Link>

          <Link
            to="/doctor/appointments"
            className="group card relative overflow-hidden border-teal-100 bg-gradient-to-br from-teal-50 to-cyan-50 p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift"
          >
            <div className="flex items-center gap-3.5">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 text-white shadow-md transition-transform duration-300 group-hover:scale-105">
                <CheckCircle2 size={20} />
              </span>
              <div>
                <h3 className="font-display font-bold text-slate-900">Confirm bookings</h3>
                <p className="text-xs text-slate-500">
                  {stats.pendingAppointments
                    ? `${stats.pendingAppointments} awaiting your review`
                    : 'No pending requests'}
                </p>
              </div>
              <ArrowRight size={16} className="ml-auto text-brand-500 transition-transform group-hover:translate-x-0.5" />
            </div>
          </Link>

          <div className="card p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-sm font-bold uppercase tracking-wide text-slate-500">
                Profile status
              </h3>
              {stats.verificationStatus === 'verified' ? (
                <span className="badge bg-mint-50 text-mint-600 ring-1 ring-mint-100">Verified</span>
              ) : (
                <span className="badge bg-amber-50 text-amber-600 ring-1 ring-amber-100">Pending</span>
              )}
            </div>
            <div className="mt-4 space-y-3">
              {[
                { label: 'License verified', done: stats.verificationStatus === 'verified' },
                { label: 'Profile visible to patients', done: stats.verificationStatus === 'verified' },
                { label: 'Availability published', done: true },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2.5 text-sm">
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-full ${
                      item.done ? 'bg-mint-500 text-white' : 'bg-amber-200 text-amber-700'
                    }`}
                  >
                    <CheckCircle2 size={13} />
                  </span>
                  <span className={item.done ? 'text-slate-700' : 'text-slate-400'}>{item.label}</span>
                </div>
              ))}
            </div>
            {stats.verificationStatus === 'pending' && (
              <Link
                to="/doctor/profile"
                className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-teal-600 hover:text-teal-700"
              >
                <TrendingUp size={13} />
                Complete your profile
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;