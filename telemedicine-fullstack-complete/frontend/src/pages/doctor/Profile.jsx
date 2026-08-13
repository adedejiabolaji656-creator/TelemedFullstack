import { useEffect, useState } from 'react';
import axios from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Save, Award, Languages, FileText } from 'lucide-react';

const DoctorProfileEdit = () => {
  const { user } = useAuth();
  const [form, setForm] = useState({
    specialization: '',
    licenseNumber: '',
    yearsExperience: '',
    bio: '',
    consultationFee: '',
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
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-2">Doctor Profile</h1>
      <p className="text-gray-500 mb-6">Update your professional information</p>

      {saved && (
        <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm">
          Profile saved successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card">
          <h3 className="font-semibold mb-4 flex items-center">
            <Award className="mr-2 text-blue-600" size={18} />
            Professional Details
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Specialization</label>
              <input
                type="text"
                name="specialization"
                className="input"
                value={form.specialization}
                onChange={handleChange}
                required
              />
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
              <label className="label">Consultation Fee ($)</label>
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
          <h3 className="font-semibold mb-4 flex items-center">
            <FileText className="mr-2 text-blue-600" size={18} />
            Education
          </h3>
          <div className="space-y-4">
            {form.education.map((edu, index) => (
              <div key={index} className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-gray-50 rounded-lg">
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
              className="text-blue-600 text-sm font-medium hover:underline"
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
