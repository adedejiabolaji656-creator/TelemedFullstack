import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
  Calendar,
  Clock,
  Video,
  MessageSquare,
  CreditCard,
  ChevronLeft,
  Stethoscope,
  ShieldCheck,
  Smartphone,
  Landmark,
  Zap,
  Loader2,
} from 'lucide-react';
import { format, addDays, startOfWeek } from 'date-fns';
import { Spinner } from '../../components/Spinner';
import { naira } from '../../utils/format';

const Stepper = ({ step }) => (
  <div className="mb-6 flex items-center gap-2">
    {['Details', 'Payment'].map((label, i) => {
      const num = i + 1;
      const active = step === num;
      const done = step > num;
      return (
        <div key={label} className="flex flex-1 items-center gap-2">
          <span
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all ${
              done
                ? 'bg-mint-500 text-white'
                : active
                ? 'bg-gradient-to-br from-teal-500 to-cyan-600 text-white shadow-md shadow-cyan-500/25'
                : 'bg-slate-100 text-slate-400'
            }`}
          >
            {done ? '✓' : num}
          </span>
          <span
            className={`hidden text-sm font-semibold sm:block ${
              active ? 'text-slate-800' : 'text-slate-400'
            }`}
          >
            {label}
          </span>
          {num === 1 && <span className="h-px flex-1 bg-slate-200 last:hidden" />}
        </div>
      );
    })}
  </div>
);

const PAYMENT_METHODS = [
  { method: 'card', label: 'Card', desc: 'Verve, Visa, Mastercard (Paystack)', icon: CreditCard },
  { method: 'bank_transfer', label: 'Bank Transfer', desc: 'Providus / GTCo bank', icon: Landmark },
  { method: 'ussd', label: 'USSD', desc: '*737# / *966# style payment', icon: Smartphone },
];

const BookAppointment = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [appointmentType, setAppointmentType] = useState('video');
  const [symptoms, setSymptoms] = useState('');
  const [appointmentId, setAppointmentId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchDoctorAndSlots();
  }, [doctorId]);

  const fetchDoctorAndSlots = async () => {
    try {
      const [doctorRes, slotsRes] = await Promise.all([
        axios.get(`/api/doctors/${doctorId}`),
        axios.get(`/api/doctors/${doctorId}/availability`),
      ]);
      setDoctor(doctorRes.data.doctor);
      setSlots(slotsRes.data.slots);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async () => {
    if (!selectedSlot) return;
    setProcessing(true);

    try {
      const res = await axios.post('/api/appointments', {
        doctorId,
        availabilityId: selectedSlot._id,
        scheduledDate: selectedDate || new Date(),
        startTime: selectedSlot.startTime,
        type: appointmentType,
        symptoms,
      });

      setAppointmentId(res.data.appointment._id);
      setStep(2);
    } catch (error) {
      alert(error.response?.data?.message || 'Booking failed');
    } finally {
      setProcessing(false);
    }
  };

  const handlePay = async () => {
    setProcessing(true);
    try {
      await axios.post('/api/payments/mock-pay', {
        appointmentId,
        method: paymentMethod,
      });
      alert('Payment successful! Appointment confirmed.');
      navigate('/patient/appointments');
    } catch (error) {
      alert(error.response?.data?.message || 'Payment failed');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return <Spinner label="Preparing your booking..." />;
  }

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const weekStart = startOfWeek(new Date());

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <Link
        to={`/patient/doctors/${doctorId}`}
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition-colors hover:text-teal-600"
      >
        <ChevronLeft size={15} />
        Back to Dr. {doctor?.user?.name}
      </Link>

      <Stepper step={step} />

      {step === 1 ? (
        <div className="space-y-6">
          {/* Doctor summary */}
          <div className="card flex items-center gap-4 p-5">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-700 text-white shadow-md">
              <Stethoscope size={24} />
            </span>
            <div>
              <p className="font-display text-lg font-bold text-slate-900">
                Dr. {doctor?.user?.name}
              </p>
              <p className="text-sm font-medium text-teal-600">{doctor?.specialization}</p>
              <p className="mt-0.5 text-xs text-slate-400">
                {doctor?.hospital ? `${doctor.hospital} · ` : ''}
                {naira(doctor?.consultationFee)} per visit · {doctor?.rating || 'New'} rating
              </p>
            </div>
          </div>

          {/* Appointment Type */}
          <div className="card p-6">
            <h3 className="mb-4 font-display text-lg font-bold text-slate-900">
              Consultation type
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { type: 'video', label: 'Video Call', desc: 'Face-to-face', icon: Video },
                { type: 'chat', label: 'Text Chat', desc: 'Asynchronous', icon: MessageSquare },
              ].map((opt) => (
                <button
                  key={opt.type}
                  onClick={() => setAppointmentType(opt.type)}
                  className={`group rounded-2xl border-2 p-4 text-center transition-all duration-200 ${
                    appointmentType === opt.type
                      ? 'border-teal-500 bg-teal-50 shadow-glow'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <opt.icon
                    className={`mx-auto mb-2 ${appointmentType === opt.type ? 'text-teal-600' : 'text-slate-400'}`}
                    size={24}
                  />
                  <span
                    className={`block text-sm font-bold ${
                      appointmentType === opt.type ? 'text-teal-700' : 'text-slate-600'
                    }`}
                  >
                    {opt.label}
                  </span>
                  <span className="text-xs text-slate-400">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Select Date & Time */}
          <div className="card p-6">
            <h3 className="mb-4 flex items-center gap-2 font-display text-lg font-bold text-slate-900">
              <Calendar size={18} className="text-teal-600" />
              Select date & time
            </h3>

            <div className="mb-5 grid grid-cols-7 gap-2">
              {[...Array(7)].map((_, i) => {
                const date = addDays(weekStart, i);
                const dateStr = format(date, 'yyyy-MM-dd');
                const daySlots = slots.filter(
                  (s) =>
                    s.dayOfWeek === i &&
                    (!s.specificDate ||
                      format(new Date(s.specificDate), 'yyyy-MM-dd') === dateStr)
                );
                const hasSlots = daySlots.length > 0;

                return (
                  <button
                    key={i}
                    onClick={() => hasSlots && setSelectedDate(dateStr)}
                    disabled={!hasSlots}
                    className={`rounded-xl p-2 text-center text-sm transition-all duration-200 ${
                      selectedDate === dateStr
                        ? 'bg-gradient-to-br from-teal-500 to-cyan-600 text-white shadow-md shadow-cyan-500/25'
                        : hasSlots
                        ? 'bg-slate-50 text-slate-700 ring-1 ring-slate-200 hover:bg-teal-50 hover:text-teal-700 hover:ring-teal-200'
                        : 'cursor-not-allowed bg-slate-100 text-slate-300'
                    }`}
                  >
                    <div className="text-[10px] font-semibold uppercase">{days[i]}</div>
                    <div className="mt-0.5 font-bold">{format(date, 'd')}</div>
                  </button>
                );
              })}
            </div>

            {selectedDate ? (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {slots
                  .filter(
                    (s) =>
                      format(addDays(weekStart, s.dayOfWeek), 'yyyy-MM-dd') === selectedDate ||
                      (s.specificDate &&
                        format(new Date(s.specificDate), 'yyyy-MM-dd') === selectedDate)
                  )
                  .map((slot) => (
                    <button
                      key={slot._id}
                      onClick={() => setSelectedSlot(slot)}
                      className={`rounded-xl p-2.5 text-center text-sm font-semibold transition-all duration-200 ${
                        selectedSlot?._id === slot._id
                          ? 'bg-gradient-to-br from-teal-500 to-cyan-600 text-white shadow-md shadow-cyan-500/25'
                          : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-teal-50 hover:text-teal-700 hover:ring-teal-300'
                      }`}
                    >
                      <Clock size={13} className="mx-auto mb-1 opacity-70" />
                      {slot.startTime}
                    </button>
                  ))}
              </div>
            ) : (
              <p className="rounded-xl bg-slate-50 p-4 text-center text-sm text-slate-400">
                Pick an available day to see open slots.
              </p>
            )}
          </div>

          {/* Symptoms */}
          <div className="card p-6">
            <h3 className="mb-4 font-display text-lg font-bold text-slate-900">
              Symptoms / reason for visit
            </h3>
            <textarea
              className="input h-28 resize-none"
              placeholder="Describe your symptoms so your doctor can prepare..."
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
            />
            <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
              <ShieldCheck size={13} className="text-mint-500" />
              Shared securely with your doctor only.
            </p>
          </div>

          {/* Fee Summary */}
          <div className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-slate-500">Consultation fee</p>
              <p className="font-display text-2xl font-extrabold text-slate-900">
                {naira(doctor?.consultationFee)}
              </p>
            </div>
            <button
              onClick={handleBook}
              disabled={!selectedSlot || processing}
              className="btn-primary px-8 py-3"
            >
              {processing ? (
                <span className="flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin" /> Booking...
                </span>
              ) : (
                <>
                  Continue to payment
                  <CreditCard size={16} />
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="card p-6">
          <h3 className="mb-1 flex items-center gap-2 font-display text-lg font-bold text-slate-900">
            <CreditCard size={18} className="text-teal-600" />
            Complete payment
          </h3>
          <p className="mb-5 text-sm text-slate-500">
            Pay <span className="font-semibold text-slate-800">{naira(doctor?.consultationFee)}</span>{' '}
            to confirm your visit with{' '}
            <span className="font-semibold text-slate-700">Dr. {doctor?.user?.name}</span> on{' '}
            {selectedDate
              ? format(new Date(selectedDate), 'EEEE, MMM d')
              : 'your chosen date'}{' '}
            at {selectedSlot?.startTime}.
          </p>

          <div className="space-y-3">
            {PAYMENT_METHODS.map((opt) => (
              <label
                key={opt.method}
                className={`flex cursor-pointer items-center gap-3 rounded-2xl border-2 p-4 transition-all duration-200 ${
                  paymentMethod === opt.method
                    ? 'border-teal-500 bg-teal-50 shadow-glow'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="payment-method"
                  value={opt.method}
                  checked={paymentMethod === opt.method}
                  onChange={() => setPaymentMethod(opt.method)}
                  className="sr-only"
                />
                <opt.icon
                  size={22}
                  className={paymentMethod === opt.method ? 'text-teal-600' : 'text-slate-400'}
                />
                <span className="flex-1">
                  <span className="block text-sm font-bold text-slate-800">{opt.label}</span>
                  <span className="block text-xs text-slate-400">{opt.desc}</span>
                </span>
                {paymentMethod === opt.method && <Zap size={16} className="text-teal-500" />}
              </label>
            ))}
          </div>

          <div className="mt-5 flex items-center justify-between gap-4 rounded-2xl bg-slate-50 p-4">
            <div>
              <p className="text-xs text-slate-400">Amount due</p>
              <p className="font-display text-xl font-extrabold text-slate-900">
                {naira(doctor?.consultationFee)}
              </p>
            </div>
            <button onClick={handlePay} disabled={processing} className="btn-primary px-8 py-3">
              {processing ? (
                <span className="flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin" /> Processing...
                </span>
              ) : (
                'Pay Now'
              )}
            </button>
          </div>

          <p className="mt-4 flex items-center gap-1.5 text-xs text-slate-400">
            <ShieldCheck size={13} className="text-mint-500" />
            Demo checkout powered by the built-in gateway. Swap-in Paystack / Flutterwave keys in
            production.
          </p>
        </div>
      )}
    </div>
  );
};

export default BookAppointment;