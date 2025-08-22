import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertTriangle, 
  CheckCircle2, 
  Loader2,
  LogIn,
  UserPlus,
  Shield,
  Zap
} from 'lucide-react';
import { signInUser } from '../../services/authService';

interface SignInFormProps {
  onBack: () => void;
  onSuccess?: () => void;
  onSwitchToSignup: () => void;
  onSwitchToForgot: () => void;
}

const SignInForm: React.FC<SignInFormProps> = ({ 
  onBack, 
  onSuccess, 
  onSwitchToSignup, 
  onSwitchToForgot 
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({});

  // Using auth service

  const validateField = (field: string, value: string) => {
    const errors: {[key: string]: string} = {};
    
    if (field === 'email') {
      if (!value.trim()) {
        errors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        errors.email = 'Please enter a valid email address';
      }
    }
    
    if (field === 'password') {
      if (!value) {
        errors.password = 'Password is required';
      } else if (value.length < 6) {
        errors.password = 'Password must be at least 6 characters';
      }
    }
    
    return errors;
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear errors when user starts typing
    if (error) setError('');
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    // Real-time validation
    const errors = validateField(field, value);
    setFieldErrors(prev => ({ ...prev, ...errors }));
  };

  const validateForm = () => {
    const emailErrors = validateField('email', formData.email);
    const passwordErrors = validateField('password', formData.password);
    const allErrors = { ...emailErrors, ...passwordErrors };
    
    setFieldErrors(allErrors);
    return Object.keys(allErrors).length === 0;
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await signInUser(formData.email, formData.password);
      
      if (!result.success) {
        if (result.code === 'INVALID_CREDENTIALS') {
          setError('Invalid login credentials');
        } else if (result.code === 'EMAIL_NOT_CONFIRMED') {
          setError('Please confirm your email to continue.');
        } else {
          setError(result.message);
        }
      } else {
        setSuccess('Welcome back! Redirecting to your dashboard...');
        setTimeout(() => {
          onSuccess?.();
        }, 1500);
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
          <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
          <p className="text-gray-600">Sign in to access your AI-powered career tools</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSignIn} className="space-y-6">
        {/* Email Field */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Email address
          </label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={`w-full pl-12 pr-4 py-4 border-2 rounded-xl text-base transition-all duration-200 ${
                fieldErrors.email 
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                  : 'border-gray-200 focus:border-blue-500 focus:ring-blue-200'
              } focus:ring-4 focus:outline-none`}
              placeholder="Enter your email"
              disabled={loading}
            />
          </div>
          {fieldErrors.email && (
            <p className="mt-2 text-sm text-red-600 flex items-center">
              <AlertTriangle className="h-4 w-4 mr-1" />
              {fieldErrors.email}
            </p>
          )}
        </div>

        {/* Password Field */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className={`w-full pl-12 pr-12 py-4 border-2 rounded-xl text-base transition-all duration-200 ${
                fieldErrors.password 
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                  : 'border-gray-200 focus:border-blue-500 focus:ring-blue-200'
              } focus:ring-4 focus:outline-none`}
              placeholder="Enter your password"
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              disabled={loading}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {fieldErrors.password && (
            <p className="mt-2 text-sm text-red-600 flex items-center">
              <AlertTriangle className="h-4 w-4 mr-1" />
              {fieldErrors.password}
            </p>
          )}
        </div>

        {/* Forgot Password */}
        <div className="text-right">
          <button
            type="button"
            onClick={onSwitchToForgot}
            className="text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors"
            disabled={loading}
          >
            Forgot your password?
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h4 className="text-red-800 font-semibold text-sm">Sign in failed</h4>
                <p className="text-red-700 text-sm mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
            <div className="flex items-center">
              <CheckCircle2 className="h-5 w-5 text-green-500 mr-3" />
              <div>
                <h4 className="text-green-800 font-semibold text-sm">Success!</h4>
                <p className="text-green-700 text-sm">{success}</p>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || Object.keys(fieldErrors).some(key => fieldErrors[key])}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white py-4 rounded-xl font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:transform-none disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Signing in...</span>
            </>
          ) : (
            <>
              <LogIn className="h-5 w-5" />
              <span>Sign In</span>
            </>
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="my-8 flex items-center">
        <div className="flex-1 border-t border-gray-200"></div>
        <span className="px-4 text-sm text-gray-500 bg-white">New to FresherHub?</span>
        <div className="flex-1 border-t border-gray-200"></div>
      </div>

      {/* Switch to Sign Up */}
      <button
        onClick={onSwitchToSignup}
        className="w-full bg-white hover:bg-gray-50 text-gray-700 py-4 rounded-xl font-semibold text-lg transition-all duration-300 border-2 border-gray-200 hover:border-gray-300 flex items-center justify-center space-x-2"
        disabled={loading}
      >
        <UserPlus className="h-5 w-5" />
        <span>Create new account</span>
      </button>

      {/* Benefits Reminder */}
      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
        <div className="flex items-center justify-center space-x-6 text-sm">
          <div className="flex items-center space-x-2 text-blue-700">
            <Zap className="h-4 w-4" />
            <span>5 AI Credits</span>
          </div>
          <div className="flex items-center space-x-2 text-purple-700">
            <Shield className="h-4 w-4" />
            <span>Secure & Private</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignInForm;