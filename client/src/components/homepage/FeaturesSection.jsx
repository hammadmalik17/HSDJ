import React, { useState, useEffect, useRef } from 'react';
import { 
  BarChart3, 
  Shield, 
  Smartphone, 
  Zap, 
  Target, 
  Briefcase,
  ArrowRight,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

const FeaturesSection = () => {
  const [visibleCards, setVisibleCards] = useState(new Set());
  const sectionRef = useRef(null);

  const features = [
    {
      icon: BarChart3,
      title: 'Advanced Analytics',
      description: 'Get deep insights into property performance, market trends, and investment opportunities with our AI-powered analytics engine.',
      color: 'from-blue-500 to-cyan-500',
      benefits: ['Real-time market data', 'Predictive analytics', 'Custom reports']
    },
    {
      icon: Shield,
      title: 'Secure Management',
      description: 'Bank-level security with multi-factor authentication, encrypted data, and secure document storage for all your investments.',
      color: 'from-green-500 to-emerald-500',
      benefits: ['256-bit encryption', '2FA protection', 'Secure backups']
    },
    {
      icon: Smartphone,
      title: 'Mobile Ready',
      description: 'Access your portfolio anywhere, anytime with our responsive design that works perfectly on all devices.',
      color: 'from-purple-500 to-pink-500',
      benefits: ['iOS & Android apps', 'Offline access', 'Push notifications']
    },
    {
      icon: Zap,
      title: 'Real-time Updates',
      description: 'Stay informed with instant notifications about market changes, property updates, and investment opportunities.',
      color: 'from-orange-500 to-red-500',
      benefits: ['Live data feeds', 'Smart alerts', 'Market insights']
    },
    {
      icon: Target,
      title: 'Smart Matching',
      description: 'Our AI algorithm matches you with properties that align with your investment goals and risk tolerance.',
      color: 'from-indigo-500 to-purple-500',
      benefits: ['AI-powered matching', 'Risk assessment', 'Goal tracking']
    },
    {
      icon: Briefcase,
      title: 'Portfolio Management',
      description: 'Comprehensive tools to track, analyze, and optimize your real estate investment portfolio performance.',
      color: 'from-teal-500 to-blue-500',
      benefits: ['Performance tracking', 'ROI optimization', 'Diversification analysis']
    }
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.dataset.index);
            setVisibleCards(prev => new Set([...prev, index]));
          }
        });
      },
      { threshold: 0.2, rootMargin: '0px 0px -50px 0px' }
    );

    const cards = sectionRef.current?.querySelectorAll('.feature-card');
    cards?.forEach((card) => observer.observe(card));

    return () => observer.disconnect();
  }, []);

  return (
    <section id="features" ref={sectionRef} className="py-20 lg:py-32 bg-gradient-to-br from-gray-50 to-blue-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16 lg:mb-24">
          <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 border border-gray-200 mb-6">
            <Sparkles className="h-4 w-4 text-blue-600" />
            <span className="text-gray-700 text-sm font-medium">Why Choose Us</span>
          </div>
          
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Why Choose
            <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
              RealEstate Pro?
            </span>
          </h2>
          
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Experience the future of real estate investment with our comprehensive platform 
            designed for modern investors who demand excellence.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            const isVisible = visibleCards.has(index);
            
            return (
              <div
                key={index}
                data-index={index}
                className={`feature-card group relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-700 border border-gray-100 hover:border-gray-200 ${
                  isVisible 
                    ? 'translate-y-0 opacity-100' 
                    : 'translate-y-10 opacity-0'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-white to-gray-50/50 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="relative z-10">
                  {/* Icon */}
                  <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg`}>
                    <IconComponent className="h-8 w-8 text-white" />
                  </div>

                  {/* Content */}
                  <div className="space-y-4">
                    <h3 className="text-xl lg:text-2xl font-bold text-gray-900 group-hover:text-gray-800 transition-colors">
                      {feature.title}
                    </h3>
                    
                    <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors">
                      {feature.description}
                    </p>

                    {/* Benefits List */}
                    <div className="space-y-2 pt-4">
                      {feature.benefits.map((benefit, benefitIndex) => (
                        <div key={benefitIndex} className="flex items-center space-x-3">
                          <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span className="text-sm text-gray-600">{benefit}</span>
                        </div>
                      ))}
                    </div>

                    {/* Learn More Button */}
                    <button className="group/btn flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium mt-6 transition-colors">
                      <span>Learn more</span>
                      <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </div>

                  {/* Hover Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA Section */}
        <div className="mt-20 lg:mt-32 text-center">
          <div className="bg-white rounded-3xl p-8 lg:p-12 shadow-xl border border-gray-100 max-w-4xl mx-auto">
            <div className="space-y-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                <Sparkles className="h-10 w-10 text-white" />
              </div>
              
              <h3 className="text-2xl lg:text-3xl font-bold text-gray-900">
                Ready to Transform Your Real Estate Journey?
              </h3>
              
              <p className="text-gray-600 max-w-2xl mx-auto">
                Join thousands of investors who have already discovered the power of our platform. 
                Start building your dream portfolio today.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                  Start Free Trial
                </button>
                <button className="border border-gray-300 text-gray-700 px-8 py-4 rounded-2xl font-semibold hover:bg-gray-50 transition-all duration-300">
                  Schedule Demo
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;