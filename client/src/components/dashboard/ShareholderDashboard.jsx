// client/src/components/dashboard/ShareholderDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { shareAPI, certificateAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { 
  TrendingUp, 
  DollarSign, 
  FileText, 
  Upload, 
  Eye, 
  Download, 
  Calendar,
  PieChart,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  BarChart3
} from 'lucide-react';

const ShareholderDashboard = () => {
  const { user } = useAuth();
  const [portfolioData, setPortfolioData] = useState(null);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadingCert, setUploadingCert] = useState(false);

  // Fetch portfolio data
  const fetchPortfolioData = async () => {
    try {
      const response = await shareAPI.getPortfolio(user._id);
      if (response.data.success) {
        setPortfolioData(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch portfolio:', error);
      toast.error('Failed to load portfolio data');
    }
  };

  // Fetch certificates
  const fetchCertificates = async () => {
    try {
      const response = await certificateAPI.getCertificates();
      if (response.data.success) {
        setCertificates(response.data.data.certificates || []);
      }
    } catch (error) {
      console.error('Failed to fetch certificates:', error);
      toast.error('Failed to load certificates');
    }
  };

  // Load data on component mount
  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      await Promise.all([fetchPortfolioData(), fetchCertificates()]);
      setLoading(false);
    };

    loadDashboardData();
  }, [user._id]);

  // Handle certificate upload
  const handleCertificateUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    
    if (file.size > maxSize) {
      toast.error('File size must be less than 10MB');
      return;
    }

    if (!allowedTypes.includes(file.type)) {
      toast.error('Only PDF and image files are allowed');
      return;
    }

    setUploadingCert(true);
    const formData = new FormData();
    formData.append('certificate', file);

    try {
      const response = await certificateAPI.uploadCertificate(formData);
      if (response.data.success) {
        toast.success('Certificate uploaded successfully');
        fetchCertificates(); // Refresh certificates list
      }
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error(error.response?.data?.message || 'Failed to upload certificate');
    } finally {
      setUploadingCert(false);
      event.target.value = ''; // Reset file input
    }
  };

  // Handle certificate download
  const handleCertificateDownload = async (certificateId, fileName) => {
    try {
      const response = await certificateAPI.downloadCertificate(certificateId);
      
      // Create blob URL and trigger download
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Certificate downloaded successfully');
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Failed to download certificate');
    }
  };

  // Get status badge styling
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <TrendingUp className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-600 font-medium">Loading your portfolio...</p>
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
            Welcome back, {user.profile?.name || user.name}
          </h1>
          <p className="text-gray-600">
            Manage your portfolio and track your investments
          </p>
        </div>

        {/* Portfolio Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Shares</p>
                <p className="text-2xl font-bold text-gray-900">
                  {portfolioData?.totalShares || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <PieChart className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Across all properties</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Portfolio Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(portfolioData?.totalValue)}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Current market value</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Investment</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(portfolioData?.totalInvestment)}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Original purchase amount</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Profit/Loss</p>
                <p className={`text-2xl font-bold ${
                  (portfolioData?.totalProfitLoss || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(portfolioData?.totalProfitLoss)}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                (portfolioData?.totalProfitLoss || 0) >= 0 ? 'bg-green-100' : 'bg-red-100'
              }`}>
                <TrendingUp className={`w-6 h-6 ${
                  (portfolioData?.totalProfitLoss || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                }`} />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {portfolioData?.averageReturn ? `${portfolioData.averageReturn.toFixed(1)}% return` : 'No data'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* My Shares Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                  My Shares Portfolio
                </h2>
              </div>
              <div className="p-6">
                {portfolioData?.shares && portfolioData.shares.length > 0 ? (
                  <div className="space-y-4">
                    {portfolioData.shares.map((share) => (
                      <div key={share._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-semibold text-gray-900">Share #{share._id.slice(-6)}</h3>
                            <p className="text-sm text-gray-600">
                              Purchased on {formatDate(share.purchaseDate)}
                            </p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            share.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {share.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Shares</p>
                            <p className="font-semibold">{share.numberOfShares}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Purchase Price</p>
                            <p className="font-semibold">{formatCurrency(share.purchasePrice)}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Current Price</p>
                            <p className="font-semibold">{formatCurrency(share.sharePrice)}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Current Value</p>
                            <p className="font-semibold">{formatCurrency(share.currentValue)}</p>
                          </div>
                        </div>

                        {share.profitLoss !== undefined && (
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-gray-600">Profit/Loss:</span>
                              <span className={`font-semibold ${
                                share.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {formatCurrency(share.profitLoss)}
                                {share.percentageReturn && (
                                  <span className="ml-1">
                                    ({share.percentageReturn.toFixed(1)}%)
                                  </span>
                                )}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <PieChart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No shares assigned yet</p>
                    <p className="text-sm text-gray-500 mt-1">Contact your director to assign shares</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar - Certificate Management */}
          <div className="space-y-6">
            {/* Certificate Upload */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <Upload className="w-5 h-5 mr-2 text-green-600" />
                  Upload Certificate
                </h2>
              </div>
              <div className="p-6">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 mb-2">Upload share certificate</p>
                  <p className="text-xs text-gray-500 mb-4">PDF or Image (max 10MB)</p>
                  <label className="relative cursor-pointer">
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleCertificateUpload}
                      disabled={uploadingCert}
                    />
                    <span className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${
                      uploadingCert 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-blue-600 hover:bg-blue-700'
                    } transition-colors`}>
                      {uploadingCert ? 'Uploading...' : 'Choose File'}
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Certificate Status Overview */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-purple-600" />
                  Certificate Status
                </h2>
              </div>
              <div className="p-6">
                {certificates.length > 0 ? (
                  <div className="space-y-3">
                    {certificates.slice(0, 5).map((cert) => {
                      const status = getStatusBadge(cert.status);
                      const StatusIcon = status.icon;
                      
                      return (
                        <div key={cert._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">
                              {cert.originalFileName}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatDate(cert.uploadedAt)}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2 ml-3">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${status.className}`}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {status.text}
                            </span>
                            {cert.status === 'approved' && (
                              <button
                                onClick={() => handleCertificateDownload(cert._id, cert.originalFileName)}
                                className="text-blue-600 hover:text-blue-800 transition-colors"
                                title="Download certificate"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    
                    {certificates.length > 5 && (
                      <div className="text-center pt-3 border-t border-gray-200">
                        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                          View all {certificates.length} certificates
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <FileText className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">No certificates uploaded</p>
                    <p className="text-xs text-gray-500 mt-1">Upload your first certificate above</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Pending Certificates</span>
                    <span className="font-semibold text-yellow-600">
                      {certificates.filter(c => c.status === 'pending').length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Approved Certificates</span>
                    <span className="font-semibold text-green-600">
                      {certificates.filter(c => c.status === 'approved').length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Active Properties</span>
                    <span className="font-semibold text-blue-600">
                      {portfolioData?.shares?.filter(s => s.isActive).length || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareholderDashboard;