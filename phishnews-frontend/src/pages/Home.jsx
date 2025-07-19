import { useEffect, useState } from 'react';
import NewsCard from '../components/NewsCard';
import Filters from '../components/Filters';
import { newsAPI, locationAPI } from '../services/api';
import { FaFire, FaGlobe, FaNewspaper, FaRss, FaChartLine } from 'react-icons/fa';

export default function Home() {
  const [filters, setFilters] = useState({ 
    country: 'us', 
    category: '', 
    source: 'all', 
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

  const tabs = [
    { id: 'headlines', label: 'Top Headlines', icon: FaNewspaper },
    { id: 'trending', label: 'Trending', icon: FaFire }
  ];

  const trendingTopics = [
    'Tech Layoffs', 'Climate Change', 'Space Exploration', 
    'Cryptocurrency', 'Remote Work', 'Healthcare AI'
  ];

  return (
    <div className="p-4 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white dark:text-white text-gray-900 mb-2">phish defense</h1>
        {userLocation && (
          <p className="text-gray-400 dark:text-gray-400 text-gray-600 flex items-center gap-2">
            <FaGlobe className="text-sm" />
            Detected location: {userLocation.country}, {userLocation.city}
          </p>
        )}
      </div>

      {/* Trending Topics */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <FaChartLine className="text-red-500 text-sm" />
          <span className="text-white dark:text-white text-gray-900 font-medium">Trending:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {trendingTopics.map((topic, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-gray-700 dark:bg-gray-700 bg-gray-200 text-gray-300 dark:text-gray-300 text-gray-700 rounded-full text-sm hover:bg-gray-600 dark:hover:bg-gray-600 hover:bg-gray-300 transition-colors cursor-pointer"
            >
              {topic}
            </span>
          ))}
        </div>
      </div>

      {/* Latest News Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white dark:text-white text-gray-900 mb-2">Latest News</h2>
        <p className="text-gray-400 dark:text-gray-400 text-gray-600">
          {articles.length} articles • AI-summarized for quick reading
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="border-b border-gray-700 dark:border-gray-700 border-gray-200">
          <nav className="flex space-x-8">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-cyan-500 text-cyan-400'
                    : 'border-transparent text-gray-400 dark:text-gray-400 text-gray-600 hover:text-gray-300 dark:hover:text-gray-300 hover:text-gray-800'
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
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-white dark:text-white text-gray-900">Filters</h2>
          </div>
          <Filters values={filters} onChange={setFilters} />
        </div>
      )}

      {/* Content */}
      <div>
        {activeTab === 'headlines' && (
          <div>
            {loading && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500 mx-auto"></div>
                <p className="mt-2 text-gray-400 dark:text-gray-400 text-gray-600">Loading news...</p>
              </div>
            )}
            {error && (
              <div className="bg-red-900 dark:bg-red-900 bg-red-100 border border-red-700 dark:border-red-700 border-red-300 rounded-lg p-4 mb-4">
                <p className="text-red-200 dark:text-red-200 text-red-800">Error: {error}</p>
              </div>
            )}
            {!loading && !error && articles.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-400 dark:text-gray-400 text-gray-600">No news found for the selected filters.</p>
              </div>
            )}
            {!loading && !error && articles.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
        )}

        {activeTab === 'trending' && (
          <div>
            {trendingLoading && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500 mx-auto"></div>
                <p className="mt-2 text-gray-400 dark:text-gray-400 text-gray-600">Loading trending articles...</p>
              </div>
            )}
            {!trendingLoading && trendingArticles.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-400 dark:text-gray-400 text-gray-600">No trending articles available.</p>
              </div>
            )}
            {!trendingLoading && trendingArticles.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {trendingArticles.map(article => (
                  <NewsCard
                    key={article.url || article.title}
                    article={article}
                    showStatus={true}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'rss' && (
          <div>
            <h2 className="text-2xl font-bold text-white dark:text-white text-gray-900 mb-4">RSS Feeds</h2>
            <div className="bg-blue-900 dark:bg-blue-900 bg-blue-100 border border-blue-700 dark:border-blue-700 border-blue-300 rounded-lg p-4">
              <p className="text-blue-200 dark:text-blue-200 text-blue-800">
                RSS feeds are automatically fetched and saved to the database. 
                You can view them in the search results or check the backend logs for RSS fetching activity.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      {!loading && !error && articles.length > 0 && (
        <div className="mt-8 p-4 bg-gray-800 dark:bg-gray-800 bg-gray-100 rounded-lg">
          <h3 className="font-semibold mb-2 text-white dark:text-white text-gray-900">News Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-300 dark:text-gray-300 text-gray-700">
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