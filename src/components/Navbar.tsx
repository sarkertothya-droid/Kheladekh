import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Trophy, Radio, Newspaper, User, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { NotificationDropdown } from './NotificationDropdown';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const { user, isAdmin } = useAuth();

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
              Khela<span className="text-[#00B7FF]">DekH</span>
            </span>
          </Link>

          {/* Zone 2: 5 Concise Single-Line Nav Links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[#A5B1C2]">
            <Link
              to="/"
              className={`whitespace-nowrap shrink-0 transition-colors hover:text-white ${
                isActive('/') ? 'text-white' : ''
              }`}
            >
              Home
            </Link>
            <Link
              to="/sports"
              className={`whitespace-nowrap shrink-0 transition-colors hover:text-white ${
                isActive('/sports') ? 'text-white' : ''
              }`}
            >
              Sports
            </Link>
            <Link
              to="/live"
              className={`whitespace-nowrap shrink-0 transition-colors hover:text-white ${
                isActive('/live') ? 'text-[#16D98A]' : ''
              }`}
            >
              Live
            </Link>
            <Link
              to="/upcoming"
              className={`whitespace-nowrap shrink-0 transition-colors hover:text-white ${
                isActive('/upcoming') ? 'text-white' : ''
              }`}
            >
              Upcoming
            </Link>
            <Link
              to="/news"
              className={`whitespace-nowrap shrink-0 transition-colors hover:text-white ${
                isActive('/news') ? 'text-white' : ''
              }`}
            >
              News
            </Link>
            {isAdmin && (
              <Link
                to="/admin"
                className={`whitespace-nowrap shrink-0 transition-colors hover:text-[#00B7FF] ${
                  isActive('/admin') ? 'text-[#00B7FF]' : ''
                }`}
              >
                Admin
              </Link>
            )}
          </nav>

          {/* Zone 3: Primary Action + Search + Notification Dropdown */}
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

      {/* Mobile Bottom Navigation Bar */}
      <nav
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#101722]/95 backdrop-blur-md border-t border-white/10 pb-safe"
      >
        <div className="grid grid-cols-5 items-center h-14">
          <Link
            to="/"
            className={`min-h-[44px] flex flex-col items-center justify-center transition-colors ${
              isActive('/') ? 'text-[#00B7FF]' : 'text-[#A5B1C2]'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px] font-medium tracking-tight mt-0.5">Home</span>
          </Link>
          <Link
            to="/sports"
            className={`min-h-[44px] flex flex-col items-center justify-center transition-colors ${
              isActive('/sports') ? 'text-[#00B7FF]' : 'text-[#A5B1C2]'
            }`}
          >
            <Trophy className="w-5 h-5" />
            <span className="text-[10px] font-medium tracking-tight mt-0.5">Sports</span>
          </Link>
          <Link
            to="/live"
            className={`min-h-[44px] flex flex-col items-center justify-center transition-colors ${
              isActive('/live') ? 'text-[#16D98A]' : 'text-[#A5B1C2]'
            }`}
          >
            <Radio className="w-5 h-5" />
            <span className="text-[10px] font-medium tracking-tight mt-0.5">Live</span>
          </Link>
          <Link
            to="/news"
            className={`min-h-[44px] flex flex-col items-center justify-center transition-colors ${
              isActive('/news') ? 'text-[#00B7FF]' : 'text-[#A5B1C2]'
            }`}
          >
            <Newspaper className="w-5 h-5" />
            <span className="text-[10px] font-medium tracking-tight mt-0.5">News</span>
          </Link>
          <Link
            to={user ? '/profile' : '/auth'}
            className={`min-h-[44px] flex flex-col items-center justify-center transition-colors ${
              isActive('/profile') || isActive('/auth') ? 'text-[#00B7FF]' : 'text-[#A5B1C2]'
            }`}
          >
            <User className="w-5 h-5" />
            <span className="text-[10px] font-medium tracking-tight mt-0.5">
              {user ? 'Profile' : 'Sign In'}
            </span>
          </Link>
        </div>
      </nav>
    </>
  );
};
