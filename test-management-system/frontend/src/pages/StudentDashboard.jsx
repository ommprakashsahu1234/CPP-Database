import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const StudentDashboard = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user?.firstName}!</p>
            </div>
            <button onClick={handleLogout} className="btn-danger">
              Logout
            </button>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="card">
            <div className="card-body">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Coming Soon</h2>
              <p className="text-gray-600">Student dashboard features will be implemented soon.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;
