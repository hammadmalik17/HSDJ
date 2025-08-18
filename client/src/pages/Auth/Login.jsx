// import React, { useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { Eye, EyeOff, Building, Shield, ArrowRight } from 'lucide-react';
// import { useAuth } from '../../contexts/AuthContext';

// const Login = () => {
//   const navigate = useNavigate();
//   const { login } = useAuth();
  
//   const [formData, setFormData] = useState({
//     email: '',
//     password: '',
//     twoFactorToken: ''
//   });
//   const [showPassword, setShowPassword] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [requires2FA, setRequires2FA] = useState(false);
//   const [tempToken, setTempToken] = useState('');

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       const result = await login(
//         formData.email, 
//         formData.password, 
//         requires2FA ? formData.twoFactorToken : null
//       );

//       if (result.requires2FA) {
//         setRequires2FA(true);
//         setTempToken(result.tempToken);
//       } else if (result.success) {
//         navigate('/dashboard');
//       }
//     } catch (error) {
//       console.error('Login error:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-800 flex items-center justify-center p-4">
//       <div className="max-w-md w-full">
//         {/* Header */}
//         <div className="text-center mb-8">
//           <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-4">
//             <Building className="w-8 h-8 text-blue-600" />
//           </div>
//           <h1 className="text-3xl font-bold text-white mb-2">Real Estate Platform</h1>
//           <p className="text-blue-200">Secure Shareholder Management</p>
//         </div>

//         {/* Login Form */}
//         <div className="bg-white rounded-lg shadow-xl p-8">
//           <form onSubmit={handleSubmit} className="space-y-6">
//             <div className="text-center mb-6">
//               <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
//               <p className="text-gray-600 mt-2">Sign in to your account</p>
//             </div>

//             {!requires2FA ? (
//               <>
//                 {/* Email */}
//                 <div>
//                   <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
//                     Email Address
//                   </label>
//                   <input
//                     type="email"
//                     id="email"
//                     name="email"
//                     value={formData.email}
//                     onChange={handleInputChange}
//                     required
//                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
//                     placeholder="Enter your email"
//                   />
//                 </div>

//                 {/* Password */}
//                 <div>
//                   <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
//                     Password
//                   </label>
//                   <div className="relative">
//                     <input
//                       type={showPassword ? 'text' : 'password'}
//                       id="password"
//                       name="password"
//                       value={formData.password}
//                       onChange={handleInputChange}
//                       required
//                       className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
//                       placeholder="Enter your password"
//                     />
//                     <button
//                       type="button"
//                       onClick={() => setShowPassword(!showPassword)}
//                       className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
//                     >
//                       {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
//                     </button>
//                   </div>
//                 </div>
//               </>
//             ) : (
//               <>
//                 {/* 2FA Token */}
//                 <div>
//                   <label htmlFor="twoFactorToken" className="block text-sm font-medium text-gray-700 mb-2">
//                     <Shield className="w-4 h-4 inline mr-1" />
//                     Two-Factor Authentication Code
//                   </label>
//                   <input
//                     type="text"
//                     id="twoFactorToken"
//                     name="twoFactorToken"
//                     value={formData.twoFactorToken}
//                     onChange={handleInputChange}
//                     required
//                     maxLength="6"
//                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-center text-lg tracking-wider"
//                     placeholder="000000"
//                   />
//                   <p className="text-sm text-gray-500 mt-1">
//                     Enter the 6-digit code from your authenticator app
//                   </p>
//                 </div>
//               </>
//             )}

//             {/* Submit Button */}
//             <button
//               type="submit"
//               disabled={loading}
//               className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
//             >
//               {loading ? (
//                 <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//               ) : (
//                 <>
//                   {requires2FA ? 'Verify Code' : 'Sign In'}
//                   <ArrowRight className="w-4 h-4 ml-2" />
//                 </>
//               )}
//             </button>

//             {/* Back to Password */}
//             {requires2FA && (
//               <button
//                 type="button"
//                 onClick={() => {
//                   setRequires2FA(false);
//                   setFormData(prev => ({ ...prev, twoFactorToken: '' }));
//                 }}
//                 className="w-full text-blue-600 hover:text-blue-700 text-sm"
//               >
//                 ← Back to password
//               </button>
//             )}

//             {/* Register Link */}
//             <div className="text-center">
//               <p className="text-sm text-gray-600">
//                 Don't have an account?{' '}
//                 <Link to="/register" className="text-blue-600 hover:text-blue-700 font-medium">
//                   Register here
//                 </Link>
//               </p>
//             </div>
//           </form>
//         </div>

//         {/* Demo Info */}
//         <div className="mt-8 bg-white/10 backdrop-blur-sm rounded-lg p-4 text-white text-sm">
//           <h3 className="font-semibold mb-2">Demo Credentials:</h3>
//           <div className="space-y-1 text-blue-200">
//             <p><strong>Director:</strong> admin@example.com / AdminPass123!</p>
//             <p><strong>Shareholder:</strong> user@example.com / UserPass123!</p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Login;

// client/src/pages/Auth/Login.jsx - FIXED VERSION
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Building, Shield, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    twoFactorToken: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [requires2FA, setRequires2FA] = useState(false);
  const [tempToken, setTempToken] = useState('');
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (error) {
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('🔑 Login page: Attempting login...');
      
      const result = await login(
        formData.email, 
        formData.password, 
        requires2FA ? formData.twoFactorToken : null
      );

      console.log('✅ Login page: Login successful');
      
      // Only redirect on successful login
      navigate('/dashboard');
      
    } catch (error) {
      console.error('❌ Login page: Login failed:', error.message);
      
      // Show error message on the page - DON'T redirect
      setError(error.message || 'Invalid email or password. Please try again.');
      
      // Don't navigate on error - let user try again
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-4">
            <Building className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Real Estate Platform</h1>
          <p className="text-blue-200">Secure Shareholder Management</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
              <p className="text-gray-600 mt-2">Sign in to your account</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-400 mr-3 flex-shrink-0" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            )}

            {!requires2FA ? (
              <>
                {/* Email Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="Enter your email"
                    required
                    disabled={loading}
                  />
                </div>

                {/* Password Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all pr-12"
                      placeholder="Enter your password"
                      required
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                      disabled={loading}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* 2FA Token Field */}
                <div className="text-center mb-6">
                  <Shield className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900">Two-Factor Authentication</h3>
                  <p className="text-gray-600">Enter the 6-digit code from your authenticator app</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Authentication Code
                  </label>
                  <input
                    type="text"
                    name="twoFactorToken"
                    value={formData.twoFactorToken}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-center text-2xl tracking-widest"
                    placeholder="000000"
                    maxLength="6"
                    required
                    disabled={loading}
                  />
                </div>
              </>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  {requires2FA ? 'Verify Code' : 'Sign In'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </button>

            {/* Back to email/password if in 2FA mode */}
            {requires2FA && (
              <button
                type="button"
                onClick={() => {
                  setRequires2FA(false);
                  setTempToken('');
                  setFormData(prev => ({ ...prev, twoFactorToken: '' }));
                }}
                className="w-full text-gray-600 hover:text-gray-800 font-medium"
                disabled={loading}
              >
                ← Back to login
              </button>
            )}

            {/* Register Link */}
            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-gray-600">
                Don't have an account?{' '}
                <Link to="/register" className="text-blue-600 hover:text-blue-700 font-medium">
                  Register here
                </Link>
              </p>
            </div>
          </form>
        </div>

        {/* Demo Info */}
        <div className="mt-8 bg-white/10 backdrop-blur-sm rounded-lg p-4 text-white text-sm">
          <h3 className="font-semibold mb-2">Demo Credentials:</h3>
          <div className="space-y-1 text-blue-200">
            <p><strong>Test User:</strong> test@example.com / TestPass123!</p>
            <p><strong>Try with wrong password to see error handling</strong></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;