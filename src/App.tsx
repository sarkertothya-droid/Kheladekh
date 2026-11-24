import { useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DataProvider, useData } from './context/DataContext';
import { NotificationProvider } from './context/NotificationContext';
import { Navbar } from './components/Navbar';
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

function BrandMetadataSync() {
  const { settings } = useData();
  useEffect(() => {
    const brand = settings.siteName?.trim() || 'KhelaDekH';
    const tag = settings.tagline?.trim() || 'Live Sports & TV Network';
    document.title = `${brand} — ${tag}`;
  }, [settings.siteName, settings.tagline]);
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DataProvider>
          <BrandMetadataSync />
          <NotificationProvider>
            <div className="min-h-screen flex flex-col bg-[#080B12] text-white">
              <Navbar />
              <NotificationPermissionBanner />
              <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/live" element={<LiveEventsPage />} />
                  <Route path="/tv" element={<TvPage />} />
                  <Route path="/stadium" element={<StadiumPage />} />
                  <Route path="/multiview" element={<StadiumPage />} />
                  <Route path="/sports" element={<SportsPage />} />
                  <Route path="/events/:slug" element={<EventDetailsPage />} />
                  <Route path="/upcoming" element={<UpcomingEventsPage />} />
                  <Route path="/news" element={<NewsPage />} />
                  <Route path="/news/:slug" element={<NewsDetailsPage />} />
                  <Route path="/search" element={<SearchPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/auth" element={<AuthPage />} />
                  <Route path="/fixtures" element={<HomePage />} />
                  <Route path="/matches" element={<HomePage />} />
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
