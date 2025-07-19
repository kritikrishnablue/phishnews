import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { FaShieldAlt, FaSun, FaMoon, FaBell, FaBookmark, FaCog, FaUser, FaSearch } from 'react-icons/fa';

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/categories', label: 'Categories' },
  { to: '/personalized', label: 'Trending' },
  { to: '/bookmarks', label: 'Saved' },
];

const authItems = [
  { to: '/login', label: 'Login' },
  { to: '/register', label: 'Register' },
];

export default function Navbar() {
  const { isAuthenticated, logout, user } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-gray-900 dark:bg-gray-900 bg-white shadow-lg border-b border-gray-700 dark:border-gray-700 border-gray-200 transition-colors duration-200">
      <div className="container mx-auto px-6 py-4 flex gap-6 items-center">
        {/* Logo/Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-cyan-500 rounded-full flex items-center justify-center">
            <FaShieldAlt className="text-white text-lg" />
          </div>
          <span className="font-bold text-white dark:text-white text-gray-900 text-xl">phish defense</span>
        </div>

        {/* Navigation Links */}
        <div className="flex gap-6 items-center">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `px-3 py-2 rounded transition-colors ${
                  isActive 
                    ? 'text-cyan-400 font-semibold' 
                    : 'text-gray-300 dark:text-gray-300 text-gray-700 hover:text-white dark:hover:text-white hover:text-gray-900'
                }`
              }
              end={item.to === '/'}
            >
              {item.label}
            </NavLink>
          ))}
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-md mx-6">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
            <input
              type="text"
              placeholder="Search news..."
              className="w-full pl-10 pr-4 py-2 bg-gray-800 dark:bg-gray-800 bg-gray-100 border border-gray-600 dark:border-gray-600 border-gray-300 rounded-lg text-white dark:text-white text-gray-900 placeholder-gray-400 dark:placeholder-gray-400 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-colors duration-200"
            />
          </div>
        </div>

        {/* Right Side Icons */}
        <div className="flex items-center gap-4">
          {/* Theme Toggle */}
          <button 
            onClick={toggleTheme}
            className="p-2 text-gray-400 dark:text-gray-400 text-gray-600 hover:text-white dark:hover:text-white hover:text-gray-900 transition-colors duration-200"
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? <FaSun className="text-sm" /> : <FaMoon className="text-sm" />}
          </button>
          
          <button className="p-2 text-gray-400 dark:text-gray-400 text-gray-600 hover:text-white dark:hover:text-white hover:text-gray-900 transition-colors duration-200">
            <FaBell className="text-sm" />
          </button>
          <button className="p-2 text-gray-400 dark:text-gray-400 text-gray-600 hover:text-white dark:hover:text-white hover:text-gray-900 transition-colors duration-200">
            <FaBookmark className="text-sm" />
          </button>
          <NavLink
            to="/settings"
            className="p-2 text-gray-400 dark:text-gray-400 text-gray-600 hover:text-white dark:hover:text-white hover:text-gray-900 transition-colors duration-200"
            title="Settings"
          >
            <FaCog className="text-sm" />
          </NavLink>
          
          {/* Auth Section */}
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-300 dark:text-gray-300 text-gray-700">
                {user?.email?.split('@')[0]}
              </span>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-400 dark:text-gray-400 text-gray-600 hover:text-white dark:hover:text-white hover:text-gray-900 transition-colors duration-200"
              >
                <FaUser className="text-sm" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              {authItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className="px-3 py-2 text-gray-300 dark:text-gray-300 text-gray-700 hover:text-white dark:hover:text-white hover:text-gray-900 transition-colors duration-200"
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
} 