import React, { useState, useEffect, createContext, useContext } from 'react';
import { 
  User, 
  Building2, 
  FileText, 
  Shield, 
  TrendingUp, 
  Upload, 
  Check, 
  X, 
  Eye, 
  Download,
  Users,
  Activity,
  Lock,
  Unlock,
  Settings,
  LogOut,
  Menu,
  Home,
  DollarSign,
  PieChart,
  AlertTriangle
} from 'lucide-react';

// Auth Context
const AuthContext = createContext();

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Mock API calls (replace with actual API calls to your backend)
const api = {
  login: async (email, password, twoFactorToken = null) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock response - replace with actual API call
    if (email === 'admin@company.com' && password === 'Admin123!') {
      return {
        success: true,
        data: {
          user: {
            id: '1',
            email: 'admin@company.com',
            name: 'John Director',
            role: 'director',
            twoFactorEnabled: false
          },
          tokens: {
            accessToken: 'mock-token-123',
            refreshToken: 'refresh-token-456'
          }
        }
      };
    } else if (email === 'shareholder@company.com' && password === 'Share123!') {
      return {
        success: true,
        data: {
          user: {
            id: '2',
            email: 'shareholder@company.com',
            name: 'Jane Shareholder',
            role: 'shareholder',
            twoFactorEnabled: true
          },
          tokens: {
            accessToken: 'mock-token-789',
            refreshToken: 'refresh-token-101'
          }
        }
      };
    }
    
    throw new Error('Invalid credentials');
  },

  register: async (userData) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { success: true, message: 'Registration successful' };
  },

  getProfile: async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      success: true,
      data: {
        user: {
          id: '1',
          email: 'admin@company.com',
          name: 'John Director',
          role: 'director',
          phone: '+1-555-0123',
          lastLogin: new Date().toISOString()
        }
      }
    };
  },

  getDashboardData: async (role) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    if (role === 'director') {
      return {
        success: true,
        data: {
          totalShareholders: 45,
          totalShares: 125000,
          totalValue: 2500000,
          pendingCertificates: 8,
          recentActivity: [
            { action: 'Certificate approved', user: 'Jane Smith', time: '2 hours ago' },
            { action: 'Share transferred', user: 'Mike Johnson', time: '4 hours ago' },
            { action: 'New user registered', user: 'Sarah Wilson', time: '6 hours ago' }
          ]
        }
      };
    } else {
      return {
        success: true,
        data: {
          portfolio: {
            totalShares: 2500,
            totalUnits: 0,
            totalCurrentValue: 50000,
            totalInvestment: 45000,
            profitLoss: 5000,
            percentageReturn: 11.11
          },
          certificates: {
            total: 3,
            pending: 1,
            approved: 2,
            rejected: 0
          }
        }
      };
    }
  }
};

// Auth Provider Component
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    // Check for existing token on mount
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, [token]);

  const login = async (email, password, twoFactorToken) => {
    try {
      const response = await api.login(email, password, twoFactorToken);
      const { user, tokens } = response.data;
      
      setUser(user);
      setToken(tokens.accessToken);
      localStorage.setItem('token', tokens.accessToken);
      localStorage.setItem('user', JSON.stringify(user));
      
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const value = {
    user,
    token,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Login Component
const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [twoFactorToken, setTwoFactorToken] = useState('');
  const [showRegister, setShowRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [requires2FA, setRequires2FA] = useState(false);
  
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(email, password, twoFactorToken);
    } catch (err) {
      if (err.message.includes('Two-factor')) {
        setRequires2FA(true);
      } else {
        setError(err.message || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const RegisterForm = () => {
    const [regData, setRegData] = useState({
      email: '',
      password: '',
      confirmPassword: '',
      name: '',
      phone: ''
    });

    const handleRegister = async (e) => {
      e.preventDefault();
      if (regData.password !== regData.confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      
      setLoading(true);
      try {
        await api.register(regData);
        setShowRegister(false);
        setError('');
        alert('Registration successful! Please login.');
      } catch (err) {
        setError(err.message || 'Registration failed');
      } finally {
        setLoading(false);
      }
    };

    return (
      <form onSubmit={handleRegister} className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Create Account</h2>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Full Name</label>
          <input
            type="text"
            value={regData.name}
            onChange={(e) => setRegData({...regData, name: e.target.value})}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            value={regData.email}
            onChange={(e) => setRegData({...regData, email: e.target.value})}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Phone (Optional)</label>
          <input
            type="tel"
            value={regData.phone}
            onChange={(e) => setRegData({...regData, phone: e.target.value})}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <input
            type="password"
            value={regData.password}
            onChange={(e) => setRegData({...regData, password: e.target.value})}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
            minLength={8}
          />
          <p className="text-xs text-gray-500 mt-1">Must be 8+ chars with uppercase, lowercase, number & special character</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
          <input
            type="password"
            value={regData.confirmPassword}
            onChange={(e) => setRegData({...regData, confirmPassword: e.target.value})}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="flex space-x-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Register'}
          </button>
          <button
            type="button"
            onClick={() => setShowRegister(false)}
            className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
          >
            Back to Login
          </button>
        </div>
      </form>
    );
  };

  if (showRegister) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
          <RegisterForm />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <Building2 className="mx-auto h-12 w-12 text-blue-600" />
          <h1 className="mt-4 text-3xl font-bold text-gray-900">Real Estate Portal</h1>
          <p className="mt-2 text-gray-600">Shareholder Management System</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {requires2FA && (
            <div>
              <label className="block text-sm font-medium text-gray-700">2FA Code</label>
              <input
                type="text"
                value={twoFactorToken}
                onChange={(e) => setTwoFactorToken(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter 6-digit code"
                maxLength={6}
              />
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setShowRegister(true)}
            className="text-blue-600 hover:text-blue-800"
          >
            Don't have an account? Register here
          </button>
        </div>

        <div className="mt-8 bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600 font-semibold mb-2">Demo Accounts:</p>
          <div className="space-y-1 text-xs text-gray-500">
            <p><strong>Director:</strong> admin@company.com / Admin123!</p>
            <p><strong>Shareholder:</strong> shareholder@company.com / Share123!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Dashboard Components
const StatCard = ({ title, value, icon: Icon, color = "blue", change }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <div className="flex items-center">
      <div className={`flex-shrink-0 p-3 rounded-lg bg-${color}-100`}>
        <Icon className={`h-6 w-6 text-${color}-600`} />
      </div>
      <div className="ml-4 flex-1">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-2xl font-semibold text-gray-900">{value}</p>
        {change && (
          <p className={`text-sm ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {change > 0 ? '+' : ''}{change}% from last month
          </p>
        )}
      </div>
    </div>
  </div>
);

const DirectorDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await api.getDashboardData('director');
        setDashboardData(response.data);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading dashboard...</div>;
  }

  const data = dashboardData || {};

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Shareholders"
          value={data.totalShareholders || 0}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Total Shares"
          value={(data.totalShares || 0).toLocaleString()}
          icon={PieChart}
          color="green"
        />
        <StatCard
          title="Portfolio Value"
          value={`$${(data.totalValue || 0).toLocaleString()}`}
          icon={DollarSign}
          color="purple"
        />
        <StatCard
          title="Pending Reviews"
          value={data.pendingCertificates || 0}
          icon={AlertTriangle}
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {(data.recentActivity || []).map((activity, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <Activity className="h-5 w-5 text-gray-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{activity.action}</p>
                  <p className="text-xs text-gray-500">{activity.user} • {activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 flex items-center space-x-3">
              <Users className="h-5 w-5 text-blue-600" />
              <span>Manage Shareholders</span>
            </button>
            <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 flex items-center space-x-3">
              <FileText className="h-5 w-5 text-green-600" />
              <span>Review Certificates</span>
            </button>
            <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 flex items-center space-x-3">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              <span>Assign Shares</span>
            </button>
            <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 flex items-center space-x-3">
              <Shield className="h-5 w-5 text-red-600" />
              <span>View Audit Logs</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ShareholderDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await api.getDashboardData('shareholder');
        setDashboardData(response.data);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading portfolio...</div>;
  }

  const data = dashboardData || {};
  const portfolio = data.portfolio || {};
  const certificates = data.certificates || {};

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Portfolio Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <p className="text-sm text-gray-500">Total Shares</p>
            <p className="text-3xl font-bold text-blue-600">{(portfolio.totalShares || 0).toLocaleString()}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500">Current Value</p>
            <p className="text-3xl font-bold text-green-600">${(portfolio.totalCurrentValue || 0).toLocaleString()}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500">Total Return</p>
            <p className={`text-3xl font-bold ${(portfolio.profitLoss || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {(portfolio.profitLoss || 0) >= 0 ? '+' : ''}${(portfolio.profitLoss || 0).toLocaleString()}
            </p>
            <p className={`text-sm ${(portfolio.percentageReturn || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ({(portfolio.percentageReturn || 0).toFixed(2)}%)
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Certificate Status</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Certificates</span>
              <span className="font-semibold">{certificates.total || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-orange-600">Pending Review</span>
              <span className="font-semibold text-orange-600">{certificates.pending || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-green-600">Approved</span>
              <span className="font-semibold text-green-600">{certificates.approved || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-red-600">Rejected</span>
              <span className="font-semibold text-red-600">{certificates.rejected || 0}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 flex items-center space-x-3">
              <Upload className="h-5 w-5 text-blue-600" />
              <span>Upload Certificate</span>
            </button>
            <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 flex items-center space-x-3">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <span>View Portfolio Details</span>
            </button>
            <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 flex items-center space-x-3">
              <FileText className="h-5 w-5 text-purple-600" />
              <span>Download Documents</span>
            </button>
            <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 flex items-center space-x-3">
              <User className="h-5 w-5 text-gray-600" />
              <span>Update Profile</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Navigation Component
const Navigation = ({ user, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', icon: Home, href: '#dashboard' },
    ...(user?.role === 'director' || user?.role === 'super_admin' ? [
      { name: 'Users', icon: Users, href: '#users' },
      { name: 'Shares', icon: TrendingUp, href: '#shares' },
      { name: 'Audit', icon: Shield, href: '#audit' }
    ] : []),
    { name: 'Certificates', icon: FileText, href: '#certificates' },
    { name: 'Profile', icon: User, href: '#profile' }
  ];

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Building2 className="h-8 w-8 text-blue-600" />
            <span className="ml-2 text-xl font-bold text-gray-900">RealEstate Portal</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md"
              >
                <item.icon className="h-4 w-4" />
                <span>{item.name}</span>
              </a>
            ))}
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              {user?.name} ({user?.role})
            </div>
            <button
              onClick={onLogout}
              className="flex items-center space-x-1 text-gray-600 hover:text-red-600"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden md:inline">Logout</span>
            </button>
            <button
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 block px-3 py-2 rounded-md"
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

// Main App Component
const App = () => {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Building2 className="mx-auto h-12 w-12 text-blue-600 animate-pulse" />
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation user={user} onLogout={logout} />
      
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user.name}!
          </h1>
          <p className="text-gray-600">
            {user.role === 'director' ? 'Director Dashboard' : 
             user.role === 'shareholder' ? 'Shareholder Portal' : 
             'User Dashboard'}
          </p>
        </div>

        {user.role === 'director' || user.role === 'super_admin' ? (
          <DirectorDashboard />
        ) : (
          <ShareholderDashboard />
        )} 
      </main>
    </div>
  );
};

// Certificate Management Component
const CertificateManagement = ({ userRole }) => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Mock certificates data
  useEffect(() => {
    const mockCertificates = [
      {
        id: '1',
        fileName: 'share_certificate_2024_Q1.pdf',
        status: 'approved',
        uploadedAt: '2024-01-15',
        reviewedAt: '2024-01-16',
        reviewedBy: 'John Director',
        shareholderName: 'Jane Smith'
      },
      {
        id: '2',
        fileName: 'updated_certificate_2024.pdf',
        status: 'pending',
        uploadedAt: '2024-02-01',
        shareholderName: 'Mike Johnson'
      },
      {
        id: '3',
        fileName: 'certificate_scan_2023.jpg',
        status: 'rejected',
        uploadedAt: '2024-01-20',
        reviewedAt: '2024-01-22',
        reviewedBy: 'John Director',
        rejectionReason: 'Image quality too low, please upload a clearer scan',
        shareholderName: 'Sarah Wilson'
      }
    ];
    
    setTimeout(() => {
      setCertificates(mockCertificates);
      setLoading(false);
    }, 1000);
  }, []);

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile) return;

    setUploading(true);
    try {
      // Simulate upload
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newCert = {
        id: Date.now().toString(),
        fileName: uploadFile.name,
        status: 'pending',
        uploadedAt: new Date().toISOString().split('T')[0],
        shareholderName: 'Current User'
      };
      
      setCertificates([newCert, ...certificates]);
      setUploadFile(null);
      alert('Certificate uploaded successfully!');
    } catch (error) {
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleApprove = async (certId) => {
    setCertificates(certificates.map(cert => 
      cert.id === certId 
        ? { ...cert, status: 'approved', reviewedAt: new Date().toISOString().split('T')[0], reviewedBy: 'Current User' }
        : cert
    ));
  };

  const handleReject = async (certId, reason) => {
    const rejectionReason = reason || prompt('Enter rejection reason:');
    if (!rejectionReason) return;

    setCertificates(certificates.map(cert => 
      cert.id === certId 
        ? { 
            ...cert, 
            status: 'rejected', 
            reviewedAt: new Date().toISOString().split('T')[0],
            reviewedBy: 'Current User',
            rejectionReason 
          }
        : cert
    ));
  };

  const getStatusBadge = (status) => {
    const styles = {
      approved: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      rejected: 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading certificates...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Upload Section - Only for shareholders */}
      {userRole === 'shareholder' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload New Certificate</h3>
          <form onSubmit={handleFileUpload} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Certificate File
              </label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => setUploadFile(e.target.files[0])}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <p className="text-xs text-gray-500 mt-1">Accepted formats: PDF, JPG, PNG (Max 10MB)</p>
            </div>
            <button
              type="submit"
              disabled={!uploadFile || uploading}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
            >
              <Upload className="h-4 w-4" />
              <span>{uploading ? 'Uploading...' : 'Upload Certificate'}</span>
            </button>
          </form>
        </div>
      )}

      {/* Certificates List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {userRole === 'director' ? 'All Certificates' : 'My Certificates'}
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  File Name
                </th>
                {userRole === 'director' && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Shareholder
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Uploaded
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {certificates.map((cert) => (
                <tr key={cert.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{cert.fileName}</div>
                        {cert.rejectionReason && (
                          <div className="text-sm text-red-600 mt-1">{cert.rejectionReason}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  {userRole === 'director' && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {cert.shareholderName}
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(cert.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {cert.uploadedAt}
                    {cert.reviewedAt && (
                      <div className="text-xs text-gray-400">
                        Reviewed: {cert.reviewedAt}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button className="text-blue-600 hover:text-blue-900 flex items-center space-x-1">
                      <Download className="h-4 w-4" />
                      <span>Download</span>
                    </button>
                    
                    {userRole === 'director' && cert.status === 'pending' && (
                      <div className="flex space-x-2 mt-2">
                        <button
                          onClick={() => handleApprove(cert.id)}
                          className="text-green-600 hover:text-green-900 flex items-center space-x-1"
                        >
                          <Check className="h-4 w-4" />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => handleReject(cert.id)}
                          className="text-red-600 hover:text-red-900 flex items-center space-x-1"
                        >
                          <X className="h-4 w-4" />
                          <span>Reject</span>
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// User Management Component (Directors only)
const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'shareholder',
    phone: ''
  });

  // Mock users data
  useEffect(() => {
    const mockUsers = [
      {
        id: '1',
        name: 'Jane Smith',
        email: 'jane@example.com',
        role: 'shareholder',
        isActive: true,
        lastLogin: '2024-02-15',
        totalShares: 2500,
        portfolioValue: 50000
      },
      {
        id: '2',
        name: 'Mike Johnson',
        email: 'mike@example.com',
        role: 'shareholder',
        isActive: true,
        lastLogin: '2024-02-14',
        totalShares: 1800,
        portfolioValue: 36000
      },
      {
        id: '3',
        name: 'Sarah Wilson',
        email: 'sarah@example.com',
        role: 'director',
        isActive: true,
        lastLogin: '2024-02-16',
        totalShares: 0,
        portfolioValue: 0
      }
    ];
    
    setTimeout(() => {
      setUsers(mockUsers);
      setLoading(false);
    }, 1000);
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const user = {
        id: Date.now().toString(),
        ...newUser,
        isActive: true,
        lastLogin: null,
        totalShares: 0,
        portfolioValue: 0
      };
      
      setUsers([...users, user]);
      setNewUser({ name: '', email: '', role: 'shareholder', phone: '' });
      setShowCreateUser(false);
      alert('User created successfully!');
    } catch (error) {
      alert('Failed to create user');
    }
  };

  const toggleUserStatus = (userId) => {
    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, isActive: !user.isActive }
        : user
    ));
  };

  const getRoleBadge = (role) => {
    const styles = {
      director: 'bg-purple-100 text-purple-800',
      shareholder: 'bg-blue-100 text-blue-800',
      super_admin: 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[role]}`}>
        {role.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading users...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Create User Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">User Management</h2>
        <button
          onClick={() => setShowCreateUser(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2"
        >
          <Users className="h-4 w-4" />
          <span>Add New User</span>
        </button>
      </div>

      {/* Create User Modal */}
      {showCreateUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New User</h3>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="shareholder">Shareholder</option>
                  <option value="director">Director</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone (Optional)</label>
                <input
                  type="tel"
                  value={newUser.phone}
                  onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                >
                  Create User
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateUser(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Portfolio
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Login
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getRoleBadge(user.role)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {user.role === 'shareholder' && (
                    <div>
                      <div>{user.totalShares.toLocaleString()} shares</div>
                      <div className="text-gray-500">${user.portfolioValue.toLocaleString()}</div>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.lastLogin || 'Never'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button
                    onClick={() => toggleUserStatus(user.id)}
                    className={`${user.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'} flex items-center space-x-1`}
                  >
                    {user.isActive ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                    <span>{user.isActive ? 'Deactivate' : 'Activate'}</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Enhanced App Component with Navigation
const EnhancedApp = () => {
  const { user, loading, logout } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Building2 className="mx-auto h-12 w-12 text-blue-600 animate-pulse" />
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case 'certificates':
        return <CertificateManagement userRole={user.role} />;
      case 'users':
        return user.role === 'director' || user.role === 'super_admin' ? <UserManagement /> : <div>Access Denied</div>;
      case 'dashboard':
      default:
        return user.role === 'director' || user.role === 'super_admin' ? (
          <DirectorDashboard />
        ) : (
          <ShareholderDashboard />
        );
    }
  };

  const navItems = [
    { id: 'dashboard', name: 'Dashboard', icon: Home },
    ...(user?.role === 'director' || user?.role === 'super_admin' ? [
      { id: 'users', name: 'Users', icon: Users },
      { id: 'shares', name: 'Shares', icon: TrendingUp },
      { id: 'audit', name: 'Audit', icon: Shield }
    ] : []),
    { id: 'certificates', name: 'Certificates', icon: FileText },
    { id: 'profile', name: 'Profile', icon: User }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Building2 className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">RealEstate Portal</span>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id)}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md ${
                    currentView === item.id 
                      ? 'text-blue-600 bg-blue-50' 
                      : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                {user?.name} ({user?.role})
              </div>
              <button
                onClick={logout}
                className="flex items-center space-x-1 text-gray-600 hover:text-red-600"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden md:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>
      
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {navItems.find(item => item.id === currentView)?.name || 'Dashboard'}
          </h1>
          <p className="text-gray-600">
            {user.role === 'director' ? 'Director Panel' : 
             user.role === 'shareholder' ? 'Shareholder Portal' : 
             'User Dashboard'}
          </p>
        </div>

        {renderCurrentView()}
      </main>
    </div>
  );
};

// Export with AuthProvider wrapper
export default function RealEstateApp() {
  return (
    <AuthProvider>
      <EnhancedApp />
    </AuthProvider>
  );
}