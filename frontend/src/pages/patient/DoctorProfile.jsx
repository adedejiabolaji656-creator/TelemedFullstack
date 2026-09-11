import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import {
  Star,
  MapPin,
  Clock,
  Award,
  Calendar,
  BadgeCheck,
  GraduationCap,
  Building2,
  Mail,
  Phone,
  ArrowLeft,
} from 'lucide-react';
import { Spinner } from '../../components/Spinner';
import { naira } from '../../utils/format';

const getAvatarInitials = (name) =>
  (name || '?')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

const DoctorProfilePage = () => {
  const { id } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDoctor();
  }, [id]);

  const fetchDoctor = async () => {
    try {
      const res = await axios.get(`/api/doctors/${id}`);
      setDoctor(res.data.doctor);
    } catch (error) {
      console.error('Error fetching doctor:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Spinner label="Loading doctor profile..." />;
  }

  if (!doctor) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="font-display text-lg font-bold text-slate-700">Doctor not found</p>
        <Link to="/patient/doctors" className="btn-secondary mt-4">
          <ArrowLeft size={15} />
          Back to doctors
        </Link>
      </div>
    );
  }

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const name = doctor.user?.name;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <Link
        to="/patient/doctors"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition-colors hover:text-teal-600"
      >
        <ArrowLeft size={15} />
        Back to search
      </Link>

      {/* Profile card */}
      <div className="card relative overflow-hidden p-0">
        <div className="h-28 bg-gradient-to-br from-teal-500 via-cyan-600 to-sky-700">
          <div className="h-full w-full opacity-20 [background-image:radial-gradient(rgba(255,255,255,.8)_1px,transparent_1px)] [background-size:16px_16px]" />
        </div>
        <div className="px-6 pb-6 sm:px-8">
          <div className="-mt-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <span className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-700 font-display text-2xl font-bold text-white shadow-lg ring-4 ring-white">
                {doctor.user?.avatar ? (
                  <img src={doctor.user.avatar} alt="" className="h-full w-full object-cover" />
                ) : (
                  getAvatarInitials(name)
                )}
              </span>
              <div>
                <h1 className="font-display text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                  Dr. {name}
                  <BadgeCheck size={22} className="ml-2 inline-block text-teal-500" />
                </h1>
                <p className="mt-0.5 font-semibold text-teal-600">{doctor.specialization}</p>
                <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 text-xs font-medium text-slate-500">
                  <span className="flex items-center gap-1">
                    <Award size={13} className="text-slate-400" />
                    {doctor.yearsExperience} yrs experience
                  </span>
                  <span className="flex items-center gap-1">
                    <Building2 size={13} className="text-slate-400" />
                    {doctor.hospital || 'Telehealth'}
                  </span>
                  {doctor.address?.state && (
                    <span className="flex items-center gap-1">
                      <MapPin size={13} className="text-slate-400" />
                      {doctor.address.city}, {doctor.address.state}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Star size={13} className="fill-amber-400 text-amber-400" />
                    {doctor.rating || 'New'} ({doctor.reviewCount || 0} reviews)
                  </span>
                </div>
              </div>
            </div>
            <Link
              to={`/patient/book/${doctor._id}`}
              className="btn-primary shrink-0"
            >
              Book Appointment
            </Link>
          </div>

          {doctor.bio && (
            <p className="mt-5 max-w-3xl leading-relaxed text-slate-600">{doctor.bio}</p>
          )}
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Availability + Reviews */}
        <div className="space-y-6 lg:col-span-2">
          <div className="card p-6">
            <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold text-slate-900">
              <Calendar size={18} className="text-teal-600" />
              Availability
            </h2>
            {doctor.availability?.length === 0 ? (
              <p className="py-6 text-center text-sm text-slate-400">No available slots right now.</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {days.map((day, idx) => {
                  const daySlots = doctor.availability?.filter((s) => s.dayOfWeek === idx) || [];
                  if (daySlots.length === 0) return null;
                  return (
                    <div key={day} className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                      <p className="text-sm font-bold text-slate-700">{day}</p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {daySlots.map((slot) => (
                          <span
                            key={slot._id}
                            className="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-700 ring-1 ring-teal-100"
                          >
                            {slot.startTime} – {slot.endTime}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="card p-6">
            <h2 className="mb-4 font-display text-lg font-bold text-slate-900">
              Patient reviews
            </h2>
            {doctor.reviews?.length === 0 ? (
              <p className="py-6 text-center text-sm text-slate-400">No reviews yet — be the first.</p>
            ) : (
              <div className="space-y-4">
                {doctor.reviews?.map((review) => (
                  <div
                    key={review._id}
                    className="border-b border-slate-100 pb-4 last:border-0 last:pb-0"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span className="flex items-center gap-2.5">
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-indigo-500 text-xs font-bold text-white">
                          {getAvatarInitials(review.patient?.user?.name)}
                        </span>
                        <span className="text-sm font-semibold text-slate-700">
                          {review.patient?.user?.name || 'Anonymous'}
                        </span>
                      </span>
                      <span className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={13}
                            className={
                              i < review.rating
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-slate-200'
                            }
                          />
                        ))}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed text-slate-600">{review.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="card p-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <p className="font-display text-2xl font-extrabold text-slate-900">
                  {naira(doctor.consultationFee)}
                </p>
                <p className="text-xs text-slate-400">per video visit</p>
              </div>
              <span className="flex items-center gap-1 rounded-full bg-mint-50 px-3 py-1 text-xs font-semibold text-mint-600 ring-1 ring-mint-100">
                <span className="h-1.5 w-1.5 rounded-full bg-mint-500" />
                Accepting patients
              </span>
            </div>
            <Link to={`/patient/book/${doctor._id}`} className="btn-primary mt-4 w-full py-3">
              <Calendar size={16} />
              Book now
            </Link>
          </div>

          <div className="card p-6">
            <h3 className="mb-3 flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wide text-slate-500">
              <Mail size={14} />
              Contact
            </h3>
            <div className="space-y-2.5 text-sm text-slate-600">
              <p className="flex items-center gap-2 break-all">
                <Mail size={14} className="shrink-0 text-slate-400" />
                {doctor.user?.email}
              </p>
              {doctor.user?.phone && (
                <p className="flex items-center gap-2">
                  <Phone size={14} className="shrink-0 text-slate-400" />
                  {doctor.user.phone}
                </p>
              )}
            </div>
          </div>

          {doctor.education?.length > 0 && (
            <div className="card p-6">
              <h3 className="mb-3 flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wide text-slate-500">
                <GraduationCap size={14} />
                Education
              </h3>
              <div className="space-y-2.5">
                {doctor.education.map((edu, idx) => (
                  <div key={idx} className="text-sm">
                    <p className="font-semibold text-slate-700">{edu.degree}</p>
                    <p className="text-slate-500">
                      {edu.institution} ({edu.year})
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorProfilePage;