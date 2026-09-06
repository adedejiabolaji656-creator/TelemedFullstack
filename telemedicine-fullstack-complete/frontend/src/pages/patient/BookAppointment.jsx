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
} from 'lucide-react';
import { format, addDays, startOfWeek } from 'date-fns';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Spinner } from '../../components/Spinner';

const stripePromise = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
  : null;

const CheckoutForm = ({ clientSecret, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: window.location.origin },
      redirect: 'if_required',
    });

    if (error) {
      alert(error.message);
    } else if (paymentIntent.status === 'succeeded') {
      onSuccess();
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      <button type="submit" disabled={!stripe || loading} className="btn-primary w-full py-3">
        {loading ? 'Processing payment...' : 'Pay & Confirm'}
      </button>
    </form>
  );
};

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

const BookAppointment = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [appointmentType, setAppointmentType] = useState('video');
  const [symptoms, setSymptoms] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);

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
    setBooking(true);

    try {
      const res = await axios.post('/api/appointments', {
        doctorId,
        availabilityId: selectedSlot._id,
        scheduledDate: selectedDate || new Date(),
        startTime: selectedSlot.startTime,
        type: appointmentType,
        symptoms,
      });

      const paymentRes = await axios.post('/api/payments/create-intent', {
        appointmentId: res.data.appointment._id,
      });

      setClientSecret(paymentRes.data.clientSecret);
      setStep(2);
    } catch (error) {
      alert(error.response?.data?.message || 'Booking failed');
    } finally {
      setBooking(false);
    }
  };

  const handlePaymentSuccess = () => {
    alert('Appointment booked successfully!');
    navigate('/patient/appointments');
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
                ${doctor?.consultationFee} per visit · {doctor?.rating || 'New'} rating
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
                ${doctor?.consultationFee}
              </p>
            </div>
            <button
              onClick={handleBook}
              disabled={!selectedSlot || booking}
              className="btn-primary px-8 py-3"
            >
              {booking ? (
                'Processing...'
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
            Pay ${doctor?.consultationFee} securely to confirm your video visit with{' '}
            <span className="font-semibold text-slate-700">Dr. {doctor?.user?.name}</span> on{' '}
            {selectedDate
              ? format(new Date(selectedDate), 'EEEE, MMM d')
              : 'your chosen date'}{' '}
            at {selectedSlot?.startTime}.
          </p>
          {clientSecret ? (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <CheckoutForm clientSecret={clientSecret} onSuccess={handlePaymentSuccess} />
            </Elements>
          ) : (
            <p className="text-sm text-amber-600">
              Payment wasn't initialized. Please go back and try again.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default BookAppointment;