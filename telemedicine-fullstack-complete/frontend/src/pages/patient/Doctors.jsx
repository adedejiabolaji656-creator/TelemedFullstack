import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Stethoscope, Star, Search, Award, DollarSign } from 'lucide-react';

const PatientDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDoctors();
  }, [specialization]);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (specialization) params.set('specialization', specialization);
      if (search) params.set('search', search);
      const query = params.toString();
      const res = await axios.get(`/api/doctors${query ? `?${query}` : ''}`);
      setDoctors(res.data.doctors);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchDoctors();
  };

  const specializations = [
    'Cardiology',
    'Dermatology',
    'Neurology',
    'Orthopedics',
    'Pediatrics',
    'Psychiatry',
    'General Practice',
    'Gynecology',
    'Ophthalmology',
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
      <h1 className="text-3xl font-bold mb-2">Find a Doctor</h1>
      <p className="text-gray-500 mb-6">Browse verified doctors and book an appointment</p>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            className="input pl-10"
            placeholder="Search by doctor name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="input md:w-64"
          value={specialization}
          onChange={(e) => setSpecialization(e.target.value)}
        >
          <option value="">All Specializations</option>
          {specializations.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <button type="submit" className="btn-primary">Search</button>
      </form>

      {doctors.length === 0 ? (
        <div className="card text-center py-12">
          <Stethoscope className="mx-auto text-gray-300 mb-4" size={48} />
          <p className="text-gray-500 text-lg">No doctors found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doctor) => (
            <Link key={doctor._id} to={`/patient/doctors/${doctor._id}`} className="card hover:shadow-md transition-shadow block">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  {doctor.user?.avatar ? (
                    <img src={doctor.user.avatar} alt="" className="w-14 h-14 rounded-full object-cover" />
                  ) : (
                    <span className="text-xl font-bold text-blue-600">{doctor.user?.name?.charAt(0)}</span>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold">Dr. {doctor.user?.name}</h3>
                  <p className="text-sm text-blue-600">{doctor.specialization}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 text-sm text-gray-500 mb-4">
                <span className="flex items-center">
                  <Star size={14} className="text-yellow-400 mr-1" />
                  {doctor.rating || 'New'} ({doctor.reviewCount || 0})
                </span>
                <span className="flex items-center">
                  <Award size={14} className="mr-1" />
                  {doctor.yearsExperience} yrs
                </span>
                <span className="flex items-center">
                  <DollarSign size={14} className="mr-1" />
                  ${doctor.consultationFee}
                </span>
              </div>

              {doctor.bio && (
                <p className="text-sm text-gray-500 line-clamp-2">{doctor.bio}</p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default PatientDoctors;
