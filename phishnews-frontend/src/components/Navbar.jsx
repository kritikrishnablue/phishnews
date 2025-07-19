import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/search', label: 'Search' },
  { to: '/personalized', label: 'Personalized' },
  { to: '/bookmarks', label: 'Bookmarks' },
  { to: '/profile', label: 'Profile' },
];

const authItems = [
  { to: '/login', label: 'Login' },
  { to: '/register', label: 'Register' },
];

export default function Navbar() {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow mb-4">
      <div className="container mx-auto px-4 py-2 flex gap-4 items-center">
        {/* Logo/Brand */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">N</span>
          </div>
          <span className="font-bold text-gray-800">NewsAggregator</span>
        </div>

        {/* Navigation Links */}
        <div className="flex gap-4 items-center">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `px-3 py-2 rounded hover:bg-gray-200 transition ${
                  isActive ? 'bg-blue-100 text-blue-700 font-semibold' : 'text-gray-700'
                }`
              }
              end={item.to === '/'}
            >
              {item.label}
            </NavLink>
          ))}
        </div>

        {/* Auth Section */}
        <div className="ml-auto flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <span className="text-sm text-gray-600">
                Welcome, {user?.email?.split('@')[0]}
              </span>
              <button
                onClick={handleLogout}
                className="px-3 py-2 bg-cyan-400 text-white rounded hover:bg-cyan-500 font-semibold border border-cyan-700"
                style={{ backgroundColor: '#06b6d4' }}
              >
                Logout
              </button>
            </>
          ) : (
            authItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `px-3 py-2 rounded hover:bg-gray-200 transition ${
                    isActive ? 'bg-blue-100 text-blue-700 font-semibold' : 'text-gray-700'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))
          )}
        </div>
      </div>
    </nav>
  );
} 