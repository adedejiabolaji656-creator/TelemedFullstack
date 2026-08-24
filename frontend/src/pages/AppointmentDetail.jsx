import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  Calendar, Clock, Video, MessageSquare, FileText, CreditCard,
  ChevronLeft, Phone, Mail, AlertCircle, CheckCircle, XCircle
} from 'lucide-react';
import { format } from 'date-fns';

const AppointmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchAppointment();
  }, [id]);

  const fetchAppointment = async () => {
    try {
      const res = await axios.get(`/api/appointments/${id}`);
      setAppointment(res.data.appointment);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (status) => {
    setUpdating(true);
    try {
      await axios.put(`/api/appointments/${id}`, { status });
      fetchAppointment();
    } catch (error) {
      alert(error.response?.data?.message || 'Update failed');
    } finally {
      setUpdating(false);
    }
  };

  const handleCancel = async () => {
    const reason = window.prompt('Please provide a reason for cancellation:');
    if (!reason) return;

    try {
      await axios.delete(`/api/appointments/${id}`, { data: { reason } });
      navigate('/patient/appointments');
    } catch (error) {
      alert(error.response?.data?.message || 'Cancellation failed');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <p className="text-gray-500 text-lg">Appointment not found</p>
      </div>
    );
  }

  const isPatient = user?.role === 'patient';
  const otherParty = isPatient ? appointment.doctor : appointment.patient;
  const canJoin = appointment.status === 'confirmed' && appointment.type === 'video';
  const canChat = appointment.status === 'confirmed';
  const canPrescribe = appointment.status === 'confirmed' && user?.role === 'doctor';
  const canComplete = appointment.status === 'confirmed' && user?.role === 'doctor';

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ChevronLeft size={20} />
        Back to Appointments
      </button>

      <div className="card mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${
                appointment.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                appointment.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                'bg-red-100 text-red-700'
              }`}>
                {appointment.status}
              </span>
              <span className="text-sm text-gray-400 capitalize flex items-center">
                {appointment.type === 'video' ? <Video size={14} className="mr-1" /> : <MessageSquare size={14} className="mr-1" />}
                {appointment.type}
              </span>
            </div>
            <h1 className="text-2xl font-bold">
              Appointment with {isPatient ? 'Dr.' : ''} {otherParty?.user?.name}
            </h1>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="flex items-center space-x-3">
            <Calendar className="text-gray-400" size={20} />
            <div>
              <p className="text-sm text-gray-500">Date</p>
              <p className="font-medium">{format(new Date(appointment.scheduledDate), 'EEEE, MMMM d, yyyy')}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Clock className="text-gray-400" size={20} />
            <div>
              <p className="text-sm text-gray-500">Time</p>
              <p className="font-medium">{appointment.startTime} - {appointment.endTime}</p>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="border-t pt-4 mb-4">
          <h3 className="font-semibold mb-2">Contact Information</h3>
          <div className="flex flex-wrap gap-4 text-sm">
            <span className="flex items-center text-gray-600">
              <Mail size={14} className="mr-1" />
              {otherParty?.user?.email}
            </span>
            {otherParty?.user?.phone && (
              <span className="flex items-center text-gray-600">
                <Phone size={14} className="mr-1" />
                {otherParty.user.phone}
              </span>
            )}
          </div>
        </div>

        {/* Symptoms */}
        {appointment.symptoms && (
          <div className="border-t pt-4 mb-4">
            <h3 className="font-semibold mb-2">Symptoms / Reason</h3>
            <p className="text-gray-600 text-sm">{appointment.symptoms}</p>
          </div>
        )}

        {/* Notes */}
        {appointment.notes && (
          <div className="border-t pt-4 mb-4">
            <h3 className="font-semibold mb-2">Notes</h3>
            <p className="text-gray-600 text-sm">{appointment.notes}</p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {canJoin && (
          <Link
            to={`/video/${appointment.roomId}`}
            className="card bg-blue-50 border-blue-200 hover:bg-blue-100 transition-colors text-center"
          >
            <Video className="mx-auto text-blue-600 mb-2" size={32} />
            <h3 className="font-semibold text-blue-900">Join Video Call</h3>
            <p className="text-sm text-blue-700">Start your consultation</p>
          </Link>
        )}

        {canChat && (
          <Link
            to={`/chat/${appointment.roomId}`}
            className="card bg-green-50 border-green-200 hover:bg-green-100 transition-colors text-center"
          >
            <MessageSquare className="mx-auto text-green-600 mb-2" size={32} />
            <h3 className="font-semibold text-green-900">Open Chat</h3>
            <p className="text-sm text-green-700">Message during consultation</p>
          </Link>
        )}

        {canPrescribe && (
          <Link
            to={`/doctor/prescriptions/create/${appointment._id}`}
            className="card bg-purple-50 border-purple-200 hover:bg-purple-100 transition-colors text-center"
          >
            <FileText className="mx-auto text-purple-600 mb-2" size={32} />
            <h3 className="font-semibold text-purple-900">Write Prescription</h3>
            <p className="text-sm text-purple-700">Issue medication</p>
          </Link>
        )}

        {canComplete && (
          <button
            onClick={() => handleStatusUpdate('completed')}
            disabled={updating}
            className="card bg-green-50 border-green-200 hover:bg-green-100 transition-colors text-center"
          >
            <CheckCircle className="mx-auto text-green-600 mb-2" size={32} />
            <h3 className="font-semibold text-green-900">Mark Complete</h3>
            <p className="text-sm text-green-700">End this consultation</p>
          </button>
        )}

        {appointment.status === 'pending' && user?.role === 'doctor' && (
          <button
            onClick={() => handleStatusUpdate('confirmed')}
            disabled={updating}
            className="card bg-green-50 border-green-200 hover:bg-green-100 transition-colors text-center"
          >
            <CheckCircle className="mx-auto text-green-600 mb-2" size={32} />
            <h3 className="font-semibold text-green-900">Confirm</h3>
            <p className="text-sm text-green-700">Accept this appointment</p>
          </button>
        )}

        {(appointment.status === 'pending' || appointment.status === 'confirmed') && (
          <button
            onClick={handleCancel}
            className="card bg-red-50 border-red-200 hover:bg-red-100 transition-colors text-center"
          >
            <XCircle className="mx-auto text-red-600 mb-2" size={32} />
            <h3 className="font-semibold text-red-900">Cancel</h3>
            <p className="text-sm text-red-700">Cancel this appointment</p>
          </button>
        )}

        {appointment.payment && (
          <div className="card bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CreditCard className="text-gray-400 mr-2" size={20} />
                <div>
                  <p className="text-sm text-gray-500">Payment</p>
                  <p className="font-medium">${appointment.payment.amount}</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                appointment.payment.status === 'completed' ? 'bg-green-100 text-green-700' :
                appointment.payment.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              }`}>
                {appointment.payment.status}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentDetail;
