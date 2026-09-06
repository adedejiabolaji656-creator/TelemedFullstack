import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';
import { SPECIALIZATIONS } from '../utils/specializations';
import {
  User as UserIcon,
  Mail,
  Lock,
  Phone,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  UserRound,
} from 'lucide-react';

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
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Brand panel */}
      <div className="relative hidden w-[46%] overflow-hidden bg-gradient-to-br from-teal-950 via-cyan-900 to-sky-950 lg:block">
        <div className="pointer-events-none absolute -top-24 right-10 h-80 w-80 rounded-full bg-accent-500/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-16 -left-16 h-72 w-72 rounded-full bg-brand-500/25 blur-3xl" />

        <div className="relative flex h-full flex-col justify-between p-12 text-white">
          <Logo to="/" size={34} light wordmarkClassName="text-lg" />

          <div>
            <span className="badge bg-white/10 text-brand-200 ring-1 ring-white/20 backdrop-blur">
              <Sparkles size={13} />
              Free · No credit card needed
            </span>
            <h2 className="mt-5 max-w-md font-display text-4xl font-extrabold leading-tight tracking-tight">
              Join 120k+ people who see doctors differently.
            </h2>
            <p className="mt-4 max-w-sm text-brand-100/85">
              Skip the waiting room. Get quality care from verified professionals — at home, at
              work, anywhere.
            </p>

            <ul className="mt-10 space-y-3.5">
              {[
                'Unlimited access to 850+ verified doctors',
                'Instant digital prescriptions & records',
                'Secure video visits from any device',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-brand-50/90">
                  <ShieldCheck size={17} className="mt-0.5 shrink-0 text-mint-500" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <p className="text-xs text-brand-200/60">
            © {new Date().getFullYear()} TeleMed Inc. HIPAA-compliant healthcare.
          </p>
        </div>
      </div>

      {/* Form panel */}
      <div className="w-full px-4 py-10 sm:px-8 lg:w-[54%] lg:px-14">
        <div className="mx-auto w-full max-w-md animate-fade-up py-2">
          <div className="mb-8 text-center">
            <h1 className="font-display text-3xl font-extrabold tracking-tight">Create your account</h1>
            <p className="mt-1.5 text-slate-500">Two minutes now, better health forever</p>
          </div>

          {error && (
            <div className="animate-fade-up mb-5 rounded-xl border border-red-100 bg-red-50 p-3.5 text-sm font-medium text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Role picker */}
            <div>
              <label className="label">I am joining as a</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, role: 'patient' })}
                  className={`group flex flex-col items-center gap-1.5 rounded-2xl border-2 p-4 transition-all duration-200 ${
                    form.role === 'patient'
                      ? 'border-brand-500 bg-brand-50 shadow-glow'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <UserRound
                    size={22}
                    className={form.role === 'patient' ? 'text-brand-600' : 'text-slate-400'}
                  />
                  <span
                    className={`text-sm font-bold ${
                      form.role === 'patient' ? 'text-brand-700' : 'text-slate-500'
                    }`}
                  >
                    Patient
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, role: 'doctor' })}
                  className={`group flex flex-col items-center gap-1.5 rounded-2xl border-2 p-4 transition-all duration-200 ${
                    form.role === 'doctor'
                      ? 'border-mint-500 bg-mint-50 shadow-glow'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <Stethoscope
                    size={22}
                    className={form.role === 'doctor' ? 'text-mint-600' : 'text-slate-400'}
                  />
                  <span
                    className={`text-sm font-bold ${
                      form.role === 'doctor' ? 'text-mint-600' : 'text-slate-500'
                    }`}
                  >
                    Doctor
                  </span>
                </button>
              </div>
            </div>

            <div>
              <label className="label" htmlFor="name">
                Full name
              </label>
              <div className="relative">
                <UserIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="name"
                  type="text"
                  name="name"
                  className="input pl-10"
                  placeholder="e.g. Priya Sharma"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div>
              <label className="label" htmlFor="email">
                Email address
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="email"
                  type="email"
                  name="email"
                  className="input pl-10"
                  placeholder="you@company.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div>
              <label className="label" htmlFor="phone">
                Phone{' '}
                <span className="font-normal text-slate-400">(optional)</span>
              </label>
              <div className="relative">
                <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="phone"
                  type="tel"
                  name="phone"
                  className="input pl-10"
                  placeholder="(512) 555-0123"
                  value={form.phone}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label className="label" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="password"
                  type="password"
                  name="password"
                  className="input pl-10"
                  placeholder="At least 6 characters"
                  value={form.password}
                  onChange={handleChange}
                  minLength={6}
                  required
                />
              </div>
            </div>

            {form.role === 'doctor' && (
              <div className="animate-fade-up space-y-5 rounded-2xl border border-mint-100 bg-mint-50/60 p-4">
                <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-mint-600">
                  <Stethoscope size={13} /> Credentials for verification
                </p>
                <div>
                  <label className="label" htmlFor="specialization">
                    Specialization
                  </label>
                  <input
                    id="specialization"
                    type="text"
                    name="specialization"
                    className="input"
                    list="specialization-options"
                    placeholder="e.g. Cardiology, Radiology"
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
                  <label className="label" htmlFor="licenseNumber">
                    Medical license number
                  </label>
                  <input
                    id="licenseNumber"
                    type="text"
                    name="licenseNumber"
                    className="input"
                    placeholder="e.g. MD-LIC-12345"
                    value={form.licenseNumber}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? (
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              ) : (
                <>
                  Create Account
                  <ArrowRight size={16} />
                </>
              )}
            </button>

            <p className="text-center text-xs leading-relaxed text-slate-400">
              By registering you agree to our Terms of Service and Privacy Policy.
            </p>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-brand-600 transition-colors hover:text-brand-700 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
