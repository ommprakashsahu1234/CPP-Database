import { useState, useEffect } from 'react';
import api from '../../services/api';
import { FaDownload, FaEye } from 'react-icons/fa';

const Results = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const response = await api.get('/student/results');
      setResults(response.data.results || []);
    } catch (error) {
      console.error('Failed to fetch results:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">My Results</h1>

      <div className="card overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>Test Title</th>
              <th>Subject</th>
              <th>Date</th>
              <th>Marks Obtained</th>
              <th>Total Marks</th>
              <th>Percentage</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {results.map((result) => (
              <tr key={result._id} className="hover:bg-gray-50">
                <td className="font-medium">{result.test?.title}</td>
                <td>{result.test?.subject?.name}</td>
                <td>{new Date(result.test?.scheduledDate).toLocaleDateString()}</td>
                <td>{result.obtainedMarks}</td>
                <td>{result.totalMarks}</td>
                <td>{result.percentage.toFixed(2)}%</td>
                <td>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    result.isPassed
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {result.isPassed ? 'Passed' : 'Failed'}
                  </span>
                </td>
                <td>
                  <div className="flex space-x-2">
                    <button className="text-blue-600 hover:text-blue-800">
                      <FaEye />
                    </button>
                    <button className="text-green-600 hover:text-green-800">
                      <FaDownload />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {results.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No results found
          </div>
        )}
      </div>
    </div>
  );
};

export default Results;
