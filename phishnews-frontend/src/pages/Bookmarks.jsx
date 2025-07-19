import { useEffect, useState } from 'react';
import NewsCard from '../components/NewsCard';
import { userAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FaBookmark, FaTrash, FaUser } from 'react-icons/fa';

export default function Bookmarks() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      loadBookmarks();
    }
  }, [isAuthenticated]);

  const loadBookmarks = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await userAPI.getBookmarks();
      setArticles(data.bookmarks || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUnbookmark = async (article) => {
    try {
      await userAPI.unbookmarkArticle(article.url || article.id);
      // Remove from local state
      setArticles(prev => prev.filter(a => (a.url || a.id) !== (article.url || article.id)));
    } catch (error) {
      console.error('Failed to unbookmark article:', error);
      alert('Failed to remove bookmark');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="p-4 max-w-4xl mx-auto">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <FaUser className="text-3xl text-yellow-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-yellow-800 mb-2">Login Required</h2>
          <p className="text-yellow-700 mb-4">
            Please login to view your bookmarked articles.
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Bookmarked Articles</h1>
            <p className="text-gray-600">
              Your saved articles for later reading
            </p>
          </div>
          {articles.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <FaBookmark className="text-cyan-500" />
              <span>{articles.length} bookmarks</span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div>
        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading bookmarks...</p>
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
              <FaBookmark className="text-4xl text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No Bookmarks Yet</h3>
              <p className="text-gray-500 mb-4">
                You haven't bookmarked any articles yet. Start browsing news and bookmark articles you want to read later.
              </p>
              <a 
                href="/" 
                className="inline-block px-4 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600 transition-colors"
              >
                Browse News
              </a>
            </div>
          </div>
        )}

        {!loading && !error && articles.length > 0 && (
          <div>
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">Your Bookmarks</h3>
              <p className="text-blue-700 text-sm">
                You have {articles.length} bookmarked article{articles.length !== 1 ? 's' : ''}.
              </p>
            </div>
            
            {articles.map(article => (
              <div key={article.url || article.title} className="relative">
                <NewsCard
                  article={article}
                  showStatus={false}
                />
                <button
                  onClick={() => handleUnbookmark(article)}
                  className="absolute top-4 right-4 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  title="Remove bookmark"
                >
                  <FaTrash className="text-sm" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Stats */}
      {!loading && !error && articles.length > 0 && (
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-2">Bookmarks Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium">Total Bookmarks:</span> {articles.length}
            </div>
            <div>
              <span className="font-medium">Sources:</span> {
                [...new Set(articles.map(a => a.source?.name || 'Unknown'))].join(', ')
              }
            </div>
            <div>
              <span className="font-medium">Oldest:</span> {
                articles.length > 0 
                  ? new Date(Math.min(...articles.map(a => new Date(a.publishedAt || Date.now())))).toLocaleDateString() 
                  : 'N/A'
              }
            </div>
            <div>
              <span className="font-medium">Newest:</span> {
                articles.length > 0 
                  ? new Date(Math.max(...articles.map(a => new Date(a.publishedAt || Date.now())))).toLocaleDateString() 
                  : 'N/A'
              }
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
