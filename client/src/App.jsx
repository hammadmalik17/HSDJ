// import React, { useState, useEffect, createContext, useContext } from 'react';
// import { ToastContainer, toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import Navigation from '../components/layout/Navigation';
// import HeroSection from './components/homepage/HeroSection';
// import React, { useState } from 'react';
// import { ToastContainer } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import { AuthProvider, useAuth } from './contexts/AuthContext';
// import HeroSection from './components/homepage/HeroSection';
// import FeaturesSection from './components/homepage/FeaturesSection';
// import AboutSection from './components/homepage/AboutSection';
// import ContactSection from './components/homepage/ContactSection';
// import Footer from './components/layout/Footer';
// import LoginModal from './components/auth/LoginModal';
// import RegisterModal from './components/auth/RegisterModal';
// import Dashboard from './components/dashboard/Dashboard';

// import { 
//   Building2, 
//   User, 
//   Lock, 
//   Mail, 
//   Eye, 
//   EyeOff, 
//   LogOut, 
//   Menu, 
//   FileText, 
//   TrendingUp, 
//   Users, 
//   Shield,
//   AlertCircle,
//   CheckCircle,
//   Clock,
//   Upload,
//   Download,
//   Edit3,
//   X,
//   Phone,
//   MapPin,
//   Star,
//   ArrowRight,
//   Play,
//   ChevronDown,
//   DollarSign,
//   BarChart3,
//   Home,
//   BookOpen,
//   MessageCircle,
//   Globe
// } from 'lucide-react';



// // Auth Context
// const AuthContext = createContext();

// const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(false);

//   const login = async (email, password, twoFactorToken = null) => {
//     setLoading(true);
//     try {
//       const response = await api.post('/api/auth/login', { email, password, twoFactorToken });
//       const { user: userData, tokens } = response.data.data;
      
//       localStorage.setItem('accessToken', tokens.accessToken);
//       setUser(userData);
//       toast.success('Login successful!');
      
//       return { success: true };
//     } catch (error) {
//       toast.error(error.message || 'Login failed');
//       throw error;
//     } finally {
//       setLoading(false);
//     }
//   };

//   const register = async (userData) => {
//     setLoading(true);
//     try {
//       await api.post('/api/auth/register', userData);
//       return { success: true };
//     } catch (error) {
//       toast.error(error.message || 'Registration failed');
//       throw error;
//     } finally {
//       setLoading(false);
//     }
//   };

//   const logout = () => {
//     localStorage.removeItem('accessToken');
//     setUser(null);
//     toast.success('Logged out successfully');
//   };

//   return (
//     <AuthContext.Provider value={{ user, login, register, logout, loading }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) throw new Error('useAuth must be used within AuthProvider');
//   return context;
// };



// // Homepage Hero Section


// // Login Modal
// const LoginModal = ({ isOpen, onClose, onSwitchToRegister }) => {
//   const { login, loading } = useAuth();
//   const [formData, setFormData] = useState({
//     email: '',
//     password: '',
//     twoFactorToken: ''
//   });
//   const [showPassword, setShowPassword] = useState(false);
//   const [requires2FA, setRequires2FA] = useState(false);
//   const [error, setError] = useState('');

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');

//     if (!formData.email || !formData.password) {
//       setError('Please fill in all required fields');
//       return;
//     }

//     try {
//       await login(formData.email, formData.password, formData.twoFactorToken);
//       onClose();
//     } catch (error) {
//       if (error.message.includes('Two-factor')) {
//         setRequires2FA(true);
//       } else {
//         setError(error.message);
//       }
//     }
//   };

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//       <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative">
//         {/* Close Button */}
//         <button
//           onClick={onClose}
//           className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
//         >
//           <X className="w-6 h-6" />
//         </button>

//         <div className="p-8">
//           {/* Header */}
//           <div className="text-center mb-8">
//             <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4">
//               <Building2 className="w-8 h-8 text-white" />
//             </div>
//             <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
//             <p className="text-gray-600 mt-2">Sign in to your account</p>
//           </div>

//           {/* Demo Credentials */}
//           <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
//             <p className="text-sm font-medium text-blue-900 mb-2">Demo Credentials:</p>
//             <div className="text-xs text-blue-800 space-y-1">
//               <div><strong>Director:</strong> admin@example.com / password</div>
//               <div><strong>Shareholder:</strong> user@example.com / password</div>
//             </div>
//           </div>

//           {/* Error Display */}
//           {error && (
//             <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
//               <div className="flex items-center space-x-2 text-red-800">
//                 <AlertCircle className="w-5 h-5" />
//                 <span className="text-sm">{error}</span>
//               </div>
//             </div>
//           )}

//           {/* Form */}
//           <form onSubmit={handleSubmit} className="space-y-6">
//             {/* Email */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Email Address
//               </label>
//               <div className="relative">
//                 <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
//                 <input
//                   type="email"
//                   value={formData.email}
//                   onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
//                   className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors outline-none"
//                   placeholder="Confirm your password"
//                   disabled={loading}
//                 />
//               </div>
//               {errors.confirmPassword && <p className="text-red-600 text-sm mt-1">{errors.confirmPassword}</p>}
//             </div>

//             {/* Terms */}
//             <div className="text-sm text-gray-600">
//               <p>By creating an account, you agree to our Terms of Service and Privacy Policy.</p>
//             </div>

//             {/* Submit Button */}
//             <button
//               type="submit"
//               disabled={loading}
//               className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
//             >
//               {loading ? (
//                 <>
//                   <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//                   <span>Creating Account...</span>
//                 </>
//               ) : (
//                 <span>Create Account</span>
//               )}
//             </button>
//           </form>

//           {/* Footer */}
//           <div className="mt-6 text-center">
//             <p className="text-sm text-gray-600">
//               Already have an account?{' '}
//               <button 
//                 onClick={onSwitchToLogin}
//                 className="text-blue-600 hover:text-blue-700 font-medium"
//               >
//                 Sign in here
//               </button>
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };





// // Dashboard Component (for logged-in users)


// // Main App Component
// const App = () => {
//   const { user } = useAuth();
//   const [showLoginModal, setShowLoginModal] = useState(false);
//   const [showRegisterModal, setShowRegisterModal] = useState(false);

//   // If user is logged in, show dashboard
//   if (user) {
//     return <Dashboard />;
//   }

//   // Otherwise show homepage
//   return (
//     <div className="min-h-screen">
//       <Navigation 
//         onLoginClick={() => setShowLoginModal(true)}
//         onRegisterClick={() => setShowRegisterModal(true)}
//       />
      
//       <HeroSection onGetStartedClick={() => setShowRegisterModal(true)} />
//       <FeaturesSection />
//       <AboutSection />
//       <ContactSection />
//       <Footer />

//       {/* Modals */}
//       <LoginModal 
//         isOpen={showLoginModal}
//         onClose={() => setShowLoginModal(false)}
//         onSwitchToRegister={() => {
//           setShowLoginModal(false);
//           setShowRegisterModal(true);
//         }}
//       />
      
//       <RegisterModal 
//         isOpen={showRegisterModal}
//         onClose={() => setShowRegisterModal(false)}
//         onSwitchToLogin={() => {
//           setShowRegisterModal(false);
//           setShowLoginModal(true);
//         }}
//       />
//     </div>
//   );
// };

// // Root App with Provider
// const RealEstateApp = () => {
//   return (
//     <AuthProvider>
//       <App />
//       <ToastContainer
//         position="top-right"
//         autoClose={5000}
//         hideProgressBar={false}
//         newestOnTop={false}
//         closeOnClick
//         rtl={false}
//         pauseOnFocusLoss
//         draggable
//         pauseOnHover
//         theme="light"
//         style={{ zIndex: 9999 }}
//       />
//     </AuthProvider>
//   );
// };

// import React, { useState } from 'react';
// import { Lock, Eye, EyeOff, Shield, Mail } from 'lucide-react';

// const LoginForm = ({ onSwitchToRegister }) => {
//   const [formData, setFormData] = useState({
//     email: '',
//     password: '',
//     twoFactorToken: ''
//   });
//   const [showPassword, setShowPassword] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [requires2FA, setRequires2FA] = useState(false);

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     // Add your login logic here
//     setLoading(true);
//     // Simulate API call
//     setTimeout(() => setLoading(false), 2000);
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-50">
//       <div className="max-w-md w-full space-y-8">
//         <div className="bg-white p-8 rounded-lg shadow-md">
//           <form onSubmit={handleSubmit} className="space-y-6">
//             {/* Email */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Email
//               </label>
//               <div className="relative">
//                 <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
//                 <input
//                   type="email"
//                   value={formData.email}
//                   onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
//                   className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors outline-none"
//                   placeholder="Enter your email"
//                   disabled={loading}
//                 />
//               </div>
//             </div>

//             {/* Password */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Password
//               </label>
//               <div className="relative">
//                 <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
//                 <input
//                   type={showPassword ? 'text' : 'password'}
//                   value={formData.password}
//                   onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
//                   className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors outline-none"
//                   placeholder="Enter your password"
//                   disabled={loading}
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setShowPassword(!showPassword)}
//                   className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
//                 >
//                   {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
//                 </button>
//               </div>
//             </div>

//             {/* 2FA Token */}
//             {requires2FA && (
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Two-Factor Authentication Code
//                 </label>
//                 <div className="relative">
//                   <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
//                   <input
//                     type="text"
//                     value={formData.twoFactorToken}
//                     onChange={(e) => setFormData(prev => ({ ...prev, twoFactorToken: e.target.value }))}
//                     className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors outline-none"
//                     placeholder="Enter 6-digit code"
//                     disabled={loading}
//                     maxLength={6}
//                   />
//                 </div>
//               </div>
//             )}

//             {/* Submit Button */}
//             <button
//               type="submit"
//               disabled={loading}
//               className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
//             >
//               {loading ? (
//                 <>
//                   <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//                   <span>Signing in...</span>
//                 </>
//               ) : (
//                 <span>{requires2FA ? 'Verify & Sign In' : 'Sign In'}</span>
//               )}
//             </button>
//           </form>

//           {/* Footer */}
//           <div className="mt-6 text-center">
//             <p className="text-sm text-gray-600">
//               Don't have an account?{' '}
//               <button
//                 onClick={onSwitchToRegister}
//                 className="text-blue-600 hover:text-blue-700 font-medium"
//               >
//                 Register here
//               </button>
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default LoginForm;



import React, { useState } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Context Import
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Component Imports
import Navigation from './components/Layout/Navigation';
import HeroSection from './components/homepage/HeroSection';
import FeaturesSection from './components/homepage/FeaturesSection';
import AboutSection from './components/homepage/AboutSection';
import ContactSection from './components/homepage/ContactSection';
import Footer from './components/layout/Footer';
import LoginModal from './components/auth/LoginModal';
import RegisterModal from './components/auth/RegisterModal';
import Dashboard from './components/dashboard/Dashboard';

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

  // If user is logged in, show dashboard
  if (user) {
    return <Dashboard />;
  }

  // Otherwise show homepage
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <Navigation 
        onLoginClick={handleLoginClick}
        onRegisterClick={handleRegisterClick}
      />
      
      {/* Homepage Sections */}
      <HeroSection onGetStartedClick={handleGetStartedClick} />
      <FeaturesSection />
      <AboutSection />
      <ContactSection />
      <Footer />

      {/* Authentication Modals */}
      <LoginModal 
        isOpen={showLoginModal}
        onClose={handleCloseLoginModal}
        onSwitchToRegister={handleSwitchToRegister}
      />
      
      <RegisterModal 
        isOpen={showRegisterModal}
        onClose={handleCloseRegisterModal}
        onSwitchToLogin={handleSwitchToLogin}
      />
    </div>
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
      />
    </AuthProvider>
  );
};

export default RealEstateApp;