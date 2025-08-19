// client/src/components/Homepage/DirectorMessage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { 
  Quote, 
  Award, 
  TrendingUp, 
  Users, 
  Building, 
  Star,
  ArrowRight,
  Play,
  CheckCircle,
  Calendar,
  Target
} from 'lucide-react';

const DirectorMessage = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('message');
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const achievements = [
    {
      icon: Building,
      number: '250+',
      label: 'Properties Developed',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Users,
      number: '1000+',
      label: 'Happy Investors',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: TrendingUp,
      number: '15%',
      label: 'Average Annual Returns',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Award,
      number: '25+',
      label: 'Years Experience',
      color: 'from-orange-500 to-red-500'
    }
  ];

  const companyUpdates = [
    {
      date: '2024-01-15',
      title: 'New Smart City Project Launch',
      description: 'Announcing our latest premium residential project in the heart of Hubballi\'s developing IT corridor.',
      type: 'launch',
      impact: 'High'
    },
    {
      date: '2024-01-10',
      title: 'Record Investment Returns',
      description: 'Our investors achieved an average 18.5% return this quarter, exceeding market expectations.',
      type: 'achievement',
      impact: 'High'
    },
    {
      date: '2024-01-05',
      title: 'Sustainability Initiative',
      description: 'HSDJ Holdings commits to 100% green building standards for all new developments.',
      type: 'initiative',
      impact: 'Medium'
    }
  ];

  const visionPoints = [
    {
      icon: Target,
      title: 'Customer-Centric Approach',
      description: 'Every decision we make prioritizes our investors\' success and financial growth.'
    },
    {
      icon: Building,
      title: 'Quality Development',
      description: 'We maintain the highest standards in construction, design, and project management.'
    },
    {
      icon: TrendingUp,
      title: 'Sustainable Growth',
      description: 'Our long-term vision focuses on consistent, sustainable returns for our stakeholders.'
    }
  ];

  return (
    <section 
      ref={sectionRef}
      className="py-20 lg:py-32 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 right-0 w-72 h-72 bg-blue-100/30 rounded-full blur-3xl translate-x-1/2"></div>
        <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-purple-100/30 rounded-full blur-3xl -translate-x-1/2"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className={`text-center mb-16 lg:mb-20 transform transition-all duration-1000 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
          <div className="inline-flex items-center space-x-2 bg-blue-50 rounded-full px-4 py-2 border border-blue-200 mb-6">
            <Quote className="h-4 w-4 text-blue-600" />
            <span className="text-blue-700 text-sm font-medium">Leadership Message</span>
          </div>
          
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Message from
            <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
              Our Director
            </span>
          </h2>
          
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            A personal note from our founder about vision, values, and our commitment to your success.
          </p>
        </div>

        {/* Main Content */}
        <div className={`transform transition-all duration-1000 delay-300 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
          {/* Navigation Tabs */}
          <div className="flex justify-center mb-12">
            <div className="bg-white rounded-2xl p-2 shadow-lg border border-gray-200">
              <div className="flex space-x-2">
                {[
                  { id: 'message', label: 'Director\'s Message', icon: Quote },
                  { id: 'vision', label: 'Our Vision', icon: Target },
                  { id: 'updates', label: 'Company Updates', icon: Calendar }
                ].map((tab) => {
                  const TabIcon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                        activeTab === tab.id
                          ? 'bg-blue-600 text-white shadow-lg'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <TabIcon className="w-4 h-4" />
                      <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Tab Content */}
          <div className="grid lg:grid-cols-3 gap-12 lg:gap-16">
            {/* Director Profile */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 sticky top-8">
                {/* Director Photo Placeholder */}
                <div className="w-32 h-32 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                  <span className="text-white text-4xl font-bold">HD</span>
                </div>
                
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Dr. Syeda Maryam Gazala</h3>
                  <p className="text-blue-600 font-medium mb-1">Founder & Managing Director</p>
                  <p className="text-gray-600 text-sm">HSDJ Holdings Pvt. Ltd.</p>
                </div>

                {/* Director Credentials */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Award className="w-4 h-4 text-blue-600" />
                    <span>25+ Years in Real Estate</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Building className="w-4 h-4 text-blue-600" />
                    <span>250+ Successful Projects</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span>1000+ Satisfied Investors</span>
                  </div>
                </div>

                {/* Achievements Grid */}
                <div className="grid grid-cols-2 gap-3">
                  {achievements.map((achievement, index) => {
                    const IconComponent = achievement.icon;
                    return (
                      <div key={index} className="text-center p-3 bg-gray-50 rounded-xl">
                        <div className={`w-8 h-8 bg-gradient-to-br ${achievement.color} rounded-lg flex items-center justify-center mx-auto mb-2`}>
                          <IconComponent className="w-4 h-4 text-white" />
                        </div>
                        <p className="font-bold text-gray-900 text-sm">{achievement.number}</p>
                        <p className="text-xs text-gray-600">{achievement.label}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Content Area */}
            <div className="lg:col-span-2">
              {/* Director's Message Tab */}
              {activeTab === 'message' && (
                <div className="bg-white rounded-3xl p-8 lg:p-12 shadow-xl border border-gray-100">
                  <div className="mb-8">
                    <Quote className="w-12 h-12 text-blue-600 mb-4" />
                    <h3 className="text-3xl font-bold text-gray-900 mb-6">
                      Building Wealth Through Strategic Real Estate Investment
                    </h3>
                  </div>

                  <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed space-y-6">
                    <p className="text-xl text-gray-800 font-medium">
                      Dear Valued Investors and Future Partners,
                    </p>

                    <p>
                      Welcome to HSDJ Holdings, where your financial dreams meet strategic real estate opportunities. 
                      With over 25 years of experience in the Hubballi real estate market, I have witnessed the 
                      incredible transformation of our city into a thriving commercial and residential hub.
                    </p>

                    <p>
                      Our mission is simple yet powerful: to provide our investors with carefully selected, 
                      high-quality properties that deliver consistent returns while building long-term wealth. 
                      We understand that every rupee you invest represents your trust in our expertise and 
                      your dreams for a secure financial future.
                    </p>

                    <p>
                      At HSDJ Holdings, we don't just develop properties; we create communities. Every project 
                      is meticulously planned with sustainable design, premium amenities, and strategic locations 
                      that ensure both lifestyle enhancement and strong appreciation potential.
                    </p>

                    <div className="bg-blue-50 rounded-2xl p-6 my-8 border-l-4 border-blue-600">
                      <p className="text-blue-800 font-medium italic">
                        "Real estate investment is not just about buying property; it's about investing in 
                        the future of our community and securing prosperity for generations to come."
                      </p>
                    </div>

                    <p>
                      Our track record speaks for itself: over 1000 satisfied investors, an average annual 
                      return of 15%, and a portfolio of premium properties that continue to set new standards 
                      in the market. We believe in transparency, integrity, and delivering on our promises.
                    </p>

                    <p>
                      As we look toward the future, I invite you to join our growing family of successful 
                      investors. Together, we will continue to build not just properties, but lasting 
                      relationships and sustainable wealth.
                    </p>

                    <div className="mt-8 pt-6 border-t border-gray-200">
                      <p className="font-semibold text-gray-900 mb-2">Warm regards,</p>
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                          <span className="text-white text-lg font-bold">HD</span>
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">Dr. Syeda Maryam Gazala</p>
                          <p className="text-blue-600 font-medium">Founder & Managing Director</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Vision Tab */}
              {activeTab === 'vision' && (
                <div className="bg-white rounded-3xl p-8 lg:p-12 shadow-xl border border-gray-100">
                  <div className="mb-8">
                    <Target className="w-12 h-12 text-blue-600 mb-4" />
                    <h3 className="text-3xl font-bold text-gray-900 mb-6">
                      Our Vision & Investment Philosophy
                    </h3>
                  </div>

                  <div className="space-y-8">
                    {/* Vision Statement */}
                    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 border border-blue-100">
                      <h4 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h4>
                      <p className="text-lg text-gray-700 leading-relaxed">
                        To be the most trusted real estate investment partner in Karnataka, creating 
                        sustainable wealth for our investors while contributing to the development 
                        of thriving, sustainable communities.
                      </p>
                    </div>

                    {/* Core Values */}
                    <div className="space-y-6">
                      <h4 className="text-2xl font-bold text-gray-900">Core Principles</h4>
                      <div className="grid gap-6">
                        {visionPoints.map((point, index) => {
                          const IconComponent = point.icon;
                          return (
                            <div key={index} className="flex items-start space-x-4 p-6 bg-gray-50 rounded-2xl">
                              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                                <IconComponent className="w-6 h-6 text-white" />
                              </div>
                              <div>
                                <h5 className="text-xl font-semibold text-gray-900 mb-2">{point.title}</h5>
                                <p className="text-gray-700 leading-relaxed">{point.description}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Investment Strategy */}
                    <div className="bg-green-50 rounded-2xl p-8 border border-green-100">
                      <h4 className="text-2xl font-bold text-gray-900 mb-4">Investment Strategy</h4>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h5 className="font-semibold text-gray-900 mb-2">Market Research</h5>
                          <p className="text-gray-700 text-sm">Deep analysis of market trends, demographics, and growth patterns</p>
                        </div>
                        <div>
                          <h5 className="font-semibold text-gray-900 mb-2">Location Selection</h5>
                          <p className="text-gray-700 text-sm">Strategic positioning in high-growth corridors and emerging areas</p>
                        </div>
                        <div>
                          <h5 className="font-semibold text-gray-900 mb-2">Quality Assurance</h5>
                          <p className="text-gray-700 text-sm">Premium construction standards with sustainable and modern amenities</p>
                        </div>
                        <div>
                          <h5 className="font-semibold text-gray-900 mb-2">Risk Management</h5>
                          <p className="text-gray-700 text-sm">Diversified portfolio approach to minimize risks and maximize returns</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Updates Tab */}
              {activeTab === 'updates' && (
                <div className="bg-white rounded-3xl p-8 lg:p-12 shadow-xl border border-gray-100">
                  <div className="mb-8">
                    <Calendar className="w-12 h-12 text-blue-600 mb-4" />
                    <h3 className="text-3xl font-bold text-gray-900 mb-6">
                      Recent Company Updates
                    </h3>
                  </div>

                  <div className="space-y-6">
                    {companyUpdates.map((update, index) => (
                      <div key={index} className="border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-shadow duration-300">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              update.type === 'launch' ? 'bg-blue-100 text-blue-600' :
                              update.type === 'achievement' ? 'bg-green-100 text-green-600' :
                              'bg-purple-100 text-purple-600'
                            }`}>
                              {update.type === 'launch' ? <Building className="w-5 h-5" /> :
                               update.type === 'achievement' ? <TrendingUp className="w-5 h-5" /> :
                               <CheckCircle className="w-5 h-5" />}
                            </div>
                            <div>
                              <h4 className="text-lg font-semibold text-gray-900">{update.title}</h4>
                              <p className="text-sm text-gray-500">{new Date(update.date).toLocaleDateString('en-IN', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })}</p>
                            </div>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            update.impact === 'High' ? 'bg-red-100 text-red-600' :
                            update.impact === 'Medium' ? 'bg-yellow-100 text-yellow-600' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {update.impact} Impact
                          </span>
                        </div>
                        <p className="text-gray-700 leading-relaxed">{update.description}</p>
                      </div>
                    ))}

                    {/* Subscribe to Updates */}
                    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 text-center border border-blue-100">
                      <h4 className="text-xl font-bold text-gray-900 mb-4">Stay Updated</h4>
                      <p className="text-gray-700 mb-6">Get the latest updates and investment opportunities delivered to your inbox.</p>
                      <button className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors duration-300 flex items-center space-x-2 mx-auto">
                        <span>Subscribe to Updates</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DirectorMessage;