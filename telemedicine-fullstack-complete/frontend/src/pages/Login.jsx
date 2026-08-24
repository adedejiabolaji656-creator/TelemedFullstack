import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  HeartPulse,
  Mail,
  Lock,
  ArrowRight,
  Video,
  ShieldCheck,
  Star,
  BadgeCheck,
} from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      if (user.role === 'patient') navigate('/patient/doctors');
      else if (user.role === 'doctor') navigate('/doctor/dashboard');
      else navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Brand panel */}
      <div className="relative hidden w-[46%] overflow-hidden bg-gradient-to-br from-brand-950 via-brand-800 to-accent-900 lg:block">
        <div className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:linear-gradient(rgba(255,255,255,.6)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.6)_1px,transparent_1px)] [background-size:40px_40px]" />
        <div className="pointer-events-none absolute -top-24 -right-16 h-80 w-80 rounded-full bg-brand-500/25 blur-3xl" />
        <div className="pointer-events-none absolute bottom-10 -left-20 h-72 w-72 rounded-full bg-accent-500/20 blur-3xl" />

        <div className="relative flex h-full flex-col justify-between p-12 text-white">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/25 backdrop-blur">
              <HeartPulse size={19} strokeWidth={2.5} />
            </span>
            <span className="font-display text-xl font-extrabold">TeleMed</span>
          </Link>

          <div>
            <h2 className="max-w-md font-display text-4xl font-extrabold leading-tight tracking-tight">
              Welcome back to healthier.
            </h2>
            <p className="mt-4 max-w-sm text-brand-100/85">
              Your doctors, records, and prescriptions are right where you left them — one secure
              sign-in away.
            </p>

            <div className="mt-10 space-y-4">
              <div className="flex items-center gap-3.5 rounded-2xl bg-white/[0.07] p-4 ring-1 ring-white/10 backdrop-blur transition-colors hover:bg-white/10">
                <Video size={20} className="shrink-0 text-brand-300" />
                <p className="text-sm text-brand-50/90">
                  <span className="font-semibold text-white">450k+ consultations</span> delivered
                  in crystal-clear HD
                </p>
              </div>
              <div className="flex items-center gap-3.5 rounded-2xl bg-white/[0.07] p-4 ring-1 ring-white/10 backdrop-blur transition-colors hover:bg-white/10">
                <ShieldCheck size={20} className="shrink-0 text-mint-500" />
                <p className="text-sm text-brand-50/90">
                  <span className="font-semibold text-white">End-to-end encrypted</span> · your
                  health data stays private
                </p>
              </div>
              <div className="flex items-center gap-3.5 rounded-2xl bg-white/[0.07] p-4 ring-1 ring-white/10 backdrop-blur transition-colors hover:bg-white/10">
                <Star size={20} className="shrink-0 fill-amber-400 text-amber-400" />
                <p className="text-sm text-brand-50/90">
                  Rated <span className="font-semibold text-white">4.9/5</span> by patients and
                  providers alike
                </p>
              </div>
            </div>
          </div>

          <p className="text-xs text-brand-200/60">
            © {new Date().getFullYear()} TeleMed Inc. HIPAA-compliant healthcare.
          </p>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex w-full items-center justify-center px-4 py-10 sm:px-8 lg:w-[54%]">
        <div className="w-full max-w-md animate-fade-up">
          <div className="mb-8 text-center lg:text-left">
            <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-accent-600 text-white shadow-glow lg:mx-0">
              <HeartPulse size={26} strokeWidth={2.4} />
            </span>
            <h1 className="font-display text-3xl font-extrabold tracking-tight">Welcome back</h1>
            <p className="mt-1.5 text-slate-500">Sign in to continue your care journey</p>
          </div>

          {error && (
            <div className="animate-fade-up mb-5 rounded-xl border border-red-100 bg-red-50 p-3.5 text-sm font-medium text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label" htmlFor="email">
                Email address
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="email"
                  type="email"
                  className="input pl-10"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
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
                  className="input pl-10"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? (
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              ) : (
                <>
                  Sign In
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="my-7 flex items-center gap-3">
            <span className="h-px flex-1 bg-slate-200" />
            <span className="text-xs font-medium uppercase tracking-wide text-slate-400">or</span>
            <span className="h-px flex-1 bg-slate-200" />
          </div>

          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-3.5 text-center text-xs text-slate-500">
            <p className="mb-1 flex items-center justify-center gap-1 font-semibold text-slate-600">
              <BadgeCheck size={13} className="text-brand-500" /> Demo accounts
            </p>
            <p>patient@example.com · doctor@example.com · admin@telemedicine.com</p>
          </div>

          <p className="mt-7 text-center text-sm text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-brand-600 transition-colors hover:text-brand-700 hover:underline">
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
