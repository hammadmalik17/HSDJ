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
  Eye
} from 'lucide-react';

const AboutSection = () => {
  const [visibleProperties, setVisibleProperties] = useState(new Set());
  const [activeProperty, setActiveProperty] = useState(0);
  const sectionRef = useRef(null);

  const properties = [
    {
      id: 1,
      title: 'Luxury Manhattan Penthouse',
      price: '$2,150,000',
      location: 'Manhattan, New York',
      beds: 5,
      baths: 4,
      sqft: 3200,
      image: 'from-blue-500 to-purple-500',
      badge: 'Featured',
      badgeColor: 'bg-blue-500',
      roi: '+12.5%',
      type: 'Luxury'
    },
    {
      id: 2,
      title: 'Modern Austin Villa',
      price: '$875,000',
      location: 'Austin, Texas',
      beds: 3,
      baths: 2,
      sqft: 2100,
      image: 'from-green-500 to-teal-500',
      badge: 'Hot Deal',
      badgeColor: 'bg-red-500',
      roi: '+8.7%',
      type: 'Modern'
    },
    {
      id: 3,
      title: 'Malibu Beach House',
      price: '$3,750,000',
      location: 'Malibu, California',
      beds: 6,
      baths: 5,
      sqft: 4800,
      image: 'from-orange-500 to-pink-500',
      badge: 'Luxury',
      badgeColor: 'bg-purple-500',
      roi: '+15.2%',
      type: 'Oceanfront'
    },
    {
      id: 4,
      title: 'Downtown Chicago Condo',
      price: '$645,000',
      location: 'Chicago, Illinois',
      beds: 2,
      baths: 2,
      sqft: 1800,
      image: 'from-indigo-500 to-blue-500',
      badge: 'New',
      badgeColor: 'bg-green-500',
      roi: '+9.8%',
      type: 'Urban'
    },
    {
      id: 5,
      title: 'Miami Waterfront Condo',
      price: '$1,420,000',
      location: 'Miami, Florida',
      beds: 4,
      baths: 3,
      sqft: 2800,
      image: 'from-cyan-500 to-blue-500',
      badge: 'Waterfront',
      badgeColor: 'bg-cyan-500',
      roi: '+11.3%',
      type: 'Luxury'
    },
    {
      id: 6,
      title: 'Seattle Tech Hub Loft',
      price: '$925,000',
      location: 'Seattle, Washington',
      beds: 3,
      baths: 2,
      sqft: 2200,
      image: 'from-purple-500 to-indigo-500',
      badge: 'Tech Hub',
      badgeColor: 'bg-indigo-500',
      roi: '+10.1%',
      type: 'Loft'
    }
  ];

  const stats = [
    { value: '50K+', label: 'Properties Listed', icon: Building2 },
    { value: '$2.5B+', label: 'Portfolio Value', icon: TrendingUp },
    { value: '15K+', label: 'Happy Investors', icon: Users },
    { value: '98%', label: 'Success Rate', icon: Award }
  ];

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
      { threshold: 0.1, rootMargin: '0px 0px -100px 0px' }
    );

    const cards = sectionRef.current?.querySelectorAll('.property-card');
    cards?.forEach((card) => observer.observe(card));

    return () => observer.disconnect();
  }, []);

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
                <span className="text-blue-700 text-sm font-medium">Featured Properties</span>
              </div>
              
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                Discover
                <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
                  Premium Properties
                </span>
              </h2>
              
              <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Hand-picked premium properties with exceptional investment potential. 
                Each property is carefully evaluated for maximum returns.
              </p>
            </div>

            {/* Properties Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
              {properties.map((property, index) => {
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
                    style={{ transitionDelay: `${index * 150}ms` }}
                    onMouseEnter={() => setActiveProperty(property.id)}
                  >
                    {/* Property Image */}
                    <div className={`relative h-64 bg-gradient-to-br ${property.image} overflow-hidden`}>
                      {/* Badge */}
                      <div className={`absolute top-4 left-4 ${property.badgeColor} text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg`}>
                        {property.badge}
                      </div>
                      
                      {/* ROI Badge */}
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-green-600 px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                        {property.roi} ROI
                      </div>

                      {/* Favorite Button */}
                      <button className="absolute bottom-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all duration-200 group/heart">
                        <Heart className="h-5 w-5 text-gray-600 group-hover/heart:text-red-500 group-hover/heart:fill-red-500 transition-all duration-200" />
                      </button>

                      {/* Overlay */}
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-all duration-300"></div>
                      
                      {/* View Details Button */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <button className="bg-white text-gray-900 px-6 py-3 rounded-xl font-semibold flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
                          <Eye className="h-4 w-4" />
                          <span>View Details</span>
                        </button>
                      </div>
                    </div>

                    {/* Property Details */}
                    <div className="p-6 space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                            {property.type}
                          </span>
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                            <span className="text-sm text-gray-600">4.9</span>
                          </div>
                        </div>
                        
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {property.title}
                        </h3>
                        
                        <div className="flex items-center text-gray-600">
                          <MapPin className="h-4 w-4 mr-1" />
                          <span className="text-sm">{property.location}</span>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="text-2xl font-bold text-gray-900">
                        {property.price}
                      </div>

                      {/* Features */}
                      <div className="grid grid-cols-3 gap-4 py-4 border-t border-gray-100">
                        <div className="text-center">
                          <div className="flex items-center justify-center space-x-1 text-gray-600">
                            <Bed className="h-4 w-4" />
                            <span className="font-semibold text-gray-900">{property.beds}</span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">Bedrooms</div>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center space-x-1 text-gray-600">
                            <Bath className="h-4 w-4" />
                            <span className="font-semibold text-gray-900">{property.baths}</span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">Bathrooms</div>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center space-x-1 text-gray-600">
                            <Square className="h-4 w-4" />
                            <span className="font-semibold text-gray-900">{property.sqft.toLocaleString()}</span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">Sq Ft</div>
                        </div>
                      </div>

                      {/* CTA Button */}
                      <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center space-x-2">
                        <span>View Property</span>
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* View All Properties Button */}
            <div className="text-center">
              <button className="bg-white border border-gray-300 text-gray-700 px-8 py-4 rounded-2xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 shadow-lg hover:shadow-xl">
                View All Properties
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
                Join our growing community of successful real estate investors who have transformed their financial future.
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
                    <div className="text-white/80 font-medium">
                      {stat.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default AboutSection;