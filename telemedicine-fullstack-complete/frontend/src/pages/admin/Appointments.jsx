import { useEffect, useState } from 'react';
import axios from 'axios';
import { Calendar, User, Clock, Video, MessageSquare, Filter } from 'lucide-react';
import { format } from 'date-fns';

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

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-700',
      confirmed: 'bg-green-100 text-green-700',
      completed: 'bg-blue-100 text-blue-700',
      cancelled: 'bg-red-100 text-red-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-6">All Appointments</h1>

      <div className="flex items-center space-x-2 mb-6">
        <Filter size={18} className="text-gray-400" />
        <select
          className="input w-40"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Patient</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Doctor</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Date & Time</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Type</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((apt) => (
              <tr key={apt._id} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4">
                  <div className="flex items-center space-x-2">
                    <User size={16} className="text-gray-400" />
                    <span className="text-sm">{apt.patient?.user?.name}</span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className="text-sm">Dr. {apt.doctor?.user?.name}</span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center space-x-1 text-sm text-gray-600">
                    <Calendar size={14} />
                    <span>{format(new Date(apt.scheduledDate), 'MMM d, yyyy')}</span>
                    <Clock size={14} className="ml-2" />
                    <span>{apt.startTime}</span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className="flex items-center text-sm text-gray-600">
                    {apt.type === 'video' ? <Video size={14} className="mr-1" /> : <MessageSquare size={14} className="mr-1" />}
                    {apt.type}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(apt.status)}`}>
                    {apt.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {appointments.length === 0 && (
          <p className="text-center text-gray-500 py-8">No appointments found</p>
        )}
      </div>
    </div>
  );
};

export default AdminAppointments;
