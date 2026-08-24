import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Plus, Trash2, FileText, ChevronLeft, Pill } from 'lucide-react';

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
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ChevronLeft size={20} />
        Back
      </button>

      <div className="flex items-center space-x-3 mb-6">
        <FileText className="text-blue-600" size={28} />
        <h1 className="text-3xl font-bold">Write Prescription</h1>
      </div>

      {appointment && (
        <div className="card bg-blue-50 border-blue-200 mb-6">
          <p className="text-sm text-blue-700">
            Patient: <span className="font-medium">{appointment.patient?.user?.name}</span>
          </p>
          <p className="text-sm text-blue-600 mt-1">
            Appointment Date: {new Date(appointment.scheduledDate).toLocaleDateString()}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card">
          <h3 className="font-semibold mb-4">Diagnosis</h3>
          <input
            type="text"
            className="input"
            placeholder="Enter diagnosis"
            value={diagnosis}
            onChange={(e) => setDiagnosis(e.target.value)}
            required
          />
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center">
              <Pill className="mr-2" size={18} />
              Medications
            </h3>
            <button
              type="button"
              onClick={addMedication}
              className="flex items-center space-x-1 text-blue-600 text-sm hover:text-blue-700"
            >
              <Plus size={16} />
              <span>Add Medication</span>
            </button>
          </div>

          <div className="space-y-4">
            {medications.map((med, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                    className="mt-2 flex items-center text-red-500 text-sm hover:text-red-700"
                  >
                    <Trash2 size={14} className="mr-1" />
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="font-semibold mb-4">Additional Information</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Valid Until</label>
              <input
                type="date"
                className="input"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                className="input h-24 resize-none"
                placeholder="Additional notes for the patient..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary disabled:opacity-50"
          >
            {submitting ? 'Creating...' : 'Create Prescription'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePrescription;
