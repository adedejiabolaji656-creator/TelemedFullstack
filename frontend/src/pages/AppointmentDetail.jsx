import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  Calendar,
  Clock,
  Video,
  MessageSquare,
  FileText,
  CreditCard,
  ChevronLeft,
  Phone,
  Mail,
  CheckCircle,
  XCircle,
  ClipboardPlus,
} from 'lucide-react';
import { format } from 'date-fns';
import { Spinner } from '../components/Spinner';
import StatusBadge from '../components/StatusBadge';
import { Avatar } from '../components/PageHeader';
import { naira } from '../utils/format';

const DetailRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-3">
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-400 ring-1 ring-slate-100">
      <Icon size={16} />
    </span>
    <div>
      <p className="text-xs font-medium text-slate-400">{label}</p>
      <p className="font-semibold text-slate-700">{value}</p>
    </div>
  </div>
);

const ActionButton = ({ icon: Icon, title, desc, tint, onClick, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`group flex flex-col items-center rounded-2xl border p-5 text-center transition-all duration-200 hover:-translate-y-0.5 ${
      disabled ? 'cursor-not-allowed opacity-50' : ''
    } ${tint}`}
  >
    <Icon size={26} className="mb-2" />
    <p className="font-semibold">{title}</p>
    <p className="text-xs opacity-75">{desc}</p>
  </button>
);

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
    return <Spinner label="Loading appointment..." />;
  }

  if (!appointment) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="font-display text-lg font-bold text-slate-700">Appointment not found</p>
        <button onClick={() => navigate(-1)} className="btn-secondary mt-4">
          <ChevronLeft size={15} />
          Go back
        </button>
      </div>
    );
  }

  const isPatient = user?.role === 'patient';
  const otherParty = isPatient ? appointment.doctor : appointment.patient;
  const canJoin = appointment.status === 'confirmed' && appointment.type === 'video';
  const canChat = appointment.status === 'confirmed';
  const canPrescribe = appointment.status === 'confirmed' && user?.role === 'doctor';
  const canComplete = appointment.status === 'confirmed' && user?.role === 'doctor';
  const partyName = otherParty?.user?.name;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition-colors hover:text-teal-600"
      >
        <ChevronLeft size={15} />
        Back to appointments
      </button>

      {/* Header card */}
      <div className="card overflow-hidden p-0">
        <div className="h-24 bg-gradient-to-br from-teal-500 via-cyan-600 to-sky-700">
          <div className="h-full w-full opacity-20 [background-image:radial-gradient(rgba(255,255,255,.8)_1px,transparent_1px)] [background-size:16px_16px]" />
        </div>
        <div className="px-6 pb-6">
          <div className="-mt-9 flex items-end justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar name={partyName} className="h-16 w-16 ring-4 ring-white text-sm" />
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="font-display text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
                  {isPatient ? `Dr. ${partyName}` : partyName}
                </h1>
                  <StatusBadge status={appointment.status} />
                </div>
                <p className="mt-0.5 text-sm font-medium capitalize text-teal-600">
                  {appointment.type === 'video' ? 'Video consultation' : 'Text consultation'} ·{' '}
                  {appointment.doctor?.specialization || 'General Practice'}
                </p>
              </div>
            </div>
            {isPatient && (
              <Link
                to={appointment.type === 'video' ? `/video/${appointment.roomId}` : `/chat/${appointment.roomId}`}
                className="hidden sm:inline-flex btn-primary"
              >
                {appointment.type === 'video' ? <Video size={15} /> : <MessageSquare size={15} />}
                {appointment.type === 'video' ? 'Join now' : 'Open chat'}
              </Link>
            )}
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <DetailRow
              icon={Calendar}
              label="Date"
              value={format(new Date(appointment.scheduledDate), 'EEEE, MMMM d, yyyy')}
            />
            <DetailRow
              icon={Clock}
              label="Time"
              value={`${appointment.startTime} – ${appointment.endTime}`}
            />
          </div>

          <div className="mt-5 grid gap-4 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100 sm:grid-cols-2">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Mail size={14} className="shrink-0 text-slate-400" />
              <span className="truncate">{otherParty?.user?.email}</span>
            </div>
            {otherParty?.user?.phone && (
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Phone size={14} className="shrink-0 text-slate-400" />
                {otherParty.user.phone}
              </div>
            )}
          </div>

          {appointment.symptoms && (
            <div className="mt-5">
              <p className="mb-1 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-400">
                <FileText size={12} />
                Symptoms / reason for visit
              </p>
              <p className="text-sm leading-relaxed text-slate-600">{appointment.symptoms}</p>
            </div>
          )}
          {appointment.notes && (
            <div className="mt-5 rounded-xl border border-amber-100 bg-amber-50/70 p-4">
              <p className="mb-1 text-xs font-bold uppercase tracking-wide text-amber-700">Notes</p>
              <p className="text-sm leading-relaxed text-slate-600">{appointment.notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {canJoin && (
          <Link
            to={`/video/${appointment.roomId}`}
            className="card group flex flex-col items-center p-5 text-center transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lift"
          >
            <span className="mb-2.5 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-red-500 text-white shadow-md">
              <Video size={22} />
            </span>
            <p className="font-display font-bold text-slate-900">Join video call</p>
            <p className="text-sm text-slate-400">Start your consultation</p>
          </Link>
        )}

        {canChat && (
          <Link
            to={`/chat/${appointment.roomId}`}
            className="card group flex flex-col items-center p-5 text-center transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lift"
          >
            <span className="mb-2.5 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 text-white shadow-md">
              <MessageSquare size={22} />
            </span>
            <p className="font-display font-bold text-slate-900">Open chat</p>
            <p className="text-sm text-slate-400">Message during consultation</p>
          </Link>
        )}

        {canPrescribe && (
          <Link
            to={`/doctor/prescriptions/create/${appointment._id}`}
            className="card group flex flex-col items-center p-5 text-center transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lift"
          >
            <span className="mb-2.5 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-md">
              <ClipboardPlus size={22} />
            </span>
            <p className="font-display font-bold text-slate-900">Write prescription</p>
            <p className="text-sm text-slate-400">Issue medication</p>
          </Link>
        )}

        {canComplete && (
          <ActionButton
            icon={CheckCircle}
            title="Mark complete"
            desc="End this consultation"
            tint="bg-gradient-to-br from-mint-50 to-teal-50 text-mint-700 ring-1 ring-mint-100 border-transparent"
            onClick={() => handleStatusUpdate('completed')}
            disabled={updating}
          />
        )}

        {appointment.status === 'pending' && user?.role === 'doctor' && (
          <ActionButton
            icon={CheckCircle}
            title="Confirm"
            desc="Accept this appointment"
            tint="bg-gradient-to-br from-mint-50 to-teal-50 text-mint-700 ring-1 ring-mint-100 border-transparent"
            onClick={() => handleStatusUpdate('confirmed')}
            disabled={updating}
          />
        )}

        {(appointment.status === 'pending' || appointment.status === 'confirmed') && (
          <ActionButton
            icon={XCircle}
            title="Cancel"
            desc="Cancel this appointment"
            tint="bg-gradient-to-br from-red-50 to-rose-50 text-red-600 ring-1 ring-red-100 border-transparent"
            onClick={handleCancel}
            disabled={updating}
          />
        )}

        {appointment.payment && (
          <div className="card p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-400 ring-1 ring-slate-100">
                  <CreditCard size={16} />
                </span>
                <div>
                  <p className="text-xs text-slate-400">Payment</p>
                  <p className="font-display text-lg font-extrabold text-slate-900">
                    {naira(appointment.payment.amount)}
                  </p>
                </div>
              </div>
              <StatusBadge status={appointment.payment.status} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentDetail;