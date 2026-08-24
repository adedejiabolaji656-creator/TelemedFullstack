import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Stethoscope, CheckCircle, XCircle, Eye, FileText,
  Mail, Phone, Award, Filter
} from 'lucide-react';
import { format } from 'date-fns';

const AdminDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  useEffect(() => {
    fetchDoctors();
  }, [filter]);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/admin/doctors?status=${filter}`);
      setDoctors(res.data.doctors);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id, status) => {
    const reason = status === 'rejected' ? window.prompt('Reason for rejection:') : '';
    try {
      await axios.put(`/api/admin/doctors/${id}/verify`, { status, rejectionReason: reason });
      fetchDoctors();
      setSelectedDoctor(null);
    } catch (error) {
      alert('Failed to update');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-700',
      under_review: 'bg-blue-100 text-blue-700',
      verified: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
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
      <h1 className="text-3xl font-bold mb-6">Doctor Verifications</h1>

      <div className="flex items-center space-x-2 mb-6">
        <Filter size={18} className="text-gray-400" />
        <select
          className="input w-48"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="pending">Pending</option>
          <option value="under_review">Under Review</option>
          <option value="verified">Verified</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {doctors.length === 0 ? (
        <div className="card text-center py-12">
          <Stethoscope className="mx-auto text-gray-300 mb-4" size={48} />
          <p className="text-gray-500 text-lg">No doctors found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {doctors.map((doctor) => (
            <div key={doctor._id} className="card">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-lg font-bold text-blue-600">
                      {doctor.user?.name?.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold">{doctor.user?.name}</h3>
                    <p className="text-sm text-gray-500">{doctor.specialization}</p>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${getStatusColor(doctor.verificationStatus)}`}>
                      {doctor.verificationStatus}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedDoctor(selectedDoctor?._id === doctor._id ? null : doctor)}
                  className="text-blue-600 hover:text-blue-700"
                >
                  <Eye size={18} />
                </button>
              </div>

              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <p className="flex items-center">
                  <Mail size={14} className="mr-2 text-gray-400" />
                  {doctor.user?.email}
                </p>
                <p className="flex items-center">
                  <Award size={14} className="mr-2 text-gray-400" />
                  License: {doctor.licenseNumber}
                </p>
                <p className="flex items-center">
                  <Stethoscope size={14} className="mr-2 text-gray-400" />
                  {doctor.yearsExperience} years experience
                </p>
                <p className="flex items-center">
                  <FileText size={14} className="mr-2 text-gray-400" />
                  Fee: ${doctor.consultationFee}
                </p>
                <p className="text-xs text-gray-400">
                  Registered: {format(new Date(doctor.user?.createdAt), 'MMM d, yyyy')}
                </p>
              </div>

              {doctor.documents?.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Documents</p>
                  <div className="flex flex-wrap gap-2">
                    {doctor.documents.map((doc, idx) => (
                      <a
                        key={idx}
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs hover:bg-gray-200 transition-colors"
                      >
                        {doc.type.replace('_', ' ')}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {doctor.verificationStatus !== 'verified' && doctor.verificationStatus !== 'rejected' && (
                <div className="flex space-x-2 pt-4 border-t">
                  <button
                    onClick={() => handleVerify(doctor._id, 'verified')}
                    className="flex-1 flex items-center justify-center space-x-1 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                  >
                    <CheckCircle size={16} />
                    <span>Verify</span>
                  </button>
                  <button
                    onClick={() => handleVerify(doctor._id, 'rejected')}
                    className="flex-1 flex items-center justify-center space-x-1 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                  >
                    <XCircle size={16} />
                    <span>Reject</span>
                  </button>
                </div>
              )}

              {doctor.rejectionReason && (
                <div className="mt-3 p-3 bg-red-50 rounded-lg text-sm text-red-700">
                  <p className="font-medium">Rejection Reason:</p>
                  {doctor.rejectionReason}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDoctors;
