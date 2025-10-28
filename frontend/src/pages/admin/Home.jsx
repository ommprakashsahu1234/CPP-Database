import { useState, useEffect } from 'react';
import api from '../../services/api';
import { FaUsers, FaChalkboardTeacher, FaUserGraduate, FaBook } from 'react-icons/fa';

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="card">
    <div className="flex items-center">
      <div className={`p-3 rounded-full ${color} bg-opacity-10`}>
        <Icon className={`text-2xl ${color}`} />
      </div>
      <div className="ml-4">
        <p className="text-sm text-gray-600">{label}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  </div>
);

const Home = () => {
  const [stats, setStats] = useState({
    teachers: 0,
    students: 0,
    classes: 0,
    subjects: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [teachers, students] = await Promise.all([
        api.get('/admin/teachers'),
        api.get('/admin/students')
      ]);

      setStats({
        teachers: teachers.data.teachers?.length || 0,
        students: students.data.students?.length || 0,
        classes: 0,
        subjects: 0
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={FaChalkboardTeacher}
          label="Total Teachers"
          value={stats.teachers}
          color="text-blue-600"
        />
        <StatCard
          icon={FaUserGraduate}
          label="Total Students"
          value={stats.students}
          color="text-green-600"
        />
        <StatCard
          icon={FaBook}
          label="Total Classes"
          value={stats.classes}
          color="text-purple-600"
        />
        <StatCard
          icon={FaUsers}
          label="Total Subjects"
          value={stats.subjects}
          color="text-orange-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <p className="text-gray-600">No recent activity</p>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-2">
            <button className="btn btn-primary w-full">Add New Teacher</button>
            <button className="btn btn-primary w-full">Add New Student</button>
            <button className="btn btn-primary w-full">Create Class</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
