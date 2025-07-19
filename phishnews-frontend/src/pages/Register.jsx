import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register, error } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await register({
        email,
        password,
        preferences: {
          topics: [],
          sources: [],
          countries: []
        },
        bookmarks: [],
        liked_articles: []
      });
      navigate('/');
    } catch (err) {
      // Error is handled by the AuthContext
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto flex items-center justify-center min-h-[80vh]">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full">
        <h1 className="text-2xl font-bold mb-6 text-center text-cyan-600">Create an Account</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="text-sm font-semibold">Email</label>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-cyan-400"
            required
            disabled={loading}
          />
          <label className="text-sm font-semibold">Password</label>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-cyan-400"
            required
            disabled={loading}
          />
          <button 
            type="submit" 
            className="px-4 py-2 bg-cyan-400 text-white border border-cyan-700 rounded hover:bg-cyan-500 font-semibold mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#06b6d4' }}
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Register'}
          </button>
          {error && <div className="text-red-500 text-center">{error}</div>}
        </form>
      </div>
    </div>
  );
}
