import { Link } from "react-router-dom";
import { Heart } from "../Icons";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">Sentinel</span>
            </div>
            <p className="text-gray-400 max-w-md">
              Revolutionizing mental healthcare through AI-powered conversations
              and blockchain security. Your trusted partner in mental wellness.
            </p>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">Platform</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link
                  to="/login"
                  className="hover:text-white transition-colors"
                >
                  Patient Portal
                </Link>
              </li>
              <li>
                <Link
                  to="/login"
                  className="hover:text-white transition-colors"
                >
                  Provider Dashboard
                </Link>
              </li>
              <li>
                <button className="hover:text-white transition-colors">
                  Security Features
                </button>
              </li>
              <li>
                <button className="hover:text-white transition-colors">
                  API Documentation
                </button>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <button className="hover:text-white transition-colors">
                  Help Center
                </button>
              </li>
              <li>
                <button className="hover:text-white transition-colors">
                  Contact Us
                </button>
              </li>
              <li>
                <button className="hover:text-white transition-colors">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button className="hover:text-white transition-colors">
                  Terms of Service
                </button>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="text-gray-400 text-center md:text-left mb-4 md:mb-0">
            <p>
              © 2025 Sentinel. Secure mental health support powered by
              blockchain technology.
            </p>
          </div>
          <div className="flex space-x-4">
            <button
              to="/login"
              className="text-gray-400 hover:text-white transition-colors"
            >
              Login
            </button>
            <button
              to="/register"
              className="text-gray-400 hover:text-white transition-colors"
            >
              Register
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
