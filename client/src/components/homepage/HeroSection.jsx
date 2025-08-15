import React from 'react';
import { ArrowRight, Play } from 'lucide-react';

const HeroSection = ({ onGetStartedClick }) => {
  return (
    <section className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-20 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-20 h-20 bg-blue-500 rounded-full"></div>
        <div className="absolute top-32 right-20 w-16 h-16 bg-indigo-500 rounded-full"></div>
        <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-purple-500 rounded-full"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Smart Real Estate
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              Investment Platform
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Manage your real estate portfolio, track share ownership, and monitor investment performance 
            with our comprehensive shareholder management system.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <button
              onClick={onGetStartedClick}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-xl flex items-center space-x-2"
            >
              <span>Start Investing</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            
            <button className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
                <Play className="w-5 h-5 ml-1" />
              </div>
              <span className="font-medium">Watch Demo</span>
            </button>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">₹50Cr+</div>
              <div className="text-gray-600">Assets Under Management</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">500+</div>
              <div className="text-gray-600">Active Shareholders</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">15+</div>
              <div className="text-gray-600">Years Experience</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Features Section
const FeaturesSection = () => {
  const features = [
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Portfolio Analytics",
      description: "Track your investment performance with real-time analytics and detailed reporting."
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Secure Platform",
      description: "Bank-level security with multi-factor authentication and encrypted data storage."
    },
    {
      icon: <FileText className="w-8 h-8" />,
      title: "Document Management",
      description: "Easily upload and manage share certificates with automated approval workflows."
    },
    {
      icon: <DollarSign className="w-8 h-8" />,
      title: "Real-time Valuations",
      description: "Get instant updates on your share values and portfolio performance."
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Shareholder Portal",
      description: "Dedicated portal for shareholders to manage their investments and documents."
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "24/7 Access",
      description: "Access your portfolio anytime, anywhere with our responsive web platform."
    }
  ];

  return (
    <section id="services" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Why Choose RealEstate Pro?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our platform provides everything you need to manage your real estate investments efficiently and securely.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-gray-50 rounded-2xl p-8 hover:bg-blue-50 transition-colors duration-200">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white mb-6">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
export default HeroSection