import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  User, 
  LogOut, 
  Settings, 
  Bell, 
  Menu, 
  X,
  BookOpen,
  Users,
  BarChart3,
  FileText
} from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getNavigationItems = () => {
    const baseItems = [
      { name: 'Dashboard', href: `/${user?.role}/dashboard`, icon: BarChart3 },
    ];

    switch (user?.role) {
      case 'admin':
        return [
          ...baseItems,
          { name: 'Users', href: '/admin/users', icon: Users },
          { name: 'Classes', href: '/admin/classes', icon: BookOpen },
          { name: 'Reports', href: '/admin/reports', icon: FileText },
          { name: 'Settings', href: '/admin/settings', icon: Settings },
        ];
      case 'teacher':
        return [
          ...baseItems,
          { name: 'Tests', href: '/teacher/tests', icon: FileText },
          { name: 'Students', href: '/teacher/students', icon: Users },
          { name: 'Groups', href: '/teacher/groups', icon: Users },
          { name: 'Reports', href: '/teacher/reports', icon: BarChart3 },
        ];
      case 'student':
        return [
          ...baseItems,
          { name: 'Tests', href: '/student/tests', icon: FileText },
          { name: 'Results', href: '/student/results', icon: BarChart3 },
          { name: 'Profile', href: '/student/profile', icon: User },
        ];
      default:
        return baseItems;
    }
  };

  const navigationItems = getNavigationItems();

  const isActive = (href) => {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  return (
    <nav className="bg-white shadow-soft border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Navigation */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to={`/${user?.role}/dashboard`} className="flex items-center">
                <BookOpen className="h-8 w-8 text-primary-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">
                  TestMS
                </span>
              </Link>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:ml-6 md:flex md:space-x-8">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200 ${
                      isActive(item.href)
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center">
            {/* Notifications */}
            <button className="p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-lg">
              <Bell className="h-5 w-5" />
            </button>

            {/* Profile dropdown */}
            <div className="ml-3 relative">
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center text-sm rounded-lg p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                  <User className="h-5 w-5 text-primary-600" />
                </div>
                <span className="ml-2 hidden md:block">
                  {user?.fullName || user?.firstName}
                </span>
              </button>

              {/* Profile dropdown menu */}
              {isProfileMenuOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-lg shadow-large bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="py-1">
                    <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                      <p className="font-medium">{user?.fullName}</p>
                      <p className="text-gray-500 capitalize">{user?.role}</p>
                    </div>
                    <Link
                      to="/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <User className="h-4 w-4 mr-3" />
                      Profile
                    </Link>
                    <Link
                      to="/settings"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <Settings className="h-4 w-4 mr-3" />
                      Settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <LogOut className="h-4 w-4 mr-3" />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden ml-2">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                {isMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="pt-2 pb-3 space-y-1 bg-white border-t border-gray-200">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center pl-3 pr-4 py-2 text-base font-medium transition-colors duration-200 ${
                    isActive(item.href)
                      ? 'bg-primary-50 border-r-4 border-primary-500 text-primary-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Click outside to close profile menu */}
      {isProfileMenuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsProfileMenuOpen(false)}
        />
      )}
    </nav>
  );
};

export default Navbar;