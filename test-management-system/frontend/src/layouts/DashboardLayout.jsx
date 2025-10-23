import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import { useAuth } from '../contexts/AuthContext';

const DashboardLayout = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="flex-1">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;