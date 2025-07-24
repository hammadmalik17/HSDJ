import React from 'react';
import { Shield } from 'lucide-react';

const AuditLogs = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
          <p className="text-gray-600">View system activity and security logs</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-8 text-center">
        <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Audit Logs Component</h3>
        <p className="text-gray-600">This page will show audit logs and security monitoring.</p>
      </div>
    </div>
  );
};

export default AuditLogs;