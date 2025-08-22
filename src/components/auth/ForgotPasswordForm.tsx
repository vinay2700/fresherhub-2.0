import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Mail, 
  AlertTriangle, 
  CheckCircle2, 
  Loader2,
  Send,
  Shield,
  Clock
} from 'lucide-react';
import { sendPasswordReset } from '../../services/authService';

interface ForgotPasswordFormProps {
  onBack: () => void;
  onSuccess?: () => void;
}

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ 
  onBack, 
  onSuccess 
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  // Using auth service

  const validateEmail = (email: string) => {
    if (!email.trim()) {
      return 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return 'Please enter a valid email address';
    }
    return '';
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (error) setError('');
    if (emailError) setEmailError('');
    
    // Real-time validation
    const error = validateEmail(value);
    setEmailError(error);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const emailValidationError = validateEmail(email);
    if (emailValidationError) {
      setEmailError(emailValidationError);
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await sendPasswordReset(email);
      
      if (!result.success) {
        setError(result.message);
      } else {
        setSuccess(result.message);
      }
    } catch (err: any) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center mb-8">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors mr-4"
          disabled={loading}
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Reset your password</h2>
          <p className="text-gray-600">Enter your email to receive reset instructions</p>
        </div>
      </div>

      {/* Success State */}
      {success && (
        <div className="mb-8 p-6 bg-green-50 border border-green-200 rounded-xl">
          <div className="flex items-start">
            <CheckCircle2 className="h-6 w-6 text-green-500 mt-1 mr-4 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="text-green-800 font-semibold text-lg mb-2">Email sent successfully!</h4>
              <p className="text-green-700 mb-4">{success}</p>
              
              <div className="bg-white p-4 rounded-lg border border-green-300 mb-4">
                <h5 className="text-green-800 font-medium mb-2 flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  Next steps:
                </h5>
                <ol className="text-green-700 text-sm space-y-1">
                  <li>1. Check your email inbox (and spam folder)</li>
                  <li>2. Click the password reset link</li>
                  <li>3. Create a new password</li>
                  <li>4. Sign in with your new password</li>
                </ol>
              </div>
              
              <div className="flex items-center space-x-2 text-green-600 text-sm">
                <Clock className="h-4 w-4" />
                <span>Reset link expires in 1 hour</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      {!success && (
        <>
          <form onSubmit={handleResetPassword} className="space-y-6">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  className={`w-full pl-12 pr-4 py-4 border-2 rounded-xl text-base transition-all duration-200 ${
                    emailError 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                      : 'border-gray-200 focus:border-blue-500 focus:ring-blue-200'
                  } focus:ring-4 focus:outline-none`}
                  placeholder="Enter your email address"
                  disabled={loading}
                />
              </div>
              {emailError && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  {emailError}
                </p>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-start">
                  <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h4 className="text-red-800 font-semibold text-sm">Reset failed</h4>
                    <p className="text-red-700 text-sm mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || emailError !== ''}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white py-4 rounded-xl font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:transform-none disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Sending reset email...</span>
                </>
              ) : (
                <>
                  <Send className="h-5 w-5" />
                  <span>Send reset email</span>
                </>
              )}
            </button>
          </form>

          {/* Security Notice */}
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <div className="flex items-start">
              <Shield className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h4 className="text-blue-800 font-semibold text-sm mb-1">Security Notice</h4>
                <p className="text-blue-700 text-sm">
                  For your security, password reset links expire after 1 hour. 
                  If you don't receive an email within a few minutes, please check your spam folder.
                </p>
              </div>
            </div>
          </div>

          {/* Help Text */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Remember your password?{' '}
              <button
                onClick={onBack}
                className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                disabled={loading}
              >
                Back to sign in
              </button>
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default ForgotPasswordForm;