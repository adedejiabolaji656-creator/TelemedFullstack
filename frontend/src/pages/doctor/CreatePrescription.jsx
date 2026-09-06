import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Plus, Trash2, ChevronLeft, Pill, ClipboardPlus } from 'lucide-react';
import PageHeader, { Avatar } from '../../components/PageHeader';
import { Spinner } from '../../components/Spinner';
import { format } from 'date-fns';

const CreatePrescription = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [medications, setMedications] = useState([
    { name: '', dosage: '', frequency: '', duration: '', instructions: '' },
  ]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAppointment();
  }, [appointmentId]);

  const fetchAppointment = async () => {
    try {
      const res = await axios.get(`/api/appointments/${appointmentId}`);
      setAppointment(res.data.appointment);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const addMedication = () => {
    setMedications([...medications, { name: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
  };

  const removeMedication = (index) => {
    setMedications(medications.filter((_, i) => i !== index));
  };

  const updateMedication = (index, field, value) => {
    const updated = [...medications];
    updated[index][field] = value;
    setMedications(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await axios.post('/api/prescriptions', {
        appointmentId,
        diagnosis,
        notes,
        validUntil,
        medications: medications.filter((m) => m.name.trim() !== ''),
      });

      alert('Prescription created successfully!');
      navigate('/doctor/appointments');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to create prescription');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Spinner label="Loading appointment details..." />;
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition-colors hover:text-teal-600"
      >
        <ChevronLeft size={15} />
        Back
      </button>

      <PageHeader
        title="Write prescription"
        subtitle="Send medications and instructions straight to your patient."
        icon={ClipboardPlus}
      />

      {appointment && (
        <div className="mb-6 flex items-center gap-4 rounded-2xl border border-teal-100 bg-teal-50/60 p-5">
          <Avatar name={appointment.patient?.user?.name} className="h-12 w-12 text-sm" />
          <div>
            <p className="text-sm text-slate-600">
              Patient: <span className="font-semibold text-slate-800">{appointment.patient?.user?.name}</span>
            </p>
            <p className="mt-0.5 text-sm text-teal-700">
              Appointment on{' '}
              {appointment.scheduledDate
                ? format(new Date(appointment.scheduledDate), 'EEEE, MMM d, yyyy')
                : '—'}{' '}
              at {appointment.startTime}
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card p-6">
          <h3 className="mb-4 font-display text-lg font-bold text-slate-900">Diagnosis</h3>
          <input
            type="text"
            className="input"
            placeholder="Enter diagnosis"
            value={diagnosis}
            onChange={(e) => setDiagnosis(e.target.value)}
            required
          />
        </div>

        <div className="card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center gap-1.5 font-display text-lg font-bold text-slate-900">
              <Pill size={18} className="text-teal-600" />
              Medications
            </h3>
            <button
              type="button"
              onClick={addMedication}
              className="inline-flex items-center gap-1 rounded-xl bg-teal-50 px-3.5 py-2 text-sm font-semibold text-teal-700 ring-1 ring-teal-100 transition-all hover:bg-teal-100"
            >
              <Plus size={15} />
              Add medication
            </button>
          </div>

          <div className="space-y-4">
            {medications.map((med, index) => (
              <div key={index} className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    type="text"
                    className="input"
                    placeholder="Medication name"
                    value={med.name}
                    onChange={(e) => updateMedication(index, 'name', e.target.value)}
                    required
                  />
                  <input
                    type="text"
                    className="input"
                    placeholder="Dosage (e.g. 500mg)"
                    value={med.dosage}
                    onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                    required
                  />
                  <input
                    type="text"
                    className="input"
                    placeholder="Frequency (e.g. Twice daily)"
                    value={med.frequency}
                    onChange={(e) => updateMedication(index, 'frequency', e.target.value)}
                    required
                  />
                  <input
                    type="text"
                    className="input"
                    placeholder="Duration (e.g. 7 days)"
                    value={med.duration}
                    onChange={(e) => updateMedication(index, 'duration', e.target.value)}
                    required
                  />
                  <input
                    type="text"
                    className="input sm:col-span-2"
                    placeholder="Special instructions (optional)"
                    value={med.instructions}
                    onChange={(e) => updateMedication(index, 'instructions', e.target.value)}
                  />
                </div>
                {medications.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeMedication(index)}
                    className="mt-2.5 inline-flex items-center gap-1 text-sm font-medium text-red-500 transition-colors hover:text-red-700"
                  >
                    <Trash2 size={14} />
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <h3 className="mb-4 font-display text-lg font-bold text-slate-900">
            Additional information
          </h3>
          <div className="space-y-4">
            <div>
              <label className="label">Valid until</label>
              <input
                type="date"
                className="input"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
              />
            </div>
            <div>
              <label className="label">Notes</label>
              <textarea
                className="input h-24 resize-none"
                placeholder="Additional notes for the patient..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={submitting} className="btn-primary disabled:opacity-50">
            {submitting ? 'Creating...' : 'Create prescription'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePrescription;
