import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import CookieConsent from './components/CookieConsent';
import HomePage from './pages/HomePage';
import DonatePage from './pages/DonatePage';
import AboutPage from './pages/AboutPage';
import ReferralPage from './pages/ReferralPage';
import AdminPage from './pages/AdminPage';
import analytics from './utils/analytics';
import { usePageTracking } from './hooks/useAnalytics';

interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
}

function AppContent() {
  usePageTracking();
  
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/donar" element={<DonatePage />} />
        <Route path="/evento" element={<AboutPage />} />
        <Route path="/referencia/:code" element={<ReferralPage />} />
        <Route path="/admin/*" element={<AdminPage />} />
      </Routes>
    </>
  );
}

function App() {
  const [cookiePreferences, setCookiePreferences] = useState<CookiePreferences | null>(null);

  const handleCookieConsent = (preferences: CookiePreferences) => {
    setCookiePreferences(preferences);
    
    // Update analytics consent
    analytics.updateConsent(preferences.analytics);
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <main className="flex-grow">
          <AppContent />
        </main>
        <Footer />
        <CookieConsent onAccept={handleCookieConsent} />
      </div>
    </Router>
  );
}

export default App;