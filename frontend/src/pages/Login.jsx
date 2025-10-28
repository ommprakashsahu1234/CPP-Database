import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('password');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-indigo-50 to-white">
      <form onSubmit={onSubmit} className="w-full max-w-sm bg-white p-6 rounded-xl shadow">
        <h1 className="text-2xl font-semibold mb-4 text-indigo-700">TMS Login</h1>
        <label className="block text-sm font-medium mb-1">Email</label>
        <input className="w-full border rounded px-3 py-2 mb-3" value={email} onChange={(e) => setEmail(e.target.value)} />
        <label className="block text-sm font-medium mb-1">Password</label>
        <input type="password" className="w-full border rounded px-3 py-2 mb-4" value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
        <button disabled={loading} className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 disabled:opacity-60">
          {loading ? 'Signing in…' : 'Sign In'}
        </button>
      </form>
    </div>
  );
}
