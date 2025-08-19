// client/src/components/Dashboard/Dashboard.jsx - ROUTER VERSION
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import ShareholderDashboard from './ShareholderDashboard';
import DirectorDashboard from './DirectorDashboard';

const Dashboard = () => {
  const { user } = useAuth();

  // Route to appropriate dashboard based on user role
  switch (user?.role) {
    case 'shareholder':
      return <ShareholderDashboard />;
    
    case 'director':
    case 'super_admin':
      return <DirectorDashboard />;
    
    case 'visitor':
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Access Restricted
            </h1>
            <p className="text-gray-600">
              Please contact an administrator to upgrade your account.
            </p>
          </div>
        </div>
      );
    
    default:
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Unknown User Role
            </h1>
            <p className="text-gray-600">
              Please contact support for assistance.
            </p>
          </div>
        </div>
      );
  }
};

export default Dashboard;