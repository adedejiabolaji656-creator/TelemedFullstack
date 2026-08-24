import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  Users, Stethoscope, Calendar, DollarSign, Clock,
  UserPlus, ShieldAlert, FileText, TrendingUp
} from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    users: 0,
    doctors: 0,
    patients: 0,
    appointments: 0,
    pendingDoctors: 0,
    revenue: 0,
    completedAppointments: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await axios.get('/api/admin/stats');
      setStats(res.data.stats);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const cards = [
    { label: 'Total Users', value: stats.users, icon: Users, color: 'bg-blue-500' },
    { label: 'Doctors', value: stats.doctors, icon: Stethoscope, color: 'bg-green-500' },
    { label: 'Patients', value: stats.patients, icon: UserPlus, color: 'bg-purple-500' },
    { label: 'Appointments', value: stats.appointments, icon: Calendar, color: 'bg-orange-500' },
    { label: 'Completed', value: stats.completedAppointments, icon: Clock, color: 'bg-teal-500' },
    { label: 'Pending Doctors', value: stats.pendingDoctors, icon: ShieldAlert, color: 'bg-yellow-500' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      {/* Revenue banner */}
      <div className="card bg-blue-50 border-blue-200 mb-8 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <DollarSign className="text-blue-600" size={28} />
          <div>
            <p className="text-sm text-blue-700">Total Revenue</p>
            <p className="text-2xl font-bold text-blue-900">${stats.revenue.toFixed(2)}</p>
          </div>
        </div>
        <Link to="/admin/payments" className="btn-primary px-4 py-2 text-sm">
          View Payments
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {cards.map((card) => (
          <div key={card.label} className={`${card.color} text-white p-4 rounded-xl`}>
            <card.icon size={20} className="opacity-70 mb-2" />
            <p className="text-2xl font-bold">{card.value}</p>
            <p className="text-xs opacity-80">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/admin/doctors" className="card bg-green-50 border-green-200 hover:bg-green-100 transition-colors">
          <div className="flex items-center space-x-3">
            <ShieldAlert className="text-green-600" size={24} />
            <div>
              <h3 className="font-semibold text-green-900">Verify Doctors</h3>
              <p className="text-sm text-green-700">
                {stats.pendingDoctors} doctor(s) pending review
              </p>
            </div>
          </div>
        </Link>

        <Link to="/admin/appointments" className="card bg-blue-50 border-blue-200 hover:bg-blue-100 transition-colors">
          <div className="flex items-center space-x-3">
            <Calendar className="text-blue-600" size={24} />
            <div>
              <h3 className="font-semibold text-blue-900">All Appointments</h3>
              <p className="text-sm text-blue-700">View and manage bookings</p>
            </div>
          </div>
        </Link>

        <div className="card">
          <div className="flex items-center space-x-3">
            <FileText className="text-gray-500" size={24} />
            <div>
              <h3 className="font-semibold">Platform Overview</h3>
              <p className="text-sm text-gray-500">
                {stats.appointments} total appointments · {stats.doctors} doctors
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
