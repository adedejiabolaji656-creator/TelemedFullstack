import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Stethoscope, Video, Shield, Clock, MessageSquare, FileText } from 'lucide-react';

const Home = () => {
  const { user } = useAuth();

  const features = [
    { icon: Video, title: 'Video Consultations', desc: 'HD video calls with doctors from anywhere' },
    { icon: Clock, title: '24/7 Availability', desc: 'Book appointments anytime, day or night' },
    { icon: Shield, title: 'Secure & Private', desc: 'End-to-end encrypted consultations' },
    { icon: FileText, title: 'Digital Prescriptions', desc: 'Get prescriptions sent to your pharmacy' },
    { icon: MessageSquare, title: 'Live Chat', desc: 'Message your doctor before and after visits' },
    { icon: Stethoscope, title: 'Verified Doctors', desc: 'All doctors are verified and licensed' },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h1 className="text-5xl font-bold mb-6">
              Healthcare at Your Fingertips
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              Connect with verified doctors, book appointments, and get prescriptions — all from the comfort of your home.
            </p>
            {!user && (
              <div className="flex gap-4">
                <Link to="/register" className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
                  Get Started
                </Link>
                <Link to="/login" className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors">
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose TeleMed?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="card text-center hover:shadow-lg transition-shadow">
                <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="text-blue-600" size={28} />
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-gray-500">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-gray-500 mb-8">Join thousands of patients and doctors on our platform.</p>
          <Link to="/register" className="btn-primary px-8 py-3 text-lg">
            Create Free Account
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
