import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Building2, Home, BarChart3, Users, Settings } from 'lucide-react';
import LoginModal from '../Auth/LoginModal';
import RegisterModal from '../Auth/RegisterModal';
import { useAuth } from '../../contexts/AuthContext';

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    // Cleanup function to reset overflow when component unmounts
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const navLinks = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Properties', href: '#properties', icon: Building2 },
    { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
    { name: 'Features', href: '#features', icon: Settings },
  ];

  const handleNavClick = (href) => {
    if (href.startsWith('#')) {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setIsMobileMenuOpen(false);
  };

  const handleModalOpen = (modalType) => {
    setIsMobileMenuOpen(false);
    if (modalType === 'login') {
      setShowLoginModal(true);
    } else {
      setShowRegisterModal(true);
    }
  };

  return (
    <>
      {/* Main Navigation */}
      <nav 
        className={`fixed top-0 left-0 right-0 transition-all duration-300 ${
          isScrolled 
            ? 'bg-white/95 backdrop-blur-lg shadow-lg border-b border-gray-200/50 z-50' 
            : 'bg-transparent z-40'
        }`}
        style={{ zIndex: isScrolled ? 50 : 40 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 lg:h-20">
            
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 group z-50 relative">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                <Building2 className="h-6 w-6 lg:h-7 lg:w-7 text-white" />
              </div>
              <span className={`text-xl lg:text-2xl font-bold transition-colors duration-300 ${
                !isScrolled && location.pathname === '/' 
                  ? 'text-white' 
                  : 'bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent'
              }`}>
                RealEstate Pro
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href.startsWith('#') ? location.pathname : link.href}
                  onClick={() => handleNavClick(link.href)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:bg-white/10 hover:backdrop-blur-sm relative group ${
                    (!isScrolled && location.pathname === '/') 
                      ? 'text-white hover:text-blue-200' 
                      : 'text-gray-700 hover:text-blue-600'
                  }`}
                >
                  <link.icon className="h-4 w-4" />
                  <span>{link.name}</span>
                  <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 group-hover:w-full transition-all duration-300"></div>
                </Link>
              ))}
            </div>

            {/* Desktop Auth Buttons */}
            <div className="hidden lg:flex items-center space-x-4 navbar-auth-buttons">
              {user ? (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-3 px-4 py-2 rounded-lg bg-white/10 backdrop-blur-sm">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-white">
                        {user.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className={`font-medium ${
                      (!isScrolled && location.pathname === '/') ? 'text-white' : 'text-gray-700'
                    }`}>
                      {user.name}
                    </span>
                  </div>
                  <button
                    onClick={logout}
                    className="px-6 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => handleModalOpen('login')}
                    className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                      (!isScrolled && location.pathname === '/') 
                        ? 'text-white border border-white/30 hover:bg-white/10' 
                        : 'text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    Login
                  </button>
                  <button
                    onClick={() => handleModalOpen('register')}
                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    Get Started
                  </button>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`lg:hidden p-2 rounded-lg transition-all duration-200 z-50 relative ${
                (!isScrolled && location.pathname === '/') 
                  ? 'text-white hover:bg-white/10' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="mobile-menu-overlay lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Menu */}
      <div className={`mobile-menu-panel lg:hidden ${isMobileMenuOpen ? 'open' : ''}`}>
        
        {/* Mobile Menu Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-purple-600">
          <div className="flex items-center space-x-3">
            <Building2 className="h-8 w-8 text-white" />
            <span className="text-lg font-bold text-white">RealEstate Pro</span>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 rounded-lg text-white hover:bg-white/10 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* User Info Section (if logged in) */}
        {user && (
          <div className="p-6 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-lg">
                  {user.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-medium text-gray-900">{user.name}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Navigation Links */}
        <div className="py-6">
          <div className="px-6 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href.startsWith('#') ? location.pathname : link.href}
                onClick={() => handleNavClick(link.href)}
                className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-all duration-200"
              >
                <link.icon className="h-5 w-5 text-gray-500" />
                <span className="font-medium">{link.name}</span>
              </Link>
            ))}
          </div>

          {/* Mobile Auth Buttons */}
          <div className="px-6 pt-6 border-t border-gray-200 mt-6">
            {user ? (
              <button
                onClick={() => {
                  logout();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full px-4 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-all duration-200"
              >
                Logout
              </button>
            ) : (
              <div className="space-y-3">
                <button
                  onClick={() => handleModalOpen('login')}
                  className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all duration-200"
                >
                  Login
                </button>
                <button
                  onClick={() => handleModalOpen('register')}
                  className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                >
                  Get Started
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)}
        onSwitchToRegister={() => {
          setShowLoginModal(false);
          setShowRegisterModal(true);
        }}
      />
      <RegisterModal 
        isOpen={showRegisterModal} 
        onClose={() => setShowRegisterModal(false)}
        onSwitchToLogin={() => {
          setShowRegisterModal(false);
          setShowLoginModal(true);
        }}
      />
    </>
  );
};

export default Navigation;