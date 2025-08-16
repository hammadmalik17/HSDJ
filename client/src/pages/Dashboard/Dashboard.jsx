import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Building2, 
  FileText, 
  Users, 
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Award,
  Eye,
  Download,
  Plus
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('1M');

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const stats = [
    {
      title: 'Total Portfolio Value',
      value: '$2,450,000',
      change: '+12.5%',
      changeType: 'positive',
      icon: DollarSign,
      color: 'from-green-500 to-emerald-500'
    },
    {
      title: 'Active Properties',
      value: '15',
      change: '+3',
      changeType: 'positive',
      icon: Building2,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Monthly ROI',
      value: '8.7%',
      change: '+1.2%',
      changeType: 'positive',
      icon: TrendingUp,
      color: 'from-purple-500 to-pink-500'
    },
    {
      title: 'Monthly Income',
      value: '$45,200',
      change: '+$3,200',
      changeType: 'positive',
      icon: Activity,
      color: 'from-orange-500 to-red-500'
    }
  ];

  const recentProperties = [
    {
      id: 1,
      title: 'Luxury Manhattan Penthouse',
      location: 'Manhattan, NY',
      value: '$2,150,000',
      roi: '+12.5%',
      status: 'Active',
      image: 'from-blue-500 to-purple-500'
    },
    {
      id: 2,
      title: 'Modern Austin Villa',
      location: 'Austin, TX',
      value: '$875,000',
      roi: '+8.7%',
      status: 'Active',
      image: 'from-green-500 to-teal-500'
    },
    {
      id: 3,
      title: 'Miami Waterfront Condo',
      location: 'Miami, FL',
      value: '$1,420,000',
      roi: '+11.3%',
      status: 'Pending',
      image: 'from-cyan-500 to-blue-500'
    }
  ];

  const recentTransactions = [
    {
      id: 1,
      type: 'Property Purchase',
      property: 'Seattle Tech Hub Loft',
      amount: '$925,000',
      date: '2024-01-15',
      status: 'Completed'
    },
    {
      id: 2,
      type: 'Rental Income',
      property: 'Manhattan Penthouse',
      amount: '+$8,500',
      date: '2024-01-10',
      status: 'Received'
    },
    {
      id: 3,
      type: 'Property Sale',
      property: 'Boston Downtown Condo',
      amount: '+$1,250,000',
      date: '2024-01-05',
      status: 'Completed'
    }
  ];

  const certificates = [
    {
      id: 1,
      title: 'Property Ownership Certificate',
      property: 'Manhattan Penthouse',
      status: 'Approved',
      date: '2024-01-12'
    },
    {
      id: 2,
      title: 'Investment Documentation',
      property: 'Austin Villa',
      status: 'Pending',
      date: '2024-01-10'
    },
    {
      id: 3,
      title: 'ROI Analysis Report',
      property: 'Miami Condo',
      status: 'In Review',
      date: '2024-01-08'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <BarChart3 className="h-8 w-8 text-white" />
          </div>
          <p className="text-gray-600 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                Welcome back, {user?.name || 'Investor'}! 👋
              </h1>
              <p className="text-gray-600 text-lg">
                Here's what's happening with your real estate portfolio today.
              </p>
            </div>
            
            <div className="mt-6 lg:mt-0 flex items-center space-x-4">
              <select 
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="1W">Last Week</option>
                <option value="1M">Last Month</option>
                <option value="3M">Last 3 Months</option>
                <option value="1Y">Last Year</option>
              </select>
              
              <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Add Property</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            
            return (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center`}>
                    <IconComponent className="h-6 w-6 text-white" />
                  </div>
                  <div className={`flex items-center space-x-1 text-sm font-medium ${
                    stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.changeType === 'positive' ? (
                      <ArrowUpRight className="h-4 w-4" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4" />
                    )}
                    <span>{stat.change}</span>
                  </div>
                </div>
                
                <div>
                  <div className="text-2xl lg:text-3xl font-bold text-gray-900 mb-1">
                    {stat.value}
                  </div>
                  <div className="text-gray-600 font-medium">
                    {stat.title}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Portfolio Performance Chart */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Portfolio Performance</h3>
                <div className="flex items-center space-x-2">
                  <button className="px-3 py-1 bg-blue-100 text-blue-600 rounded-lg text-sm font-medium">
                    Value
                  </button>
                  <button className="px-3 py-1 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-100">
                    ROI
                  </button>
                </div>
              </div>
              
              {/* Simulated Chart */}
              <div className="h-64 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <p className="text-gray-600">Interactive chart would be here</p>
                  <p className="text-sm text-gray-500">Portfolio value up 12.5% this month</p>
                </div>
              </div>
            </div>

            {/* Recent Properties */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Recent Properties</h3>
                <button className="text-blue-600 hover:text-blue-700 font-medium">
                  View All
                </button>
              </div>
              
              <div className="space-y-4">
                {recentProperties.map((property) => (
                  <div key={property.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className={`w-12 h-12 bg-gradient-to-br ${property.image} rounded-xl flex-shrink-0`}></div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 truncate">{property.title}</h4>
                      <p className="text-sm text-gray-600">{property.location}</p>
                    </div>
                    
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">{property.value}</div>
                      <div className="text-sm text-green-600">{property.roi}</div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        property.status === 'Active' 
                          ? 'bg-green-100 text-green-600'
                          : 'bg-yellow-100 text-yellow-600'
                      }`}>
                        {property.status}
                      </span>
                      <button className="text-gray-400 hover:text-gray-600">
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Quick Actions */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h3>
              
              <div className="space-y-3">
                {[
                  { icon: Plus, label: 'Add New Property', color: 'from-blue-500 to-cyan-500' },
                  { icon: FileText, label: 'Upload Documents', color: 'from-green-500 to-emerald-500' },
                  { icon: BarChart3, label: 'View Analytics', color: 'from-purple-500 to-pink-500' },
                  { icon: Download, label: 'Export Reports', color: 'from-orange-500 to-red-500' }
                ].map((action, index) => {
                  const IconComponent = action.icon;
                  
                  return (
                    <button
                      key={index}
                      className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-50 transition-colors text-left"
                    >
                      <div className={`w-10 h-10 bg-gradient-to-br ${action.color} rounded-xl flex items-center justify-center`}>
                        <IconComponent className="h-5 w-5 text-white" />
                      </div>
                      <span className="font-medium text-gray-900">{action.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Transactions</h3>
              
              <div className="space-y-4">
                {recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${
                      transaction.status === 'Completed' ? 'bg-green-500' :
                      transaction.status === 'Received' ? 'bg-blue-500' : 'bg-yellow-500'
                    }`}></div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 text-sm">{transaction.type}</div>
                      <div className="text-xs text-gray-600 truncate">{transaction.property}</div>
                    </div>
                    
                    <div className="text-right">
                      <div className={`font-semibold text-sm ${
                        transaction.amount.startsWith('+') ? 'text-green-600' : 'text-gray-900'
                      }`}>
                        {transaction.amount}
                      </div>
                      <div className="text-xs text-gray-500">{transaction.date}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Certificates Status */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Certificates</h3>
              
              <div className="space-y-4">
                {certificates.map((cert) => (
                  <div key={cert.id} className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 text-sm truncate">{cert.title}</div>
                      <div className="text-xs text-gray-600">{cert.property}</div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        cert.status === 'Approved' ? 'bg-green-100 text-green-600' :
                        cert.status === 'Pending' ? 'bg-yellow-100 text-yellow-600' :
                        'bg-blue-100 text-blue-600'
                      }`}>
                        {cert.status}
                      </span>
                      
                      {cert.status === 'Approved' ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : cert.status === 'Pending' ? (
                        <Clock className="h-4 w-4 text-yellow-500" />
                      ) : (
                        <Eye className="h-4 w-4 text-blue-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;