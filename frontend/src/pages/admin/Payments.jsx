import { useEffect, useState } from 'react';
import axios from 'axios';
import { DollarSign, Calendar, CreditCard, TrendingUp, Receipt } from 'lucide-react';
import { format } from 'date-fns';
import PageHeader, { Avatar } from '../../components/PageHeader';
import { Spinner } from '../../components/Spinner';
import StatusBadge from '../../components/StatusBadge';

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'completed', label: 'Completed' },
  { key: 'pending', label: 'Pending' },
  { key: 'failed', label: 'Failed' },
  { key: 'refunded', label: 'Refunded' },
];

const SummaryCard = ({ label, value, icon: Icon, tint }) => (
  <div className="card relative overflow-hidden p-5">
    <div
      className={`pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br ${tint} opacity-[0.12] blur-2xl`}
    />
    <div className="flex items-center gap-3.5">
      <span
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${tint} text-white shadow-md`}
      >
        <Icon size={19} />
      </span>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
        <p className="font-display text-xl font-extrabold text-slate-900">{value}</p>
      </div>
    </div>
  </div>
);

const AdminPayments = () => {
  const [payments, setPayments] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [totalRevenue, setTotalRevenue] = useState(0);

  useEffect(() => {
    fetchPayments();
  }, [filter]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/admin/payments');
      let data = res.data.payments;
      if (filter !== 'all') {
        data = data.filter((p) => p.status === filter);
      }
      setPayments(data);
      setTotalRevenue(
        data.filter((p) => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0)
      );
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const completed = payments.filter((p) => p.status === 'completed').length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <PageHeader
        title="Payments"
        subtitle="Track revenue and transaction health across the platform."
        icon={CreditCard}
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <SummaryCard
          label="Total revenue"
          value={`$${totalRevenue.toFixed(2)}`}
          icon={Receipt}
          tint="from-teal-500 to-cyan-600"
        />
        <SummaryCard
          label="Transactions"
          value={payments.length}
          icon={DollarSign}
          tint="from-brand-500 to-indigo-500"
        />
        <SummaryCard
          label="Completed"
          value={completed}
          icon={TrendingUp}
          tint="from-mint-500 to-emerald-600"
        />
      </div>

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

      {loading ? (
        <Spinner label="Loading payments..." />
      ) : (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60">
                  <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wide text-slate-400">
                    Date
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wide text-slate-400">
                    Patient
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wide text-slate-400">
                    Doctor
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wide text-slate-400">
                    Amount
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wide text-slate-400">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment._id} className="border-b border-slate-50 transition-colors hover:bg-slate-50/70">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 text-sm text-slate-500">
                        <Calendar size={13} className="text-slate-400" />
                        {format(new Date(payment.createdAt), 'MMM d, yyyy')}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={payment.patient?.user?.name} className="h-9 w-9 text-[10px]" />
                        <span className="text-sm font-semibold text-slate-700">
                          {payment.patient?.user?.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm text-slate-600">Dr. {payment.doctor?.user?.name}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-display font-bold text-slate-800">${payment.amount}</span>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={payment.status} />
                    </td>
                  </tr>
                ))}
                {payments.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center text-sm text-slate-400">
                      No payments found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPayments;