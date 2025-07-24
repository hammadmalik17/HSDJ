import React from 'react';
import { TrendingUp } from 'lucide-react';

const Shares = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Shares</h1>
          <p className="text-gray-600">Manage your share portfolio</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-8 text-center">
        <TrendingUp className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Shares Component</h3>
        <p className="text-gray-600">This page will show share portfolio management functionality.</p>
      </div>
    </div>
  );
};

export default Shares;