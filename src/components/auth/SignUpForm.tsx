import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Mail, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  AlertTriangle, 
  CheckCircle2, 
  Loader2,
  UserPlus,
  LogIn,
  Shield,
  Zap,
  Clock,
  Gift,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { signUpUser } from '../../services/authService';

interface SignUpFormProps {
  onBack: () => void;
  onSuccess?: () => void;
  onSwitchToSignin: () => void;
}

const SignUpForm: React.FC<SignUpFormProps> = ({ 
  onBack, 
  onSuccess, 
  onSwitchToSignin 
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({});
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Using auth service

  const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    return strength;
  };

  const getPasswordStrengthText = (strength: number) => {
    switch (strength) {
      case 0:
      case 1: return { text: 'Weak', color: 'text-red-600' };
      case 2: return { text: 'Fair', color: 'text-orange-600' };
      case 3: return { text: 'Good', color: 'text-yellow-600' };
      case 4: return { text: 'Strong', color: 'text-green-600' };
      case 5: return { text: 'Very Strong', color: 'text-green-700' };
      default: return { text: '', color: '' };
    }
  };

  const validateField = (field: string, value: string) => {
    const errors: {[key: string]: string} = {};
    
    if (field === 'name') {
      if (!value.trim()) {
        errors.name = 'Full name is required';
      } else if (value.trim().length < 2) {
        errors.name = 'Name must be at least 2 characters';
      }
    }
    
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
    
    if (field === 'confirmPassword') {
      if (!value) {
        errors.confirmPassword = 'Please confirm your password';
      } else if (value !== formData.password) {
        errors.confirmPassword = 'Passwords do not match';
      }
    }
    
    return errors;
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (error) setError('');
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    if (field === 'password') {
      setPasswordStrength(calculatePasswordStrength(value));
    }
    
    const errors = validateField(field, value);
    setFieldErrors(prev => ({ ...prev, ...errors }));
    
    if (field === 'password' && formData.confirmPassword) {
      const confirmErrors = validateField('confirmPassword', formData.confirmPassword);
      setFieldErrors(prev => ({ ...prev, ...confirmErrors }));
    }
  };

  const validateForm = () => {
    const nameErrors = validateField('name', formData.name);
    const emailErrors = validateField('email', formData.email);
    const passwordErrors = validateField('password', formData.password);
    const confirmPasswordErrors = validateField('confirmPassword', formData.confirmPassword);
    const allErrors = { ...nameErrors, ...emailErrors, ...passwordErrors, ...confirmPasswordErrors };
    
    setFieldErrors(allErrors);
    return Object.keys(allErrors).length === 0;
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await signUpUser(formData.email, formData.password);
      
      if (!result.success) {
        if (result.code === 'EMAIL_ALREADY_REGISTERED') {
          setError('Email is already registered.');
        } else {
          setError(result.message);
        }
      } else {
        setSuccess('Check your email to confirm your account.');
        setFormData({
          name: '',
          email: '',
          password: '',
          confirmPassword: ''
        });
        setPasswordStrength(0);
        
        // Auto redirect to sign in after 3 seconds
        setTimeout(() => {
          onSwitchToSignin();
        }, 3000);
      }
    } catch (err: any) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center mb-8">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors mr-4"
          disabled={loading}
        >
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Create your account</h2>
          <p className="text-gray-600">Join thousands of professionals advancing their careers</p>
        </div>
      </div>

      {success && (
        <div className="text-center p-8">
          {/* Success Icon */}
          <div className="mx-auto mb-6">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-4">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>
          </div>
          
          {/* Success Message */}
          <div className="mb-8">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              🎉 Account Created Successfully!
            </h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
              <div className="flex items-center mb-3">
                <Mail className="h-5 w-5 text-blue-600 mr-2" />
                <p className="text-blue-800 font-semibold text-lg">Please verify your email before signing in</p>
              </div>
              <p className="text-blue-700 text-sm mb-3">We've sent a confirmation email to:</p>
              <div className="bg-white border border-blue-300 rounded-lg p-3 mb-3">
                <p className="text-blue-900 font-semibold text-center">{formData.email}</p>
              </div>
              <p className="text-blue-700 text-sm">Click the verification link in the email to activate your account, then return here to sign in.</p>
            </div>
            <div className="inline-flex items-center px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
              <Mail className="h-4 w-4 text-blue-600 mr-2" />
              <span className="font-semibold text-blue-800">{formData.email}</span>
            </div>
          </div>
          
          {/* Next Steps */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 mb-8">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center justify-center">
              <Sparkles className="h-5 w-5 mr-2 text-purple-600" />
              Next Steps
            </h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="flex flex-col items-center p-3 bg-white rounded-lg border border-green-200">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mb-2">
                  <span className="text-green-600 font-bold">1</span>
                </div>
                <p className="text-green-800 font-medium text-center">Check your email</p>
              </div>
              <div className="flex flex-col items-center p-3 bg-white rounded-lg border border-blue-200">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                  <span className="text-blue-600 font-bold">2</span>
                </div>
                <p className="text-blue-800 font-medium text-center">Confirm your email</p>
              </div>
              <div className="flex flex-col items-center p-3 bg-white rounded-lg border border-purple-200">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mb-2">
                  <span className="text-purple-600 font-bold">3</span>
                </div>
                <p className="text-purple-800 font-medium text-center">Sign in to start</p>
              </div>
            </div>
          </div>
          
          {/* Action Button */}
          <button
            onClick={onSwitchToSignin}
            className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white py-4 rounded-xl font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] flex items-center justify-center space-x-3 mb-6"
          >
            <LogIn className="h-5 w-5" />
            <span>Continue to Sign In</span>
            <ArrowRight className="h-5 w-5" />
          </button>
          
          {/* Benefits Reminder */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
            <h5 className="text-purple-800 font-semibold text-sm mb-2 flex items-center justify-center">
              <Gift className="h-4 w-4 mr-2" />
              Your FresherHub Benefits
            </h5>
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="flex items-center justify-center space-x-2 text-purple-700">
                <Zap className="h-3 w-3" />
                <span>5 AI Credits</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-blue-700">
                <Shield className="h-3 w-3" />
                <span>Secure Profile</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-green-700">
                <Clock className="h-3 w-3" />
                <span>24h Reset</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {!success && (
        <form onSubmit={handleSignUp} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Full name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`w-full pl-12 pr-4 py-4 border-2 rounded-xl text-base transition-all duration-200 ${
                  fieldErrors.name 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                    : 'border-gray-200 focus:border-blue-500 focus:ring-blue-200'
                } focus:ring-4 focus:outline-none`}
                placeholder="Enter your full name"
                disabled={loading}
              />
            </div>
            {fieldErrors.name && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <AlertTriangle className="h-4 w-4 mr-1" />
                {fieldErrors.name}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Email address</label>
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

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
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
                placeholder="Create a strong password"
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
            
            {formData.password && (
              <div className="mt-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-600">Password strength</span>
                  <span className={`text-xs font-medium ${getPasswordStrengthText(passwordStrength).color}`}>
                    {getPasswordStrengthText(passwordStrength).text}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      passwordStrength <= 1 ? 'bg-red-500' :
                      passwordStrength <= 2 ? 'bg-orange-500' :
                      passwordStrength <= 3 ? 'bg-yellow-500' :
                      passwordStrength <= 4 ? 'bg-green-500' : 'bg-green-600'
                    }`}
                    style={{ width: `${(passwordStrength / 5) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}
            
            {fieldErrors.password && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <AlertTriangle className="h-4 w-4 mr-1" />
                {fieldErrors.password}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                className={`w-full pl-12 pr-12 py-4 border-2 rounded-xl text-base transition-all duration-200 ${
                  fieldErrors.confirmPassword 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                    : 'border-gray-200 focus:border-blue-500 focus:ring-blue-200'
                } focus:ring-4 focus:outline-none`}
                placeholder="Confirm your password"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                disabled={loading}
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {fieldErrors.confirmPassword && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <AlertTriangle className="h-4 w-4 mr-1" />
                {fieldErrors.confirmPassword}
              </p>
            )}
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h4 className="text-red-800 font-semibold text-sm">Sign up failed</h4>
                  <p className="text-red-700 text-sm mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || Object.keys(fieldErrors).some(key => fieldErrors[key])}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white py-4 rounded-xl font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:transform-none disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Creating account...</span>
              </>
            ) : (
              <>
                <UserPlus className="h-5 w-5" />
                <span>Create account</span>
              </>
            )}
          </button>

          <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200">
            <h4 className="text-green-800 font-semibold text-sm mb-3 flex items-center">
              <Gift className="h-4 w-4 mr-2" />
              What you get with your free account:
            </h4>
            <div className="grid grid-cols-1 gap-2">
              <div className="flex items-center space-x-2 text-sm text-green-700">
                <Zap className="h-4 w-4" />
                <span>5 AI credits for resume analysis & optimization</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-blue-700">
                <Shield className="h-4 w-4" />
                <span>Secure profile & data protection</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-purple-700">
                <Clock className="h-4 w-4" />
                <span>Credits reset every 24 hours</span>
              </div>
            </div>
          </div>
        </form>
      )}

      {!success && (
        <>
          <div className="my-8 flex items-center">
            <div className="flex-1 border-t border-gray-200"></div>
            <span className="px-4 text-sm text-gray-500 bg-white">Already have an account?</span>
            <div className="flex-1 border-t border-gray-200"></div>
          </div>

          <button
            onClick={onSwitchToSignin}
            className="w-full bg-white hover:bg-gray-50 text-gray-700 py-4 rounded-xl font-semibold text-lg transition-all duration-300 border-2 border-gray-200 hover:border-gray-300 flex items-center justify-center space-x-2"
            disabled={loading}
          >
            <LogIn className="h-5 w-5" />
            <span>Sign in instead</span>
          </button>
        </>
      )}

      <div className="mt-6 text-center text-xs text-gray-500">
        By creating an account, you agree to our{' '}
        <a href="#" className="text-blue-600 hover:underline">Terms of Service</a>
        {' '}and{' '}
        <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>
      </div>
    </div>
  );
};

export default SignUpForm;