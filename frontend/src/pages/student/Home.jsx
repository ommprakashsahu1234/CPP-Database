import { useState, useEffect } from 'react';
import api from '../../services/api';
import { FaClipboardCheck, FaCheckCircle, FaTimesCircle, FaPercentage } from 'react-icons/fa';

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
  const [analytics, setAnalytics] = useState(null);
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [analyticsRes, testsRes] = await Promise.all([
        api.get('/student/analytics'),
        api.get('/student/tests')
      ]);
      setAnalytics(analyticsRes.data.analytics);
      setTests(testsRes.data.tests || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Student Dashboard</h1>
      
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={FaClipboardCheck}
            label="Tests Taken"
            value={analytics.totalTests}
            color="text-blue-600"
          />
          <StatCard
            icon={FaCheckCircle}
            label="Tests Passed"
            value={analytics.passedTests}
            color="text-green-600"
          />
          <StatCard
            icon={FaTimesCircle}
            label="Tests Failed"
            value={analytics.failedTests}
            color="text-red-600"
          />
          <StatCard
            icon={FaPercentage}
            label="Average Score"
            value={`${analytics.averagePercentage}%`}
            color="text-purple-600"
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Upcoming Tests</h2>
          {tests.slice(0, 5).map((test) => (
            <div key={test._id} className="flex justify-between items-center py-2 border-b last:border-b-0">
              <div>
                <p className="font-medium">{test.title}</p>
                <p className="text-sm text-gray-600">{test.subject?.name}</p>
              </div>
              <span className="text-sm text-gray-500">
                {new Date(test.scheduledDate).toLocaleDateString()}
              </span>
            </div>
          ))}
          {tests.length === 0 && (
            <p className="text-gray-600">No upcoming tests</p>
          )}
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Recent Results</h2>
          {analytics?.recentResults?.map((result) => (
            <div key={result._id} className="flex justify-between items-center py-2 border-b last:border-b-0">
              <div>
                <p className="font-medium">{result.test?.title}</p>
                <p className="text-sm text-gray-600">
                  {result.obtainedMarks}/{result.totalMarks}
                </p>
              </div>
              <span className={`px-2 py-1 text-xs rounded-full ${
                result.isPassed
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {result.isPassed ? 'Passed' : 'Failed'}
              </span>
            </div>
          ))}
          {!analytics?.recentResults?.length && (
            <p className="text-gray-600">No results yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
