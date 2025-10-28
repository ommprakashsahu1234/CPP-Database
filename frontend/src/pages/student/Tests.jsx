import { useState, useEffect } from 'react';
import api from '../../services/api';
import { FaPlay, FaClock } from 'react-icons/fa';

const Tests = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      const response = await api.get('/student/tests');
      setTests(response.data.tests || []);
    } catch (error) {
      console.error('Failed to fetch tests:', error);
    } finally {
      setLoading(false);
    }
  };

  const isTestAvailable = (test) => {
    const now = new Date();
    const startTime = new Date(test.startTime);
    const endTime = new Date(startTime.getTime() + test.duration * 60000);
    return now >= startTime && now <= endTime;
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Available Tests</h1>

      <div className="grid gap-4">
        {tests.map((test) => {
          const available = isTestAvailable(test);
          
          return (
            <div key={test._id} className="card">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">{test.title}</h3>
                  <p className="text-gray-600 mt-1">{test.description}</p>
                  <div className="flex flex-wrap gap-4 mt-3 text-sm">
                    <span className="text-gray-600">
                      <strong>Subject:</strong> {test.subject?.name}
                    </span>
                    <span className="text-gray-600">
                      <strong>Date:</strong> {new Date(test.scheduledDate).toLocaleDateString()}
                    </span>
                    <span className="text-gray-600">
                      <strong>Duration:</strong> {test.duration} mins
                    </span>
                    <span className="text-gray-600">
                      <strong>Total Marks:</strong> {test.totalMarks}
                    </span>
                    <span className="text-gray-600">
                      <strong>Passing Marks:</strong> {test.passingMarks}
                    </span>
                  </div>
                </div>
                <div className="ml-4">
                  {available ? (
                    <button className="btn btn-success flex items-center">
                      <FaPlay className="mr-2" />
                      Start Test
                    </button>
                  ) : (
                    <button className="btn btn-secondary flex items-center cursor-not-allowed" disabled>
                      <FaClock className="mr-2" />
                      Not Available
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {tests.length === 0 && (
          <div className="card text-center py-12">
            <p className="text-gray-600">No tests available at the moment</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Tests;
