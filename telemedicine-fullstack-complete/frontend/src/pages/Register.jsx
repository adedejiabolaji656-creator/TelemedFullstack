import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Stethoscope, User as UserIcon, Mail, Lock, Phone } from 'lucide-react';

const Register = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'patient',
    specialization: '',
    licenseNumber: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await register(form);
      if (user.role === 'patient') navigate('/patient/doctors');
      else if (user.role === 'doctor') navigate('/doctor/dashboard');
      else navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="card">
          <div className="text-center mb-6">
            <Stethoscope className="mx-auto text-blue-600 mb-2" size={40} />
            <h1 className="text-2xl font-bold">Create your account</h1>
            <p className="text-gray-500 text-sm">Join TeleMed today</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">I am a</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, role: 'patient' })}
                  className={`p-3 rounded-lg border-2 text-sm font-medium transition-colors ${
                    form.role === 'patient'
                      ? 'border-blue-600 bg-blue-50 text-blue-600'
                      : 'border-gray-200 hover:border-gray-300 text-gray-600'
                  }`}
                >
                  Patient
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, role: 'doctor' })}
                  className={`p-3 rounded-lg border-2 text-sm font-medium transition-colors ${
                    form.role === 'doctor'
                      ? 'border-blue-600 bg-blue-50 text-blue-600'
                      : 'border-gray-200 hover:border-gray-300 text-gray-600'
                  }`}
                >
                  Doctor
                </button>
              </div>
            </div>

            <div>
              <label className="label">Full Name</label>
              <div className="relative">
                <UserIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  name="name"
                  className="input pl-9"
                  placeholder="Jane Smith"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div>
              <label className="label">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  className="input pl-9"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div>
              <label className="label">Phone</label>
              <div className="relative">
                <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="tel"
                  name="phone"
                  className="input pl-9"
                  placeholder="555-000-0000"
                  value={form.phone}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  name="password"
                  className="input pl-9"
                  placeholder="At least 6 characters"
                  value={form.password}
                  onChange={handleChange}
                  minLength={6}
                  required
                />
              </div>
            </div>

            {form.role === 'doctor' && (
              <>
                <div>
                  <label className="label">Specialization</label>
                  <input
                    type="text"
                    name="specialization"
                    className="input"
                    placeholder="e.g. Cardiology"
                    value={form.specialization}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label className="label">Medical License Number</label>
                  <input
                    type="text"
                    name="licenseNumber"
                    className="input"
                    placeholder="e.g. MD-LIC-1234"
                    value={form.licenseNumber}
                    onChange={handleChange}
                    required
                  />
                </div>
              </>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Creating account...' : 'Register'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
