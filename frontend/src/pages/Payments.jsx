import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  CreditCard,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Banknote,
  Download,
  BadgeCheck,
} from 'lucide-react';
import { format } from 'date-fns';
import PageHeader, { Avatar } from '../components/PageHeader';
import { Spinner } from '../components/Spinner';
import StatusBadge from '../components/StatusBadge';
import { naira } from '../utils/format';

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const res = await axios.get('/api/payments');
      setPayments(res.data.payments);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const statusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={16} className="text-mint-600" />;
      case 'failed':
        return <XCircle size={16} className="text-red-500" />;
      case 'refunded':
        return <Banknote size={16} className="text-orange-500" />;
      default:
        return <Clock size={16} className="text-amber-500" />;
    }
  };

  const totalPaid = payments
    .filter((p) => p.status === 'completed')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <PageHeader
        title="Payments"
        subtitle="Your consultation billing, invoices, and receipts in one place."
        icon={CreditCard}
        actions={
          <span className="badge bg-mint-50 text-mint-600 ring-1 ring-mint-100">
            <BadgeCheck size={12} />
            {payments.length ? `${payments.length} transactions` : 'No transactions yet'}
          </span>
        }
      />

      {loading ? (
        <Spinner label="Loading payments..." />
      ) : payments.length === 0 ? (
        <div className="card mx-auto max-w-lg py-16 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 text-slate-300 ring-1 ring-slate-100">
            <CreditCard size={30} />
          </div>
          <p className="font-display text-lg font-bold text-slate-800">No payments yet</p>
          <p className="mt-2 text-sm text-slate-500">
            Billed consultations will appear here with a secure receipt.
          </p>
        </div>
      ) : (
        <>
          {totalPaid > 0 && (
            <div className="mb-6 rounded-2xl bg-gradient-to-r from-teal-600 to-cyan-700 px-6 py-5 text-white shadow-lg shadow-cyan-500/25">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-cyan-100">Total paid this period</p>
                  <p className="mt-1 font-display text-3xl font-extrabold">{naira(totalPaid)}</p>
                </div>
                <Banknote size={34} className="opacity-40" />
              </div>
            </div>
          )}

          <div className="space-y-4">
            {payments.map((payment) => (
              <div key={payment._id} className="card p-5 transition-all duration-200 hover:shadow-lift">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <span
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ring-1 ${
                        payment.status === 'completed'
                          ? 'bg-mint-50 text-mint-600 ring-mint-100'
                          : payment.status === 'failed'
                          ? 'bg-red-50 text-red-500 ring-red-100'
                          : payment.status === 'refunded'
                          ? 'bg-orange-50 text-orange-500 ring-orange-100'
                          : 'bg-amber-50 text-amber-500 ring-amber-100'
                      }`}
                    >
                      {statusIcon(payment.status)}
                    </span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-display font-bold text-slate-900">
                          {payment.doctor?.user?.name
                            ? `Consultation with Dr. ${payment.doctor.user.name}`
                            : 'Consultation'}
                        </p>
                        <StatusBadge status={payment.status} />
                      </div>
                      <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
                        <Calendar size={12} />
                        {payment.appointment?.scheduledDate
                          ? format(new Date(payment.appointment.scheduledDate), 'EEEE, MMM d, yyyy')
                          : format(new Date(payment.createdAt), 'MMM d, yyyy')}
                        · Paid {format(new Date(payment.createdAt), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 sm:shrink-0">
                    <div className="text-left sm:text-right">
                      <p className="font-display text-xl font-extrabold text-slate-900">
                        {naira(payment.amount)}
                      </p>
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                        {payment.currency} · {payment.method || 'card'}
                      </p>
                    </div>
                    {payment.receiptUrl && (
                      <a
                        href={payment.receiptUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-slate-400 ring-1 ring-slate-200 transition-all hover:bg-brand-50 hover:text-brand-600 hover:ring-brand-100"
                        aria-label="Download receipt"
                      >
                        <Download size={15} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Payments;