import React from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';

export const Footer: React.FC = () => {
  const { settings } = useData();

  return (
    <footer className="bg-[#101722] border-t border-white/10 mt-16 pb-20 md:pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <Link to="/" className="inline-flex items-center gap-2 font-display text-lg font-extrabold text-white">
            <img
              src="/src/assets/images/kheladekh_logo_1793952334814.jpg"
              alt="KhelaDekH Logo"
              className="w-6 h-6 rounded-md object-cover"
            />
            <span>
              Khela<span className="text-[#00B7FF]">DekH</span>
            </span>
          </Link>
          <p className="text-xs text-[#A5B1C2] mt-1">{settings.footerText}</p>
        </div>

        <nav className="flex flex-wrap items-center gap-6 text-xs font-medium text-[#A5B1C2]">
          <Link to="/about" className="hover:text-white transition-colors">
            About
          </Link>
          <Link to="/contact" className="hover:text-white transition-colors">
            Contact
          </Link>
          <Link to="/privacy" className="hover:text-white transition-colors">
            Privacy Policy
          </Link>
          <Link to="/terms" className="hover:text-white transition-colors">
            Terms of Service
          </Link>
          <Link to="/admin" className="hover:text-[#00B7FF] transition-colors">
            Admin
          </Link>
        </nav>
      </div>
    </footer>
  );
};
