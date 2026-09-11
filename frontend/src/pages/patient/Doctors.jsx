import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  Stethoscope,
  Star,
  Search,
  Award,
  BadgeCheck,
  MapPin,
  ArrowRight,
  Building2,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { SPECIALIZATIONS } from '../../utils/specializations';
import PageHeader, { Avatar } from '../../components/PageHeader';
import { Spinner } from '../../components/Spinner';
import { naira } from '../../utils/format';

const LANGUAGES = ['English', 'Yoruba', 'Igbo', 'Hausa', 'Spanish', 'French'];
const FEE_TIERS = [
  { label: 'Any fee', value: '' },
  { label: 'Under ₦10,000', value: '10000' },
  { label: 'Under ₦20,000', value: '20000' },
  { label: 'Under ₦30,000', value: '30000' },
];

const PatientDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [city, setCity] = useState('');
  const [maxFee, setMaxFee] = useState('');
  const [language, setLanguage] = useState('');
  const [gender, setGender] = useState('');
  const [specializations, setSpecializations] = useState(SPECIALIZATIONS);
  const [loading, setLoading] = useState(true);
  const debounceRef = useRef(null);

  useEffect(() => {
    axios
      .get('/api/doctors/specializations')
      .then((res) => {
        const dynamic = res.data.specializations || [];
        const merged = [...SPECIALIZATIONS];
        dynamic.forEach((s) => {
          if (!merged.some((x) => x.toLowerCase() === s.toLowerCase())) {
            merged.push(s);
          }
        });
        setSpecializations(merged);
      })
      .catch(() => {
        setSpecializations(SPECIALIZATIONS);
      });
  }, []);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (specialization) params.set('specialization', specialization);
      if (search.trim()) params.set('search', search.trim());
      if (city.trim()) params.set('city', city.trim());
      if (maxFee) params.set('maxFee', maxFee);
      if (language) params.set('language', language);
      if (gender) params.set('gender', gender);
      const query = params.toString();
      const res = await axios.get(`/api/doctors${query ? `?${query}` : ''}`);
      setDoctors(res.data.doctors);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchDoctors();
    }, 400);
    return () => clearTimeout(debounceRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, specialization, city, maxFee, language, gender]);

  const handleSearch = (e) => {
    e.preventDefault();
    clearTimeout(debounceRef.current);
    fetchDoctors();
  };

  const clearFilters = () => {
    setCity('');
    setMaxFee('');
    setLanguage('');
    setGender('');
    setSpecialization('');
    setSearch('');
  };

  const hasFilters = city || maxFee || language || gender || specialization || search;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <PageHeader
        title="Find a doctor"
        subtitle="Search verified specialists across Nigeria — compare fees, locations and reviews, then book."
        icon={Stethoscope}
        actions={
          <span className="badge bg-mint-50 text-mint-600 ring-1 ring-mint-100">
            <span className="h-1.5 w-1.5 rounded-full bg-mint-500" />
            {doctors.length ? `${doctors.length} doctors available` : 'Verified network'}
          </span>
        }
      />

      {/* Search + filters */}
      <form
        onSubmit={handleSearch}
        className="mb-3 flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-card md:flex-row md:items-center"
      >
        <div className="relative flex-1">
          <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            className="input pl-10"
            placeholder="Search by doctor, specialty or hospital..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="relative md:w-56">
          <SlidersHorizontal size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <select
            className="input appearance-none pl-10"
            value={specialization}
            onChange={(e) => setSpecialization(e.target.value)}
          >
            <option value="">All Specializations</option>
            {specializations.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div className="relative md:w-48">
          <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <select
            className="input appearance-none pl-10"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          >
            <option value="">All cities</option>
            {['Lagos', 'Abuja', 'Ibadan', 'Kano', 'Port Harcourt', 'Enugu'].map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <button type="submit" className="btn-primary px-6">
          <Search size={15} />
          Search
        </button>
      </form>

      {/* Secondary filters */}
      <div className="mb-8 flex flex-wrap items-center gap-2">
        {FEE_TIERS.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => setMaxFee(t.value)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
              maxFee === t.value
                ? 'bg-teal-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {t.label}
          </button>
        ))}
        <span className="mx-1 hidden h-4 w-px bg-slate-200 sm:block" />
        {LANGUAGES.map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => setLanguage(l === language ? '' : l)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
              language === l
                ? 'bg-teal-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {l}
          </button>
        ))}
        <span className="mx-1 hidden h-4 w-px bg-slate-200 sm:block" />
        {['male', 'female'].map((g) => (
          <button
            key={g}
            type="button"
            onClick={() => setGender(g === gender ? '' : g)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize transition-colors ${
              gender === g
                ? 'bg-teal-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {g === 'male' ? 'Male doctor' : 'Female doctor'}
          </button>
        ))}
        {hasFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="ml-auto flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-50"
          >
            <X size={12} /> Clear filters
          </button>
        )}
      </div>

      {loading && doctors.length === 0 ? (
        <Spinner label="Finding doctors..." />
      ) : (
        <>
          {loading && <p className="mb-4 text-sm text-slate-400">Searching…</p>}

          {doctors.length === 0 ? (
            <div className="card mx-auto max-w-lg py-16 text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 text-slate-300 ring-1 ring-slate-100">
                <Stethoscope size={30} />
              </div>
              <p className="font-display text-lg font-bold text-slate-800">No doctors found</p>
              <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
                Try a different name, specialty or city. Only verified doctors are shown here.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {doctors.map((doctor) => (
                <Link
                  key={doctor._id}
                  to={`/patient/doctors/${doctor._id}`}
                  className="card card-hover group relative flex flex-col overflow-hidden p-0"
                >
                  {/* top banner */}
                  <div className="relative h-20 overflow-hidden bg-gradient-to-br from-teal-500 via-cyan-600 to-sky-700">
                    <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(rgba(255,255,255,.8)_1px,transparent_1px)] [background-size:14px_14px]" />
                    <span className="absolute right-3 top-3 badge bg-white/15 text-white ring-1 ring-white/25 backdrop-blur">
                      <BadgeCheck size={12} />
                      Verified
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col p-5">
                    <div className="-mt-12 mb-4 flex items-end justify-between">
                      <Avatar
                        name={doctor.user?.name}
                        className="h-16 w-16 text-base shadow-lg ring-4 ring-white"
                      />
                      <span className="flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-600 ring-1 ring-amber-100">
                        <Star size={12} className="fill-amber-400 text-amber-400" />
                        {doctor.rating || 'New'}
                        <span className="font-medium text-amber-500">
                          ({doctor.reviewCount || 0})
                        </span>
                      </span>
                    </div>

                    <h3 className="font-display text-lg font-bold text-slate-900">
                      Dr. {doctor.user?.name}
                    </h3>
                    <p className="mt-0.5 text-sm font-semibold text-teal-600">
                      {doctor.specialization}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs font-medium text-slate-500">
                      <span className="flex items-center gap-1">
                        <Award size={13} className="text-slate-400" />
                        {doctor.yearsExperience} yrs experience
                      </span>
                      {doctor.hospital && (
                        <span className="flex items-center gap-1 truncate">
                          <Building2 size={13} className="text-slate-400" />
                          {doctor.hospital}
                        </span>
                      )}
                      {doctor.address?.state && (
                        <span className="flex items-center gap-1">
                          <MapPin size={13} className="text-slate-400" />
                          {doctor.address.street ? `${doctor.address.street}, ` : ''}{doctor.address.city}, {doctor.address.state}, Nigeria
                        </span>
                      )}
                    </div>

                    {doctor.bio && (
                      <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-slate-500">
                        {doctor.bio}
                      </p>
                    )}

                    <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4">
                      <div>
                        <span className="font-display text-lg font-extrabold text-slate-900">
                          {naira(doctor.consultationFee)}
                        </span>
                        <span className="text-xs text-slate-400"> / visit</span>
                      </div>
                      <span className="btn-primary px-4 py-2 text-xs group-hover:opacity-90">
                        Book now
                        <ArrowRight size={13} />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PatientDoctors;