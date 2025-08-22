import React, { useState } from 'react';
import {
  Search,
  MapPin,
  FileText,
  Mail,
  Calculator,
  Users,
  Shield,
  CheckCircle,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Award,
  Star,
  Building,
  Clock
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import AuthModal from './auth/AuthModal';

interface HomepageProps {
  onNavigate: (tab: 'jobs' | 'ats' | 'cover' | 'salary', searchParams?: { query?: string; location?: string }) => void;
}

const Homepage: React.FC<HomepageProps> = ({ onNavigate }) => {
  const [jobQuery, setJobQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [guestCreditUsed, setGuestCreditUsed] = useState(false);
  const { isAuthenticated, credits, resetTime } = useAuth();

  // Check guest credit status on component mount and when returning to homepage
  React.useEffect(() => {
    const checkGuestCredit = () => {
      const used = localStorage.getItem('fresherhub_guest_used');
      setGuestCreditUsed(!!used);
    };
    
    checkGuestCredit();
    
    // Check again when window gains focus (user returns to tab)
    const handleFocus = () => checkGuestCredit();
    window.addEventListener('focus', handleFocus);
    
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const handleJobSearch = () => {
    onNavigate('jobs', {
      query: jobQuery.trim(),
      location: locationQuery.trim()
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleJobSearch();
    }
  };

  const creditsInfo = {
    credits: isAuthenticated ? credits : (guestCreditUsed ? 0 : 1),
    resetTime: resetTime
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-white to-purple-50 py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4 mr-2" />
              AI-Powered Job Search Platform
            </div>
            <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 mb-8 leading-tight">
              Land Your Dream
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Job</span>
            </h1>
            <p className="text-xl lg:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
              Discover verified fresher jobs, off-campus drives, and paid internships. 
              Get AI-powered resume analysis, cover letters, and salary insights.
            </p>

            {/* Search Bar */}
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-3 flex flex-col md:flex-row gap-3 max-w-4xl mx-auto mb-12">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400" />
                <input
                  type="text"
                  value={jobQuery}
                  onChange={(e) => setJobQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Job title, keywords, or company"
                  className="w-full pl-12 pr-4 py-4 text-lg border-0 focus:outline-none focus:ring-0 rounded-xl"
                />
              </div>
              <div className="flex-1 relative">
                <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400" />
                <input
                  type="text"
                  value={locationQuery}
                  onChange={(e) => setLocationQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Location"
                  className="w-full pl-12 pr-4 py-4 text-lg border-0 focus:outline-none focus:ring-0 rounded-xl"
                />
              </div>
              <button
                onClick={handleJobSearch}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all transform hover:scale-105 flex items-center gap-2"
              >
                Find Jobs
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
              {[
                { icon: <Building className="h-6 w-6" />, value: '10,000+', label: 'Active Jobs' },
                { icon: <Users className="h-6 w-6" />, value: '50,000+', label: 'Job Seekers' },
                { icon: <Award className="h-6 w-6" />, value: '95%', label: 'Success Rate' },
                { icon: <Star className="h-6 w-6" />, value: '4.9/5', label: 'User Rating' }
              ].map((stat, idx) => (
                <div key={idx} className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 text-blue-600 rounded-xl mb-3">
                    {stat.icon}
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>



      {/* AI Tools Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-purple-100 text-purple-800 rounded-full text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4 mr-2" />
              AI-Powered Tools
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Supercharge Your Job Hunt
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Use our advanced AI tools to optimize your resume, write compelling cover letters, 
              and get accurate salary insights.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <FileText className="h-8 w-8 text-white" />,
                title: 'ATS Resume Scanner',
                description: 'Get your resume analyzed by AI, receive compatibility scores, and get an optimized version built automatically.',
                features: ['ATS Compatibility Check', 'AI-Powered Optimization', 'Instant Resume Rebuild'],
                bgColor: 'from-purple-600 to-purple-700',
                buttonText: '🚀 Scan & Rebuild',
                creditsRequired: 1,
                onClick: () => onNavigate('ats')
              },
              {
                icon: <Mail className="h-8 w-8 text-white" />,
                title: 'Cover Letter Generator',
                description: 'Create personalized cover letters and professional cold emails instantly with AI-powered content generation.',
                features: ['Personalized Content', 'Professional Templates', 'Job-Specific Writing'],
                bgColor: 'from-indigo-600 to-indigo-700',
                buttonText: '✍️ Generate Content',
                creditsRequired: 1,
                onClick: () => onNavigate('cover')
              },
              {
                icon: <Calculator className="h-8 w-8 text-white" />,
                title: 'Salary Calculator',
                description: 'Get accurate salary estimates powered by AI. Analyze market trends, location factors, and skill premiums.',
                features: ['Market Analysis', 'Location-Based Data', 'Skill Premium Insights'],
                bgColor: 'from-green-600 to-green-700',
                buttonText: '💰 Check Salary',
                creditsRequired: 1,
                onClick: () => onNavigate('salary')
              }
            ].map((tool, idx) => (
              <div key={idx} className="group relative bg-white rounded-3xl p-8 border border-gray-200 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                <div className={`absolute inset-0 bg-gradient-to-r ${tool.bgColor} rounded-3xl opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
                <div className="relative">
                  <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${tool.bgColor} rounded-2xl mb-6`}>
                    {tool.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">{tool.title}</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">{tool.description}</p>
                  
                  <ul className="space-y-2 mb-8">
                    {tool.features.map((feature, featureIdx) => (
                      <li key={featureIdx} className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  
                  <div className="mb-4 flex items-center justify-between text-sm">
                    <span className="text-gray-500">Requires {tool.creditsRequired} credit</span>
                    {isAuthenticated ? (
                      creditsInfo.credits >= tool.creditsRequired ? (
                        <span className="text-green-600 font-medium">✓ Available</span>
                      ) : (
                        <span className="text-red-500 font-medium">
                          {creditsInfo.resetTime 
                            ? `Resets at ${new Date(creditsInfo.resetTime).toLocaleTimeString()}`
                            : 'No credits'
                          }
                        </span>
                      )
                    ) : (
                      <span className="text-blue-600 font-medium">Sign in required</span>
                    )}
                  </div>
                  
                  <button
                    onClick={() => {
                      if (creditsInfo.credits >= tool.creditsRequired) {
                        tool.onClick();
                      } else if (!isAuthenticated) {
                        setShowAuthModal(true);
                      }
                    }}
                    className={`w-full bg-gradient-to-r ${tool.bgColor} hover:shadow-lg text-white px-6 py-4 rounded-xl font-semibold transition-all transform hover:scale-105 flex items-center justify-center gap-2 ${creditsInfo.credits < tool.creditsRequired ? 'opacity-75' : ''}`}
                  >
                    {creditsInfo.credits >= tool.creditsRequired ? tool.buttonText : (isAuthenticated ? '⏳ No Credits' : '🔒 Sign In Required')}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Why Choose FresherHub?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're committed to helping fresh graduates and entry-level professionals 
              find their perfect job match.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Shield className="h-8 w-8 text-green-600" />,
                title: '100% Free',
                description: 'All core features are completely free to use'
              },
              {
                icon: <Clock className="h-8 w-8 text-blue-600" />,
                title: 'Real-time Updates',
                description: 'Get the latest job postings as soon as they\'re available'
              },
              {
                icon: <Award className="h-8 w-8 text-purple-600" />,
                title: 'Verified Jobs',
                description: 'All job listings are verified and legitimate'
              },
              {
                icon: <TrendingUp className="h-8 w-8 text-orange-600" />,
                title: 'Career Growth',
                description: 'Tools and resources to accelerate your career'
              }
            ].map((feature, idx) => (
              <div key={idx} className="text-center p-6 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-2xl mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Land Your Dream Job?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of successful job seekers who found their perfect match with FresherHub.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => onNavigate('jobs')}
              className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
            >
              Browse Jobs
              <ArrowRight className="h-5 w-5" />
            </button>
            {!isAuthenticated && (
              <button
                onClick={() => setShowAuthModal(true)}
                className="bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-800 transition-colors border-2 border-blue-400"
              >
                Sign Up Free
              </button>
            )}
          </div>
        </div>
      </section>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  );
};

export default Homepage;