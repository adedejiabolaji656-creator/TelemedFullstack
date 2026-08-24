import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Calendar, Clock, Video, MessageSquare, CreditCard, ChevronLeft } from 'lucide-react';
import { format, addDays, startOfWeek } from 'date-fns';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Stripe is optional: only initialize when a publishable key is configured,
// otherwise the payment step degrades gracefully instead of crashing.
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
      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full btn-primary py-3 disabled:opacity-50"
      >
        {loading ? 'Processing...' : 'Pay & Confirm'}
      </button>
    </form>
  );
};

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

      // Create payment intent
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
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const weekStart = startOfWeek(new Date());

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ChevronLeft size={20} />
        Back
      </button>

      <h1 className="text-3xl font-bold mb-2">Book Appointment</h1>
      <p className="text-gray-500 mb-8">
        with Dr. {doctor?.user?.name} — {doctor?.specialization}
      </p>

      {step === 1 ? (
        <div className="space-y-6">
          {/* Appointment Type */}
          <div className="card">
            <h3 className="font-semibold mb-3">Consultation Type</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { type: 'video', label: 'Video Call', icon: Video },
                { type: 'chat', label: 'Text Chat', icon: MessageSquare },
              ].map((opt) => (
                <button
                  key={opt.type}
                  onClick={() => setAppointmentType(opt.type)}
                  className={`p-4 rounded-lg border-2 text-center transition-colors ${
                    appointmentType === opt.type
                      ? 'border-blue-600 bg-blue-50 text-blue-600'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <opt.icon className="mx-auto mb-2" size={24} />
                  <span className="font-medium">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Select Date & Time */}
          <div className="card">
            <h3 className="font-semibold mb-3 flex items-center">
              <Calendar className="mr-2" size={18} />
              Select Date & Time
            </h3>

            <div className="grid grid-cols-7 gap-2 mb-4">
              {[...Array(7)].map((_, i) => {
                const date = addDays(weekStart, i);
                const dateStr = format(date, 'yyyy-MM-dd');
                const daySlots = slots.filter(
                  (s) => s.dayOfWeek === i && (!s.specificDate || format(new Date(s.specificDate), 'yyyy-MM-dd') === dateStr)
                );
                const hasSlots = daySlots.length > 0;

                return (
                  <button
                    key={i}
                    onClick={() => hasSlots && setSelectedDate(dateStr)}
                    disabled={!hasSlots}
                    className={`p-2 rounded-lg text-center text-sm transition-colors ${
                      selectedDate === dateStr
                        ? 'bg-blue-600 text-white'
                        : hasSlots
                        ? 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                        : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                    }`}
                  >
                    <div className="text-xs">{days[i]}</div>
                    <div className="font-semibold">{format(date, 'd')}</div>
                  </button>
                );
              })}
            </div>

            {selectedDate && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {slots
                  .filter(
                    (s) =>
                      format(addDays(weekStart, s.dayOfWeek), 'yyyy-MM-dd') === selectedDate ||
                      (s.specificDate && format(new Date(s.specificDate), 'yyyy-MM-dd') === selectedDate)
                  )
                  .map((slot) => (
                    <button
                      key={slot._id}
                      onClick={() => setSelectedSlot(slot)}
                      className={`p-2 rounded-lg text-sm text-center transition-colors ${
                        selectedSlot?._id === slot._id
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-50 hover:bg-blue-50 text-gray-700 border border-gray-200'
                      }`}
                    >
                      <Clock size={14} className="mx-auto mb-1" />
                      {slot.startTime}
                    </button>
                  ))}
              </div>
            )}
          </div>

          {/* Symptoms */}
          <div className="card">
            <h3 className="font-semibold mb-3">Symptoms / Reason for Visit</h3>
            <textarea
              className="input w-full h-32 resize-none"
              placeholder="Describe your symptoms or reason for consultation..."
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
            />
          </div>

          {/* Fee Summary */}
          <div className="card bg-gray-50">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">Consultation Fee</p>
                <p className="text-2xl font-bold">${doctor?.consultationFee}</p>
              </div>
              <button
                onClick={handleBook}
                disabled={!selectedSlot || booking}
                className="btn-primary px-8 py-3 disabled:opacity-50"
              >
                {booking ? 'Processing...' : 'Continue to Payment'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="card">
          <h3 className="font-semibold mb-4 flex items-center">
            <CreditCard className="mr-2" size={20} />
            Complete Payment
          </h3>
          <p className="text-gray-500 mb-4">Amount: ${doctor?.consultationFee}</p>
          {clientSecret && (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <CheckoutForm clientSecret={clientSecret} onSuccess={handlePaymentSuccess} />
            </Elements>
          )}
        </div>
      )}
    </div>
  );
};

export default BookAppointment;
