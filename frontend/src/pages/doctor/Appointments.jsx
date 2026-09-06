import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  Calendar,
  Clock,
  Video,
  MessageSquare,
  CheckCircle,
  XCircle,
  ChevronRight,
  ClipboardPlus,
} from 'lucide-react';
import { format } from 'date-fns';
import PageHeader, { Avatar } from '../../components/PageHeader';
import { Spinner } from '../../components/Spinner';
import StatusBadge from '../../components/StatusBadge';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
];

const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, [filter]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const params = filter !== 'all' ? `?status=${filter}` : '';
      const res = await axios.get(`/api/appointments${params}`);
      setAppointments(res.data.appointments);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (id) => {
    try {
      await axios.put(`/api/appointments/${id}`, { status: 'confirmed' });
      fetchAppointments();
    } catch (error) {
      alert('Failed to confirm');
    }
  };

  const handleCancel = async (id) => {
    const reason = window.prompt('Reason for cancellation:');
    if (!reason) return;
    try {
      await axios.delete(`/api/appointments/${id}`, { data: { reason } });
      fetchAppointments();
    } catch (error) {
      alert('Failed to cancel');
    }
  };

  const pendingCount = appointments.filter((a) => a.status === 'pending').length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <PageHeader
        title="Manage appointments"
        subtitle="Confirm bookings, start video visits, and write prescriptions."
        icon={Calendar}
        actions={
          pendingCount > 0 ? (
            <span className="badge bg-amber-50 text-amber-600 ring-1 ring-amber-100">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
              {pendingCount} pending
            </span>
          ) : (
            <span className="badge bg-mint-50 text-mint-600 ring-1 ring-mint-100">
              Schedule up to date
            </span>
          )
        }
      />

      {/* Filter tabs */}
      <div className="mb-6 flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const active = filter === f.key;
          return (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                active
                  ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-md shadow-cyan-500/25'
                  : 'bg-white text-slate-500 ring-1 ring-slate-200 hover:bg-slate-50 hover:text-slate-700'
              }`}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {loading ? (
        <Spinner label="Loading appointments..." />
      ) : appointments.length === 0 ? (
        <div className="card mx-auto max-w-lg py-16 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 text-slate-300 ring-1 ring-slate-100">
            <Calendar size={30} />
          </div>
          <p className="font-display text-lg font-bold text-slate-800">No {filter === 'all' ? '' : `${filter} `}appointments</p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
            Bookings in this category will show up here automatically.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((apt) => (
            <div
              key={apt._id}
              className="card p-5 transition-all duration-200 hover:shadow-lift"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-4">
                  <Avatar name={apt.patient?.user?.name} className="h-12 w-12 text-sm" />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate font-display font-bold text-slate-900">
                        {apt.patient?.user?.name}
                      </p>
                      <StatusBadge status={apt.status} />
                      <span className="flex items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-semibold capitalize text-brand-700">
                        {apt.type === 'video' ? <Video size={11} /> : <MessageSquare size={11} />}
                        {apt.type} visit
                      </span>
                    </div>
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                      <Clock size={13} className="text-slate-400" />
                      {format(new Date(apt.scheduledDate), 'EEEE, MMM d, yyyy')} · {apt.startTime}
                    </p>
                    {apt.symptoms && (
                      <p className="mt-1 line-clamp-1 text-xs text-slate-400">"{apt.symptoms}"</p>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                  {apt.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleConfirm(apt._id)}
                        className="btn-primary px-4 py-2 text-xs"
                      >
                        <CheckCircle size={14} />
                        Confirm
                      </button>
                      <button
                        onClick={() => handleCancel(apt._id)}
                        className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold text-red-600 ring-1 ring-red-100 transition-all hover:bg-red-50"
                      >
                        <XCircle size={14} />
                        Decline
                      </button>
                    </>
                  )}

                  {apt.status === 'confirmed' && (
                    <>
                      <Link to={`/video/${apt.roomId}`} className="btn-primary px-4 py-2 text-xs">
                        <Video size={14} />
                        Join visit
                      </Link>
                      <Link
                        to={`/doctor/prescriptions/create/${apt._id}`}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-accent-50 px-4 py-2 text-xs font-semibold text-accent-600 ring-1 ring-accent-100 transition-all hover:bg-accent-100"
                      >
                        <ClipboardPlus size={14} />
                        Prescribe
                      </Link>
                    </>
                  )}

                  <Link
                    to={`/appointments/${apt._id}`}
                    className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                    aria-label="View details"
                  >
                    <ChevronRight size={18} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DoctorAppointments;