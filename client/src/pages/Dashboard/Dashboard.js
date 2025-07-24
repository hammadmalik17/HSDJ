import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  FileText, 
  Users, 
  AlertCircle,
  CheckCircle,
  Clock,
  Building,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useAuth } from '../../contexts/AuthContext';
import { userAPI, shareAPI, certificateAPI } from '../../services/api';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import { formatCurrency, formatDate } from '../../services/api';

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch user-specific dashboard data
      const response = await userAPI.getDashboard(user.id);
      setDashboardData(response.data.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Dashboard</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={fetchDashboardData}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Mock data for demo purposes (replace with real data from API)
  const portfolioData = dashboardData?.portfolio || {
    totalShares: 15000,
    totalUnits: 3,
    totalCurrentValue: 75000,
    totalInvestment: 70000,
    profitLoss: 5000,
    percentageReturn: 7.14
  };

  const recentTransactions = [
    { date: '2024-01-15', type: 'Purchase', shares: 5000, amount: 25000 },
    { date: '2024-01-10', type: 'Value Update', shares: 10000, amount: 50000 },
    { date: '2024-01-05', type: 'Purchase', shares: 5000, amount: 22000 }
  ];

  const chartData = [
    { month: 'Jan', value: 65000 },
    { month: 'Feb', value: 68000 },
    { month: 'Mar', value: 72000 },
    { month: 'Apr', value: 75000 }
  ];

  const certificateStats = dashboardData?.certificates || {
    total: 8,
    pending: 2,
    approved: 5,
    rejected: 1
  };

  const pieData = [
    { name: 'Approved', value: certificateStats.approved, color: '#10B981' },
    { name: 'Pending', value: certificateStats.pending, color: '#F59E0B' },
    { name: 'Rejected', value: certificateStats.rejected, color: '#EF4444' }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Welcome back, {user?.name}!</h1>
            <p className="mt-2 opacity-90">
              Here's an overview of your investment portfolio
            </p>
          </div>
          <Building className="h-16 w-16 opacity-20" />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Portfolio Value */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Portfolio Value</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(portfolioData.totalCurrentValue)}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            {portfolioData.profitLoss >= 0 ? (
              <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
            ) : (
              <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
            )}
            <span className={`text-sm font-medium ${portfolioData.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {portfolioData.percentageReturn.toFixed(2)}%
            </span>
            <span className="text-sm text-gray-500 ml-1">from last month</span>
          </div>
        </div>

        {/* Total Shares */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Shares</p>
              <p className="text-2xl font-bold text-gray-900">
                {portfolioData.totalShares.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-gray-500">
              {portfolioData.totalUnits} units • {portfolioData.totalShares % 5000} remaining shares
            </span>
          </div>
        </div>

        {/* Certificates */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Certificates</p>
              <p className="text-2xl font-bold text-gray-900">{certificateStats.total}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <FileText className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center space-x-4 text-sm">
            <span className="text-green-600">{certificateStats.approved} approved</span>
            <span className="text-yellow-600">{certificateStats.pending} pending</span>
          </div>
        </div>

        {/* Profit/Loss */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Profit/Loss</p>
              <p className={`text-2xl font-bold ${portfolioData.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(portfolioData.profitLoss)}
              </p>
            </div>
            <div className={`p-3 rounded-full ${portfolioData.profitLoss >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
              {portfolioData.profitLoss >= 0 ? (
                <TrendingUp className="h-6 w-6 text-green-600" />
              ) : (
                <TrendingDown className="h-6 w-6 text-red-600" />
              )}
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-gray-500">
              Initial investment: {formatCurrency(portfolioData.totalInvestment)}
            </span>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Portfolio Value Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Portfolio Performance</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `$${(value / 1000)}k`} />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Certificate Status Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Certificate Status</h3>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center space-x-6 mt-4">
            {pieData.map((item) => (
              <div key={item.name} className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-gray-600">{item.name}: {item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {recentTransactions.map((transaction, index) => (
            <div key={index} className="p-6 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`p-2 rounded-full mr-4 ${
                    transaction.type === 'Purchase' ? 'bg-green-100' : 'bg-blue-100'
                  }`}>
                    {transaction.type === 'Purchase' ? (
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    ) : (
                      <Clock className="h-5 w-5 text-blue-600" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{transaction.type}</p>
                    <p className="text-sm text-gray-500">
                      {transaction.shares.toLocaleString()} shares
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {formatCurrency(transaction.amount)}
                  </p>
                  <p className="text-sm text-gray-500">{formatDate(transaction.date)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="p-6 border-t border-gray-200">
          <button className="w-full text-center text-blue-600 hover:text-blue-700 font-medium">
            View all activity
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      {user?.role !== 'visitor' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
              <FileText className="h-6 w-6 text-gray-400 mr-2" />
              <span className="text-gray-600">Upload Certificate</span>
            </button>
            <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
              <TrendingUp className="h-6 w-6 text-gray-400 mr-2" />
              <span className="text-gray-600">View Portfolio</span>
            </button>
            <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
              <Users className="h-6 w-6 text-gray-400 mr-2" />
              <span className="text-gray-600">Contact Support</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;