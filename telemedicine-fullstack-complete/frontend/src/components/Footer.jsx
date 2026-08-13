import { Stethoscope } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white border-t mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Stethoscope className="text-blue-600" size={24} />
            <span className="font-semibold text-gray-900">TeleMed</span>
          </div>
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} TeleMed. Secure telemedicine for everyone.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
