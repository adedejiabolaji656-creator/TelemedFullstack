import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  Calendar,
  Clock,
  Video,
  MessageSquare,
  ChevronRight,
  Stethoscope,
} from 'lucide-react';
import { format } from 'date-fns';
import PageHeader, { Avatar } from '../components/PageHeader';
import { Spinner } from '../components/Spinner';
import StatusBadge from '../components/StatusBadge';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
];

const Appointments = () => {
  const { user } = useAuth();
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

  const isPatient = user?.role === 'patient';

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <PageHeader
        title="My appointments"
        subtitle="Track bookings, join video visits, and manage follow-ups."
        icon={Calendar}
        actions={
          isPatient && (
            <Link to="/patient/doctors" className="btn-primary">
              <Stethoscope size={16} />
              Find a doctor
            </Link>
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
          <p className="font-display text-lg font-bold text-slate-800">No appointments found</p>
          <p className="mt-2 text-sm text-slate-500">
            {isPatient
              ? 'When you book a visit, it will show up here.'
              : 'Patient bookings will appear here automatically.'}
          </p>
          {isPatient && (
            <Link to="/patient/doctors" className="btn-primary mt-6 inline-flex">
              Browse doctors
              <ChevronRight size={15} />
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((apt) => {
            const otherPartyName = isPatient
              ? `Dr. ${apt.doctor?.user?.name}`
              : apt.patient?.user?.name;
            const specialization = apt.doctor?.specialization || 'General Practice';
            return (
              <Link
                key={apt._id}
                to={`/appointments/${apt._id}`}
                className="card group flex flex-col gap-4 p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lift sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-4">
                  <Avatar name={otherPartyName} className="h-12 w-12 text-sm" />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate font-display font-bold text-slate-900">
                        {otherPartyName}
                      </p>
                      <StatusBadge status={apt.status} />
                      <span className="flex items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-semibold capitalize text-brand-700">
                        {apt.type === 'video' ? <Video size={11} /> : <MessageSquare size={11} />}
                        {apt.type}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs font-medium text-teal-600">{specialization}</p>
                    {apt.symptoms && (
                      <p className="mt-1 line-clamp-1 text-xs text-slate-400">"{apt.symptoms}"</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-5 sm:shrink-0">
                  <div className="text-left sm:text-right">
                    <p className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 sm:justify-end">
                      <Calendar size={13} className="text-slate-400" />
                      {format(new Date(apt.scheduledDate), 'MMM d, yyyy')}
                    </p>
                    <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-400 sm:justify-end">
                      <Clock size={12} />
                      {apt.startTime} – {apt.endTime}
                    </p>
                  </div>
                  <ChevronRight
                    size={18}
                    className="text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-teal-500 sm:hidden"
                  />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Appointments;