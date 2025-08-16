import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Building2, Home, BarChart3, Users, Settings } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Navigation = ({ onLoginClick, onRegisterClick }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/95 backdrop-blur-lg shadow-lg border-b border-gray-200/50' 
        : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
              <Building2 className="h-6 w-6 lg:h-7 lg:w-7 text-white" />
            </div>
            <span className={`text-xl lg:text-2xl font-bold transition-colors duration-300 ${
              !isScrolled && location.pathname === '/' 
                ? 'text-white' 
                : 'bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent'
            }`}>
              HSDJ
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

          {/* Auth Buttons */}
          <div className="hidden lg:flex items-center space-x-4">
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
                  onClick={onLoginClick}
                  className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                    (!isScrolled && location.pathname === '/') 
                      ? 'text-white border border-white/30 hover:bg-white/10' 
                      : 'text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Login
                </button>
                <button
                  onClick={onRegisterClick}
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
            className={`lg:hidden p-2 rounded-lg transition-all duration-200 ${
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

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-white/95 backdrop-blur-lg border-b border-gray-200/50 shadow-xl">
          <div className="px-4 py-6 space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href.startsWith('#') ? location.pathname : link.href}
                onClick={() => handleNavClick(link.href)}
                className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-all duration-200"
              >
                <link.icon className="h-5 w-5" />
                <span className="font-medium">{link.name}</span>
              </Link>
            ))}
            
            {/* Mobile Auth Buttons */}
            <div className="pt-4 border-t border-gray-200 space-y-3">
              {user ? (
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 px-4 py-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold">
                        {user.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="font-medium text-gray-900">{user.name}</span>
                  </div>
                  <button
                    onClick={logout}
                    className="w-full px-4 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-all duration-200"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => {
                      onLoginClick();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all duration-200"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => {
                      onRegisterClick();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                  >
                    Get Started
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;