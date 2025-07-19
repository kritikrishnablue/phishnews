import { useEffect, useState } from 'react';
import NewsCard from '../components/NewsCard';
import Filters from '../components/Filters';
import { newsAPI, locationAPI } from '../services/api';
import { FaFire, FaGlobe, FaNewspaper, FaRss } from 'react-icons/fa';

export default function Home() {
  const [filters, setFilters] = useState({ 
    country: 'us', 
    category: '', 
    source: 'newsapi', 
    q: '' 
  });
  const [articles, setArticles] = useState([]);
  const [trendingArticles, setTrendingArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trendingLoading, setTrendingLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [activeTab, setActiveTab] = useState('headlines');

  // Load user location on component mount
  useEffect(() => {
    loadUserLocation();
  }, []);

  // Load trending articles
  useEffect(() => {
    loadTrendingArticles();
  }, []);

  // Fetch news when filters change
  useEffect(() => {
    if (activeTab === 'headlines') {
      fetchNews(filters);
    }
  }, [filters, activeTab]);

  const loadUserLocation = async () => {
    try {
      const locationData = await locationAPI.getLocation();
      setUserLocation(locationData.location);
      // Auto-set country based on user location
      if (locationData.location?.country_code) {
        setFilters(prev => ({
          ...prev,
          country: locationData.location.country_code.toLowerCase()
        }));
      }
    } catch (error) {
      console.log('Could not detect user location');
    }
  };

  const loadTrendingArticles = async () => {
    setTrendingLoading(true);
    try {
      const data = await newsAPI.getTrending();
      setTrendingArticles(data.trending || []);
    } catch (error) {
      console.error('Failed to load trending articles:', error);
    } finally {
      setTrendingLoading(false);
    }
  };

  const fetchNews = async (params) => {
    setLoading(true);
    setError(null);
    try {
      const data = await newsAPI.getNews(params);
      setArticles(data.articles || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'trending') {
      loadTrendingArticles();
    }
  };

  const handleSaveNews = async () => {
    try {
      await newsAPI.saveNews(filters);
      alert('News saved to database successfully!');
    } catch (error) {
      alert('Failed to save news: ' + error.message);
    }
  };

  const tabs = [
    { id: 'headlines', label: 'Top Headlines', icon: FaNewspaper },
    { id: 'trending', label: 'Trending', icon: FaFire },
    { id: 'rss', label: 'RSS Feeds', icon: FaRss }
  ];

  return (
    <div className="p-4 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">News Aggregator</h1>
        {userLocation && (
          <p className="text-gray-600 flex items-center gap-2">
            <FaGlobe className="text-sm" />
            Detected location: {userLocation.country}, {userLocation.city}
          </p>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-cyan-500 text-cyan-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="text-sm" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Filters - Only show for headlines tab */}
      {activeTab === 'headlines' && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Filters</h2>
            <button
              onClick={handleSaveNews}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
            >
              Save to Database
            </button>
          </div>
      <Filters values={filters} onChange={setFilters} />
        </div>
      )}

      {/* Content */}
      <div>
        {activeTab === 'headlines' && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Top Headlines</h2>
            {loading && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading news...</p>
              </div>
            )}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-red-800">Error: {error}</p>
              </div>
            )}
            {!loading && !error && articles.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No news found for the selected filters.</p>
              </div>
            )}
            {!loading && !error && articles.map(article => (
              <NewsCard
                key={article.url || article.title}
                article={article}
                showStatus={true}
              />
            ))}
          </div>
        )}

        {activeTab === 'trending' && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Trending Articles</h2>
            {trendingLoading && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading trending articles...</p>
              </div>
            )}
            {!trendingLoading && trendingArticles.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No trending articles available.</p>
              </div>
            )}
            {!trendingLoading && trendingArticles.map(article => (
        <NewsCard
          key={article.url || article.title}
          article={article}
                showStatus={true}
        />
      ))}
          </div>
        )}

        {activeTab === 'rss' && (
          <div>
            <h2 className="text-2xl font-bold mb-4">RSS Feeds</h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800">
                RSS feeds are automatically fetched and saved to the database. 
                You can view them in the search results or check the backend logs for RSS fetching activity.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      {!loading && !error && articles.length > 0 && (
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-2">News Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium">Total Articles:</span> {articles.length}
            </div>
            <div>
              <span className="font-medium">Country:</span> {filters.country.toUpperCase()}
            </div>
            <div>
              <span className="font-medium">Source:</span> {filters.source}
            </div>
            <div>
              <span className="font-medium">Category:</span> {filters.category || 'All'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}