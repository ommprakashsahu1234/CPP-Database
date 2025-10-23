import { useAuth } from '../../contexts/AuthContext.jsx';

export default function TeacherDashboard() {
  const { user, logout } = useAuth();
  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Teacher Dashboard</h1>
        <button onClick={logout} className="px-3 py-1 bg-gray-800 text-white rounded">Logout</button>
      </div>
      <p className="mt-3">Welcome, {user?.name}</p>
    </div>
  );
}
