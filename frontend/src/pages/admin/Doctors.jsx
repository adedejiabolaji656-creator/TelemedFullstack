import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Stethoscope, CheckCircle, XCircle, Eye, FileText,
  Mail, Award, BadgeCheck
} from 'lucide-react';
import { format } from 'date-fns';
import PageHeader, { Avatar } from '../../components/PageHeader';
import { Spinner } from '../../components/Spinner';
import StatusBadge from '../../components/StatusBadge';
import { naira } from '../../utils/format';

const TABS = [
  { key: 'pending', label: 'Pending' },
  { key: 'under_review', label: 'Under review' },
  { key: 'verified', label: 'Verified' },
  { key: 'rejected', label: 'Rejected' },
];

const AdminDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  useEffect(() => {
    fetchDoctors();
  }, [filter]);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/admin/doctors?status=${filter}`);
      setDoctors(res.data.doctors);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id, status) => {
    const reason = status === 'rejected' ? window.prompt('Reason for rejection:') : '';
    try {
      await axios.put(`/api/admin/doctors/${id}/verify`, { status, rejectionReason: reason });
      fetchDoctors();
      setSelectedDoctor(null);
    } catch (error) {
      alert('Failed to update');
    }
  };

  if (loading) {
    return <Spinner label="Loading doctor applications..." />;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <PageHeader
        title="Doctor verifications"
        subtitle="Review licenses, documents, and approve new specialists."
        icon={BadgeCheck}
      />

      {/* Filter tabs */}
      <div className="mb-6 flex flex-wrap gap-2">
        {TABS.map((t) => {
          const active = filter === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setFilter(t.key)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                active
                  ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-md shadow-cyan-500/25'
                  : 'bg-white text-slate-500 ring-1 ring-slate-200 hover:bg-slate-50 hover:text-slate-700'
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {doctors.length === 0 ? (
        <div className="card mx-auto max-w-lg py-16 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 text-slate-300 ring-1 ring-slate-100">
            <Stethoscope size={30} />
          </div>
          <p className="font-display text-lg font-bold text-slate-800">No doctors found</p>
          <p className="mt-2 text-sm text-slate-500">Applications in this category will show here.</p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {doctors.map((doctor) => (
            <div key={doctor._id} className="card overflow-hidden p-0">
              <div className="h-14 bg-gradient-to-br from-teal-500 via-cyan-600 to-sky-700" />
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3.5">
                    <Avatar name={doctor.user?.name} className="h-12 w-12 text-sm ring-4 ring-white -mt-8" />
                    <div>
                      <h3 className="font-display font-bold text-slate-900">{doctor.user?.name}</h3>
                      <p className="text-sm font-semibold text-teal-600">{doctor.specialization}</p>
                      <div className="mt-1.5">
                        <StatusBadge status={doctor.verificationStatus} />
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedDoctor(selectedDoctor?._id === doctor._id ? null : doctor)}
                    className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                    aria-label="Preview details"
                  >
                    <Eye size={17} />
                  </button>
                </div>

                <div className="mt-4 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                  <p className="flex items-center gap-2 truncate">
                    <Mail size={13} className="shrink-0 text-slate-400" />
                    <span className="truncate">{doctor.user?.email}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Award size={13} className="shrink-0 text-slate-400" />
                    License: {doctor.licenseNumber}
                  </p>
                  <p className="flex items-center gap-2">
                    <Stethoscope size={13} className="shrink-0 text-slate-400" />
                    {doctor.yearsExperience} yrs experience
                  </p>
                  <p className="flex items-center gap-2">
                    <FileText size={13} className="shrink-0 text-slate-400" />
                    Fee: {naira(doctor.consultationFee)}
                  </p>
                  <p className="flex items-center gap-2 text-xs text-slate-400">
                    Registered {format(new Date(doctor.user?.createdAt), 'MMM d, yyyy')}
                  </p>
                </div>

                {doctor.documents?.length > 0 && (
                  <div className="mt-4">
                    <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-slate-400">
                      Documents
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {doctor.documents.map((doc, idx) => (
                        <a
                          key={idx}
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 transition-colors hover:bg-brand-50 hover:text-brand-700"
                        >
                          {doc.type.replace('_', ' ')}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {doctor.verificationStatus !== 'verified' && doctor.verificationStatus !== 'rejected' && (
                  <div className="mt-5 flex gap-3 border-t border-slate-100 pt-4">
                    <button
                      onClick={() => handleVerify(doctor._id, 'verified')}
                      className="btn-primary flex-1 py-2 text-xs"
                    >
                      <CheckCircle size={14} />
                      Verify
                    </button>
                    <button
                      onClick={() => handleVerify(doctor._id, 'rejected')}
                      className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold text-red-600 ring-1 ring-red-100 transition-all hover:bg-red-50"
                    >
                      <XCircle size={14} />
                      Reject
                    </button>
                  </div>
                )}

                {doctor.rejectionReason && (
                  <div className="mt-3 rounded-xl border border-red-100 bg-red-50 p-3.5 text-sm text-red-700">
                    <p className="mb-0.5 font-bold">Rejection reason</p>
                    {doctor.rejectionReason}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDoctors;
