import { useEffect, useState } from 'react';
import axios from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { SPECIALIZATIONS } from '../../utils/specializations';
import { Save, Award, Languages, FileText, Stethoscope } from 'lucide-react';
import PageHeader from '../../components/PageHeader';

const DoctorProfileEdit = () => {
  const { user } = useAuth();
  const [form, setForm] = useState({
    specialization: '',
    licenseNumber: '',
    yearsExperience: '',
    bio: '',
    consultationFee: '',
    hospital: '',
    gender: '',
    languages: '',
    education: [{ degree: '', institution: '', year: '' }],
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const profile = user?.profile;
    if (profile) {
      setForm({
        specialization: profile.specialization || '',
        licenseNumber: profile.licenseNumber || '',
        yearsExperience: profile.yearsExperience ?? '',
        bio: profile.bio || '',
        consultationFee: profile.consultationFee ?? '',
        hospital: profile.hospital || '',
        gender: profile.gender || '',
        languages: (profile.languages || []).join(', '),
        education:
          profile.education && profile.education.length > 0
            ? profile.education.map((e) => ({
                degree: e.degree || '',
                institution: e.institution || '',
                year: e.year || '',
              }))
            : [{ degree: '', institution: '', year: '' }],
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setSaved(false);
  };

  const handleEducationChange = (index, field, value) => {
    const updated = [...form.education];
    updated[index][field] = value;
    setForm({ ...form, education: updated });
  };

  const addEducation = () => {
    setForm({ ...form, education: [...form.education, { degree: '', institution: '', year: '' }] });
  };

  const removeEducation = (index) => {
    const updated = form.education.filter((_, i) => i !== index);
    setForm({ ...form, education: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.put('/api/auth/doctor-profile', {
        specialization: form.specialization,
        licenseNumber: form.licenseNumber,
        yearsExperience: Number(form.yearsExperience) || 0,
        bio: form.bio,
        consultationFee: Number(form.consultationFee) || 0,
        hospital: form.hospital,
        gender: form.gender,
        languages: form.languages.split(',').map((l) => l.trim()).filter(Boolean),
        education: form.education
          .filter((edu) => edu.degree || edu.institution)
          .map((edu) => ({
            degree: edu.degree,
            institution: edu.institution,
            year: Number(edu.year) || undefined,
          })),
      });
      await fetchUser();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <PageHeader
        title="Doctor profile"
        subtitle="Update your professional information and public listing."
        icon={Stethoscope}
      />

      {saved && (
        <div className="mb-5 rounded-xl border border-mint-100 bg-mint-50 p-3.5 text-sm font-medium text-mint-600">
          Profile saved successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card">
          <h3 className="mb-4 flex items-center gap-1.5 font-display text-lg font-bold text-slate-900">
            <Award size={18} className="text-mint-600" />
            Professional details
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Specialization</label>
              <input
                type="text"
                name="specialization"
                className="input"
                list="specialization-options"
                value={form.specialization}
                onChange={handleChange}
                required
              />
              <datalist id="specialization-options">
                {SPECIALIZATIONS.map((s) => (
                  <option key={s} value={s} />
                ))}
              </datalist>
            </div>
            <div>
              <label className="label">License Number</label>
              <input
                type="text"
                name="licenseNumber"
                className="input"
                value={form.licenseNumber}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="label">Years of Experience</label>
              <input
                type="number"
                name="yearsExperience"
                className="input"
                min="0"
                value={form.yearsExperience}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="label">Consultation Fee (₦)</label>
              <input
                type="number"
                name="consultationFee"
                className="input"
                min="0"
                step="0.01"
                value={form.consultationFee}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="label">Hospital / Clinic</label>
              <input
                type="text"
                name="hospital"
                className="input"
                placeholder="e.g. LUTH, Idi-Araba"
                value={form.hospital}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="label">Gender</label>
              <select
                name="gender"
                className="input"
                value={form.gender}
                onChange={handleChange}
              >
                <option value="">Prefer not to say</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="label">
                <Languages size={14} className="inline mr-1" />
                Languages (comma separated)
              </label>
              <input
                type="text"
                name="languages"
                className="input"
                placeholder="English, Spanish, Hindi"
                value={form.languages}
                onChange={handleChange}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Bio</label>
              <textarea
                name="bio"
                className="input h-32 resize-none"
                maxLength={1000}
                placeholder="Tell patients about your background and approach..."
                value={form.bio}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="mb-4 flex items-center gap-1.5 font-display text-lg font-bold text-slate-900">
            <FileText size={18} className="text-mint-600" />
            Education
          </h3>
          <div className="space-y-4">
            {form.education.map((edu, index) => (
              <div key={index} className="grid grid-cols-1 sm:grid-cols-3 gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                <input
                  type="text"
                  className="input"
                  placeholder="Degree (e.g. MD)"
                  value={edu.degree}
                  onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                />
                <input
                  type="text"
                  className="input"
                  placeholder="Institution"
                  value={edu.institution}
                  onChange={(e) => handleEducationChange(index, 'institution', e.target.value)}
                />
                <div className="flex gap-2">
                  <input
                    type="number"
                    className="input"
                    placeholder="Year"
                    value={edu.year}
                    onChange={(e) => handleEducationChange(index, 'year', e.target.value)}
                  />
                  {form.education.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeEducation(index)}
                      className="btn-secondary px-3 text-red-600"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addEducation}
              className="text-sm font-semibold text-teal-600 transition-colors hover:underline hover:text-teal-700"
            >
              + Add education
            </button>
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" disabled={saving} className="btn-primary flex items-center">
            <Save size={16} className="mr-2" />
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DoctorProfileEdit;
