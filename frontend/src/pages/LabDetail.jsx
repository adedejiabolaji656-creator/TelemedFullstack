import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
  ChevronLeft,
  FlaskConical,
  MapPin,
  Phone,
  Loader2,
  CheckCircle2,
  TestTube,
  Building2,
} from 'lucide-react';
import Spinner from '../components/Spinner';
import StatusBadge from '../components/StatusBadge';
import { naira } from '../utils/format';
import { PARTNER_LABS } from '../utils/partners';
import { format } from 'date-fns';

const FLAG_STYLE = {
  normal: 'text-mint-600',
  low: 'text-amber-600',
  high: 'text-red-600',
};

const LabDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState('');

  const isPatient = user?.role === 'patient';

  useEffect(() => {
    load();
  }, [id]);

  const load = async () => {
    try {
      const res = await axios.get(`/api/labs/${id}`);
      setOrder(res.data.labOrder);
    } catch (error) {
      alert(error.response?.data?.message || 'Could not load lab order');
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const act = async (action, fn, successMsg, reset = true) => {
    setBusy(action);
    try {
      await fn();
      alert(successMsg);
      if (reset) await load();
    } catch (error) {
      alert(error.response?.data?.message || 'Action failed');
    } finally {
      setBusy('');
    }
  };

  const bookLab = (lab) =>
    act('book', () => axios.post(`/api/labs/${id}/book`, { lab }), `Booked at ${lab.name}. Payment of ${naira(order.amount)} completed (demo).`);

  if (loading) return <Spinner label="Loading lab order..." />;
  if (!order) return null;

  const root = isPatient ? '/patient/labs' : '/doctor/labs';

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <Link to={root} className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition-colors hover:text-teal-600">
        <ChevronLeft size={15} /> Back to lab orders
      </Link>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-slate-900">
            {order.panelName || order.tests?.join(', ')}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {isPatient ? `Requested by Dr. ${order.doctor?.user?.name}` : `Patient: ${order.patient?.user?.name}`} ·{' '}
            {format(new Date(order.createdAt), 'MMM d, yyyy')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {order.amount > 0 && (
            <span className="font-display text-xl font-extrabold text-slate-800">
              {naira(order.amount)}
            </span>
          )}
          <StatusBadge status={order.status} />
        </div>
      </div>

      {isPatient && order.status === 'requested' && (
        <div className="mb-6 card p-6">
          <h3 className="mb-1 flex items-center gap-2 font-display text-lg font-bold text-slate-900">
            <Building2 size={18} className="text-teal-600" /> Book a partner lab
          </h3>
          <p className="mb-4 text-sm text-slate-400">
            Pick a lab near you. The estimated cost includes sample collection & analysis.
          </p>
          <div className="space-y-3">
            {PARTNER_LABS.map((lab) => (
              <div key={lab.name} className="flex flex-col gap-3 rounded-2xl border border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-800">{lab.name}</p>
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-400">
                    <MapPin size={12} /> {lab.address}, {lab.city} · <Phone size={11} /> {lab.phone}
                  </p>
                </div>
                <button
                  onClick={() => bookLab(lab)}
                  disabled={busy === 'book'}
                  className="btn-primary px-4 py-2 text-xs"
                >
                  {busy === 'book' ? <Loader2 size={14} className="animate-spin" /> : `Book & pay ${naira(order.amount)}`}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {isPatient && order.status === 'ordered' && (
        <div className="mb-6 card p-6">
          <p className="text-sm font-bold text-slate-800">Sample collection</p>
          <p className="mt-1 text-xs text-slate-400">
            Visit <span className="font-semibold">{order.lab?.name}</span> ({order.lab?.address}, {order.lab?.city}) with your
            test slip. Fasting tests should be done in the morning.
          </p>
          <button
            onClick={() => act('sample', () => axios.post(`/api/labs/${id}/sample`), 'Sample marked as collected. The lab is processing your tests.')}
            disabled={busy === 'sample'}
            className="btn-secondary mt-4 px-4 py-2 text-xs font-semibold"
          >
            {busy === 'sample' ? <Loader2 size={14} className="animate-spin" /> : "I've given my sample (demo)"}
          </button>
        </div>
      )}

      {isPatient && order.status === 'sample_collected' && (
        <div className="mb-6 card p-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600">
            <TestTube size={22} />
          </div>
          <p className="text-sm font-bold text-slate-800">Sample sent to the lab</p>
          <p className="mt-1 text-xs text-slate-400">
            Results typically ready within 24–48 hours. You'll be notified.
          </p>
          <button
            onClick={() => act('results', () => axios.post(`/api/labs/${id}/results`), 'Results uploaded to your record (demo). A notification was sent to your doctor.')}
            disabled={busy === 'results'}
            className="btn-primary mt-4 px-4 py-2 text-xs"
          >
            {busy === 'results' ? <Loader2 size={14} className="animate-spin" /> : 'Lab uploads results (demo)'}
          </button>
        </div>
      )}

      {order.lab && (
        <div className="mb-6 card flex items-start gap-3 p-5">
          <Building2 className="mt-0.5 text-teal-600" size={18} />
          <div>
            <p className="text-sm font-bold text-slate-800">{order.lab.name}</p>
            <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-400">
              <MapPin size={12} /> {order.lab.address}, {order.lab.city} · <Phone size={11} /> {order.lab.phone}
            </p>
          </div>
        </div>
      )}

      <div className="card p-6">
        <h3 className="mb-4 flex items-center gap-2 font-display text-lg font-bold text-slate-900">
          <FlaskConical size={18} className="text-teal-600" /> Requested tests
        </h3>
        {order.reason && (
          <p className="mb-4 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
            <span className="font-semibold">Reason:</span> {order.reason}
          </p>
        )}
        <ul className="space-y-2">
          {order.tests.map((t) => (
            <li key={t} className="flex items-center gap-2 text-sm text-slate-700">
              <CheckCircle2 size={14} className="text-mint-500" /> {t}
            </li>
          ))}
        </ul>
      </div>

      {(order.results?.length > 0 || order.status === 'results_ready') && (
        <div className="card mt-6 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center gap-2 font-display text-lg font-bold text-slate-900">
              <FlaskConical size={18} className="text-teal-600" /> Results
            </h3>
            <span className="text-xs text-slate-400">
              Reported {order.resultDate ? format(new Date(order.resultDate), 'MMM d, yyyy') : '—'}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                  <th className="py-2 pr-4 font-semibold">Test</th>
                  <th className="py-2 pr-4 font-semibold">Result</th>
                  <th className="py-2 pr-4 font-semibold">Unit</th>
                  <th className="py-2 font-semibold">Reference range</th>
                </tr>
              </thead>
              <tbody>
                {order.results.map((r, i) => (
                  <tr key={i} className="border-b border-slate-50 last:border-0">
                    <td className="py-3 pr-4 font-semibold text-slate-700">{r.test}</td>
                    <td className={`py-3 pr-4 font-bold ${FLAG_STYLE[r.flag] || 'text-slate-800'}`}>{r.result}</td>
                    <td className="py-3 pr-4 text-slate-400">{r.unit}</td>
                    <td className="py-3 text-slate-400">{r.referenceRange}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {order.resultsSummary && (
            <p className="mt-4 rounded-xl bg-slate-50 p-3 text-xs text-slate-500">{order.resultsSummary}</p>
          )}
          <p className="mt-3 text-[11px] text-slate-400">
            Results were added to your medical record automatically.
          </p>
        </div>
      )}
    </div>
  );
};

export default LabDetail;