import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FlaskConical } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import { naira } from '../utils/format';
import { format } from 'date-fns';

const STEP_LABEL = {
  requested: 'Book a lab',
  ordered: 'Give sample',
  sample_collected: 'Awaiting results',
  results_ready: 'View results',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

const Labs = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get('/api/labs');
        setOrders(res.data.labOrders || []);
      } catch (error) {
        console.error('Labs load error:', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const isPatient = user?.role === 'patient';
  const root = isPatient ? '/patient/labs' : '/doctor/labs';

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <PageHeader
        title="Lab & Diagnostics"
        subtitle={
          isPatient
            ? 'Book tests with partner labs and track your results.'
            : 'Test requests you have sent to patients.'
        }
        icon={FlaskConical}
      />

      {loading ? (
        <p className="py-16 text-center text-sm text-slate-400">Loading lab orders...</p>
      ) : orders.length === 0 ? (
        <div className="card p-12 text-center">
          <FlaskConical className="mx-auto mb-3 text-slate-300" size={36} />
          <p className="text-sm text-slate-400">
            {isPatient
              ? 'No lab tests yet. When your doctor requests tests they will appear here.'
              : 'No lab requests yet. Use the consultation workspace to request tests.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link key={order._id} to={`${root}/${order._id}`} className="card block p-5 transition-all duration-200 hover:shadow-lift">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-display text-base font-bold text-slate-900">
                    {order.panelName || order.tests?.join(', ')}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    {isPatient
                      ? `Requested by Dr. ${order.doctor?.user?.name}`
                      : `Patient: ${order.patient?.user?.name || '—'}`}{' '}
                    · {format(new Date(order.createdAt), 'MMM d, yyyy')}
                    {order.lab?.name && ` · ${order.lab.name}`}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {order.amount > 0 && (
                    <span className="text-sm font-bold text-slate-700">{naira(order.amount)}</span>
                  )}
                  <span className="flex flex-col items-end gap-1">
                    <StatusBadge status={order.status} />
                    <span className="text-[10px] font-medium text-slate-400">
                      {STEP_LABEL[order.status] || order.status}
                    </span>
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Labs;