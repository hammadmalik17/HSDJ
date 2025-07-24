import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Building, 
  LayoutDashboard, 
  Users, 
  TrendingUp, 
  FileText, 
  User, 
  Shield, 
  X,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      roles: ['visitor', 'shareholder', 'director', 'super_admin']
    },
    {
      name: 'Profile',
      href: '/profile',
      icon: User,
      roles: ['visitor', 'shareholder', 'director', 'super_admin']
    },
    {
      name: 'Shares',
      href: '/shares',
      icon: TrendingUp,
      roles: ['shareholder', 'director', 'super_admin']
    },
    {
      name: 'Certificates',
      href: '/certificates',
      icon: FileText,
      roles: ['shareholder', 'director', 'super_admin']
    },
    {
      name: 'Users',
      href: '/users',
      icon: Users,
      roles: ['director', 'super_admin']
    },
    {
      name: 'Audit Logs',
      href: '/audit',
      icon: Shield,
      roles: ['director', 'super_admin']
    }
  ];

  const filteredNavigation = navigationItems.filter(item => 
    item.roles.includes(user?.role)
  );

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'super_admin':
        return 'bg-red-100 text-red-800';
      case 'director':
        return 'bg-purple-100 text-purple-800';
      case 'shareholder':
        return 'bg-green-100 text-green-800';
      case 'visitor':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleDisplayName = (role) => {
    switch (role) {
      case 'super_admin':
        return 'Super Admin';
      case 'director':
        return 'Director';
      case 'shareholder':
        return 'Shareholder';
      case 'visitor':
        return 'Visitor';
      default:
        return role;
    }
  };

  return (
    <>
      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:inset-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center">
            <Building className="h-8 w-8 text-blue-600" />
            <span className="ml-2 text-xl font-semibold text-gray-900">RealEstate</span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* User Info */}
        {user && (
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                {user.profilePicture ? (
                  <img
                    className="h-10 w-10 rounded-full object-cover"
                    src={user.profilePicture}
                    alt={user.name}
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                    <span className="text-sm font-medium text-white">
                      {user.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user.name}
                </p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                  {getRoleDisplayName(user.role)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {filteredNavigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={() => onClose()}
                className={({ isActive }) => `
                  group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200
                  ${isActive 
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
              >
                {({ isActive }) => (
                  <>
                    <item.icon 
                      className={`mr-3 h-5 w-5 transition-colors duration-200 ${
                        isActive ? 'text-blue-700' : 'text-gray-400 group-hover:text-gray-500'
                      }`} 
                    />
                    <span className="flex-1">{item.name}</span>
                    {isActive && (
                      <ChevronRight className="h-4 w-4 text-blue-700" />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 w-full p-6 border-t border-gray-200">
          <div className="text-xs text-gray-500 text-center">
            <p>Real Estate Platform</p>
            <p className="mt-1">v1.0.0</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;