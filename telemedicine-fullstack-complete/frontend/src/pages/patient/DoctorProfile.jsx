import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Star, MapPin, Clock, DollarSign, Award, Calendar, ChevronRight } from 'lucide-react';
import { format, addDays } from 'date-fns';

const DoctorProfilePage = () => {
  const { id } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDoctor();
  }, [id]);

  const fetchDoctor = async () => {
    try {
      const res = await axios.get(`/api/doctors/${id}`);
      setDoctor(res.data.doctor);
    } catch (error) {
      console.error('Error fetching doctor:', error);
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

  if (!doctor) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <p className="text-gray-500 text-lg">Doctor not found</p>
      </div>
    );
  }

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="card mb-6">
        <div className="flex flex-col md:flex-row items-start gap-6">
          <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            {doctor.user.avatar ? (
              <img src={doctor.user.avatar} alt="" className="w-24 h-24 rounded-full object-cover" />
            ) : (
              <span className="text-3xl font-bold text-blue-600">{doctor.user.name.charAt(0)}</span>
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Dr. {doctor.user.name}</h1>
            <p className="text-blue-600 font-medium">{doctor.specialization}</p>
            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500">
              <span className="flex items-center">
                <Star size={16} className="text-yellow-400 mr-1" />
                {doctor.rating || 'New'} ({doctor.reviewCount || 0} reviews)
              </span>
              <span className="flex items-center">
                <Award size={16} className="mr-1" />
                {doctor.yearsExperience} years experience
              </span>
              <span className="flex items-center">
                <DollarSign size={16} className="mr-1" />
                ${doctor.consultationFee} per visit
              </span>
            </div>
            {doctor.bio && (
              <p className="text-gray-600 mt-4 leading-relaxed">{doctor.bio}</p>
            )}
          </div>
          <Link
            to={`/patient/book/${doctor._id}`}
            className="btn-primary px-8 py-3 flex-shrink-0"
          >
            Book Appointment
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Availability */}
        <div className="lg:col-span-2">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Calendar className="mr-2" size={20} />
              Availability
            </h2>
            {doctor.availability?.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No available slots</p>
            ) : (
              <div className="space-y-3">
                {days.map((day, idx) => {
                  const daySlots = doctor.availability?.filter((s) => s.dayOfWeek === idx) || [];
                  if (daySlots.length === 0) return null;
                  return (
                    <div key={day} className="border rounded-lg p-4">
                      <h3 className="font-medium text-gray-700 mb-2">{day}</h3>
                      <div className="flex flex-wrap gap-2">
                        {daySlots.map((slot) => (
                          <span
                            key={slot._id}
                            className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                          >
                            {slot.startTime} - {slot.endTime}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Reviews */}
          <div className="card mt-6">
            <h2 className="text-xl font-semibold mb-4">Patient Reviews</h2>
            {doctor.reviews?.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No reviews yet</p>
            ) : (
              <div className="space-y-4">
                {doctor.reviews?.map((review) => (
                  <div key={review._id} className="border-b pb-4 last:border-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium">
                            {review.patient?.user?.name?.charAt(0) || '?'}
                          </span>
                        </div>
                        <span className="font-medium text-sm">
                          {review.patient?.user?.name || 'Anonymous'}
                        </span>
                      </div>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            className={i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm">{review.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="card">
            <h3 className="font-semibold mb-3">Contact Info</h3>
            <div className="space-y-2 text-sm">
              <p className="text-gray-600">{doctor.user.email}</p>
              {doctor.user.phone && <p className="text-gray-600">{doctor.user.phone}</p>}
            </div>
          </div>

          {doctor.education?.length > 0 && (
            <div className="card">
              <h3 className="font-semibold mb-3">Education</h3>
              <div className="space-y-2">
                {doctor.education.map((edu, idx) => (
                  <div key={idx} className="text-sm">
                    <p className="font-medium">{edu.degree}</p>
                    <p className="text-gray-500">{edu.institution} ({edu.year})</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Link
            to={`/patient/book/${doctor._id}`}
            className="block w-full text-center btn-primary py-3"
          >
            Book Now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DoctorProfilePage;
