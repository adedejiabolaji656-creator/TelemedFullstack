import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center">
        <Compass className="mx-auto text-gray-300 mb-4" size={64} />
        <h1 className="text-4xl font-bold mb-2">404</h1>
        <p className="text-gray-500 mb-6">Page not found</p>
        <Link to="/" className="btn-primary">
          Go Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
