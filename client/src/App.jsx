// client/src/App.jsx - Updated Homepage Component with DirectorMessage
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Context Import
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Component Imports
import Navigation from './components/Layout/Navigation';
import HeroSection from './components/Homepage/HeroSection';
import FeaturesSection from './components/Homepage/FeaturesSection';
import AboutSection from './components/Homepage/AboutSection';
import DirectorMessage from './components/Homepage/DirectorMessage';
import ContactSection from './components/Homepage/ContactSection';
import Dashboard from './components/Dashboard/Dashboard';

// Enhanced Homepage Component with DirectorMessage
const Homepage = ({ onGetStartedClick }) => {
  return (
    <div className="min-h-screen">
      <HeroSection onGetStartedClick={onGetStartedClick} />
      <FeaturesSection />
      <AboutSection />
      <DirectorMessage />
      <ContactSection />
    </div>
  );
};

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-white font-bold text-xl">RE</span>
          </div>
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }
  
  return user ? children : <Navigate to="/" replace />;
};

// Main App Component
const App = () => {
  const { user } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  // Handler functions
  const handleLoginClick = () => setShowLoginModal(true);
  const handleRegisterClick = () => setShowRegisterModal(true);
  const handleGetStartedClick = () => setShowRegisterModal(true);
  
  const handleCloseLoginModal = () => setShowLoginModal(false);
  const handleCloseRegisterModal = () => setShowRegisterModal(false);
  
  const handleSwitchToRegister = () => {
    setShowLoginModal(false);
    setShowRegisterModal(true);
  };
  
  const handleSwitchToLogin = () => {
    setShowRegisterModal(false);
    setShowLoginModal(true);
  };

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        {/* Navigation - show on all pages */}
        <Navigation 
          onLoginClick={handleLoginClick}
          onRegisterClick={handleRegisterClick}
        />
        
        {/* Routes */}
        <Routes>
          <Route 
            path="/" 
            element={
              user ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Homepage onGetStartedClick={handleGetStartedClick} />
              )
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          {/* Redirect any unknown routes to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
};

// Root App Component with Providers
const RealEstateApp = () => {
  return (
    <AuthProvider>
      <App />
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        style={{ zIndex: 9999 }}
        className="mt-16" // Add margin to account for fixed navigation
      />
    </AuthProvider>
  );
};

export default RealEstateApp;