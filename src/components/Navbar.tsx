import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Trophy, Radio, Newspaper, User, Search, Tv, ShieldCheck, Sparkles, Layers, Download, Smartphone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { NotificationDropdown } from './NotificationDropdown';
import { SecurityCenterModal } from './SecurityCenterModal';
import { downloadKhelaDekBinaryApk } from '../utils/apkDownloader';

interface NavbarProps {
  onLaunchApp?: () => void;
  isAppMode?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onLaunchApp, isAppMode = false }) => {
  const location = useLocation();
  const { user, isAdmin } = useAuth();
  const [showSecurityModal, setShowSecurityModal] = useState(false);

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <>
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 h-14 bg-[#080B12]/90 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 flex items-center justify-between gap-8">
          {/* Zone 1: Brand Wordmark & Logo */}
          <Link
            to="/"
            className="flex items-center gap-2.5 font-display text-xl font-extrabold tracking-tight text-white whitespace-nowrap shrink-0"
          >
            <img
              src="/src/assets/images/kheladekh_logo_1793952334814.jpg"
              alt="KhelaDekH Logo"
              className="w-7 h-7 rounded-lg object-cover"
            />
            <span>
              Khela<span className="text-[#00B7FF]">Dek</span>
            </span>
            <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-[#16D98A]/15 text-[#16D98A] text-[10px] font-mono font-bold border border-[#16D98A]/30">
              OFFICIAL APK
            </span>
          </Link>

          {/* Zone 2: Main App Navigation Links */}
          <nav className="hidden md:flex items-center gap-5 text-xs sm:text-sm font-medium text-[#A5B1C2]">
            <Link
              to="/"
              className={`whitespace-nowrap shrink-0 transition-colors hover:text-white font-bold flex items-center gap-1.5 ${
                isActive('/') && location.pathname === '/' ? 'text-[#00B7FF]' : ''
              }`}
            >
              <Home className="w-4 h-4" />
              <span>হোম</span>
            </Link>
            <Link
              to="/live"
              className={`whitespace-nowrap shrink-0 transition-colors hover:text-white font-bold flex items-center gap-1.5 ${
                isActive('/live') ? 'text-[#16D98A]' : ''
              }`}
            >
              <Radio className="w-4 h-4 text-red-500 animate-pulse" />
              <span>লাইভ খেলা</span>
            </Link>
            <Link
              to="/tv"
              className={`whitespace-nowrap shrink-0 transition-colors hover:text-white font-bold flex items-center gap-1.5 ${
                isActive('/tv') ? 'text-red-400' : ''
              }`}
            >
              <Tv className="w-4 h-4 text-[#00B7FF]" />
              <span>লাইভ টিভি ৫০০+</span>
              <span className="px-1.5 py-0.2 rounded bg-red-500/20 text-red-400 text-[9px] font-mono font-bold">
                BD
              </span>
            </Link>
            <Link
              to="/stadium"
              className={`whitespace-nowrap shrink-0 transition-colors hover:text-white font-bold flex items-center gap-1.5 ${
                isActive('/stadium') ? 'text-[#00B7FF]' : ''
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>৪X স্টেডিয়াম</span>
            </Link>
            <Link
              to="/sports"
              className={`whitespace-nowrap shrink-0 transition-colors hover:text-white flex items-center gap-1 ${
                isActive('/sports') ? 'text-[#00B7FF]' : ''
              }`}
            >
              <Trophy className="w-4 h-4" />
              <span>স্পোর্টস</span>
            </Link>
            <Link
              to="/admin"
              className={`whitespace-nowrap shrink-0 transition-colors hover:text-white font-bold flex items-center gap-1 ${
                isActive('/admin') ? 'text-amber-400' : 'text-amber-400/80'
              }`}
              title="অ্যাডমিন প্যানেল (factsknown178@gmail.com)"
            >
              <span className="text-amber-400">👑</span>
              <span>অ্যাডমিন</span>
            </Link>
            <Link
              to="/download"
              className={`whitespace-nowrap shrink-0 transition-colors hover:text-white flex items-center gap-1 ${
                isActive('/download') ? 'text-[#00B7FF]' : ''
              }`}
            >
              <Smartphone className="w-4 h-4 text-[#16D98A]" />
              <span>APK অ্যাপ</span>
            </Link>
          </nav>

          {/* Zone 3: Primary Direct APK Download Button + Security */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Direct APK Download Button (Binary Blob) */}
            <button
              type="button"
              onClick={() => downloadKhelaDekBinaryApk()}
              title="KhelaDek অফিশিয়াল APK ডাউনলোড করুন (৭.৩ MB)"
              className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#00B7FF] via-[#33C5FF] to-[#16D98A] text-[#080B12] text-xs font-black flex items-center gap-2 shadow-lg shadow-[#00B7FF]/25 hover:brightness-110 active:scale-95 transition-all whitespace-nowrap cursor-pointer ring-1 ring-white/30"
            >
              <Download className="w-4 h-4 fill-current animate-bounce" />
              <span>APK ডাউনলোড (৭.৩ MB)</span>
            </button>

            {!isAppMode && onLaunchApp && (
              <button
                type="button"
                onClick={onLaunchApp}
                className="hidden sm:inline-flex min-h-[38px] px-3 py-1.5 rounded-xl bg-[#151E2B] hover:bg-[#1E293B] border border-white/20 text-white text-xs font-bold items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
              >
                <Smartphone className="w-4 h-4 text-[#16D98A]" />
                <span>অ্যাপে খেলা দেখুন</span>
              </button>
            )}

            {/* Live Security Shield & Diagnostic Trigger */}
            <button
              type="button"
              onClick={() => setShowSecurityModal(true)}
              title="সিকিউরিটি শিল্ড ও সিস্টেম হেলথ অডিট (Security Center)"
              className="min-h-[40px] px-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/25 flex items-center gap-1.5 text-xs font-mono transition-all"
            >
              <ShieldCheck className="w-4 h-4 animate-pulse" />
              <span className="hidden lg:inline text-[11px] font-bold">100% সুরক্ষিত</span>
            </button>

            <Link
              to="/search"
              aria-label="Search"
              className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg text-[#A5B1C2] hover:text-white hover:bg-white/5 transition-colors"
            >
              <Search className="w-4 h-4" />
            </Link>
            <NotificationDropdown />
            {user ? (
              <Link
                to="/profile"
                className="px-4 py-2 text-xs font-semibold text-[#080B12] bg-[#00B7FF] rounded-lg hover:bg-[#33C5FF] transition-colors whitespace-nowrap shrink-0"
              >
                Profile
              </Link>
            ) : (
              <Link
                to="/auth"
                className="px-4 py-2 text-xs font-semibold text-[#080B12] bg-[#00B7FF] rounded-lg hover:bg-[#33C5FF] transition-colors whitespace-nowrap shrink-0"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Security Center Modal */}
      <SecurityCenterModal
        isOpen={showSecurityModal}
        onClose={() => setShowSecurityModal(false)}
      />

      {/* Mobile Bottom Navigation Bar */}
      <nav
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#101722]/95 backdrop-blur-md border-t border-white/10 pb-safe"
      >
        <div className="grid grid-cols-6 items-center h-14">
          <Link
            to="/"
            className={`min-h-[44px] flex flex-col items-center justify-center transition-colors ${
              isActive('/') && location.pathname === '/' ? 'text-[#00B7FF]' : 'text-[#A5B1C2]'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px] font-medium tracking-tight mt-0.5">হোম</span>
          </Link>
          <Link
            to="/live"
            className={`min-h-[44px] flex flex-col items-center justify-center transition-colors ${
              isActive('/live') ? 'text-[#16D98A]' : 'text-[#A5B1C2]'
            }`}
          >
            <Radio className="w-5 h-5 text-red-500 animate-pulse" />
            <span className="text-[10px] font-medium tracking-tight mt-0.5">লাইভ</span>
          </Link>
          <Link
            to="/tv"
            className={`min-h-[44px] flex flex-col items-center justify-center transition-colors relative ${
              isActive('/tv') ? 'text-red-400 font-bold' : 'text-[#A5B1C2]'
            }`}
          >
            <span className="absolute top-1.5 right-2 w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <Tv className="w-5 h-5 text-[#00B7FF]" />
            <span className="text-[10px] font-medium tracking-tight mt-0.5">টিভি ৫০০+</span>
          </Link>
          <Link
            to="/stadium"
            className={`min-h-[44px] flex flex-col items-center justify-center transition-colors relative ${
              isActive('/stadium') ? 'text-[#00B7FF] font-bold' : 'text-[#A5B1C2]'
            }`}
          >
            <Sparkles className="w-5 h-5 text-amber-400" />
            <span className="text-[10px] font-medium tracking-tight mt-0.5 text-amber-400">৪X স্টুডিও</span>
          </Link>
          <Link
            to="/sports"
            className={`min-h-[44px] flex flex-col items-center justify-center transition-colors ${
              isActive('/sports') ? 'text-[#00B7FF]' : 'text-[#A5B1C2]'
            }`}
          >
            <Trophy className="w-5 h-5" />
            <span className="text-[10px] font-medium tracking-tight mt-0.5">স্পোর্টস</span>
          </Link>
          <Link
            to="/admin"
            className={`min-h-[44px] flex flex-col items-center justify-center transition-colors ${
              isActive('/admin') ? 'text-amber-400 font-bold' : 'text-[#A5B1C2]'
            }`}
          >
            <span className="text-base leading-none">👑</span>
            <span className="text-[10px] font-medium tracking-tight mt-0.5">অ্যাডমিন</span>
          </Link>
        </div>
      </nav>
    </>
  );
};
