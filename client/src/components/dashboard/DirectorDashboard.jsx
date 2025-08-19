// client/src/components/dashboard/DirectorDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { userAPI, shareAPI, certificateAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { 
  Users, 
  TrendingUp, 
  FileText, 
  Plus, 
  Search, 
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  DollarSign,
  PieChart,
  BarChart3,
  Upload,
  Download,
  Edit,
  Trash2,
  Shield,
  Building,
  Calendar,
  Send,
  UserPlus
} from 'lucide-react';

const DirectorDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Data states
  const [shareholders, setShareholders] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [pendingStats, setPendingStats] = useState(null);
  const [systemStats, setSystemStats] = useState({
    totalShareholders: 0,
    totalShares: 0,
    totalValue: 0,
    pendingCertificates: 0
  });

  // UI states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedShareholder, setSelectedShareholder] = useState(null);
  const [showShareAssignModal, setShowShareAssignModal] = useState(false);
  const [showNewUserModal, setShowNewUserModal] = useState(false);
  const [processingCertificate, setProcessingCertificate] = useState(null);

  // Form states
  const [newUserForm, setNewUserForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'shareholder'
  });

  const [newShareForm, setNewShareForm] = useState({
    shareholderId: '',
    numberOfShares: '',
    sharePrice: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    purchasePrice: '',
    notes: ''
  });

  // Fetch all data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const [usersRes, certificatesRes, pendingRes] = await Promise.all([
        userAPI.getUsers({ role: 'shareholder' }),
        certificateAPI.getCertificates(),
        certificateAPI.getPendingStats()
      ]);

      if (usersRes.data.success) {
        setShareholders(usersRes.data.data.users);
      }

      if (certificatesRes.data.success) {
        setCertificates(certificatesRes.data.data.certificates || []);
      }

      if (pendingRes.data.success) {
        setPendingStats(pendingRes.data.data);
      }

      // Calculate system stats
      calculateSystemStats(usersRes.data.data.users, certificatesRes.data.data.certificates || []);

    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Calculate system statistics
  const calculateSystemStats = (shareholdersList, certificatesList) => {
    const stats = {
      totalShareholders: shareholdersList.filter(u => u.role === 'shareholder').length,
      totalShares: 0, // Will be calculated from shares data if available
      totalValue: 0, // Will be calculated from shares data if available
      pendingCertificates: certificatesList.filter(c => c.status === 'pending').length
    };
    
    setSystemStats(stats);
  };

  // Load data on mount
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Handle certificate approval
  const handleApproveCertificate = async (certificateId, notes = '') => {
    setProcessingCertificate(certificateId);
    try {
      const response = await certificateAPI.approveCertificate(certificateId, notes);
      if (response.data.success) {
        toast.success('Certificate approved successfully');
        fetchDashboardData(); // Refresh data
      }
    } catch (error) {
      console.error('Failed to approve certificate:', error);
      toast.error(error.response?.data?.message || 'Failed to approve certificate');
    } finally {
      setProcessingCertificate(null);
    }
  };

  // Handle certificate rejection
  const handleRejectCertificate = async (certificateId, reason) => {
    if (!reason) {
      reason = prompt('Please provide a reason for rejection:');
      if (!reason) return;
    }

    setProcessingCertificate(certificateId);
    try {
      const response = await certificateAPI.rejectCertificate(certificateId, reason);
      if (response.data.success) {
        toast.success('Certificate rejected successfully');
        fetchDashboardData(); // Refresh data
      }
    } catch (error) {
      console.error('Failed to reject certificate:', error);
      toast.error(error.response?.data?.message || 'Failed to reject certificate');
    } finally {
      setProcessingCertificate(null);
    }
  };

  // Handle bulk operations
  const handleBulkApprove = async (shareholderId, notes = '') => {
    try {
      const response = await certificateAPI.bulkApprove(shareholderId, notes);
      if (response.data.success) {
        toast.success(`Approved ${response.data.data.certificatesApproved} certificates`);
        fetchDashboardData();
      }
    } catch (error) {
      console.error('Bulk approve failed:', error);
      toast.error(error.response?.data?.message || 'Bulk approval failed');
    }
  };

  // Handle new user creation
  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const response = await userAPI.createUser(newUserForm);
      if (response.data.success) {
        toast.success('User created successfully');
        setShowNewUserModal(false);
        setNewUserForm({ name: '', email: '', password: '', phone: '', role: 'shareholder' });
        fetchDashboardData();
      }
    } catch (error) {
      console.error('Failed to create user:', error);
      toast.error(error.response?.data?.message || 'Failed to create user');
    }
  };

  // Handle share assignment
  const handleAssignShares = async (e) => {
    e.preventDefault();
    try {
      const response = await shareAPI.createShare(newShareForm);
      if (response.data.success) {
        toast.success('Shares assigned successfully');
        setShowShareAssignModal(false);
        setNewShareForm({
          shareholderId: '',
          numberOfShares: '',
          sharePrice: '',
          purchaseDate: new Date().toISOString().split('T')[0],
          purchasePrice: '',
          notes: ''
        });
        fetchDashboardData();
      }
    } catch (error) {
      console.error('Failed to assign shares:', error);
      toast.error(error.response?.data?.message || 'Failed to assign shares');
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get status badge for certificates
  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return {
          icon: Clock,
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          text: 'Pending'
        };
      case 'approved':
        return {
          icon: CheckCircle,
          className: 'bg-green-100 text-green-800 border-green-200',
          text: 'Approved'
        };
      case 'rejected':
        return {
          icon: XCircle,
          className: 'bg-red-100 text-red-800 border-red-200',
          text: 'Rejected'
        };
      default:
        return {
          icon: AlertCircle,
          className: 'bg-gray-100 text-gray-800 border-gray-200',
          text: 'Unknown'
        };
    }
  };

  // Filter certificates based on search and status
  const filteredCertificates = certificates.filter(cert => {
    if (activeTab === 'pending-certificates') {
      return cert.status === 'pending';
    }
    return true;
  });

  // Filter shareholders based on search
  const filteredShareholders = shareholders.filter(shareholder =>
    shareholder.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shareholder.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-600 font-medium">Loading director dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Director Dashboard
          </h1>
          <p className="text-gray-600">
            Manage shareholders, approve certificates, and oversee portfolio performance
          </p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Shareholders</p>
                <p className="text-2xl font-bold text-gray-900">
                  {systemStats.totalShareholders}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Active accounts</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Certificates</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {systemStats.pendingCertificates}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Awaiting review</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Properties</p>
                <p className="text-2xl font-bold text-green-600">
                  {systemStats.totalShares}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Building className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Active investments</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Portfolio Value</p>
                <p className="text-2xl font-bold text-purple-600">
                  {formatCurrency(systemStats.totalValue)}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Total managed value</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {[
                { id: 'overview', name: 'Overview', icon: BarChart3 },
                { id: 'shareholders', name: 'Shareholders', icon: Users },
                { id: 'pending-certificates', name: 'Pending Certificates', icon: Clock, badge: systemStats.pendingCertificates },
                { id: 'shares', name: 'Share Management', icon: TrendingUp }
              ].map((tab) => {
                const TabIcon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
                  >
                    <TabIcon className="w-4 h-4" />
                    <span>{tab.name}</span>
                    {tab.badge > 0 && (
                      <span className="bg-red-100 text-red-600 text-xs font-medium px-2 py-1 rounded-full">
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Quick Actions */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                    <div className="space-y-3">
                      <button
                        onClick={() => setShowNewUserModal(true)}
                        className="w-full flex items-center space-x-3 p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                      >
                        <UserPlus className="w-5 h-5" />
                        <span className="font-medium">Add New Shareholder</span>
                      </button>
                      
                      <button
                        onClick={() => setShowShareAssignModal(true)}
                        className="w-full flex items-center space-x-3 p-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                      >
                        <Plus className="w-5 h-5" />
                        <span className="font-medium">Assign Shares</span>
                      </button>
                      
                      <button
                        onClick={() => setActiveTab('pending-certificates')}
                        className="w-full flex items-center justify-between p-3 bg-yellow-50 hover:bg-yellow-100 text-yellow-800 rounded-lg transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <Clock className="w-5 h-5" />
                          <span className="font-medium">Review Certificates</span>
                        </div>
                        {systemStats.pendingCertificates > 0 && (
                          <span className="bg-yellow-200 text-yellow-800 text-xs font-medium px-2 py-1 rounded-full">
                            {systemStats.pendingCertificates}
                          </span>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                    <div className="space-y-3">
                      {certificates.slice(0, 5).map((cert) => {
                        const status = getStatusBadge(cert.status);
                        const StatusIcon = status.icon;
                        
                        return (
                          <div key={cert._id} className="flex items-center space-x-3 p-2 bg-white rounded border">
                            <StatusIcon className="w-4 h-4 text-gray-500" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                Certificate uploaded
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatDate(cert.uploadedAt)}
                              </p>
                            </div>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${status.className}`}>
                              {status.text}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Shareholders Tab */}
            {activeTab === 'shareholders' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <div className="flex-1 max-w-lg">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Search shareholders..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => setShowNewUserModal(true)}
                    className="ml-4 flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Add Shareholder</span>
                  </button>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Shareholder
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Contact
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Joined
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredShareholders.map((shareholder) => (
                          <tr key={shareholder.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                  <span className="text-white font-semibold text-sm">
                                    {shareholder.name.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {shareholder.name}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    ID: {shareholder.id.slice(-6)}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{shareholder.email}</div>
                              <div className="text-sm text-gray-500">{shareholder.phone}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                shareholder.isActive
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {shareholder.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(shareholder.createdAt)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => setSelectedShareholder(shareholder)}
                                  className="text-blue-600 hover:text-blue-900 transition-colors"
                                  title="View details"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    setNewShareForm(prev => ({ ...prev, shareholderId: shareholder.id }));
                                    setShowShareAssignModal(true);
                                  }}
                                  className="text-green-600 hover:text-green-900 transition-colors"
                                  title="Assign shares"
                                >
                                  <Plus className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Pending Certificates Tab */}
            {activeTab === 'pending-certificates' && (
              <div>
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Certificates Awaiting Review
                  </h3>
                  <p className="text-gray-600">
                    Review and approve or reject uploaded certificates
                  </p>
                </div>

                {filteredCertificates.length > 0 ? (
                  <div className="space-y-4">
                    {filteredCertificates.map((cert) => (
                      <div key={cert._id} className="bg-white border border-gray-200 rounded-lg p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <FileText className="w-5 h-5 text-gray-500" />
                              <h4 className="text-lg font-medium text-gray-900">
                                {cert.originalFileName}
                              </h4>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                              <div>
                                <span className="font-medium">Shareholder:</span>
                                <p>{cert.shareholderName || 'Unknown'}</p>
                              </div>
                              <div>
                                <span className="font-medium">Uploaded:</span>
                                <p>{formatDate(cert.uploadedAt)}</p>
                              </div>
                              <div>
                                <span className="font-medium">File Size:</span>
                                <p>{(cert.fileSize / 1024 / 1024).toFixed(2)} MB</p>
                              </div>
                              <div>
                                <span className="font-medium">Type:</span>
                                <p>{cert.fileType}</p>
                              </div>
                            </div>
                          </div>

                          <div className="flex space-x-2 ml-4">
                            <button
                              onClick={() => handleApproveCertificate(cert._id)}
                              disabled={processingCertificate === cert._id}
                              className="flex items-center space-x-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                            >
                              <CheckCircle className="w-4 h-4" />
                              <span>Approve</span>
                            </button>
                            
                            <button
                              onClick={() => handleRejectCertificate(cert._id)}
                              disabled={processingCertificate === cert._id}
                              className="flex items-center space-x-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                            >
                              <XCircle className="w-4 h-4" />
                              <span>Reject</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">All caught up!</h3>
                    <p className="text-gray-600">No pending certificates to review</p>
                  </div>
                )}
              </div>
            )}

            {/* Share Management Tab */}
            {activeTab === 'shares' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Share Management</h3>
                    <p className="text-gray-600">Assign and manage share allocations</p>
                  </div>
                  <button
                    onClick={() => setShowShareAssignModal(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Assign Shares</span>
                  </button>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <p className="text-gray-600 text-center">
                    Share management interface coming soon...
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* New User Modal */}
      {showNewUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Add New Shareholder</h3>
              <button
                onClick={() => setShowNewUserModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={newUserForm.name}
                  onChange={(e) => setNewUserForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={newUserForm.email}
                  onChange={(e) => setNewUserForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter email address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={newUserForm.password}
                  onChange={(e) => setNewUserForm(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter password"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={newUserForm.phone}
                  onChange={(e) => setNewUserForm(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter phone number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  value={newUserForm.role}
                  onChange={(e) => setNewUserForm(prev => ({ ...prev, role: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="shareholder">Shareholder</option>
                  <option value="director">Director</option>
                </select>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowNewUserModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Share Assignment Modal */}
      {showShareAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Assign Shares</h3>
              <button
                onClick={() => setShowShareAssignModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleAssignShares} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Shareholder
                </label>
                <select
                  required
                  value={newShareForm.shareholderId}
                  onChange={(e) => setNewShareForm(prev => ({ ...prev, shareholderId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select shareholder</option>
                  {shareholders.map((shareholder) => (
                    <option key={shareholder.id} value={shareholder.id}>
                      {shareholder.name} ({shareholder.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Shares
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={newShareForm.numberOfShares}
                  onChange={(e) => setNewShareForm(prev => ({ ...prev, numberOfShares: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter number of shares"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Share Price (₹)
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={newShareForm.sharePrice}
                  onChange={(e) => setNewShareForm(prev => ({ ...prev, sharePrice: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter current share price"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Purchase Date
                </label>
                <input
                  type="date"
                  required
                  value={newShareForm.purchaseDate}
                  onChange={(e) => setNewShareForm(prev => ({ ...prev, purchaseDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Purchase Price (₹)
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={newShareForm.purchasePrice}
                  onChange={(e) => setNewShareForm(prev => ({ ...prev, purchasePrice: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter original purchase price"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  value={newShareForm.notes}
                  onChange={(e) => setNewShareForm(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="3"
                  placeholder="Additional notes about this share assignment"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowShareAssignModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Assign Shares
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Shareholder Details Modal */}
      {selectedShareholder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Shareholder Details
              </h3>
              <button
                onClick={() => setSelectedShareholder(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Basic Info */}
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xl">
                    {selectedShareholder.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-gray-900">
                    {selectedShareholder.name}
                  </h4>
                  <p className="text-gray-600">{selectedShareholder.email}</p>
                  <p className="text-sm text-gray-500">
                    Member since {formatDate(selectedShareholder.createdAt)}
                  </p>
                </div>
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <p className="text-gray-900">{selectedShareholder.phone || 'Not provided'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    selectedShareholder.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedShareholder.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setNewShareForm(prev => ({ ...prev, shareholderId: selectedShareholder.id }));
                    setSelectedShareholder(null);
                    setShowShareAssignModal(true);
                  }}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Assign Shares</span>
                </button>
                
                <button
                  onClick={() => {
                    const certificates = filteredCertificates.filter(
                      cert => cert.shareholderId === selectedShareholder.id && cert.status === 'pending'
                    );
                    if (certificates.length > 0) {
                      handleBulkApprove(selectedShareholder.id);
                    } else {
                      toast.info('No pending certificates for this shareholder');
                    }
                  }}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Approve All Certificates</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DirectorDashboard;