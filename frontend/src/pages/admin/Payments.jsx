import { useEffect, useState } from 'react';
import axios from 'axios';
import { DollarSign, Calendar, User, TrendingUp, Filter } from 'lucide-react';
import { format } from 'date-fns';

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
      setTotalRevenue(data.filter((p) => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0));
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-6">Payments</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card bg-green-50 border-green-200">
          <div className="flex items-center space-x-3">
            <TrendingUp className="text-green-600" size={24} />
            <div>
              <p className="text-sm text-green-700">Total Revenue</p>
              <p className="text-2xl font-bold text-green-900">${totalRevenue.toFixed(2)}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center space-x-3">
            <DollarSign className="text-blue-600" size={24} />
            <div>
              <p className="text-sm text-gray-500">Total Transactions</p>
              <p className="text-2xl font-bold">{payments.length}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center space-x-3">
            <DollarSign className="text-purple-600" size={24} />
            <div>
              <p className="text-sm text-gray-500">Completed</p>
              <p className="text-2xl font-bold">
                {payments.filter((p) => p.status === 'completed').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2 mb-6">
        <Filter size={18} className="text-gray-400" />
        <select
          className="input w-40"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Date</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Patient</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Doctor</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Amount</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => (
              <tr key={payment._id} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4">
                  <div className="flex items-center space-x-1 text-sm text-gray-600">
                    <Calendar size={14} />
                    <span>{format(new Date(payment.createdAt), 'MMM d, yyyy')}</span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center space-x-2">
                    <User size={14} className="text-gray-400" />
                    <span className="text-sm">{payment.patient?.user?.name}</span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className="text-sm">Dr. {payment.doctor?.user?.name}</span>
                </td>
                <td className="py-3 px-4">
                  <span className="font-medium">${payment.amount}</span>
                </td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                    {payment.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {payments.length === 0 && (
          <p className="text-center text-gray-500 py-8">No payments found</p>
        )}
      </div>
    </div>
  );
};

export default AdminPayments;
