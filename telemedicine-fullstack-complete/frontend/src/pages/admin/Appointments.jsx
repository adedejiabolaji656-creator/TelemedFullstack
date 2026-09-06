import { useEffect, useState } from 'react';
import axios from 'axios';
import { Calendar, Clock, Video, MessageSquare, Users } from 'lucide-react';
import { format } from 'date-fns';
import PageHeader, { Avatar } from '../../components/PageHeader';
import { Spinner } from '../../components/Spinner';
import StatusBadge from '../../components/StatusBadge';

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
];

const AdminAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, [filter]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/admin/appointments');
      let data = res.data.appointments;
      if (filter !== 'all') {
        data = data.filter((a) => a.status === filter);
      }
      setAppointments(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <PageHeader
        title="All appointments"
        subtitle="A live view of every consultation across the platform."
        icon={Users}
        actions={
          <span className="badge bg-brand-50 text-brand-700 ring-1 ring-brand-100">
            {appointments.length} shown
          </span>
        }
      />

      <div className="mb-6 flex flex-wrap gap-2">
        {TABS.map((t) => {
          const active = filter === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setFilter(t.key)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                active
                  ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-md shadow-cyan-500/25'
                  : 'bg-white text-slate-500 ring-1 ring-slate-200 hover:bg-slate-50 hover:text-slate-700'
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {loading ? (
        <Spinner label="Loading appointments..." />
      ) : (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60">
                  <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wide text-slate-400">
                    Patient
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wide text-slate-400">
                    Doctor
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wide text-slate-400">
                    Date & time
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wide text-slate-400">
                    Type
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wide text-slate-400">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((apt) => (
                  <tr key={apt._id} className="border-b border-slate-50 transition-colors hover:bg-slate-50/70">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={apt.patient?.user?.name} className="h-9 w-9 text-[10px]" />
                        <span className="text-sm font-semibold text-slate-700">
                          {apt.patient?.user?.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm text-slate-600">Dr. {apt.doctor?.user?.name}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 text-sm text-slate-500">
                        <Calendar size={13} className="text-slate-400" />
                        {format(new Date(apt.scheduledDate), 'MMM d, yyyy')}
                        <span className="text-slate-200">•</span>
                        <Clock size={13} className="text-slate-400" />
                        {apt.startTime}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="flex items-center gap-1.5 text-sm capitalize text-slate-500">
                        {apt.type === 'video' ? (
                          <Video size={14} className="text-slate-400" />
                        ) : (
                          <MessageSquare size={14} className="text-slate-400" />
                        )}
                        {apt.type}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={apt.status} />
                    </td>
                  </tr>
                ))}
                {appointments.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center text-sm text-slate-400">
                      No appointments found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAppointments;