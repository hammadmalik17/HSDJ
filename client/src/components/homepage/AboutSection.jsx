import React from 'react';
import { CheckCircle } from 'lucide-react';

const AboutSection = () => {
  return (
    <section id="about" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Trusted Real Estate Investment Platform
            </h2>
            <p className="text-lg text-gray-600 mb-6">
              With over 15 years of experience in real estate investment management, 
              RealEstate Pro has helped thousands of investors build and manage their 
              property portfolios efficiently.
            </p>
            <p className="text-gray-600 mb-8">
              Our platform combines cutting-edge technology with deep industry expertise 
              to provide shareholders with transparent, secure, and profitable investment opportunities.
            </p>
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <div className="text-2xl font-bold text-blue-600">₹50Cr+</div>
                <div className="text-gray-600">Assets Managed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">500+</div>
                <div className="text-gray-600">Happy Investors</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">25+</div>
                <div className="text-gray-600">Properties</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">15+</div>
                <div className="text-gray-600">Years Experience</div>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-4">Why Investors Choose Us</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                  <span>Transparent reporting and analytics</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                  <span>Secure document management</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                  <span>Real-time portfolio tracking</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                  <span>Expert investment guidance</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                  <span>24/7 customer support</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;