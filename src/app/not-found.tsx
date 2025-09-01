import Link from 'next/link';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-grow flex items-center justify-center p-4">
        <div className="text-center max-w-lg mx-auto">
          {/* Large 404 */}
          <div className="mb-8">
            <h1 className="text-8xl md:text-9xl font-black bg-gradient-to-r from-primary-green to-emerald-400 bg-clip-text text-transparent mb-4 select-none">
              404
            </h1>
            <div className="w-32 h-1 bg-gradient-to-r from-primary-green to-emerald-400 mx-auto mb-6"></div>
          </div>

          {/* Error Message */}
          <div className="space-y-4 mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-white">
              Oops! Page not found
            </h2>
            <p className="text-lighter-gray-text text-base leading-relaxed max-w-md mx-auto">
              The page you are looking for appears to be missing. However, let us help you get back on track to discovering great opportunities.
            </p>
          </div>

          {/* Enhanced Action Buttons */}
          <div className="space-y-4">
            <Link 
              href="/"
              className="group w-full inline-flex items-center justify-center bg-primary-green hover:bg-emerald-600 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-lg hover:shadow-primary-green/25"
            >
              Go to Homepage
            </Link>
            
          </div>
        </div>
      </div>
    </div>
  );
}