import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowRightLeft, Building2, MapPin } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';

const Referrals = () => {
  const { user } = useAuth();
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);

  const isPatient = user?.role === 'patient';
  const to = isPatient ? '/patient/referrals' : '/doctor/referrals';

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get('/api/referrals');
        setReferrals(res.data.referrals || []);
      } catch (error) {
        console.error('Referrals load error:', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <PageHeader
        title="Referrals"
        subtitle={
          isPatient
            ? 'Specialist referrals from your doctors. Follow up to book your appointment.'
            : 'Referrals you have sent to patients.'
        }
        icon={ArrowRightLeft}
      />

      {loading ? (
        <p className="py-16 text-center text-sm text-slate-400">Loading referrals...</p>
      ) : referrals.length === 0 ? (
        <div className="card p-12 text-center">
          <ArrowRightLeft className="mx-auto mb-3 text-slate-300" size={36} />
          <p className="text-sm text-slate-400">No referrals yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {referrals.map((r) => (
            <div key={r._id} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-display text-base font-bold text-slate-900">
                    Referral to {r.toSpecialty}
                  </p>
                  <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                    {r.toHospital && (
                      <span className="flex items-center gap-1">
                        <Building2 size={12} /> {r.toHospital}
                      </span>
                    )}
                    {r.toCity && (
                      <span className="flex items-center gap-1">
                        <MapPin size={12} /> {r.toCity}
                      </span>
                    )}
                    <span>
                      {isPatient ? `from Dr. ${r.doctor?.user?.name}` : `for ${r.patient?.user?.name}`} ·{' '}
                      {format(new Date(r.createdAt), 'MMM d, yyyy')}
                    </span>
                  </p>
                </div>
                <StatusBadge status={r.status} />
              </div>
              <p className="mt-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">{r.reason}</p>
              {r.notes && (
                <p className="mt-2 text-xs leading-relaxed text-slate-400">{r.notes}</p>
              )}
              {isPatient && r.status === 'sent' && (
                <p className="mt-3 text-xs text-amber-600">
                  Contact the receiving institution with this referral to book your appointment.
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Referrals;