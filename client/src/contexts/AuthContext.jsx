// client/src/contexts/AuthContext.jsx - FIXED VERSION
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const savedUser = localStorage.getItem('user');
        const accessToken = localStorage.getItem('accessToken');
        
        if (savedUser && accessToken) {
          setUser(JSON.parse(savedUser));
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        // Clear invalid data
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // REAL login function that calls your API
  const login = async (email, password) => {
    try {
      console.log('🔑 Frontend: Attempting login for:', email);
      
      const response = await authAPI.login({ email, password });
      
      console.log('✅ Frontend: Login response:', response.data);
      
      if (response.data.success) {
        const { user: userData, tokens } = response.data.data;
        
        // Save user data and tokens
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('accessToken', tokens.accessToken);
        localStorage.setItem('refreshToken', tokens.refreshToken);
        
        console.log('✅ Frontend: User logged in successfully:', userData.email);
        toast.success('Login successful!');
        
        return userData;
      } else {
        throw new Error(response.data.message || 'Login failed');
      }
    } catch (error) {
      console.error('❌ Frontend: Login failed:', error);
      
      const errorMessage = error.response?.data?.message || error.message || 'Login failed';
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // REAL register function that calls your API
  const register = async (name, email, password, phone = '', address = '') => {
    try {
      console.log('📝 Frontend: Attempting registration for:', email);
      
      const response = await authAPI.register({
        name,
        email,
        password,
        phone,
        address
      });
      
      console.log('✅ Frontend: Registration response:', response.data);
      
      if (response.data.success) {
        const { user: userData, tokens } = response.data.data;
        
        // Save user data and tokens
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('accessToken', tokens.accessToken);
        localStorage.setItem('refreshToken', tokens.refreshToken);
        
        console.log('✅ Frontend: User registered successfully:', userData.email);
        toast.success('Registration successful!');
        
        return userData;
      } else {
        throw new Error(response.data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('❌ Frontend: Registration failed:', error);
      
      const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // REAL logout function
  const logout = async () => {
    try {
      console.log('🚪 Frontend: Attempting logout...');
      
      // Call API logout (optional - clears server-side session/cookies)
      try {
        await authAPI.logout();
      } catch (logoutError) {
        console.warn('API logout failed, continuing with local logout:', logoutError);
      }
      
      // Clear local state and storage
      setUser(null);
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      
      console.log('✅ Frontend: User logged out successfully');
      toast.success('Logged out successfully');
      
    } catch (error) {
      console.error('❌ Frontend: Logout failed:', error);
      
      // Force local logout even if API call fails
      setUser(null);
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;