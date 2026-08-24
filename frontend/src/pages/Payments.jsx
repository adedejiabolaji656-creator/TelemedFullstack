import { useEffect, useState } from 'react';
import axios from 'axios';
import { CreditCard, Calendar, CheckCircle, XCircle, Clock, DollarSign } from 'lucide-react';
import { format } from 'date-fns';

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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={18} className="text-green-500" />;
      case 'failed':
        return <XCircle size={18} className="text-red-500" />;
      case 'refunded':
        return <DollarSign size={18} className="text-orange-500" />;
      default:
        return <Clock size={18} className="text-yellow-500" />;
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      completed: 'bg-green-100 text-green-700',
      pending: 'bg-yellow-100 text-yellow-700',
      failed: 'bg-red-100 text-red-700',
      refunded: 'bg-orange-100 text-orange-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-6">Payments</h1>

      {payments.length === 0 ? (
        <div className="card text-center py-12">
          <CreditCard className="mx-auto text-gray-300 mb-4" size={48} />
          <p className="text-gray-500 text-lg">No payments yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {payments.map((payment) => (
            <div key={payment._id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                    {getStatusIcon(payment.status)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                        {payment.status}
                      </span>
                      <span className="text-xs text-gray-400">
                        {format(new Date(payment.createdAt), 'MMM d, yyyy')}
                      </span>
                    </div>
                    <p className="font-medium mt-1">
                      Consultation with Dr. {payment.doctor?.user?.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {format(new Date(payment.appointment?.scheduledDate), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">${payment.amount}</p>
                  <p className="text-sm text-gray-500 uppercase">{payment.currency}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Payments;
