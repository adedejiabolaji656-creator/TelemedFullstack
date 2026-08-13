import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Calendar, Clock, Video, MessageSquare, ChevronRight, Filter } from 'lucide-react';
import { format } from 'date-fns';

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

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-700',
      confirmed: 'bg-green-100 text-green-700',
      completed: 'bg-blue-100 text-blue-700',
      cancelled: 'bg-red-100 text-red-700',
      no_show: 'bg-gray-100 text-gray-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getTypeIcon = (type) => {
    return type === 'video' ? <Video size={16} /> : <MessageSquare size={16} />;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">My Appointments</h1>
        <div className="flex items-center space-x-2">
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
      </div>

      {appointments.length === 0 ? (
        <div className="card text-center py-12">
          <Calendar className="mx-auto text-gray-300 mb-4" size={48} />
          <p className="text-gray-500 text-lg">No appointments found</p>
          {user?.role === 'patient' && (
            <Link to="/patient/doctors" className="btn-primary mt-4 inline-block">
              Find a Doctor
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((apt) => (
            <Link
              key={apt._id}
              to={`/appointments/${apt._id}`}
              className="card hover:shadow-md transition-shadow block"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    {getTypeIcon(apt.type)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(apt.status)}`}>
                        {apt.status}
                      </span>
                      <span className="text-xs text-gray-400 capitalize">{apt.type}</span>
                    </div>
                    <p className="font-medium mt-1">
                      {user?.role === 'patient'
                        ? `Dr. ${apt.doctor?.user?.name}`
                        : apt.patient?.user?.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {apt.doctor?.specialization || 'General Practice'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium flex items-center text-gray-700">
                    <Calendar size={14} className="mr-1" />
                    {format(new Date(apt.scheduledDate), 'MMM d, yyyy')}
                  </p>
                  <p className="text-sm text-gray-500 flex items-center justify-end mt-1">
                    <Clock size={14} className="mr-1" />
                    {apt.startTime} - {apt.endTime}
                  </p>
                  <ChevronRight className="ml-auto mt-2 text-gray-400" size={18} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Appointments;
