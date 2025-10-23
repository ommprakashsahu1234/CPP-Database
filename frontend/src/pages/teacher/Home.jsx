import { useState, useEffect } from 'react';
import api from '../../services/api';
import { FaClipboardList, FaUsers, FaCheckCircle, FaClock } from 'react-icons/fa';

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
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      const response = await api.get('/teacher/tests');
      setTests(response.data.tests || []);
    } catch (error) {
      console.error('Failed to fetch tests:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    totalTests: tests.length,
    activeTests: tests.filter(t => t.isActive).length,
    completedTests: tests.filter(t => !t.isActive && t.isPublished).length,
    upcomingTests: tests.filter(t => new Date(t.scheduledDate) > new Date()).length
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Teacher Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={FaClipboardList}
          label="Total Tests"
          value={stats.totalTests}
          color="text-blue-600"
        />
        <StatCard
          icon={FaCheckCircle}
          label="Active Tests"
          value={stats.activeTests}
          color="text-green-600"
        />
        <StatCard
          icon={FaClock}
          label="Upcoming Tests"
          value={stats.upcomingTests}
          color="text-orange-600"
        />
        <StatCard
          icon={FaUsers}
          label="Completed Tests"
          value={stats.completedTests}
          color="text-purple-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Recent Tests</h2>
          {tests.slice(0, 5).map((test) => (
            <div key={test._id} className="flex justify-between items-center py-2 border-b last:border-b-0">
              <div>
                <p className="font-medium">{test.title}</p>
                <p className="text-sm text-gray-600">{test.subject?.name}</p>
              </div>
              <span className={`px-2 py-1 text-xs rounded-full ${
                test.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {test.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          ))}
          {tests.length === 0 && (
            <p className="text-gray-600">No tests created yet</p>
          )}
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-2">
            <button className="btn btn-primary w-full">Create New Test</button>
            <button className="btn btn-primary w-full">Create Student Group</button>
            <button className="btn btn-primary w-full">View Reports</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
