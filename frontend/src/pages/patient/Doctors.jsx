import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  Stethoscope,
  Star,
  Search,
  Award,
  DollarSign,
  BadgeCheck,
  MapPin,
  ArrowRight,
  SlidersHorizontal,
} from 'lucide-react';
import { SPECIALIZATIONS } from '../../utils/specializations';
import PageHeader, { Avatar } from '../../components/PageHeader';
import { Spinner } from '../../components/Spinner';

const PatientDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState('');
  const [specialization, setSpecialization] = useState('');
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

  const fetchDoctors = async (q = search, spec = specialization) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (spec) params.set('specialization', spec);
      if (q.trim()) params.set('search', q.trim());
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
  }, [search, specialization]);

  const handleSearch = (e) => {
    e.preventDefault();
    clearTimeout(debounceRef.current);
    fetchDoctors();
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <PageHeader
        title="Find a doctor"
        subtitle="Browse verified specialists, compare ratings, and book in seconds."
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
        className="mb-8 flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-card md:flex-row md:items-center"
      >
        <div className="relative flex-1">
          <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            className="input pl-10"
            placeholder="Search by doctor name or specialty..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="relative md:w-72">
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
        <button type="submit" className="btn-primary px-6">
          <Search size={15} />
          Search
        </button>
      </form>

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
                Try a different name or specialty. Only verified doctors are shown here.
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
                      {doctor.location && (
                        <span className="flex items-center gap-1">
                          <MapPin size={13} className="text-slate-400" />
                          {doctor.location}
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
                          ${doctor.consultationFee}
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