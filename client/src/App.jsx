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
import ContactSection from './components/Homepage/ContactSection';
import LoginModal from './components/Auth/LoginModal';
import RegisterModal from './components/Auth/RegisterModal';
import Dashboard from './components/Dashboard/Dashboard';

// Homepage Component - Fixed layout structure
const Homepage = ({ onGetStartedClick }) => {
  return (
    <>
      <HeroSection onGetStartedClick={onGetStartedClick} />
      <FeaturesSection />
      <AboutSection />
      <ContactSection />
    </>
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
      <div className="min-h-screen">
        {/* Navigation - Fixed positioning */}
        <Navigation 
          onLoginClick={handleLoginClick}
          onRegisterClick={handleRegisterClick}
        />
        
        {/* Main Content - Removed conflicting background */}
        <main>
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
          </Routes>
        </main>
        
        {/* Modals */}
        {showLoginModal && (
          <LoginModal 
            onClose={handleCloseLoginModal}
            onSwitchToRegister={handleSwitchToRegister}
          />
        )}
        
        {showRegisterModal && (
          <RegisterModal 
            onClose={handleCloseRegisterModal}
            onSwitchToLogin={handleSwitchToLogin}
          />
        )}
        
        {/* Toast Container */}
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
        />
      </div>
    </Router>
  );
};

// Wrap the app with AuthProvider
const AppWithProvider = () => (
  <AuthProvider>
    <App />
  </AuthProvider>
);

export default AppWithProvider;