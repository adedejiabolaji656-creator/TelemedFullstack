import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UserCog, HeartPulse, MapPin, PhoneCall, ShieldCheck, Save, Loader2 } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import { useAuth } from '../../context/AuthContext';

const STATES_NG = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
  'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT Abuja', 'Gombe',
  'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos',
  'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto',
  'Taraba', 'Yobe', 'Zamfara',
];

const HMO_PROVIDERS = ['Hygeia HMO', 'AXA Mansard Health', 'Reliance HMO', 'Leadway Health', 'Total Health Trust', 'Other'];

const splitList = (arr) => (Array.isArray(arr) ? arr.join(', ') : '');

const PatientProfilePage = () => {
  const { user, fetchUser } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    dateOfBirth: '',
    gender: '',
    bloodType: '',
    allergies: '',
    medicalConditions: '',
    currentMedications: '',
    address: { street: '', city: '', state: '', zipCode: '', country: 'Nigeria' },
    emergencyContact: { name: '', phone: '', relationship: '' },
    insurance: { provider: '', policyNumber: '', groupNumber: '' },
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const p = user?.profile;
    if (!p) return;
    setForm({
      dateOfBirth: p.dateOfBirth ? p.dateOfBirth.slice(0, 10) : '',
      gender: p.gender || '',
      bloodType: p.bloodType || '',
      allergies: splitList(p.allergies),
      medicalConditions: splitList(p.medicalConditions),
      currentMedications: splitList(p.currentMedications),
      address: { ...p.address, country: p.address?.country || 'Nigeria' },
      emergencyContact: { ...p.emergencyContact },
      insurance: { ...p.insurance },
    });
  }, [user]);

  const update = (path, value) =>
    setForm((prev) => {
      const [group, key] = path.split('.');
      if (key) return { ...prev, [group]: { ...prev[group], [key]: value } };
      return { ...prev, [group]: value };
    });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        dateOfBirth: form.dateOfBirth ? new Date(form.dateOfBirth) : undefined,
        gender: form.gender || undefined,
        bloodType: form.bloodType || undefined,
        allergies: form.allergies ? form.allergies.split(',').map((s) => s.trim()).filter(Boolean) : [],
        medicalConditions: form.medicalConditions ? form.medicalConditions.split(',').map((s) => s.trim()).filter(Boolean) : [],
        currentMedications: form.currentMedications ? form.currentMedications.split(',').map((s) => s.trim()).filter(Boolean) : [],
        address: { ...form.address, country: form.address.country || 'Nigeria' },
        emergencyContact: form.emergencyContact,
        insurance: form.insurance,
      };
      await axios.put('/api/auth/patient-profile', payload);
      await fetchUser();
      alert('Health profile updated successfully!');
      navigate('/patient');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <PageHeader
        title="Health Profile"
        subtitle="Blood type, allergies, HMO and emergency contact — only visible to your doctors."
        icon={UserCog}
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="card p-6">
          <h3 className="mb-4 flex items-center gap-2 font-display text-lg font-bold text-slate-900">
            <HeartPulse size={18} className="text-teal-600" /> Basic health details
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Date of birth</label>
              <input
                type="date"
                className="input"
                value={form.dateOfBirth}
                onChange={(e) => update('dateOfBirth', e.target.value)}
              />
            </div>
            <div>
              <label className="label">Blood type</label>
              <select
                className="input"
                value={form.bloodType}
                onChange={(e) => update('bloodType', e.target.value)}
              >
                <option value="">Select...</option>
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Gender</label>
              <select className="input" value={form.gender} onChange={(e) => update('gender', e.target.value)}>
                <option value="">Select...</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="label">Current medications (comma separated)</label>
              <input
                className="input"
                placeholder="e.g. Amlodipine 5 mg, Vitamin B2"
                value={form.currentMedications}
                onChange={(e) => update('currentMedications', e.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Allergies (comma separated)</label>
              <input
                className="input"
                placeholder="e.g. Penicillin, Ibuprofen, Latex"
                value={form.allergies}
                onChange={(e) => update('allergies', e.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Ongoing medical conditions (comma separated)</label>
              <input
                className="input"
                placeholder="e.g. Mild hypertension, Asthma"
                value={form.medicalConditions}
                onChange={(e) => update('medicalConditions', e.target.value)}
              />
            </div>
          </div>
        </section>

        <section className="card p-6">
          <h3 className="mb-4 flex items-center gap-2 font-display text-lg font-bold text-slate-900">
            <MapPin size={18} className="text-teal-600" /> Address
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="label">Street address</label>
              <input
                className="input"
                placeholder="e.g. 12 Admiralty Way, Lekki Phase 1"
                value={form.address.street}
                onChange={(e) => update('address.street', e.target.value)}
              />
            </div>
            <div>
              <label className="label">City</label>
              <input className="input" value={form.address.city} onChange={(e) => update('address.city', e.target.value)} />
            </div>
            <div>
              <label className="label">State</label>
              <select className="input" value={form.address.state} onChange={(e) => update('address.state', e.target.value)}>
                <option value="">Select...</option>
                {STATES_NG.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">LGA / Zip code</label>
              <input className="input" value={form.address.zipCode} onChange={(e) => update('address.zipCode', e.target.value)} />
            </div>
            <div>
              <label className="label">Country</label>
              <input className="input" value={form.address.country} readOnly />
            </div>
          </div>
        </section>

        <section className="card p-6">
          <h3 className="mb-4 flex items-center gap-2 font-display text-lg font-bold text-slate-900">
            <PhoneCall size={18} className="text-teal-600" /> Emergency contact
          </h3>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="label">Name</label>
              <input className="input" value={form.emergencyContact.name} onChange={(e) => update('emergencyContact.name', e.target.value)} />
            </div>
            <div>
              <label className="label">Phone</label>
              <input className="input" placeholder="+234..." value={form.emergencyContact.phone} onChange={(e) => update('emergencyContact.phone', e.target.value)} />
            </div>
            <div>
              <label className="label">Relationship</label>
              <input className="input" placeholder="Spouse, Parent..." value={form.emergencyContact.relationship} onChange={(e) => update('emergencyContact.relationship', e.target.value)} />
            </div>
          </div>
        </section>

        <section className="card p-6">
          <h3 className="mb-4 flex items-center gap-2 font-display text-lg font-bold text-slate-900">
            <ShieldCheck size={18} className="text-teal-600" /> Health insurance / HMO
          </h3>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="label">HMO provider</label>
              <input
                className="input"
                list="hmo-list"
                placeholder="Search or type provider"
                value={form.insurance.provider}
                onChange={(e) => update('insurance.provider', e.target.value)}
              />
              <datalist id="hmo-list">
                {HMO_PROVIDERS.map((h) => (
                  <option key={h} value={h} />
                ))}
              </datalist>
            </div>
            <div>
              <label className="label">Policy number</label>
              <input className="input" value={form.insurance.policyNumber} onChange={(e) => update('insurance.policyNumber', e.target.value)} />
            </div>
            <div>
              <label className="label">Group / Employer code</label>
              <input className="input" value={form.insurance.groupNumber} onChange={(e) => update('insurance.groupNumber', e.target.value)} />
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-400">
            Provide your HMO card details to enable insured consultations where supported.
          </p>
        </section>

        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary px-6 py-3">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="btn-primary px-6 py-3">
            {saving ? (
              <span className="flex items-center gap-2"><Loader2 size={16} className="animate-spin" /> Saving...</span>
            ) : (
              <>
                <Save size={16} /> Save profile
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PatientProfilePage;