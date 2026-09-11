import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  Users,
  Stethoscope,
  Calendar,
  Banknote,
  Clock,
  UserPlus,
  ShieldAlert,
  FileText,
  LayoutDashboard,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import { Spinner } from '../../components/Spinner';
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

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    users: 0,
    doctors: 0,
    patients: 0,
    appointments: 0,
    pendingDoctors: 0,
    revenue: 0,
    completedAppointments: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await axios.get('/api/admin/stats');
      setStats(res.data.stats);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Spinner label="Loading platform stats..." />;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <PageHeader
        title="Platform overview"
        subtitle="Monitor your network of doctors, appointments, and revenue."
        icon={LayoutDashboard}
        actions={
          stats.pendingDoctors > 0 && (
            <Link to="/admin/doctors" className="btn-primary">
              <ShieldAlert size={15} />
              Review {stats.pendingDoctors} pending
            </Link>
          )
        }
      />

      {/* Revenue banner */}
      <div className="mb-8 overflow-hidden rounded-2xl bg-gradient-to-r from-teal-600 to-cyan-700 px-6 py-6 text-white shadow-lg shadow-cyan-500/25">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25">
              <Banknote size={22} />
            </span>
            <div>
              <p className="text-sm font-medium text-cyan-100">Total platform revenue</p>
              <p className="font-display text-3xl font-extrabold">{naira(stats.revenue)}</p>
            </div>
          </div>
          <Link
            to="/admin/payments"
            className="inline-flex items-center gap-1.5 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-teal-700 shadow-md transition-all hover:bg-teal-50"
          >
            View payments
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Total users" value={stats.users} icon={Users} tint="from-teal-500 to-cyan-600" />
        <StatCard label="Doctors" value={stats.doctors} icon={Stethoscope} tint="from-mint-500 to-emerald-600" sub="verified network" />
        <StatCard label="Patients" value={stats.patients} icon={UserPlus} tint="from-brand-500 to-indigo-500" />
        <StatCard label="Appointments" value={stats.appointments} icon={Calendar} tint="from-amber-400 to-orange-500" sub="all bookings" />
        <StatCard label="Completed" value={stats.completedAppointments} icon={Clock} tint="from-violet-500 to-purple-600" sub="visits finished" />
        <StatCard label="Pending doctors" value={stats.pendingDoctors} icon={ShieldAlert} tint="from-rose-500 to-red-500" sub={stats.pendingDoctors ? 'awaiting review' : 'all verified'} />
      </div>

      {/* Quick actions */}
      <div className="mt-8 grid gap-6 md:grid-cols-3">
        <Link
          to="/admin/doctors"
          className="group card relative overflow-hidden border-mint-100 bg-gradient-to-br from-mint-50 to-teal-50 p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift"
        >
          <div className="flex items-center gap-3.5">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-mint-500 to-emerald-600 text-white shadow-md transition-transform duration-300 group-hover:scale-105">
              <ShieldAlert size={20} />
            </span>
            <div>
              <h3 className="font-display font-bold text-slate-900">Verify doctors</h3>
              <p className="text-xs text-slate-500">
                {stats.pendingDoctors} doctor(s) pending review
              </p>
            </div>
            <ArrowRight size={16} className="ml-auto text-mint-600 transition-transform group-hover:translate-x-0.5" />
          </div>
        </Link>

        <Link
          to="/admin/appointments"
          className="group card relative overflow-hidden border-teal-100 bg-gradient-to-br from-teal-50 to-cyan-50 p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift"
        >
          <div className="flex items-center gap-3.5">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 text-white shadow-md transition-transform duration-300 group-hover:scale-105">
              <Calendar size={20} />
            </span>
            <div>
              <h3 className="font-display font-bold text-slate-900">All appointments</h3>
              <p className="text-xs text-slate-500">View and manage every booking</p>
            </div>
            <ArrowRight size={16} className="ml-auto text-brand-500 transition-transform group-hover:translate-x-0.5" />
          </div>
        </Link>

        <div className="card p-5">
          <div className="flex items-center gap-3.5">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-md">
              <TrendingUp size={20} />
            </span>
            <div>
              <h3 className="font-display font-bold text-slate-900">Platform overview</h3>
              <p className="text-xs text-slate-500">
                {stats.appointments} appointments · {stats.doctors} doctors · {stats.patients}{' '}
                patients
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;