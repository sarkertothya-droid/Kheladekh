import React from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';

export const Footer: React.FC = () => {
  const { settings } = useData();
  const brandName = settings.siteName?.trim() || 'KhelaDekH';
  const brandLogo = settings.logoUrl?.trim() || '/src/assets/images/kheladekh_logo_1793952334814.jpg';

  return (
    <footer className="bg-[#101722] border-t border-white/10 mt-16 pb-20 md:pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <Link to="/" className="inline-flex items-center gap-2 font-display text-lg font-extrabold text-white">
            <img
              src={brandLogo}
              alt={`${brandName} Logo`}
              className="w-6 h-6 rounded-md object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/src/assets/images/kheladekh_logo_1793952334814.jpg';
              }}
            />
            {brandName === 'KhelaDekH' ? (
              <span>
                Khela<span className="text-[#00B7FF]">DekH</span>
              </span>
            ) : (
              <span>{brandName}</span>
            )}
          </Link>
          <p className="text-xs text-[#A5B1C2] mt-1">
            {settings.tagline || 'সরাসরি বিশ্ব ক্রীড়া সম্প্রচার, লাইভ স্কোর, অধিনায়ক ম্যাচআপ ও ৫০০+ লাইভ টিভি চ্যানেল।'}
          </p>
          <p className="text-[11px] text-[#64748B] mt-2">
            {settings.footerText ||
              `© 2026 ${brandName}${settings.ownerName ? ` — ${settings.ownerName}` : ''}. All rights reserved.`}
          </p>
        </div>

        <nav className="flex flex-wrap items-center gap-6 text-xs font-medium text-[#A5B1C2]">
          <Link to="/live" className="hover:text-white transition-colors">
            Live Sports
          </Link>
          <Link to="/tv" className="hover:text-white transition-colors">
            Live TV
          </Link>
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
