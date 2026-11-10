import { useState, useEffect } from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider, useData } from './context/DataContext';
import { NotificationProvider } from './context/NotificationContext';
import { useViewerPresence } from './services/presenceService';
import { Navbar } from './components/Navbar';
import { AppDownloadBanner } from './components/AppDownloadBanner';
import { NotificationPermissionBanner } from './components/NotificationPermissionBanner';
import { SupportChatWidget } from './components/SupportChatWidget';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { SportsPage } from './pages/SportsPage';
import { LiveEventsPage } from './pages/LiveEventsPage';
import { UpcomingEventsPage } from './pages/UpcomingEventsPage';
import { EventDetailsPage } from './pages/EventDetailsPage';
import { NewsPage } from './pages/NewsPage';
import { NewsDetailsPage } from './pages/NewsDetailsPage';
import { SearchPage } from './pages/SearchPage';
import { ProfilePage } from './pages/ProfilePage';
import { AuthPage } from './pages/AuthPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { LegalPage } from './pages/LegalPage';
import { AdminPage } from './pages/AdminPage';
import { TvPage } from './pages/TvPage';
import { StadiumPage } from './pages/StadiumPage';
import { AppDownloadPage } from './pages/AppDownloadPage';

function GlobalPresenceTracker() {
  const location = useLocation();
  const { user, profile } = useAuth();

  // If viewing an event page, EventDetailsPage handles specific match presence
  const isEventPage = location.pathname.startsWith('/events/');

  useViewerPresence({
    page: location.pathname,
    eventId: null,
    eventTitle: null,
    sportId: null,
    userId: user?.uid || null,
    userName: profile?.displayName || user?.displayName || 'Fan',
    enabled: !isEventPage,
  });

  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DataProvider>
          <NotificationProvider>
            <GlobalPresenceTracker />
            <div className="min-h-screen flex flex-col bg-[#080B12] text-white">
              <AppDownloadBanner />
              <Navbar />
              <NotificationPermissionBanner />
              <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/download" element={<AppDownloadPage />} />
                  <Route path="/app" element={<AppDownloadPage />} />
                  <Route path="/get-app" element={<AppDownloadPage />} />
                  <Route path="/sports" element={<SportsPage />} />
                  <Route path="/live" element={<LiveEventsPage />} />
                  <Route path="/tv" element={<TvPage />} />
                  <Route path="/stadium" element={<StadiumPage />} />
                  <Route path="/multiview" element={<StadiumPage />} />
                  <Route path="/upcoming" element={<UpcomingEventsPage />} />
                  <Route path="/events/:slug" element={<EventDetailsPage />} />
                  <Route path="/news" element={<NewsPage />} />
                  <Route path="/news/:slug" element={<NewsDetailsPage />} />
                  <Route path="/search" element={<SearchPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/auth" element={<AuthPage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/privacy" element={<LegalPage type="privacy" />} />
                  <Route path="/terms" element={<LegalPage type="terms" />} />
                  <Route path="/admin" element={<AdminPage />} />
                  <Route path="*" element={<HomePage />} />
                </Routes>
              </main>
              <Footer />
              <SupportChatWidget />
            </div>
          </NotificationProvider>
        </DataProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
