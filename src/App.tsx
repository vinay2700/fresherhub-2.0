import React, { useState, useEffect } from 'react';
// Removed useAdvancedAuth import
import Navigation from './components/Navigation';
import Homepage from './components/Homepage';
import JobBoard from './components/JobBoard';
import ATSAnalyzer from './components/ATSAnalyzer';
import CoverLetterGenerator from './components/CoverLetterGenerator';
import SalaryCalculator from './components/SalaryCalculator';
import Footer from './components/Footer';
import ResetPasswordPage from './pages/ResetPasswordPage';

function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'jobs' | 'ats' | 'cover' | 'salary'>('home');
  const [searchParams, setSearchParams] = useState<{ query?: string; location?: string }>({});
  const loading = false;
  const initialized = true;
  const [isResetPasswordPage, setIsResetPasswordPage] = useState(false);

  useEffect(() => {
    // Check if current URL is reset password page
    const path = window.location.pathname;
    setIsResetPasswordPage(path === '/reset-password');
  }, []);

  const handleNavigate = (tab: 'home' | 'jobs' | 'ats' | 'cover' | 'salary', params?: { query?: string; location?: string }) => {
    setActiveTab(tab);
    if (params) {
      setSearchParams(params);
    } else {
      setSearchParams({});
    }
  };

  // Show reset password page if URL matches
  if (isResetPasswordPage) {
    return <ResetPasswordPage />;
  }

  // Removed loading state

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navigation onNavigate={handleNavigate} currentTab={activeTab} />
      
      <main className={activeTab === 'home' ? '' : 'container mx-auto px-4 py-8'}>
        {activeTab === 'home' && <Homepage onNavigate={handleNavigate} />}
        {activeTab === 'jobs' && <JobBoard searchParams={searchParams} />}
        {activeTab === 'ats' && <ATSAnalyzer />}
        {activeTab === 'cover' && <CoverLetterGenerator />}
        {activeTab === 'salary' && <SalaryCalculator />}
      </main>
      
      <Footer />
    </div>
  );
}

export default App;