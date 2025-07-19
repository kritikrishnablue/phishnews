import { useState, useEffect } from 'react';
import { FaFire, FaShieldAlt, FaDesktop, FaHeart, FaHome, FaBuilding, FaGlobe, FaNewspaper, FaChartLine, FaFlask, FaGamepad, FaMusic, FaCar, FaPlane } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    // Simulate loading categories
    setTimeout(() => {
      setCategories([
        {
          id: 'all',
          title: 'All News',
          description: 'Latest news from all categories, curated by AI for comprehensive coverage.',
          icon: FaHome,
          articleCount: 1247,
          trending: false,
          color: 'bg-gray-500'
        },
        {
          id: 'cybersecurity',
          title: 'Cybersecurity',
          description: 'Latest threats, security breaches, and defense strategies in the digital world.',
          icon: FaShieldAlt,
          articleCount: 342,
          trending: true,
          color: 'bg-red-500'
        },
        {
          id: 'technology',
          title: 'Technology',
          description: 'Innovation, startups, and breakthrough technologies shaping our future.',
          icon: FaDesktop,
          articleCount: 567,
          trending: true,
          color: 'bg-blue-500'
        },
        {
          id: 'health',
          title: 'Health',
          description: 'Medical advances, health tips, and wellness trends for better living.',
          icon: FaHeart,
          articleCount: 234,
          trending: true,
          color: 'bg-pink-500'
        },
        {
          id: 'business',
          title: 'Business',
          description: 'Market trends, corporate news, and economic developments worldwide.',
          icon: FaBuilding,
          articleCount: 423,
          trending: false,
          color: 'bg-green-500'
        },
        {
          id: 'politics',
          title: 'Politics',
          description: 'Political developments, policy changes, and government affairs.',
          icon: FaGlobe,
          articleCount: 189,
          trending: false,
          color: 'bg-purple-500'
        },
        {
          id: 'science',
          title: 'Science',
          description: 'Scientific discoveries, research breakthroughs, and academic insights.',
          icon: FaFlask,
          articleCount: 156,
          trending: false,
          color: 'bg-indigo-500'
        },
        {
          id: 'sports',
          title: 'Sports',
          description: 'Athletic events, team updates, and sports industry news.',
          icon: FaGamepad,
          articleCount: 298,
          trending: false,
          color: 'bg-orange-500'
        },
        {
          id: 'entertainment',
          title: 'Entertainment',
          description: 'Movies, music, celebrity news, and cultural events.',
          icon: FaMusic,
          articleCount: 312,
          trending: false,
          color: 'bg-yellow-500'
        },
        {
          id: 'automotive',
          title: 'Automotive',
          description: 'Car industry news, electric vehicles, and transportation technology.',
          icon: FaCar,
          articleCount: 145,
          trending: false,
          color: 'bg-gray-600'
        },
        {
          id: 'travel',
          title: 'Travel',
          description: 'Travel industry updates, destination guides, and tourism trends.',
          icon: FaPlane,
          articleCount: 178,
          trending: false,
          color: 'bg-teal-500'
        }
      ]);
      setLoading(false);
    }, 1000);
  };

  const handleCategoryClick = (categoryId) => {
    // Navigate to search page with category filter
    navigate('/search', { 
      state: { 
        category: categoryId,
        source: 'all'
      }
    });
  };

  const trendingCategories = categories.filter(cat => cat.trending);
  const allCategories = categories;

  if (loading) {
    return (
      <div className="p-4 max-w-6xl mx-auto">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500 mx-auto"></div>
          <p className="mt-2 text-gray-400">Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Categories</h1>
        <p className="text-gray-400">
          Explore news by category and discover trending topics
        </p>
      </div>

      {/* Trending Categories */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-6">
          <FaFire className="text-orange-500 text-lg" />
          <h2 className="text-2xl font-bold text-white">Trending Categories</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trendingCategories.map((category) => (
            <CategoryCard 
              key={category.id} 
              category={category} 
              onClick={() => handleCategoryClick(category.id)}
            />
          ))}
        </div>
      </div>

      {/* All Categories */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">All Categories</h2>
          <span className="text-gray-400 text-sm">{allCategories.length} categories available</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {allCategories.map((category) => (
            <CategoryCard 
              key={category.id} 
              category={category} 
              onClick={() => handleCategoryClick(category.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function CategoryCard({ category, onClick }) {
  const IconComponent = category.icon;
  
  return (
    <div 
      className="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition-colors cursor-pointer border border-gray-700 hover:border-gray-600"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 ${category.color} rounded-lg flex items-center justify-center`}>
          <IconComponent className="text-white text-xl" />
        </div>
        {category.trending && (
          <div className="flex items-center gap-1 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
            <FaFire className="text-xs" />
            Trending
          </div>
        )}
      </div>
      
      <h3 className="text-white font-bold text-lg mb-2">{category.title}</h3>
      <p className="text-gray-400 text-sm mb-4 line-clamp-2">
        {category.description}
      </p>
      
      <div className="flex items-center justify-between">
        <span className="text-gray-500 text-sm">{category.articleCount} articles</span>
        <button className="flex items-center gap-1 text-green-400 hover:text-green-300 transition-colors font-medium">
          Explore
          <span className="text-sm">→</span>
        </button>
      </div>
    </div>
  );
} 