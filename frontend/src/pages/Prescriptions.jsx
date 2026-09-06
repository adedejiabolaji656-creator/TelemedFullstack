import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { FileText, Calendar, Pill, ClipboardList } from 'lucide-react';
import { format } from 'date-fns';
import PageHeader, { Avatar } from '../components/PageHeader';
import { Spinner } from '../components/Spinner';
import StatusBadge from '../components/StatusBadge';

const Prescriptions = () => {
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      const res = await axios.get('/api/prescriptions');
      setPrescriptions(res.data.prescriptions);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const isPatient = user?.role === 'patient';

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <PageHeader
        title="Prescriptions"
        subtitle="Medications, dosages, and doctor notes — always at hand."
        icon={ClipboardList}
        actions={
          prescriptions.length > 0 && (
            <span className="badge bg-brand-50 text-brand-700 ring-1 ring-brand-100">
              {prescriptions.length} on record
            </span>
          )
        }
      />

      {loading ? (
        <Spinner label="Loading prescriptions..." />
      ) : prescriptions.length === 0 ? (
        <div className="card mx-auto max-w-lg py-16 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 text-slate-300 ring-1 ring-slate-100">
            <FileText size={30} />
          </div>
          <p className="font-display text-lg font-bold text-slate-800">No prescriptions yet</p>
          <p className="mt-2 text-sm text-slate-500">
            After a video visit, your doctor can send prescriptions straight here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {prescriptions.map((prescription) => {
            const partyName = isPatient
              ? `Dr. ${prescription.doctor?.user?.name}`
              : prescription.patient?.user?.name;
            return (
              <div key={prescription._id} className="card p-5 transition-all duration-200 hover:shadow-lift">
                <div className="flex flex-col gap-5 lg:flex-row">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-display text-lg font-bold text-slate-900">
                        {prescription.diagnosis}
                      </h3>
                      <StatusBadge status={prescription.status} />
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-medium text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <Avatar name={partyName} className="h-6 w-6 text-[9px]" />
                        {partyName}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Calendar size={12} className="text-slate-400" />
                        {format(new Date(prescription.createdAt), 'MMM d, yyyy')}
                      </span>
                    </div>

                    <div className="mt-4">
                      <h4 className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-400">
                        <Pill size={13} className="text-teal-600" />
                        Medications
                      </h4>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {prescription.medications?.map((med, idx) => (
                          <div
                            key={idx}
                            className="rounded-xl border border-slate-100 bg-slate-50/60 p-3.5"
                          >
                            <p className="flex items-center gap-1.5 text-sm font-semibold text-slate-800">
                              <span className="h-2 w-2 rounded-full bg-teal-500" />
                              {med.name}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              <span className="font-medium text-slate-600">{med.dosage}</span>
                              <span className="mx-1 text-slate-300">·</span>
                              {med.frequency}
                            </p>
                            {med.duration && (
                              <p className="mt-0.5 text-[11px] text-slate-400">{med.duration}</p>
                            )}
                            {med.instructions && (
                              <p className="mt-1 text-[11px] italic text-slate-500">{med.instructions}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {prescription.notes && (
                      <div className="mt-3 rounded-xl border border-amber-100 bg-amber-50/70 p-3.5 text-sm text-slate-600">
                        <p className="mb-0.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-amber-700">
                          <FileText size={12} />
                          Doctor's notes
                        </p>
                        {prescription.notes}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Prescriptions;