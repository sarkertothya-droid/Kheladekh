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
import { AppSplashScreen } from './components/AppSplashScreen';
import { usePWAInstall } from './hooks/usePWAInstall';

function GlobalPresenceTracker() {
  return null;
}

export default function App() {
  const { isInstalled, enterAppMode } = usePWAInstall();
  const [showSplash, setShowSplash] = useState(false);
  const [appModeActive, setAppModeActive] = useState<boolean>(() => {
    return (
      localStorage.getItem('kheladek_app_mode') === 'true' ||
      window.location.search.includes('mode=app')
    );
  });

  // Sync if isInstalled triggers from PWA
  useEffect(() => {
    if (isInstalled && !appModeActive) {
      setAppModeActive(true);
    }
  }, [isInstalled, appModeActive]);

  const handleLaunchApp = () => {
    setShowSplash(true);
  };

  const handleSplashFinish = () => {
    setShowSplash(false);
    setAppModeActive(true);
    enterAppMode();
    localStorage.setItem('kheladek_app_mode', 'true');
  };

  return (
    <BrowserRouter>
      <AuthProvider>
        <DataProvider>
          <NotificationProvider>
            <GlobalPresenceTracker />

            {/* App Splash Loading Screen */}
            {showSplash && <AppSplashScreen onFinish={handleSplashFinish} />}

            <div className="min-h-screen flex flex-col bg-[#080B12] text-white">
              <AppDownloadBanner onLaunchApp={handleLaunchApp} isAppMode={appModeActive} />
              <Navbar onLaunchApp={handleLaunchApp} isAppMode={appModeActive} />
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
                  <Route path="/download" element={<AppDownloadPage onOpenApp={handleLaunchApp} />} />
                  <Route path="/app" element={<HomePage />} />
                  <Route path="/apk" element={<AppDownloadPage onOpenApp={handleLaunchApp} />} />
                  <Route path="/get-app" element={<AppDownloadPage onOpenApp={handleLaunchApp} />} />
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
