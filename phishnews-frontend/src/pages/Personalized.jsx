import { useEffect, useState } from 'react';
import NewsCard from '../components/NewsCard';
import { newsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FaUser, FaCog, FaFilter } from 'react-icons/fa';

export default function Personalized() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [source, setSource] = useState('newsapi');
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      loadPersonalizedNews();
    }
  }, [isAuthenticated, source]);

  const loadPersonalizedNews = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await newsAPI.getPersonalized(source);
      setArticles(data.articles || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="p-4 max-w-4xl mx-auto">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <FaUser className="text-3xl text-yellow-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-yellow-800 mb-2">Login Required</h2>
          <p className="text-yellow-700 mb-4">
            Please login to view your personalized news feed based on your preferences and reading history.
          </p>
          <a 
            href="/login" 
            className="inline-block px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Personalized News</h1>
            <p className="text-gray-600">
              News tailored to your preferences and reading history
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <FaFilter className="text-gray-500" />
              <select
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-cyan-400"
              >
                <option value="newsapi">NewsAPI</option>
                <option value="gnews">GNews</option>
              </select>
            </div>
            <a 
              href="/profile" 
              className="flex items-center gap-2 px-4 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600 transition-colors"
            >
              <FaCog className="text-sm" />
              Manage Preferences
            </a>
          </div>
        </div>
      </div>

      {/* Content */}
      <div>
        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading personalized news...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-800">Error: {error}</p>
          </div>
        )}

        {!loading && !error && articles.length === 0 && (
          <div className="text-center py-8">
            <div className="bg-gray-50 rounded-lg p-6">
              <FaUser className="text-4xl text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No Personalized News</h3>
              <p className="text-gray-500 mb-4">
                We couldn't find personalized news for you. This might be because:
              </p>
              <ul className="text-left text-gray-500 space-y-1 mb-4">
                <li>• You haven't set any preferences yet</li>
                <li>• You haven't liked or bookmarked any articles</li>
                <li>• Your reading history is empty</li>
              </ul>
              <a 
                href="/profile" 
                className="inline-block px-4 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600 transition-colors"
              >
                Set Your Preferences
              </a>
            </div>
          </div>
        )}

        {!loading && !error && articles.length > 0 && (
          <div>
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">Your Personalized Feed</h3>
              <p className="text-blue-700 text-sm">
                Showing {articles.length} articles based on your preferences, reading history, and engagement.
              </p>
            </div>
            
            {articles.map(article => (
              <NewsCard
                key={article.url || article.title}
                article={article}
                showStatus={true}
              />
            ))}
          </div>
        )}
      </div>

      {/* Stats */}
      {!loading && !error && articles.length > 0 && (
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-2">Personalization Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium">Total Articles:</span> {articles.length}
            </div>
            <div>
              <span className="font-medium">Source:</span> {source}
            </div>
            <div>
              <span className="font-medium">Recommended:</span> {
                articles.filter(a => a.status === 'Recommended').length
              }
            </div>
            <div>
              <span className="font-medium">Read:</span> {
                articles.filter(a => a.status === 'Read').length
              }
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
