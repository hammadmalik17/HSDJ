import React from 'react';
import { 
  BarChart3, 
  Shield, 
  FileText, 
  DollarSign, 
  Users, 
  Globe,
  CheckCircle,
  TrendingUp,
  Lock,
  Clock,
  Download,
  Bell
} from 'lucide-react';

const FeaturesSection = () => {
  const features = [
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Portfolio Analytics",
      description: "Track your investment performance with real-time analytics, detailed reporting, and comprehensive market insights.",
      color: "blue",
      benefits: ["Real-time tracking", "Performance metrics", "Market insights"]
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Bank-Level Security",
      description: "Your investments are protected with military-grade encryption, multi-factor authentication, and secure data storage.",
      color: "green",
      benefits: ["256-bit encryption", "2FA protection", "Secure storage"]
    },
    {
      icon: <FileText className="w-8 h-8" />,
      title: "Document Management",
      description: "Easily upload, manage, and track all your share certificates with automated approval workflows and digital signatures.",
      color: "purple",
      benefits: ["Digital certificates", "Auto-approval", "Cloud storage"]
    },
    {
      icon: <DollarSign className="w-8 h-8" />,
      title: "Real-Time Valuations",
      description: "Get instant updates on your share values, portfolio performance, and market trends with live data feeds.",
      color: "yellow",
      benefits: ["Live market data", "Instant updates", "ROI tracking"]
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Shareholder Portal",
      description: "Dedicated portal for shareholders to manage investments, view documents, and communicate with directors.",
      color: "indigo",
      benefits: ["Personal dashboard", "Direct communication", "Investment history"]
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "24/7 Global Access",
      description: "Access your portfolio anytime, anywhere with our responsive web platform and mobile-optimized interface.",
      color: "teal",
      benefits: ["Mobile responsive", "Global access", "Always available"]
    }
  ];

  const additionalFeatures = [
    {
      icon: <CheckCircle className="w-6 h-6" />,
      title: "Automated Compliance",
      description: "Stay compliant with regulations automatically"
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Investment Insights",
      description: "AI-powered market analysis and recommendations"
    },
    {
      icon: <Lock className="w-6 h-6" />,
      title: "Audit Trail",
      description: "Complete transaction history and audit logs"
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Real-Time Notifications",
      description: "Instant alerts for important portfolio changes"
    },
    {
      icon: <Download className="w-6 h-6" />,
      title: "Export & Reports",
      description: "Generate detailed reports and export data"
    },
    {
      icon: <Bell className="w-6 h-6" />,
      title: "Smart Alerts",
      description: "Customizable notifications for market opportunities"
    }
  ];

  const getColorClasses = (color) => {
    const colorMap = {
      blue: "from-blue-600 to-indigo-600 group-hover:from-blue-700 group-hover:to-indigo-700",
      green: "from-green-600 to-emerald-600 group-hover:from-green-700 group-hover:to-emerald-700",
      purple: "from-purple-600 to-violet-600 group-hover:from-purple-700 group-hover:to-violet-700",
      yellow: "from-yellow-500 to-orange-500 group-hover:from-yellow-600 group-hover:to-orange-600",
      indigo: "from-indigo-600 to-blue-600 group-hover:from-indigo-700 group-hover:to-blue-700",
      teal: "from-teal-600 to-cyan-600 group-hover:from-teal-700 group-hover:to-cyan-700"
    };
    return colorMap[color] || colorMap.blue;
  };

  const getBgColorClasses = (color) => {
    const colorMap = {
      blue: "group-hover:bg-blue-50",
      green: "group-hover:bg-green-50",
      purple: "group-hover:bg-purple-50",
      yellow: "group-hover:bg-yellow-50",
      indigo: "group-hover:bg-indigo-50",
      teal: "group-hover:bg-teal-50"
    };
    return colorMap[color] || colorMap.blue;
  };

  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Why Choose RealEstate Pro?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our platform provides everything you need to manage your real estate investments 
            efficiently, securely, and profitably. Experience the future of investment management.
          </p>
        </div>

        {/* Main Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className={`group bg-gray-50 rounded-2xl p-8 transition-all duration-300 hover:shadow-xl ${getBgColorClasses(feature.color)}`}
            >
              {/* Icon */}
              <div className={`w-16 h-16 bg-gradient-to-r ${getColorClasses(feature.color)} rounded-xl flex items-center justify-center text-white mb-6 transition-all duration-300 group-hover:scale-110`}>
                {feature.icon}
              </div>
              
              {/* Content */}
              <h3 className="text-xl font-semibold text-gray-900 mb-4 group-hover:text-gray-800">
                {feature.title}
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                {feature.description}
              </p>
              
              {/* Benefits List */}
              <ul className="space-y-2">
                {feature.benefits.map((benefit, benefitIndex) => (
                  <li key={benefitIndex} className="flex items-center text-sm text-gray-700">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Additional Features */}
        <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-3xl p-8 md:p-12">
          <div className="text-center mb-12">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Plus Many More Features
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our comprehensive platform includes everything you need for successful real estate investment management.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {additionalFeatures.map((feature, index) => (
              <div 
                key={index}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 group"
              >
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      {feature.title}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-16 text-center">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="group">
              <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2 group-hover:scale-110 transition-transform duration-300">
                99.9%
              </div>
              <div className="text-gray-600 font-medium">Uptime</div>
            </div>
            <div className="group">
              <div className="text-3xl md:text-4xl font-bold text-green-600 mb-2 group-hover:scale-110 transition-transform duration-300">
                500+
              </div>
              <div className="text-gray-600 font-medium">Happy Investors</div>
            </div>
            <div className="group">
              <div className="text-3xl md:text-4xl font-bold text-purple-600 mb-2 group-hover:scale-110 transition-transform duration-300">
                ₹50Cr+
              </div>
              <div className="text-gray-600 font-medium">Assets Managed</div>
            </div>
            <div className="group">
              <div className="text-3xl md:text-4xl font-bold text-orange-600 mb-2 group-hover:scale-110 transition-transform duration-300">
                15+
              </div>
              <div className="text-gray-600 font-medium">Years Experience</div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 md:p-12 text-white">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              Ready to Transform Your Investment Experience?
            </h3>
            <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
              Join thousands of successful investors who trust RealEstate Pro to manage their portfolios. 
              Start your journey today with our comprehensive investment platform.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <button className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-colors duration-200 shadow-lg">
                Start Free Trial
              </button>
              <button className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-blue-600 transition-all duration-200">
                Schedule Demo
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;