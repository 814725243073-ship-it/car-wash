import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { Navbar } from './components/public/Navbar';
import { Hero } from './components/public/Hero';
import { ServicesSection } from './components/public/ServicesSection';
import { AboutSection } from './components/public/AboutSection';
import { BookingSection } from './components/public/BookingSection';
import { Footer } from './components/public/Footer';
import { AdminLoginView } from './components/admin/AdminLoginView';
import { AdminLayout } from './components/admin/AdminLayout';
import { SupabaseConfigModal } from './components/SupabaseConfigModal';
import { Service } from './types/database';

function MainApp() {
  const { user, isAdmin, loading } = useAuth();
  const [viewMode, setViewMode] = useState<'public' | 'admin'>(() => {
    if (typeof window !== 'undefined') {
      if (window.location.hash === '#admin' || window.location.search.includes('admin=true')) {
        return 'admin';
      }
    }
    return 'public';
  });

  const [selectedServiceForBooking, setSelectedServiceForBooking] = useState<Service | null>(null);

  // Sync hash with viewMode
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#admin') {
        setViewMode('admin');
      } else if (window.location.hash === '' || window.location.hash === '#') {
        setViewMode('public');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleSelectService = (service: Service) => {
    setSelectedServiceForBooking(service);
    const bookingElement = document.getElementById('booking');
    if (bookingElement) {
      bookingElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleBookClick = () => {
    const bookingElement = document.getElementById('booking');
    if (bookingElement) {
      bookingElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleExploreServices = () => {
    const servicesElement = document.getElementById('services');
    if (servicesElement) {
      servicesElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const navigateToAdmin = () => {
    window.location.hash = 'admin';
    setViewMode('admin');
  };

  const navigateToPublic = () => {
    window.location.hash = '';
    setViewMode('public');
  };

  // ADMIN VIEW ROUTING
  if (viewMode === 'admin') {
    if (loading) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#080B11] text-slate-300">
          <div className="h-10 w-10 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold">
            Verifying Admin Access...
          </p>
        </div>
      );
    }

    if (user && isAdmin) {
      return <AdminLayout onBackToWebsite={navigateToPublic} />;
    }

    return <AdminLoginView onBackToWebsite={navigateToPublic} />;
  }

  // PUBLIC WEBSITE
  return (
    <div className="min-h-screen bg-[#080B11] text-slate-100 selection:bg-cyan-500/20 selection:text-cyan-200">
      <Navbar onBookClick={handleBookClick} onAdminClick={navigateToAdmin} />

      <main>
        <Hero onBookClick={handleBookClick} onExploreServices={handleExploreServices} />
        <ServicesSection onSelectService={handleSelectService} />
        <AboutSection />
        <BookingSection preselectedService={selectedServiceForBooking} />
      </main>

      <Footer onAdminClick={navigateToAdmin} />
      <SupabaseConfigModal />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <MainApp />
      </DataProvider>
    </AuthProvider>
  );
}
