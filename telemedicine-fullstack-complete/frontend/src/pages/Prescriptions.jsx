import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { FileText, Calendar, User, ChevronRight, Pill } from 'lucide-react';
import { format } from 'date-fns';

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

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-700',
      completed: 'bg-blue-100 text-blue-700',
      cancelled: 'bg-red-100 text-red-700',
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
      <h1 className="text-3xl font-bold mb-6">Prescriptions</h1>

      {prescriptions.length === 0 ? (
        <div className="card text-center py-12">
          <FileText className="mx-auto text-gray-300 mb-4" size={48} />
          <p className="text-gray-500 text-lg">No prescriptions yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {prescriptions.map((prescription) => (
            <div key={prescription._id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(prescription.status)}`}>
                      {prescription.status}
                    </span>
                    <span className="text-xs text-gray-400">
                      {format(new Date(prescription.createdAt), 'MMM d, yyyy')}
                    </span>
                  </div>

                  <h3 className="font-semibold text-lg mb-1">
                    {prescription.diagnosis}
                  </h3>

                  <div className="flex items-center text-sm text-gray-500 mb-3">
                    <User size={14} className="mr-1" />
                    {user?.role === 'patient'
                      ? `Dr. ${prescription.doctor?.user?.name}`
                      : prescription.patient?.user?.name}
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700 flex items-center">
                      <Pill size={14} className="mr-1" />
                      Medications
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {prescription.medications?.map((med, idx) => (
                        <div key={idx} className="bg-gray-50 rounded-lg p-3 text-sm">
                          <p className="font-medium">{med.name}</p>
                          <p className="text-gray-500">{med.dosage} — {med.frequency}</p>
                          <p className="text-gray-400 text-xs mt-1">{med.duration}</p>
                          {med.instructions && (
                            <p className="text-gray-500 text-xs mt-1 italic">{med.instructions}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {prescription.notes && (
                    <div className="mt-3 p-3 bg-yellow-50 rounded-lg text-sm text-gray-600">
                      <p className="font-medium text-yellow-800 mb-1">Doctor's Notes</p>
                      {prescription.notes}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Prescriptions;
