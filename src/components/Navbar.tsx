import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Trophy, Radio, Tv, Sparkles, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { NotificationDropdown } from './NotificationDropdown';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const { user, isAdmin } = useAuth();

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <>
      {/* Top Navigation Bar (Clean 3-Zone Layout) */}
      <header className="sticky top-0 z-40 h-14 bg-[#080B12]/90 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 flex items-center justify-between gap-6">
          {/* Zone 1: Brand Wordmark */}
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
              Khela<span className="text-[#00B7FF]">DekH</span>
            </span>
          </Link>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-5 text-xs sm:text-sm font-medium text-[#A5B1C2]">
            <Link
              to="/"
              className={`whitespace-nowrap shrink-0 transition-colors hover:text-white font-semibold flex items-center gap-1.5 ${
                isActive('/') && location.pathname === '/' ? 'text-[#00B7FF]' : ''
              }`}
            >
              <Home className="w-4 h-4" />
              <span>হোম</span>
            </Link>
            <Link
              to="/live"
              className={`whitespace-nowrap shrink-0 transition-colors hover:text-white font-semibold flex items-center gap-1.5 ${
                isActive('/live') ? 'text-[#16D98A]' : ''
              }`}
            >
              <Radio className="w-4 h-4 text-red-500 animate-pulse" />
              <span>লাইভ খেলা</span>
            </Link>
            <Link
              to="/tv"
              className={`whitespace-nowrap shrink-0 transition-colors hover:text-white font-semibold flex items-center gap-1.5 ${
                isActive('/tv') ? 'text-[#00B7FF]' : ''
              }`}
            >
              <Tv className="w-4 h-4 text-[#00B7FF]" />
              <span>লাইভ টিভি</span>
            </Link>
            <Link
              to="/stadium"
              className={`whitespace-nowrap shrink-0 transition-colors hover:text-white font-semibold flex items-center gap-1.5 ${
                isActive('/stadium') ? 'text-[#00B7FF]' : ''
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>৪X স্টেডিয়াম</span>
            </Link>
            <Link
              to="/sports"
              className={`whitespace-nowrap shrink-0 transition-colors hover:text-white font-semibold flex items-center gap-1.5 ${
                isActive('/sports') ? 'text-[#00B7FF]' : ''
              }`}
            >
              <Trophy className="w-4 h-4" />
              <span>স্পোর্টস</span>
            </Link>
            {isAdmin && (
              <Link
                to="/admin"
                className={`whitespace-nowrap shrink-0 transition-colors hover:text-white font-semibold flex items-center gap-1 ${
                  isActive('/admin') ? 'text-amber-400' : 'text-amber-400/80'
                }`}
              >
                <span>👑 অ্যাডমিন</span>
              </Link>
            )}
          </nav>

          {/* Zone 3: Search, Notifications & Auth */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
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

      {/* Compact Mobile Bottom Navigation Bar */}
      <nav
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#101722]/95 backdrop-blur-md border-t border-white/10 pb-safe"
      >
        <div className="grid grid-cols-5 items-center h-14">
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
              isActive('/tv') ? 'text-[#00B7FF] font-bold' : 'text-[#A5B1C2]'
            }`}
          >
            <Tv className="w-5 h-5 text-[#00B7FF]" />
            <span className="text-[10px] font-medium tracking-tight mt-0.5">টিভি</span>
          </Link>
          <Link
            to="/stadium"
            className={`min-h-[44px] flex flex-col items-center justify-center transition-colors relative ${
              isActive('/stadium') ? 'text-[#00B7FF] font-bold' : 'text-[#A5B1C2]'
            }`}
          >
            <Sparkles className="w-5 h-5 text-amber-400" />
            <span className="text-[10px] font-medium tracking-tight mt-0.5">৪X</span>
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
        </div>
      </nav>
    </>
  );
};
