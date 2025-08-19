// client/src/components/Homepage/AboutSection.jsx - PHASE 2 ENHANCED
import React, { useState, useEffect, useRef } from 'react';
import { 
  MapPin, 
  Bed, 
  Bath, 
  Square, 
  Heart, 
  Star,
  TrendingUp,
  Award,
  Users,
  Building2,
  ArrowRight,
  Eye,
  Play,
  Calendar,
  CheckCircle,
  IndianRupee,
  Filter,
  Search
} from 'lucide-react';

const AboutSection = () => {
  const [visibleProperties, setVisibleProperties] = useState(new Set());
  const [activeProperty, setActiveProperty] = useState(0);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showPropertyModal, setShowPropertyModal] = useState(null);
  const sectionRef = useRef(null);

  // Enhanced property portfolio with Indian context
  const properties = [
    {
      id: 1,
      title: 'HSDJ Luxury Residences',
      price: '₹85,00,000',
      originalPrice: '₹95,00,000',
      location: 'Vidyanagar, Hubballi',
      beds: 3,
      baths: 3,
      sqft: 1850,
      image: 'from-blue-500 to-purple-500',
      badge: 'Best Seller',
      badgeColor: 'bg-green-500',
      roi: '+12.5%',
      type: 'residential',
      status: 'Ready to Move',
      completion: '100%',
      amenities: ['Swimming Pool', 'Gym', 'Parking', 'Security'],
      description: 'Premium 3BHK apartments with modern amenities in the heart of Vidyanagar.',
      possession: '2024',
      totalUnits: 120,
      soldUnits: 95,
      pricePerSqft: '₹4,595',
      hasVideo: true
    },
    {
      id: 2,
      title: 'HSDJ Commercial Hub',
      price: '₹1,25,00,000',
      originalPrice: '₹1,35,00,000',
      location: 'Old Hubballi',
      beds: null,
      baths: 2,
      sqft: 2800,
      image: 'from-green-500 to-teal-500',
      badge: 'Commercial',
      badgeColor: 'bg-blue-500',
      roi: '+15.2%',
      type: 'commercial',
      status: 'Under Construction',
      completion: '75%',
      amenities: ['Central AC', 'Elevator', 'Parking', 'Power Backup'],
      description: 'Prime commercial space perfect for offices and retail businesses.',
      possession: '2024',
      totalUnits: 50,
      soldUnits: 32,
      pricePerSqft: '₹4,465',
      hasVideo: false
    },
    {
      id: 3,
      title: 'HSDJ Smart City Apartments',
      price: '₹65,00,000',
      originalPrice: '₹70,00,000',
      location: 'Gokul Road, Hubballi',
      beds: 2,
      baths: 2,
      sqft: 1200,
      image: 'from-purple-500 to-pink-500',
      badge: 'Pre-Launch',
      badgeColor: 'bg-orange-500',
      roi: '+10.8%',
      type: 'residential',
      status: 'Pre-Launch',
      completion: '25%',
      amenities: ['Smart Home', 'Garden', 'Clubhouse', 'Play Area'],
      description: 'Modern 2BHK apartments with smart home technology and green spaces.',
      possession: '2025',
      totalUnits: 200,
      soldUnits: 45,
      pricePerSqft: '₹5,417',
      hasVideo: true
    },
    {
      id: 4,
      title: 'HSDJ Executive Villas',
      price: '₹1,85,00,000',
      originalPrice: '₹2,00,00,000',
      location: 'Keshwapur, Hubballi',
      beds: 4,
      baths: 4,
      sqft: 3200,
      image: 'from-orange-500 to-red-500',
      badge: 'Luxury',
      badgeColor: 'bg-purple-500',
      roi: '+18.5%',
      type: 'villa',
      status: 'Ready to Move',
      completion: '100%',
      amenities: ['Private Garden', 'Garage', 'Study Room', 'Servant Quarter'],
      description: 'Spacious 4BHK independent villas with private gardens and premium finishes.',
      possession: '2024',
      totalUnits: 30,
      soldUnits: 28,
      pricePerSqft: '₹5,781',
      hasVideo: true
    },
    {
      id: 5,
      title: 'HSDJ IT Park Offices',
      price: '₹95,00,000',
      originalPrice: '₹1,05,00,000',
      location: 'IT Park, Hubballi',
      beds: null,
      baths: 1,
      sqft: 1800,
      image: 'from-indigo-500 to-blue-500',
      badge: 'IT Hub',
      badgeColor: 'bg-cyan-500',
      roi: '+14.2%',
      type: 'commercial',
      status: 'Under Construction',
      completion: '60%',
      amenities: ['High Speed Internet', 'Conference Rooms', 'Cafeteria', 'Parking'],
      description: 'Modern office spaces in Hubballi\'s premier IT corridor.',
      possession: '2025',
      totalUnits: 80,
      soldUnits: 55,
      pricePerSqft: '₹5,278',
      hasVideo: false
    },
    {
      id: 6,
      title: 'HSDJ Heritage Homes',
      price: '₹75,00,000',
      originalPrice: '₹80,00,000',
      location: 'Unkal, Hubballi',
      beds: 3,
      baths: 2,
      sqft: 1600,
      image: 'from-emerald-500 to-green-500',
      badge: 'Nature View',
      badgeColor: 'bg-green-600',
      roi: '+11.5%',
      type: 'residential',
      status: 'Selling Fast',
      completion: '90%',
      amenities: ['Lake View', 'Jogging Track', 'Kids Play Area', 'Temple'],
      description: '3BHK apartments with beautiful lake views and serene environment.',
      possession: '2024',
      totalUnits: 150,
      soldUnits: 135,
      pricePerSqft: '₹4,688',
      hasVideo: true
    }
  ];

  const stats = [
    {
      icon: Building2,
      value: '250+',
      label: 'Properties Developed',
      subtext: 'Across Hubballi-Dharwad'
    },
    {
      icon: Users,
      value: '1000+',
      label: 'Happy Families',
      subtext: 'Living in our homes'
    },
    {
      icon: TrendingUp,
      value: '15%',
      label: 'Average Returns',
      subtext: 'Annual ROI for investors'
    },
    {
      icon: Award,
      value: '25',
      label: 'Years Experience',
      subtext: 'In real estate development'
    }
  ];

  const filterOptions = [
    { id: 'all', label: 'All Properties', count: properties.length },
    { id: 'residential', label: 'Residential', count: properties.filter(p => p.type === 'residential').length },
    { id: 'commercial', label: 'Commercial', count: properties.filter(p => p.type === 'commercial').length },
    { id: 'villa', label: 'Villas', count: properties.filter(p => p.type === 'villa').length }
  ];

  const filteredProperties = selectedFilter === 'all' 
    ? properties 
    : properties.filter(property => property.type === selectedFilter);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.dataset.index);
            setVisibleProperties(prev => new Set([...prev, index]));
          }
        });
      },
      { 
        threshold: 0.3,
        rootMargin: '50px'
      }
    );

    const propertyCards = document.querySelectorAll('.property-card');
    propertyCards.forEach((card) => {
      observer.observe(card);
    });

    return () => observer.disconnect();
  }, [filteredProperties]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Ready to Move': return 'bg-green-100 text-green-800';
      case 'Under Construction': return 'bg-blue-100 text-blue-800';
      case 'Pre-Launch': return 'bg-orange-100 text-orange-800';
      case 'Selling Fast': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-IN').format(num);
  };

  return (
    <>
      <div className="bg-white">
        {/* Properties Section */}
        <section id="properties" ref={sectionRef} className="py-20 lg:py-32 bg-gradient-to-br from-white to-gray-50 relative overflow-hidden">
          {/* Background Elements */}
          <div className="absolute inset-0">
            <div className="absolute top-1/4 left-0 w-72 h-72 bg-blue-100/50 rounded-full blur-3xl -translate-x-1/2"></div>
            <div className="absolute bottom-1/4 right-0 w-72 h-72 bg-purple-100/50 rounded-full blur-3xl translate-x-1/2"></div>
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section Header */}
            <div className="text-center mb-16 lg:mb-20">
              <div className="inline-flex items-center space-x-2 bg-blue-50 rounded-full px-4 py-2 border border-blue-200 mb-6">
                <Building2 className="h-4 w-4 text-blue-600" />
                <span className="text-blue-700 text-sm font-medium">Our Property Portfolio</span>
              </div>
              
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                Discover Your
                <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
                  Dream Property
                </span>
              </h2>
              
              <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                From luxury residences to prime commercial spaces, explore our carefully curated portfolio 
                of premium properties in Hubballi's most sought-after locations.
              </p>
            </div>

            {/* Filters */}
            <div className="flex justify-center mb-12">
              <div className="bg-white rounded-2xl p-2 shadow-lg border border-gray-200">
                <div className="flex flex-wrap gap-2">
                  {filterOptions.map((filter) => (
                    <button
                      key={filter.id}
                      onClick={() => setSelectedFilter(filter.id)}
                      className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center space-x-2 ${
                        selectedFilter === filter.id
                          ? 'bg-blue-600 text-white shadow-lg'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <span>{filter.label}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        selectedFilter === filter.id 
                          ? 'bg-white/20 text-white' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {filter.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Properties Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
              {filteredProperties.map((property, index) => {
                const isVisible = visibleProperties.has(index);
                
                return (
                  <div
                    key={property.id}
                    data-index={index}
                    className={`property-card group relative bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-700 border border-gray-100 hover:border-gray-200 ${
                      isVisible 
                        ? 'translate-y-0 opacity-100' 
                        : 'translate-y-10 opacity-0'
                    }`}
                    style={{ 
                      transitionDelay: `${(index % 3) * 100}ms` 
                    }}
                  >
                    {/* Property Image/Video */}
                    <div className={`relative h-48 bg-gradient-to-br ${property.image} overflow-hidden`}>
                      {/* Property Badge */}
                      <div className="absolute top-4 left-4 z-10">
                        <span className={`${property.badgeColor} text-white px-3 py-1 rounded-full text-xs font-semibold`}>
                          {property.badge}
                        </span>
                      </div>

                      {/* Video/Photo Indicator */}
                      <div className="absolute top-4 right-4 z-10">
                        {property.hasVideo ? (
                          <div className="bg-black/50 backdrop-blur-sm rounded-full p-2">
                            <Play className="h-4 w-4 text-white" />
                          </div>
                        ) : (
                          <div className="bg-black/50 backdrop-blur-sm rounded-full p-2">
                            <Eye className="h-4 w-4 text-white" />
                          </div>
                        )}
                      </div>

                      {/* Placeholder for actual property image */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Building2 className="h-16 w-16 text-white/50" />
                      </div>

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300"></div>
                    </div>

                    {/* Property Details */}
                    <div className="p-6">
                      {/* Header */}
                      <div className="mb-4">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                            {property.title}
                          </h3>
                          <Heart className="h-5 w-5 text-gray-300 hover:text-red-500 transition-colors cursor-pointer" />
                        </div>
                        
                        <div className="flex items-center text-gray-600 text-sm mb-3">
                          <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                          <span className="line-clamp-1">{property.location}</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center space-x-2">
                              <p className="text-2xl font-bold text-gray-900">{property.price}</p>
                              {property.originalPrice !== property.price && (
                                <p className="text-sm text-gray-500 line-through">{property.originalPrice}</p>
                              )}
                            </div>
                            <p className="text-xs text-gray-500">{property.pricePerSqft}/sq ft</p>
                          </div>
                          <div className="text-right">
                            <p className="text-green-600 font-semibold text-sm">{property.roi}</p>
                            <p className="text-xs text-gray-500">Expected ROI</p>
                          </div>
                        </div>
                      </div>

                      {/* Property Stats */}
                      {property.beds && (
                        <div className="grid grid-cols-3 gap-3 mb-4 text-center">
                          <div className="bg-gray-50 rounded-lg p-2">
                            <Bed className="h-4 w-4 text-gray-600 mx-auto mb-1" />
                            <p className="text-xs text-gray-600">{property.beds} Beds</p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-2">
                            <Bath className="h-4 w-4 text-gray-600 mx-auto mb-1" />
                            <p className="text-xs text-gray-600">{property.baths} Baths</p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-2">
                            <Square className="h-4 w-4 text-gray-600 mx-auto mb-1" />
                            <p className="text-xs text-gray-600">{formatNumber(property.sqft)} sq ft</p>
                          </div>
                        </div>
                      )}

                      {/* Status and Progress */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(property.status)}`}>
                            {property.status}
                          </span>
                          <span className="text-xs text-gray-500">{property.completion} Complete</span>
                        </div>
                        
                        {/* Sales Progress */}
                        <div className="mb-3">
                          <div className="flex justify-between text-xs text-gray-600 mb-1">
                            <span>Units Sold</span>
                            <span>{property.soldUnits}/{property.totalUnits}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div 
                              className="bg-blue-600 h-1.5 rounded-full transition-all duration-500"
                              style={{ width: `${(property.soldUnits / property.totalUnits) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setShowPropertyModal(property)}
                          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-xl font-medium hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center space-x-2"
                        >
                          <span>View Details</span>
                          <ArrowRight className="h-4 w-4" />
                        </button>
                        
                        <button className="px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">
                          <Heart className="h-4 w-4 text-gray-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* View All Properties Button */}
            <div className="text-center">
              <button className="bg-white border border-gray-300 text-gray-700 px-8 py-4 rounded-2xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center space-x-2 mx-auto">
                <span>View All {properties.length} Properties</span>
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=&quot;60&quot; height=&quot;60&quot; viewBox=&quot;0 0 60 60&quot; xmlns=&quot;http://www.w3.org/2000/svg&quot;%3E%3Cg fill=&quot;none&quot; fill-rule=&quot;evenodd&quot;%3E%3Cg fill=&quot;%23ffffff&quot; fill-opacity=&quot;0.1&quot;%3E%3Cpath d=&quot;M0 0h60v60H0z&quot;/&gt;%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
          
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h3 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                Trusted by Thousands of Investors
              </h3>
              <p className="text-white/80 text-lg max-w-2xl mx-auto">
                Join our growing community of successful real estate investors who have transformed their financial future with HSDJ Holdings.
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((stat, index) => {
                const IconComponent = stat.icon;
                
                return (
                  <div key={index} className="text-center">
                    <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/20">
                      <IconComponent className="h-8 w-8 text-white" />
                    </div>
                    <div className="text-3xl lg:text-4xl font-bold text-white mb-2">
                      {stat.value}
                    </div>
                    <div className="text-white/90 font-medium mb-1">
                      {stat.label}
                    </div>
                    <div className="text-white/70 text-sm">
                      {stat.subtext}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>

      {/* Property Modal */}
      {showPropertyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className={`relative h-64 bg-gradient-to-br ${showPropertyModal.image} overflow-hidden rounded-t-3xl`}>
              <button
                onClick={() => setShowPropertyModal(null)}
                className="absolute top-4 right-4 w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors z-10"
              >
                ×
              </button>
              
              <div className="absolute top-4 left-4">
                <span className={`${showPropertyModal.badgeColor} text-white px-3 py-1 rounded-full text-sm font-semibold`}>
                  {showPropertyModal.badge}
                </span>
              </div>

              <div className="absolute inset-0 flex items-center justify-center">
                <Building2 className="h-20 w-20 text-white/50" />
              </div>

              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
              
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <h2 className="text-2xl font-bold mb-2">{showPropertyModal.title}</h2>
                <div className="flex items-center text-white/90">
                  <MapPin className="h-4 w-4 mr-1" />
                  {showPropertyModal.location}
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-8">
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Left Column - Details */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Property Details</h3>
                    <p className="text-gray-700 leading-relaxed">{showPropertyModal.description}</p>
                  </div>

                  {/* Price and ROI */}
                  <div className="bg-blue-50 rounded-2xl p-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Property Price</p>
                        <div className="flex items-center space-x-2">
                          <p className="text-2xl font-bold text-gray-900">{showPropertyModal.price}</p>
                          {showPropertyModal.originalPrice !== showPropertyModal.price && (
                            <p className="text-sm text-gray-500 line-through">{showPropertyModal.originalPrice}</p>
                          )}
                        </div>
                        <p className="text-xs text-gray-600">{showPropertyModal.pricePerSqft}/sq ft</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Expected ROI</p>
                        <p className="text-2xl font-bold text-green-600">{showPropertyModal.roi}</p>
                        <p className="text-xs text-gray-600">Annual returns</p>
                      </div>
                    </div>
                  </div>

                  {/* Specifications */}
                  {showPropertyModal.beds && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Specifications</h4>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center p-3 bg-gray-50 rounded-xl">
                          <Bed className="h-6 w-6 text-gray-600 mx-auto mb-2" />
                          <p className="font-semibold text-gray-900">{showPropertyModal.beds}</p>
                          <p className="text-xs text-gray-600">Bedrooms</p>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-xl">
                          <Bath className="h-6 w-6 text-gray-600 mx-auto mb-2" />
                          <p className="font-semibold text-gray-900">{showPropertyModal.baths}</p>
                          <p className="text-xs text-gray-600">Bathrooms</p>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-xl">
                          <Square className="h-6 w-6 text-gray-600 mx-auto mb-2" />
                          <p className="font-semibold text-gray-900">{formatNumber(showPropertyModal.sqft)}</p>
                          <p className="text-xs text-gray-600">Sq Ft</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Amenities */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Amenities</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {showPropertyModal.amenities.map((amenity, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm text-gray-700">{amenity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Column - Project Info */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Project Information</h3>
                    
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-700">Status</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(showPropertyModal.status)}`}>
                          {showPropertyModal.status}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-700">Completion</span>
                        <span className="font-semibold text-gray-900">{showPropertyModal.completion}</span>
                      </div>
                      
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-700">Possession</span>
                        <span className="font-semibold text-gray-900">{showPropertyModal.possession}</span>
                      </div>
                    </div>
                  </div>

                  {/* Sales Progress */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Sales Progress</h4>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>Units Sold</span>
                        <span>{showPropertyModal.soldUnits} of {showPropertyModal.totalUnits}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                        <div 
                          className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${(showPropertyModal.soldUnits / showPropertyModal.totalUnits) * 100}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-600">
                        {Math.round((showPropertyModal.soldUnits / showPropertyModal.totalUnits) * 100)}% sold
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <button className="w-full bg-blue-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-blue-700 transition-colors duration-300">
                      Schedule Site Visit
                    </button>
                    <button className="w-full bg-green-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-green-700 transition-colors duration-300">
                      Request Callback
                    </button>
                    <button className="w-full border border-gray-300 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:bg-gray-50 transition-colors duration-300">
                      Download Brochure
                    </button>
                  </div>

                  {/* Contact Info */}
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 text-center border border-blue-100">
                    <h4 className="font-semibold text-gray-900 mb-2">Need More Information?</h4>
                    <p className="text-sm text-gray-700 mb-3">Speak with our property consultant</p>
                    <p className="text-blue-600 font-semibold">+91 98765 43210</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AboutSection;