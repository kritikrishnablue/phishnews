import { useEffect, useState } from 'react';
import NewsCard from '../components/NewsCard';
import { userAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FaBookmark, FaTrash } from 'react-icons/fa';

export default function Bookmarks() {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      loadBookmarks();
    }
  }, [isAuthenticated]);

  const loadBookmarks = async () => {
    try {
      setLoading(true);
      const data = await userAPI.getBookmarks();
      setBookmarks(data.bookmarks || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUnbookmark = async (article) => {
    try {
      await userAPI.unbookmarkArticle(article.url);
      setBookmarks(prev => prev.filter(b => b.url !== article.url));
    } catch (error) {
      console.error('Failed to remove bookmark:', error);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="p-4 max-w-4xl mx-auto">
        <div className="bg-yellow-900 border border-yellow-700 rounded-lg p-6 text-center">
          <FaBookmark className="text-3xl text-yellow-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-yellow-200 mb-2">Login Required</h2>
          <p className="text-yellow-100 mb-4">
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
            <h1 className="text-3xl font-bold text-white mb-2">Bookmarks</h1>
            <p className="text-gray-400">
              Your saved articles and reading list
            </p>
          </div>
          {bookmarks.length > 0 && (
            <button
              onClick={() => setBookmarks([])}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            >
              <FaTrash className="text-sm" />
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div>
        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500 mx-auto"></div>
            <p className="mt-2 text-gray-400">Loading bookmarks...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-900 border border-red-700 rounded-lg p-4 mb-4">
            <p className="text-red-200">Error: {error}</p>
          </div>
        )}

        {!loading && !error && bookmarks.length === 0 && (
          <div className="text-center py-8">
            <div className="bg-gray-800 rounded-lg p-6">
              <FaBookmark className="text-4xl text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-300 mb-2">No Bookmarks</h3>
              <p className="text-gray-400 mb-4">
                You haven't bookmarked any articles yet. Start reading and bookmark articles you want to save for later.
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

        {!loading && !error && bookmarks.length > 0 && (
          <div>
            <div className="mb-4 p-4 bg-blue-900 border border-blue-700 rounded-lg">
              <h3 className="font-semibold text-blue-200 mb-2">Your Bookmarks</h3>
              <p className="text-blue-100 text-sm">
                You have {bookmarks.length} bookmarked articles.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bookmarks.map(article => (
                <div key={article.url} className="relative">
                  <NewsCard
                    article={article}
                    showStatus={true}
                  />
                  <button
                    onClick={() => handleUnbookmark(article)}
                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors z-10"
                    title="Remove bookmark"
                  >
                    <FaTrash className="text-xs" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      {!loading && !error && bookmarks.length > 0 && (
        <div className="mt-8 p-4 bg-gray-800 rounded-lg">
          <h3 className="font-semibold mb-2 text-white">Bookmarks Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-300">
            <div>
              <span className="font-medium">Total Bookmarks:</span> {bookmarks.length}
            </div>
            <div>
              <span className="font-medium">Categories:</span> {
                [...new Set(bookmarks.map(b => b.category || 'general'))].length
              }
            </div>
            <div>
              <span className="font-medium">Sources:</span> {
                [...new Set(bookmarks.map(b => b.source?.name || 'Unknown'))].length
              }
            </div>
            <div>
              <span className="font-medium">Latest:</span> {
                bookmarks.length > 0 ? new Date(bookmarks[0].publishedAt || Date.now()).toLocaleDateString() : 'None'
              }
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
