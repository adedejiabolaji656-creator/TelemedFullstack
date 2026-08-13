import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  Calendar, Clock, Video, MessageSquare, CheckCircle, XCircle,
  User, Filter, ChevronRight
} from 'lucide-react';
import { format } from 'date-fns';

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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-6">Manage Appointments</h1>

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

      {appointments.length === 0 ? (
        <div className="card text-center py-12">
          <Calendar className="mx-auto text-gray-300 mb-4" size={48} />
          <p className="text-gray-500 text-lg">No appointments found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((apt) => (
            <div key={apt._id} className="card">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <User size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(apt.status)}`}>
                        {apt.status}
                      </span>
                      <span className="text-xs text-gray-400 capitalize flex items-center">
                        {apt.type === 'video' ? <Video size={12} className="mr-1" /> : <MessageSquare size={12} className="mr-1" />}
                        {apt.type}
                      </span>
                    </div>
                    <p className="font-medium">{apt.patient?.user?.name}</p>
                    <p className="text-sm text-gray-500">
                      {format(new Date(apt.scheduledDate), 'MMM d, yyyy')} at {apt.startTime}
                    </p>
                    {apt.symptoms && (
                      <p className="text-sm text-gray-400 mt-1 line-clamp-1">{apt.symptoms}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {apt.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleConfirm(apt._id)}
                        className="flex items-center space-x-1 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm"
                      >
                        <CheckCircle size={16} />
                        <span>Confirm</span>
                      </button>
                      <button
                        onClick={() => handleCancel(apt._id)}
                        className="flex items-center space-x-1 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
                      >
                        <XCircle size={16} />
                        <span>Decline</span>
                      </button>
                    </>
                  )}

                  {apt.status === 'confirmed' && (
                    <>
                      <Link
                        to={`/video/${apt.roomId}`}
                        className="flex items-center space-x-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                      >
                        <Video size={16} />
                        <span>Join</span>
                      </Link>
                      <Link
                        to={`/doctor/prescriptions/create/${apt._id}`}
                        className="flex items-center space-x-1 px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm"
                      >
                        <span>Prescribe</span>
                      </Link>
                    </>
                  )}

                  <Link
                    to={`/appointments/${apt._id}`}
                    className="p-2 text-gray-400 hover:text-gray-600"
                  >
                    <ChevronRight size={20} />
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
