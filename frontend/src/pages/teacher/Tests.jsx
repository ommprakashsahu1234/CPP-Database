import { useState, useEffect } from 'react';
import api from '../../services/api';
import { FaPlus, FaEdit, FaTrash, FaEye } from 'react-icons/fa';

const Tests = () => {
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

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this test?')) return;
    
    try {
      await api.delete(`/teacher/tests/${id}`);
      fetchTests();
    } catch (error) {
      console.error('Failed to delete test:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Tests</h1>
        <button className="btn btn-primary flex items-center">
          <FaPlus className="mr-2" />
          Create Test
        </button>
      </div>

      <div className="grid gap-4">
        {tests.map((test) => (
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
                    <strong>Class:</strong> {test.class?.name}
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
                </div>
              </div>
              <div className="flex flex-col items-end ml-4">
                <span className={`px-3 py-1 text-xs rounded-full mb-2 ${
                  test.isPublished
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {test.isPublished ? 'Published' : 'Draft'}
                </span>
                <div className="flex space-x-2">
                  <button className="text-blue-600 hover:text-blue-800">
                    <FaEye />
                  </button>
                  <button className="text-green-600 hover:text-green-800">
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(test._id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {tests.length === 0 && (
          <div className="card text-center py-12">
            <p className="text-gray-600">No tests found. Create your first test!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Tests;
