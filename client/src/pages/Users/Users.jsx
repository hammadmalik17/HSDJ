import React from 'react';
import { Users as UsersIcon } from 'lucide-react';

const Users = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">Manage users and their permissions</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-8 text-center">
        <UsersIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Users Component</h3>
        <p className="text-gray-600">This page will show user management functionality for directors.</p>
      </div>
    </div>
  );
};

export default Users;