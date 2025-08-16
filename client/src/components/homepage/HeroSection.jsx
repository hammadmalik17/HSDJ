import React, { useState, useEffect } from 'react';
import { ArrowRight, Play, Sparkles, TrendingUp } from 'lucide-react';

const HeroSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    setIsVisible(true);
    
    // Auto-slide for property showcase
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 3);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const propertyShowcase = [
    {
      price: '$1,250,000',
      location: 'Beverly Hills, CA',
      beds: 4,
      baths: 3,
      sqft: '2,500',
      image: 'from-purple-500 to-pink-500'
    },
    {
      price: '$875,000',
      location: 'Austin, TX',
      beds: 3,
      baths: 2,
      sqft: '2,100',
      image: 'from-blue-500 to-cyan-500'
    },
    {
      price: '$2,150,000',
      location: 'Manhattan, NY',
      beds: 5,
      baths: 4,
      sqft: '3,200',
      image: 'from-green-500 to-emerald-500'
    }
  ];

  const scrollToProperties = () => {
    const element = document.querySelector('#properties');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToDashboard = () => {
    const element = document.querySelector('#dashboard');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <div className="relative min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
        </div>

        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=&#39;60&#39; height=&#39;60&#39; viewBox=&#39;0 0 60 60&#39; xmlns=&#39;http://www.w3.org/2000/svg&#39;%3E%3Cg fill=&#39;none&#39; fill-rule=&#39;evenodd&#39;%3E%3Cg fill=&#39;%23ffffff&#39; fill-opacity=&#39;0.05&#39;%3E%3Cpath d=&#39;M0 0h60v60H0z&#39;/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 lg:pt-32">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center min-h-[80vh]">
            {/* Hero Content */}
            <div className={`space-y-8 transform transition-all duration-1000 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}>
              {/* Badge */}
              <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
                <Sparkles className="h-4 w-4 text-yellow-300" />
                <span className="text-white/90 text-sm font-medium">
                  #1 Real Estate Platform 2024
                </span>
              </div>

              {/* Main Heading */}
              <div className="space-y-4">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight">
                  Find Your
                  <span className="block bg-gradient-to-r from-yellow-300 via-orange-300 to-yellow-400 bg-clip-text text-transparent">
                    Dream Property
                  </span>
                  with Confidence
                </h1>
                
                <p className="text-lg sm:text-xl text-white/80 leading-relaxed max-w-2xl">
                  Discover premium real estate investments with our cutting-edge platform. 
                  Manage your portfolio, track performance, and maximize returns with industry-leading tools.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={scrollToProperties}
                  className="group flex items-center justify-center space-x-2 bg-white text-blue-600 px-8 py-4 rounded-2xl font-semibold text-lg shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 transition-all duration-300"
                >
                  <span>🏠 Explore Properties</span>
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </button>
                
                <button
                  onClick={scrollToDashboard}
                  className="group flex items-center justify-center space-x-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-white/20 transition-all duration-300"
                >
                  <TrendingUp className="h-5 w-5" />
                  <span>View Dashboard</span>
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-8 pt-8 border-t border-white/20">
                <div className="text-center">
                  <div className="text-2xl lg:text-3xl font-bold text-white">50K+</div>
                  <div className="text-white/70 text-sm">Properties</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl lg:text-3xl font-bold text-white">$2.5B+</div>
                  <div className="text-white/70 text-sm">Portfolio Value</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl lg:text-3xl font-bold text-white">98%</div>
                  <div className="text-white/70 text-sm">Satisfaction</div>
                </div>
              </div>
            </div>

            {/* Property Showcase */}
            <div className={`relative transform transition-all duration-1000 delay-300 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}>
              <div className="relative">
                {/* Floating Property Cards */}
                <div className="relative h-96 lg:h-[500px]">
                  {propertyShowcase.map((property, index) => (
                    <div
                      key={index}
                      className={`absolute inset-0 transform transition-all duration-700 ${
                        index === currentSlide 
                          ? 'translate-x-0 opacity-100 scale-100 rotate-0' 
                          : index < currentSlide 
                            ? '-translate-x-full opacity-0 scale-95 -rotate-6' 
                            : 'translate-x-full opacity-0 scale-95 rotate-6'
                      }`}
                    >
                      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden h-full hover:scale-105 transition-transform duration-500">
                        {/* Property Image */}
                        <div className={`h-48 lg:h-64 bg-gradient-to-br ${property.image} relative`}>
                          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1">
                            <span className="text-sm font-semibold text-gray-800">Featured</span>
                          </div>
                          <div className="absolute inset-0 bg-black/20"></div>
                        </div>
                        
                        {/* Property Details */}
                        <div className="p-6 space-y-4">
                          <div className="space-y-2">
                            <div className="text-2xl lg:text-3xl font-bold text-gray-900">
                              {property.price}
                            </div>
                            <div className="flex items-center text-gray-600">
                              <span className="text-sm">📍 {property.location}</span>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                            <div className="text-center">
                              <div className="font-semibold text-gray-900">{property.beds}</div>
                              <div className="text-xs text-gray-500">Bedrooms</div>
                            </div>
                            <div className="text-center">
                              <div className="font-semibold text-gray-900">{property.baths}</div>
                              <div className="text-xs text-gray-500">Bathrooms</div>
                            </div>
                            <div className="text-center">
                              <div className="font-semibold text-gray-900">{property.sqft}</div>
                              <div className="text-xs text-gray-500">Sq Ft</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Slide Indicators */}
                <div className="flex justify-center space-x-2 mt-6">
                  {propertyShowcase.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        index === currentSlide 
                          ? 'bg-white scale-125' 
                          : 'bg-white/50 hover:bg-white/75'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                <span className="text-2xl">🔥</span>
              </div>
              <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                <span className="text-xl">💎</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/70 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HeroSection;