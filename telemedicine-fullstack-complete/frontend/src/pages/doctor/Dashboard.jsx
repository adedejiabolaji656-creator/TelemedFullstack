import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  Calendar, Users, DollarSign, Star, TrendingUp,
  Clock, AlertCircle, CheckCircle
} from 'lucide-react';
import { format } from 'date-fns';

const DoctorDashboard = () => {
  const [stats, setStats] = useState({
    totalAppointments: 0,
    todayAppointments: 0,
    pendingAppointments: 0,
    totalEarnings: 0,
    rating: 0,
    reviewCount: 0,
  });
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [profileRes, aptRes] = await Promise.all([
        axios.get('/api/doctors/me'),
        axios.get('/api/appointments'),
      ]);

      const profile = profileRes.data.doctor;
      const appointments = aptRes.data.appointments;
      const today = new Date().toISOString().split('T')[0];

      setStats({
        totalAppointments: appointments.length,
        todayAppointments: appointments.filter(
          (a) => new Date(a.scheduledDate).toISOString().split('T')[0] === today
        ).length,
        pendingAppointments: appointments.filter((a) => a.status === 'pending').length,
        totalEarnings: appointments
          .filter((a) => a.status === 'completed')
          .reduce((sum, a) => sum + (a.payment?.amount || 0), 0),
        rating: profile.rating,
        reviewCount: profile.reviewCount,
      });

      setRecentAppointments(appointments.slice(0, 5));
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
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
      <h1 className="text-3xl font-bold mb-8">Doctor Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {[
          { label: 'Total Appts', value: stats.totalAppointments, icon: Calendar, color: 'bg-blue-500' },
          { label: 'Today', value: stats.todayAppointments, icon: Clock, color: 'bg-green-500' },
          { label: 'Pending', value: stats.pendingAppointments, icon: AlertCircle, color: 'bg-yellow-500' },
          { label: 'Earnings', value: `$${stats.totalEarnings}`, icon: DollarSign, color: 'bg-purple-500' },
          { label: 'Rating', value: stats.rating || 'New', icon: Star, color: 'bg-orange-500' },
          { label: 'Reviews', value: stats.reviewCount, icon: TrendingUp, color: 'bg-pink-500' },
        ].map((stat) => (
          <div key={stat.label} className={`${stat.color} text-white p-4 rounded-xl`}>
            <stat.icon size={20} className="opacity-70 mb-2" />
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-xs opacity-80">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Appointments */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Recent Appointments</h2>
              <Link to="/doctor/appointments" className="text-blue-600 text-sm hover:underline">
                View all
              </Link>
            </div>

            {recentAppointments.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No appointments yet</p>
            ) : (
              <div className="space-y-3">
                {recentAppointments.map((apt) => (
                  <div
                    key={apt._id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users size={18} className="text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{apt.patient?.user?.name}</p>
                        <p className="text-sm text-gray-500">
                          {format(new Date(apt.scheduledDate), 'MMM d')} at {apt.startTime}
                        </p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      apt.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                      apt.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      apt.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {apt.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <Link
            to="/doctor/availability"
            className="card bg-blue-50 border-blue-200 hover:bg-blue-100 transition-colors block"
          >
            <div className="flex items-center space-x-3">
              <Calendar className="text-blue-600" size={24} />
              <div>
                <h3 className="font-semibold text-blue-900">Set Availability</h3>
                <p className="text-sm text-blue-700">Manage your schedule</p>
              </div>
            </div>
          </Link>

          <Link
            to="/doctor/appointments"
            className="card bg-green-50 border-green-200 hover:bg-green-100 transition-colors block"
          >
            <div className="flex items-center space-x-3">
              <CheckCircle className="text-green-600" size={24} />
              <div>
                <h3 className="font-semibold text-green-900">Manage Appointments</h3>
                <p className="text-sm text-green-700">Confirm or cancel bookings</p>
              </div>
            </div>
          </Link>

          <div className="card">
            <h3 className="font-semibold mb-2">Verification Status</h3>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${
                stats.verificationStatus === 'verified' ? 'bg-green-500' :
                stats.verificationStatus === 'pending' ? 'bg-yellow-500' :
                'bg-red-500'
              }`} />
              <span className="text-sm capitalize">{stats.verificationStatus || 'Pending'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
