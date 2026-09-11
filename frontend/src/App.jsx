import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';

import Appointments from './pages/Appointments';
import AppointmentDetail from './pages/AppointmentDetail';
import Payments from './pages/Payments';
import Prescriptions from './pages/Prescriptions';
import MedicalRecords from './pages/MedicalRecords';
import VideoCall from './pages/VideoCall';
import Chat from './pages/Chat';

import PatientDoctors from './pages/patient/Doctors';
import DoctorProfilePage from './pages/patient/DoctorProfile';
import BookAppointment from './pages/patient/BookAppointment';
import PatientDashboard from './pages/patient/Dashboard';
import PatientProfilePage from './pages/patient/Profile';

import DoctorDashboard from './pages/doctor/Dashboard';
import DoctorAppointments from './pages/doctor/Appointments';
import CreatePrescription from './pages/doctor/CreatePrescription';
import DoctorAvailability from './pages/doctor/Availability';
import DoctorProfileEdit from './pages/doctor/Profile';
import DoctorConsultation from './pages/doctor/Consultation';

import Labs from './pages/Labs';
import LabDetail from './pages/LabDetail';
import Pharmacy from './pages/Pharmacy';
import Referrals from './pages/Referrals';
import Notifications from './pages/Notifications';

import AdminDashboard from './pages/admin/Dashboard';
import AdminDoctors from './pages/admin/Doctors';
import AdminAppointments from './pages/admin/Appointments';
import AdminPayments from './pages/admin/Payments';

const App = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Shared authenticated pages */}
          <Route path="/appointments" element={<ProtectedRoute><Appointments /></ProtectedRoute>} />
          <Route path="/patient/appointments" element={<ProtectedRoute roles={['patient']}><Appointments /></ProtectedRoute>} />
          <Route path="/appointments/:id" element={<ProtectedRoute><AppointmentDetail /></ProtectedRoute>} />
          <Route path="/payments" element={<ProtectedRoute><Payments /></ProtectedRoute>} />
          <Route path="/patient/payments" element={<ProtectedRoute roles={['patient']}><Payments /></ProtectedRoute>} />
          <Route path="/prescriptions" element={<ProtectedRoute><Prescriptions /></ProtectedRoute>} />
          <Route path="/patient/prescriptions" element={<ProtectedRoute roles={['patient']}><Prescriptions /></ProtectedRoute>} />
          <Route path="/doctor/prescriptions" element={<ProtectedRoute roles={['doctor']}><Prescriptions /></ProtectedRoute>} />
          <Route path="/medical-records" element={<ProtectedRoute><MedicalRecords /></ProtectedRoute>} />
          <Route path="/patient/records" element={<ProtectedRoute roles={['patient']}><MedicalRecords /></ProtectedRoute>} />

          {/* Patient */}
          <Route path="/patient" element={<ProtectedRoute roles={['patient']}><PatientDashboard /></ProtectedRoute>} />
          <Route path="/patient/profile" element={<ProtectedRoute roles={['patient']}><PatientProfilePage /></ProtectedRoute>} />
          <Route path="/patient/doctors" element={<ProtectedRoute roles={['patient']}><PatientDoctors /></ProtectedRoute>} />
          <Route path="/patient/doctors/:id" element={<ProtectedRoute roles={['patient']}><DoctorProfilePage /></ProtectedRoute>} />
          <Route path="/patient/book/:doctorId" element={<ProtectedRoute roles={['patient']}><BookAppointment /></ProtectedRoute>} />
          <Route path="/patient/labs" element={<ProtectedRoute roles={['patient']}><Labs /></ProtectedRoute>} />
          <Route path="/patient/labs/:id" element={<ProtectedRoute roles={['patient']}><LabDetail /></ProtectedRoute>} />
          <Route path="/patient/pharmacy" element={<ProtectedRoute roles={['patient']}><Pharmacy /></ProtectedRoute>} />
          <Route path="/patient/referrals" element={<ProtectedRoute roles={['patient']}><Referrals /></ProtectedRoute>} />

          {/* Doctor */}
          <Route path="/doctor" element={<ProtectedRoute roles={['doctor']}><DoctorDashboard /></ProtectedRoute>} />
          <Route path="/doctor/dashboard" element={<ProtectedRoute roles={['doctor']}><DoctorDashboard /></ProtectedRoute>} />
          <Route path="/doctor/appointments" element={<ProtectedRoute roles={['doctor']}><DoctorAppointments /></ProtectedRoute>} />
          <Route path="/doctor/prescriptions/create/:appointmentId" element={<ProtectedRoute roles={['doctor']}><CreatePrescription /></ProtectedRoute>} />
          <Route path="/doctor/consultation/:appointmentId" element={<ProtectedRoute roles={['doctor']}><DoctorConsultation /></ProtectedRoute>} />
          <Route path="/doctor/availability" element={<ProtectedRoute roles={['doctor']}><DoctorAvailability /></ProtectedRoute>} />
          <Route path="/doctor/profile" element={<ProtectedRoute roles={['doctor']}><DoctorProfileEdit /></ProtectedRoute>} />
          <Route path="/doctor/labs" element={<ProtectedRoute roles={['doctor']}><Labs /></ProtectedRoute>} />
          <Route path="/doctor/labs/:id" element={<ProtectedRoute roles={['doctor']}><LabDetail /></ProtectedRoute>} />
          <Route path="/doctor/pharmacy" element={<ProtectedRoute roles={['doctor']}><Pharmacy /></ProtectedRoute>} />
          <Route path="/doctor/referrals" element={<ProtectedRoute roles={['doctor']}><Referrals /></ProtectedRoute>} />

          {/* Shared */}
          <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />

          {/* Admin */}
          <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/doctors" element={<ProtectedRoute roles={['admin']}><AdminDoctors /></ProtectedRoute>} />
          <Route path="/admin/appointments" element={<ProtectedRoute roles={['admin']}><AdminAppointments /></ProtectedRoute>} />
          <Route path="/admin/payments" element={<ProtectedRoute roles={['admin']}><AdminPayments /></ProtectedRoute>} />

          {/* Video / chat */}
          <Route path="/video/:roomId" element={<ProtectedRoute><VideoCall /></ProtectedRoute>} />
          <Route path="/chat/:roomId" element={<ProtectedRoute><Chat /></ProtectedRoute>} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export default App;
