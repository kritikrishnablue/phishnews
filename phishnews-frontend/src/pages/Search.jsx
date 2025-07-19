import { useState } from 'react';
import NewsCard from '../components/NewsCard';
import Filters from '../components/Filters';
import { newsAPI } from '../services/api';
import { FaSearch, FaCalendar, FaFilter, FaDatabase } from 'react-icons/fa';

export default function Search() {
  const [filters, setFilters] = useState({ 
    country: 'us', 
    category: '', 
    source: 'newsapi', 
    q: '' 
  });
  const [searchParams, setSearchParams] = useState({
    keywords: '',
    start_date: '',
    end_date: '',
    source: 'newsapi',
    limit: 20
  });
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchMode, setSearchMode] = useState('filter'); // 'filter' or 'advanced'

  const handleFilterSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await newsAPI.getNews(filters);
      setArticles(data.articles || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAdvancedSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await newsAPI.searchNews(searchParams);
      setArticles(data.results || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setArticles([]);
    setError(null);
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Search News</h1>
        <p className="text-gray-600">
          Find news articles using filters or advanced search options
        </p>
      </div>

      {/* Search Mode Toggle */}
      <div className="mb-6">
        <div className="flex gap-4 border-b">
          <button
            onClick={() => setSearchMode('filter')}
            className={`px-4 py-2 font-medium transition-colors ${
              searchMode === 'filter'
                ? 'border-b-2 border-cyan-500 text-cyan-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <FaFilter className="inline mr-2" />
            Filter Search
          </button>
          <button
            onClick={() => setSearchMode('advanced')}
            className={`px-4 py-2 font-medium transition-colors ${
              searchMode === 'advanced'
                ? 'border-b-2 border-cyan-500 text-cyan-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <FaSearch className="inline mr-2" />
            Advanced Search
          </button>
        </div>
      </div>

      {/* Search Forms */}
      {searchMode === 'filter' && (
        <div className="mb-6">
          <form onSubmit={handleFilterSearch} className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Filter Search</h2>
              <button
                type="button"
                onClick={clearResults}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
              >
                Clear Results
              </button>
            </div>
        <Filters values={filters} onChange={setFilters} />
            <div className="flex gap-4">
              <button 
                type="submit" 
                className="px-6 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600 transition-colors flex items-center gap-2"
                disabled={loading}
              >
                <FaSearch className="text-sm" />
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </form>
        </div>
      )}

      {searchMode === 'advanced' && (
        <div className="mb-6">
          <form onSubmit={handleAdvancedSearch} className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Advanced Search</h2>
              <button
                type="button"
                onClick={clearResults}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
              >
                Clear Results
              </button>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Keywords</label>
                <input
                  type="text"
                  value={searchParams.keywords}
                  onChange={(e) => setSearchParams(prev => ({ ...prev, keywords: e.target.value }))}
                  placeholder="Enter search keywords..."
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold mb-1">Source</label>
                <select
                  value={searchParams.source}
                  onChange={(e) => setSearchParams(prev => ({ ...prev, source: e.target.value }))}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-cyan-400"
                >
                  <option value="newsapi">NewsAPI</option>
                  <option value="gnews">GNews</option>
                  <option value="mongo">Database</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold mb-1">Start Date</label>
                <input
                  type="date"
                  value={searchParams.start_date}
                  onChange={(e) => setSearchParams(prev => ({ ...prev, start_date: e.target.value }))}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold mb-1">End Date</label>
                <input
                  type="date"
                  value={searchParams.end_date}
                  onChange={(e) => setSearchParams(prev => ({ ...prev, end_date: e.target.value }))}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold mb-1">Limit</label>
                <select
                  value={searchParams.limit}
                  onChange={(e) => setSearchParams(prev => ({ ...prev, limit: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-cyan-400"
                >
                  <option value={10}>10 results</option>
                  <option value={20}>20 results</option>
                  <option value={50}>50 results</option>
                  <option value={100}>100 results</option>
                </select>
              </div>
            </div>
            
            <div className="flex gap-4">
              <button 
                type="submit" 
                className="px-6 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600 transition-colors flex items-center gap-2"
                disabled={loading}
              >
                <FaSearch className="text-sm" />
                {loading ? 'Searching...' : 'Advanced Search'}
              </button>
            </div>
      </form>
        </div>
      )}

      {/* Results */}
      <div>
        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500 mx-auto"></div>
            <p className="mt-2 text-gray-600">Searching...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-800">Error: {error}</p>
          </div>
        )}

        {!loading && !error && articles.length > 0 && (
          <div>
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">Search Results</h3>
              <p className="text-green-700 text-sm">
                Found {articles.length} articles matching your search criteria.
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

        {!loading && !error && articles.length === 0 && !loading && (
          <div className="text-center py-8">
            <FaSearch className="text-4xl text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No Results Found</h3>
            <p className="text-gray-500">
              Try adjusting your search criteria or using different keywords.
            </p>
          </div>
        )}
      </div>

      {/* Search Stats */}
      {!loading && !error && articles.length > 0 && (
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-2">Search Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium">Results:</span> {articles.length}
            </div>
            <div>
              <span className="font-medium">Mode:</span> {searchMode === 'filter' ? 'Filter' : 'Advanced'}
            </div>
            <div>
              <span className="font-medium">Source:</span> {searchMode === 'filter' ? filters.source : searchParams.source}
            </div>
            <div>
              <span className="font-medium">Keywords:</span> {searchMode === 'filter' ? filters.q || 'None' : searchParams.keywords || 'None'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
