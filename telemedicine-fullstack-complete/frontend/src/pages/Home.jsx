import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  HeartPulse,
  Video,
  ShieldCheck,
  Clock,
  MessageSquare,
  FileText,
  Stethoscope,
  Star,
  ArrowRight,
  CalendarPlus,
  Activity,
  Sparkles,
  BadgeCheck,
  UserRoundSearch,
  CalendarCheck,
} from 'lucide-react';

const features = [
  {
    icon: Video,
    title: 'HD Video Consultations',
    desc: 'Face-to-face with your doctor in seconds — crystal-clear video, screen sharing, and in-call chat.',
    tint: 'from-brand-500 to-brand-600',
  },
  {
    icon: Clock,
    title: '24/7 Availability',
    desc: 'Book appointments day or night. On-call doctors are always a tap away, even at 3 AM.',
    tint: 'from-amber-400 to-orange-500',
  },
  {
    icon: ShieldCheck,
    title: 'Secure & Private',
    desc: 'End-to-end encrypted consultations and HIPAA-compliant records. Your data stays yours.',
    tint: 'from-mint-500 to-mint-600',
  },
  {
    icon: FileText,
    title: 'Digital Prescriptions',
    desc: 'Prescriptions delivered to your inbox instantly — shareable with any pharmacy in one tap.',
    tint: 'from-accent-500 to-accent-600',
  },
  {
    icon: MessageSquare,
    title: 'Live Chat & Follow-up',
    desc: 'Message your care team before and after every visit. No question is too small.',
    tint: 'from-pink-500 to-rose-500',
  },
  {
    icon: BadgeCheck,
    title: 'Verified Doctors Only',
    desc: 'Every doctor passes license verification and manual review before joining TeleMed.',
    tint: 'from-cyan-500 to-brand-600',
  },
];

const specialties = [
  { emoji: '🫀', name: 'Cardiology' },
  { emoji: '🧠', name: 'Neurology' },
  { emoji: '🦴', name: 'Orthopedics' },
  { emoji: '👶', name: 'Pediatrics' },
  { emoji: '🩺', name: 'General Medicine' },
  { emoji: '👁️', name: 'Ophthalmology' },
  { emoji: '🌸', name: 'Dermatology' },
  { emoji: '🍎', name: 'Nutrition' },
];

const stats = [
  { value: '850+', label: 'Verified Doctors' },
  { value: '120k+', label: 'Happy Patients' },
  { value: '450k+', label: 'Consultations' },
  { value: '4.9/5', label: 'Average Rating' },
];

const steps = [
  {
    icon: UserRoundSearch,
    title: 'Find your doctor',
    desc: 'Browse verified specialists by field, rating, and availability. Read real patient reviews.',
  },
  {
    icon: CalendarCheck,
    title: 'Book in seconds',
    desc: 'Pick a slot that fits your schedule — no waiting rooms, no phone queues, no paperwork.',
  },
  {
    icon: Video,
    title: 'Meet online',
    desc: 'Join a secure video visit, get your diagnosis, prescription, and follow-up plan instantly.',
  },
];

const testimonials = [
  {
    name: 'Amara Johnson',
    role: 'Patient · Austin, TX',
    initials: 'AJ',
    color: 'from-brand-500 to-accent-500',
    text: 'I booked a dermatology consult during my lunch break and had a prescription by dinner. This is how healthcare should work.',
  },
  {
    name: 'Dr. Raj Patel',
    role: 'Cardiologist · TeleMed partner',
    initials: 'RP',
    color: 'from-mint-500 to-mint-600',
    text: 'The scheduling tools are flawless. I see more patients, skip the admin work, and my no-show rate dropped by half.',
  },
  {
    name: 'Lena Martinez',
    role: 'Mother of two · Denver, CO',
    initials: 'LM',
    color: 'from-pink-500 to-rose-500',
    text: 'Midnight ear infection with a toddler? Our pediatrician picked up on TeleMed in under five minutes. Lifesaver.',
  },
];

const HeroVisual = () => (
  <div className="relative mx-auto w-full max-w-md lg:max-w-none">
    {/* blobs */}
    <div className="pointer-events-none absolute -left-16 -top-10 h-56 w-56 animate-blob rounded-full bg-brand-400/30 blur-3xl" />
    <div className="pointer-events-none absolute -bottom-8 -right-6 h-64 w-64 animate-blob rounded-full bg-accent-500/25 blur-3xl [animation-delay:-6s]" />

    {/* main appointment card */}
    <div className="relative animate-fade-up rounded-3xl bg-white/95 p-5 shadow-lift ring-1 ring-white/60 backdrop-blur">
      <div className="flex items-center gap-4">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 font-display text-lg font-bold text-white shadow-glow">
          SM
        </span>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 font-semibold text-slate-900">
            Dr. Sarah Miller
            <BadgeCheck size={15} className="shrink-0 text-brand-500" />
          </p>
          <p className="text-sm text-slate-500">Cardiologist · 12 yrs experience</p>
        </div>
        <span className="badge bg-mint-50 text-mint-600 ring-1 ring-mint-100">
          <span className="h-1.5 w-1.5 rounded-full bg-mint-500" />
          Online
        </span>
      </div>

      <div className="mt-4 flex items-center gap-2 rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-100">
        <CalendarPlus size={18} className="shrink-0 text-brand-600" />
        <p className="text-sm font-medium text-slate-700">Today, 4:30 PM</p>
        <span className="ml-auto badge bg-brand-50 text-brand-700">Video visit</span>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        {['09:00', '11:30', '16:00'].map((t) => (
          <button
            key={t}
            type="button"
            className="rounded-xl border border-slate-200 py-2 text-sm font-semibold text-slate-600 transition-all hover:border-brand-400 hover:bg-brand-50 hover:text-brand-700"
          >
            {t}
          </button>
        ))}
      </div>

      <Link
        to="/register"
        className="btn-primary mt-4 w-full py-2.5 text-sm"
      >
        Book Appointment
        <ArrowRight size={15} />
      </Link>
    </div>

    {/* floating video call chip */}
    <div className="absolute -left-6 top-16 hidden animate-float rounded-2xl bg-white p-3 shadow-lift ring-1 ring-slate-100 sm:block lg:-left-12">
      <div className="flex items-center gap-2.5">
        <span className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-red-500 text-white">
          <Video size={17} />
          <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-white bg-mint-500" />
        </span>
        <div>
          <p className="text-xs font-bold text-slate-800">Call in progress</p>
          <p className="text-[11px] tabular-nums text-slate-400">12:47 · HD quality</p>
        </div>
      </div>
    </div>

    {/* floating health stat chip */}
    <div className="absolute -bottom-6 right-2 hidden animate-float rounded-2xl bg-white p-3 shadow-lift ring-1 ring-slate-100 [animation-delay:-3s] sm:block lg:-right-8">
      <div className="flex items-center gap-2.5">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-accent-500 to-accent-600 text-white">
          <Activity size={17} />
        </span>
        <div>
          <p className="text-xs font-bold text-slate-800">Heart rate</p>
          <p className="text-[11px] text-slate-400">
            <span className="font-bold text-mint-600">72 bpm</span> · Normal
          </p>
        </div>
      </div>
    </div>

    {/* floating rating chip */}
    <div className="absolute -top-5 right-8 hidden animate-float rounded-2xl bg-white px-3.5 py-2.5 shadow-lift ring-1 ring-slate-100 [animation-delay:-1.5s] md:block">
      <div className="flex items-center gap-1.5">
        {[...Array(5)].map((_, i) => (
          <Star key={i} size={13} className="fill-amber-400 text-amber-400" />
        ))}
        <span className="ml-1 text-xs font-bold text-slate-700">4.9</span>
      </div>
    </div>
  </div>
);

const Home = () => {
  const { user } = useAuth();

  return (
    <div>
      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-950 via-brand-800 to-accent-900 text-white">
        {/* decorative grid + glows */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:linear-gradient(rgba(255,255,255,.6)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.6)_1px,transparent_1px)] [background-size:44px_44px]" />
        <div className="pointer-events-none absolute -top-32 right-1/4 h-96 w-96 rounded-full bg-brand-500/25 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-72 w-72 rounded-full bg-accent-500/20 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 pb-24 pt-16 sm:px-6 lg:grid lg:grid-cols-2 lg:items-center lg:gap-16 lg:px-8 lg:pt-24">
          <div className="max-w-xl">
            <span className="badge animate-fade-in bg-white/10 text-brand-200 ring-1 ring-white/20 backdrop-blur">
              <Sparkles size={13} />
              Trusted by 120,000+ patients worldwide
            </span>

            <h1 className="mt-5 animate-fade-up font-display text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl xl:text-6xl [animation-delay:80ms]">
              Healthcare that
              <br />
              comes <span className="bg-gradient-to-r from-brand-300 via-sky-300 to-accent-400 bg-clip-text text-transparent">to you.</span>
            </h1>

            <p className="mt-6 animate-fade-up text-lg leading-relaxed text-brand-100/90 [animation-delay:160ms]">
              Connect with verified doctors in minutes, book video consultations, get digital
              prescriptions — all without leaving your couch.
            </p>

            {!user ? (
              <div className="mt-9 flex animate-fade-up flex-wrap gap-3.5 [animation-delay:240ms]">
                <Link to="/register" className="btn-primary px-8 py-3.5 text-base">
                  Get Started Free
                  <ArrowRight size={17} />
                </Link>
                <Link to="/login" className="btn-ghost-light px-8 py-3.5 text-base">
                  Sign In
                </Link>
              </div>
            ) : (
              <div className="mt-9 flex animate-fade-up flex-wrap gap-3.5 [animation-delay:240ms]">
                <Link
                  to={user.role === 'doctor' ? '/doctor/dashboard' : user.role === 'admin' ? '/admin' : '/patient/doctors'}
                  className="btn-primary px-8 py-3.5 text-base"
                >
                  Go to Dashboard
                  <ArrowRight size={17} />
                </Link>
              </div>
            )}

            {/* trust row */}
            <div className="mt-10 flex animate-fade-up items-center gap-4 [animation-delay:320ms]">
              <div className="flex -space-x-2.5">
                {['from-rose-400 to-orange-400', 'from-brand-400 to-brand-600', 'from-mint-500 to-teal-500', 'from-accent-400 to-purple-500'].map(
                  (c, i) => (
                    <span
                      key={i}
                      className={`flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br ${c} text-[10px] font-bold text-white ring-2 ring-brand-900`}
                    >
                      {['JM', 'AK', 'SO', 'TP'][i]}
                    </span>
                  )
                )}
              </div>
              <p className="text-sm text-brand-100/80">
                <span className="font-bold text-white">2,400+ visits</span> booked this week
              </p>
            </div>
          </div>

          <div className="mt-16 lg:mt-0">
            <HeroVisual />
          </div>
        </div>

        {/* wave divider */}
        <svg viewBox="0 0 1440 70" preserveAspectRatio="none" className="absolute bottom-0 left-0 h-10 w-full text-slate-50 sm:h-14" fill="currentColor">
          <path d="M0,40 C240,75 480,0 720,20 C960,40 1200,65 1440,35 L1440,70 L0,70 Z" />
        </svg>
      </section>

      {/* ================= STATS ================= */}
      <section className="-mb-2 pt-2">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="card grid grid-cols-2 divide-slate-100 p-0 shadow-lift sm:grid-cols-4 sm:divide-x">
            {stats.map((s) => (
              <div key={s.label} className="px-6 py-7 text-center">
                <p className="gradient-text font-display text-3xl font-extrabold">{s.value}</p>
                <p className="mt-1 text-sm font-medium text-slate-500">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= SPECIALTIES ================= */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <h2 className="font-display text-3xl font-extrabold sm:text-4xl">
              Care for <span className="gradient-text">every need</span>
            </h2>
            <p className="mt-3 text-slate-500">
              Specialist care across 20+ fields of medicine, available around the clock.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {specialties.map((s) => (
              <Link
                key={s.name}
                to={user && user.role === 'patient' ? '/patient/doctors' : '/register'}
                className="group flex items-center gap-2.5 rounded-2xl bg-white px-5 py-3.5 shadow-card ring-1 ring-slate-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-lift hover:ring-brand-200"
              >
                <span className="text-xl transition-transform duration-300 group-hover:scale-125 group-hover:-rotate-6">
                  {s.emoji}
                </span>
                <span className="text-sm font-semibold text-slate-700 group-hover:text-brand-700">
                  {s.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ================= FEATURES ================= */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="font-display text-3xl font-extrabold sm:text-4xl">
              Why patients <span className="gradient-text">love TeleMed</span>
            </h2>
            <p className="mt-3 text-slate-500">
              Everything you need for modern healthcare, wrapped into one seamless platform.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div key={f.title} className="card card-hover group relative overflow-hidden">
                <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-gradient-to-br from-brand-50 to-transparent opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />
                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${f.tint} text-white shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3`}
                >
                  <f.icon size={24} />
                </div>
                <h3 className="mb-2 mt-4 font-display text-lg font-bold">{f.title}</h3>
                <p className="text-sm leading-relaxed text-slate-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <h2 className="font-display text-3xl font-extrabold sm:text-4xl">
              Better in <span className="gradient-text">three steps</span>
            </h2>
            <p className="mt-3 text-slate-500">From "I feel awful" to feeling better — faster than a parking lot.</p>
          </div>
          <div className="relative grid gap-10 md:grid-cols-3">
            {/* connector line */}
            <div className="pointer-events-none absolute left-[16%] right-[16%] top-9 hidden h-0.5 bg-gradient-to-r from-brand-200 via-brand-300 to-accent-200 md:block" />
            {steps.map((step, i) => (
              <div key={step.title} className="relative text-center">
                <div className="relative z-10 mx-auto flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-3xl bg-white shadow-lift ring-1 ring-slate-100">
                  <step.icon size={28} className="text-brand-600" />
                  <span className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-accent-600 font-display text-xs font-extrabold text-white shadow-md">
                    {i + 1}
                  </span>
                </div>
                <h3 className="mb-2 mt-5 font-display text-lg font-bold">{step.title}</h3>
                <p className="mx-auto max-w-xs text-sm leading-relaxed text-slate-500">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= TESTIMONIALS ================= */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="font-display text-3xl font-extrabold sm:text-4xl">
              Stories that <span className="gradient-text">keep us going</span>
            </h2>
            <p className="mt-3 text-slate-500">Real experiences from patients and doctors on TeleMed.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <figure key={t.name} className="card card-hover relative">
                <span className="absolute right-6 top-4 select-none font-display text-6xl leading-none text-brand-100">
                  "
                </span>
                <div className="flex gap-0.5 pt-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={15} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <blockquote className="mt-4 text-sm leading-relaxed text-slate-600">{t.text}</blockquote>
                <figcaption className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-5">
                  <span
                    className={`flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br ${t.color} font-display text-xs font-bold text-white shadow-md`}
                  >
                    {t.initials}
                  </span>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{t.name}</p>
                    <p className="text-xs text-slate-400">{t.role}</p>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand-700 via-brand-600 to-accent-700 px-6 py-16 text-center text-white shadow-lift sm:px-16">
            <div className="pointer-events-none absolute inset-0 opacity-[0.08] [background-image:radial-gradient(white_1px,transparent_1px)] [background-size:22px_22px]" />
            <div className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -right-10 h-64 w-64 rounded-full bg-brand-300/20 blur-3xl" />

            <div className="relative">
              <HeartPulse size={36} className="mx-auto mb-5 animate-pulse-soft text-brand-200" strokeWidth={2.2} />
              <h2 className="font-display text-3xl font-extrabold sm:text-4xl">
                Your doctor is one tap away
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-brand-100">
                Join free today. First consultation is on us — because everyone deserves great
                healthcare.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 font-semibold text-brand-700 shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-50 active:scale-[0.98]"
                >
                  Create Free Account
                  <ArrowRight size={17} />
                </Link>
                <Stethoscope className="hidden self-center opacity-40 sm:block" size={22} />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
