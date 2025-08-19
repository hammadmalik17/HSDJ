// client/src/components/Homepage/HeroSection.jsx - PHASE 2 ENHANCED
import React, { useState, useEffect } from 'react';
import { ArrowRight, Play, Sparkles, TrendingUp, ChevronLeft, ChevronRight, MapPin, Building2 } from 'lucide-react';

const HeroSection = ({ onGetStartedClick }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);

  // Enhanced property showcase with real images placeholders and videos
  const propertyShowcase = [
    {
      id: 1,
      title: 'Luxury Residential Complex',
      location: 'Hubballi Business District',
      price: '₹85,00,000',
      roi: '+12.5% Annual Returns',
      beds: 3,
      baths: 2,
      sqft: '1,850',
      type: 'video',
      media: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4', // Placeholder
      thumbnail: 'from-blue-500 to-purple-600',
      status: 'Available',
      completion: '85%'
    },
    {
      id: 2,
      title: 'Premium Commercial Hub',
      location: 'Hubballi IT Park',
      price: '₹1,25,00,000',
      roi: '+15.2% Annual Returns',
      beds: null,
      baths: null,
      sqft: '3,200',
      type: 'image',
      media: '/api/placeholder/600/400', // Placeholder for real property image
      thumbnail: 'from-green-500 to-emerald-600',
      status: 'Pre-Launch',
      completion: '45%'
    },
    {
      id: 3,
      title: 'Smart City Apartments',
      location: 'New Hubballi',
      price: '₹65,00,000',
      roi: '+10.8% Annual Returns',
      beds: 2,
      baths: 2,
      sqft: '1,200',
      type: 'image',
      media: '/api/placeholder/600/400', // Placeholder for real property image
      thumbnail: 'from-purple-500 to-pink-600',
      status: 'Selling Fast',
      completion: '92%'
    },
    {
      id: 4,
      title: 'Executive Villa Project',
      location: 'Vidyanagar Extension',
      price: '₹1,85,00,000',
      roi: '+18.5% Annual Returns',
      beds: 4,
      baths: 3,
      sqft: '2,800',
      type: 'video',
      media: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4', // Placeholder
      thumbnail: 'from-orange-500 to-red-600',
      status: 'Luxury',
      completion: '100%'
    }
  ];

  useEffect(() => {
    setIsVisible(true);
    
    // Auto-slide for property showcase
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % propertyShowcase.length);
    }, 6000); // Slower transition for better viewing

    return () => clearInterval(interval);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % propertyShowcase.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + propertyShowcase.length) % propertyShowcase.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const handlePlayVideo = () => {
    const currentProperty = propertyShowcase[currentSlide];
    if (currentProperty.type === 'video') {
      setShowVideoModal(true);
    }
  };

  const scrollToProperties = () => {
    const element = document.querySelector('#properties');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const currentProperty = propertyShowcase[currentSlide];

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
                <Sparkles className="h-4 w-4 text-yellow-400" />
                <span className="text-white text-sm font-medium">Premium Real Estate Investments</span>
              </div>

              {/* Main Heading */}
              <div className="space-y-4">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
                  Invest in
                  <span className="block bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
                    Premium Properties
                  </span>
                  in Hyderabad
                </h1>
                
                <p className="text-lg sm:text-xl text-white/80 max-w-xl leading-relaxed">
                  Join HSDJ Holdings and build wealth through carefully selected real estate investments. 
                  Secure your financial future with our premium property portfolio.
                </p>
              </div>

              {/* Current Property Quick Info */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Building2 className="h-5 w-5 text-yellow-400" />
                    <span className="text-white font-medium">Featured Property</span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    currentProperty.status === 'Available' ? 'bg-green-500/20 text-green-300' :
                    currentProperty.status === 'Pre-Launch' ? 'bg-blue-500/20 text-blue-300' :
                    currentProperty.status === 'Selling Fast' ? 'bg-orange-500/20 text-orange-300' :
                    'bg-purple-500/20 text-purple-300'
                  }`}>
                    {currentProperty.status}
                  </span>
                </div>
                
                <h3 className="text-white font-semibold text-lg mb-2">{currentProperty.title}</h3>
                <div className="flex items-center text-white/70 text-sm mb-3">
                  <MapPin className="h-4 w-4 mr-1" />
                  {currentProperty.location}
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-white">{currentProperty.price}</p>
                    <p className="text-green-400 text-sm font-medium">{currentProperty.roi}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white/70 text-xs">Project Completion</p>
                    <p className="text-white font-semibold">{currentProperty.completion}</p>
                  </div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={onGetStartedClick}
                  className="group bg-white text-blue-600 px-8 py-4 rounded-2xl font-semibold hover:bg-blue-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center space-x-2"
                >
                  <span>Start Investing</span>
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </button>
                
                <button
                  onClick={scrollToProperties}
                  className="group border border-white/30 text-white px-8 py-4 rounded-2xl font-semibold hover:bg-white/10 transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  <span>View Properties</span>
                  <TrendingUp className="h-5 w-5 group-hover:scale-110 transition-transform" />
                </button>
              </div>
            </div>

            {/* Enhanced Property Showcase with Photos/Videos */}
            <div className={`relative transform transition-all duration-1000 delay-500 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}>
              <div className="relative bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20 shadow-2xl">
                {/* Property Media Container */}
                <div className="relative mb-6 overflow-hidden rounded-2xl bg-gradient-to-br">
                  {/* Media Display */}
                  <div className={`relative w-full h-64 bg-gradient-to-br ${currentProperty.thumbnail} rounded-2xl overflow-hidden group cursor-pointer`}>
                    {/* Placeholder for actual media */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      {currentProperty.type === 'video' ? (
                        <button
                          onClick={handlePlayVideo}
                          className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-300 group-hover:scale-110"
                        >
                          <Play className="w-8 h-8 text-white ml-1" />
                        </button>
                      ) : (
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                          <Building2 className="w-8 h-8 text-white" />
                        </div>
                      )}
                    </div>
                    
                    {/* Media Type Badge */}
                    <div className="absolute top-4 left-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${
                        currentProperty.type === 'video' ? 'bg-red-500/80' : 'bg-blue-500/80'
                      }`}>
                        {currentProperty.type === 'video' ? 'Video Tour' : 'Photo Gallery'}
                      </span>
                    </div>
                    
                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                  </div>

                  {/* Navigation Arrows */}
                  <button
                    onClick={prevSlide}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-300 text-white"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  
                  <button
                    onClick={nextSlide}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-300 text-white"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>

                {/* Property Details */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">{currentProperty.title}</h3>
                    <div className="flex items-center text-white/70 text-sm">
                      <MapPin className="h-4 w-4 mr-1" />
                      {currentProperty.location}
                    </div>
                  </div>

                  {/* Property Stats */}
                  {currentProperty.beds && (
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="bg-white/10 rounded-lg p-3">
                        <p className="text-white font-semibold">{currentProperty.beds}</p>
                        <p className="text-white/70 text-xs">Bedrooms</p>
                      </div>
                      <div className="bg-white/10 rounded-lg p-3">
                        <p className="text-white font-semibold">{currentProperty.baths}</p>
                        <p className="text-white/70 text-xs">Bathrooms</p>
                      </div>
                      <div className="bg-white/10 rounded-lg p-3">
                        <p className="text-white font-semibold">{currentProperty.sqft}</p>
                        <p className="text-white/70 text-xs">Sq Ft</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Slide Indicators */}
                <div className="flex justify-center space-x-2 mt-6">
                  {propertyShowcase.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToSlide(index)}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        currentSlide === index 
                          ? 'bg-white scale-125' 
                          : 'bg-white/50 hover:bg-white/75'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                <span className="text-2xl">🏢</span>
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

      {/* Video Modal */}
      {showVideoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl w-full">
            <button
              onClick={() => setShowVideoModal(false)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <div className="bg-black rounded-lg overflow-hidden">
              <video
                controls
                autoPlay
                className="w-full h-auto"
                src={currentProperty.media}
              >
                Your browser does not support the video tag.
              </video>
            </div>
            
            <div className="mt-4 text-center text-white">
              <h3 className="text-xl font-semibold">{currentProperty.title}</h3>
              <p className="text-white/70">{currentProperty.location}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default HeroSection;