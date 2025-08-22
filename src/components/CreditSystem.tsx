import React, { useState, useEffect } from 'react';
import { Zap, Clock, User, LogIn, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import AuthModal from './AuthModal';

interface CreditSystemProps {
  onAuthRequired?: () => void;
  showSignInButton?: boolean;
}

const CreditSystem: React.FC<CreditSystemProps> = ({ onAuthRequired, showSignInButton = true }) => {
  const { credits, resetTime, loading, isAuthenticated } = useAuth();
  const [guestCredits, setGuestCredits] = useState(1);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [timeUntilReset, setTimeUntilReset] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      const used = localStorage.getItem('fresherhub_guest_used');
      setGuestCredits(used ? 0 : 1);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (resetTime) {
      updateResetTimer(resetTime);
      const interval = setInterval(() => updateResetTimer(resetTime), 60000);
      return () => clearInterval(interval);
    }
  }, [resetTime]);

  const updateResetTimer = (resetTimeStr: string) => {
    const now = new Date();
    const reset = new Date(resetTimeStr);
    const diff = reset.getTime() - now.getTime();
    
    if (diff <= 0) {
      setTimeUntilReset('Resetting...');
      return;
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    setTimeUntilReset(`${hours}h ${minutes}m`);
  };

  const handleSignInClick = () => {
    setShowAuthModal(true);
  };

  const handleAuthSuccess = () => {
    if (onAuthRequired) onAuthRequired();
  };

  if (loading) {
    return (
      <div className="bg-gray-100 px-4 py-3 rounded-lg animate-pulse">
        <div className="h-6 bg-gray-300 rounded w-48"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <>
        <div className={`px-4 py-3 rounded-lg shadow-lg ${
          credits > 0 
            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' 
            : 'bg-gradient-to-r from-red-500 to-orange-500 text-white'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Zap className="h-5 w-5" />
              </div>
              <div>
                <div className="font-semibold">
                  {credits} AI Credits Remaining
                </div>
                <div className="text-blue-100 text-sm flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Resets in {timeUntilReset}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-blue-100">
              <User className="h-4 w-4" />
              <span className="text-sm">User</span>
            </div>
          </div>
        </div>
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onSuccess={handleAuthSuccess}
        />
      </>
    );
  }

  return (
    <>
      <div className={`px-4 py-3 rounded-lg shadow-lg ${
        guestCredits > 0 
          ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
          : 'bg-gradient-to-r from-red-500 to-orange-500 text-white'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              {guestCredits > 0 ? <Zap className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
            </div>
            <div>
              <div className="font-semibold">
                {guestCredits > 0 ? `${guestCredits} Free Credit Available` : 'No Credits Remaining'}
              </div>
              <div className="text-green-100 text-sm">
                {guestCredits > 0 
                  ? 'Sign in to get 5 credits that reset every 1.5 hours'
                  : 'Sign in to get 5 AI credits'
                }
              </div>
            </div>
          </div>
          {showSignInButton && (
            <button
              onClick={handleSignInClick}
              className="flex items-center gap-2 px-4 py-2 bg-white text-green-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              <LogIn className="h-4 w-4" />
              Sign In
            </button>
          )}
        </div>
      </div>
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
      />
    </>
  );
};

export default CreditSystem;