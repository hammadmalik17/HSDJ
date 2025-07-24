import axios from 'axios';
import { toast } from 'react-toastify';

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh and errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        // Try to refresh the token
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/refresh`,
          { refreshToken }
        );

        const { accessToken, refreshToken: newRefreshToken } = response.data.data;
        
        // Update stored tokens
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);
        
        // Update default header
        api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        
        // Retry original request
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
        
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        
        // Clear tokens and redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        delete api.defaults.headers.common['Authorization'];
        
        // Redirect to login page
        window.location.href = '/login';
        
        return Promise.reject(refreshError);
      }
    }

    // Handle other HTTP errors
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 403:
          toast.error('Access denied: Insufficient permissions');
          break;
        case 404:
          toast.error('Resource not found');
          break;
        case 422:
          if (data.errors) {
            data.errors.forEach(err => toast.error(err.msg));
          } else {
            toast.error(data.message || 'Validation error');
          }
          break;
        case 429:
          toast.error('Too many requests. Please try again later.');
          break;
        case 500:
          toast.error('Server error. Please try again later.');
          break;
        default:
          if (data?.message) {
            toast.error(data.message);
          }
      }
    } else if (error.request) {
      // Network error
      toast.error('Network error. Please check your connection.');
    }

    return Promise.reject(error);
  }
);

// API service functions
export const authAPI = {
  login: (credentials) => api.post('/api/auth/login', credentials),
  register: (userData) => api.post('/api/auth/register', userData),
  logout: () => api.post('/api/auth/logout'),
  refreshToken: (refreshToken) => api.post('/api/auth/refresh', { refreshToken }),
  setup2FA: () => api.post('/api/auth/setup-2fa'),
  verify2FA: (token) => api.post('/api/auth/verify-2fa', { token }),
  disable2FA: (password, twoFactorToken) => api.post('/api/auth/disable-2fa', { password, twoFactorToken }),
};

export const userAPI = {
  getProfile: () => api.get('/api/users/profile'),
  updateProfile: (data) => api.put('/api/users/profile', data),
  changePassword: (data) => api.put('/api/users/profile/password', data),
  uploadProfilePicture: (formData) => api.post('/api/users/profile/picture', formData),
  getUsers: (params) => api.get('/api/users', { params }),
  getUser: (userId) => api.get(`/api/users/${userId}`),
  createUser: (userData) => api.post('/api/users', userData),
  updateUser: (userId, userData) => api.put(`/api/users/${userId}`, userData),
  deleteUser: (userId, reason) => api.delete(`/api/users/${userId}`, { data: { reason } }),
  getDashboard: (userId) => api.get(`/api/users/${userId}/dashboard`),
};

export const shareAPI = {
  getShares: (params) => api.get('/api/shares', { params }),
  getShare: (shareId) => api.get(`/api/shares/${shareId}`),
  createShare: (shareData) => api.post('/api/shares', shareData),
  updateShare: (shareId, shareData) => api.put(`/api/shares/${shareId}`, shareData),
  updateShareValue: (shareId, data) => api.put(`/api/shares/${shareId}/value`, data),
  transferShare: (shareId, data) => api.put(`/api/shares/${shareId}/transfer`, data),
  deleteShare: (shareId, reason) => api.delete(`/api/shares/${shareId}`, { data: { reason } }),
  getPortfolio: (shareholderId) => api.get(`/api/shares/portfolio/${shareholderId}`),
  getShareHistory: (shareId) => api.get(`/api/shares/${shareId}/history`),
};

export const certificateAPI = {
  getCertificates: (params) => api.get('/api/certificates', { params }),
  getCertificate: (certificateId) => api.get(`/api/certificates/${certificateId}`),
  uploadCertificate: (formData) => api.post('/api/certificates/upload', formData),
  approveCertificate: (certificateId, notes) => api.put(`/api/certificates/${certificateId}/approve`, { notes }),
  rejectCertificate: (certificateId, reason) => api.put(`/api/certificates/${certificateId}/reject`, { reason }),
  bulkApprove: (shareholderId, notes) => api.put(`/api/certificates/bulk/approve/${shareholderId}`, { notes }),
  bulkReject: (shareholderId, reason) => api.put(`/api/certificates/bulk/reject/${shareholderId}`, { reason }),
  downloadCertificate: (certificateId) => api.get(`/api/certificates/${certificateId}/download`, { 
    responseType: 'blob' 
  }),
  deleteCertificate: (certificateId, reason) => api.delete(`/api/certificates/${certificateId}`, { 
    data: { reason } 
  }),
  getPendingStats: () => api.get('/api/certificates/stats/pending'),
};

export const auditAPI = {
  getLogs: (params) => api.get('/api/audit', { params }),
  getLog: (logId) => api.get(`/api/audit/${logId}`),
  getSecurityAlerts: (timeframe) => api.get('/api/audit/security-alerts', { params: { timeframe } }),
  getFailedLogins: (timeframe) => api.get('/api/audit/failed-logins', { params: { timeframe } }),
  getActivity: (userId, timeframe) => api.get(`/api/audit/activity/${userId}`, { params: { timeframe } }),
  getSuspiciousActivity: (timeframe) => api.get('/api/audit/suspicious-activity', { params: { timeframe } }),
  exportLogs: (params) => api.get('/api/audit/export', { params, responseType: 'blob' }),
  getStats: (timeframe) => api.get('/api/audit/stats', { params: { timeframe } }),
};

// Utility functions
export const downloadFile = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  window.URL.revokeObjectURL(url);
};

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateTime = (dateString) => {
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default api;