import { FaChartLine } from 'react-icons/fa';

export default function RelatedArticles({ articles = [] }) {
  // Generate mock related articles if none provided
  const relatedArticles = articles.length > 0 ? articles : [
    {
      title: "Major Tech Companies Invest $2.5 Billion in Quantum Computing Security",
      source: "TechNews Pro",
      category: "technology",
      urlToImage: "https://via.placeholder.com/300x200/1e40af/ffffff?text=Tech",
      publishedAt: new Date().toISOString()
    },
    {
      title: "Global Cybersecurity Skills Gap Reaches Critical Point as Demand Surges 300%",
      source: "Security Weekly", 
      category: "cybersecurity",
      urlToImage: "https://via.placeholder.com/300x200/059669/ffffff?text=Security",
      publishedAt: new Date().toISOString()
    },
    {
      title: "New EU Regulation",
      source: "Policy Today",
      category: "politics", 
      urlToImage: "https://via.placeholder.com/300x200/7c2d12/ffffff?text=Policy",
      publishedAt: new Date().toISOString()
    }
  ];

  // Get the best available image URL for an article
  const getImageUrl = (article) => {
    if (article.urlToImage && article.urlToImage !== 'null' && article.urlToImage !== '') {
      return article.urlToImage;
    }
    if (article.image && article.image !== 'null' && article.image !== '') {
      return article.image;
    }
    if (article.urlToImage && typeof article.urlToImage === 'string' && article.urlToImage.length > 0) {
      return article.urlToImage;
    }
    return null;
  };

  return (
    <div className="px-6 py-4 border-t border-gray-700 dark:border-gray-700 border-gray-200">
      <div className="flex items-center gap-2 mb-4">
        <FaChartLine className="text-green-500 text-sm" />
        <h3 className="text-white dark:text-white text-gray-900 font-semibold">Related Articles</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {relatedArticles.map((article, index) => {
          const imageUrl = getImageUrl(article);
          
          return (
            <div key={index} className="bg-gray-800 dark:bg-gray-800 bg-gray-100 rounded-lg overflow-hidden hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700">
              {/* Article Image */}
              {imageUrl ? (
                <div className="relative">
                  <img
                    src={imageUrl}
                    alt={article.title}
                    className="w-full h-32 object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                    loading="lazy"
                    crossOrigin="anonymous"
                  />
                  {/* Fallback placeholder */}
                  <div className="hidden w-full h-32 bg-gray-700 dark:bg-gray-700 bg-gray-200 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-gray-500 dark:text-gray-500 text-gray-400 text-2xl mb-1">📰</div>
                      <div className="text-gray-500 dark:text-gray-500 text-gray-400 text-xs">{article.category}</div>
                    </div>
                  </div>
                  {/* Category Tag */}
                  <div className="absolute top-2 left-2">
                    <span className="px-2 py-1 text-xs font-medium bg-gray-700 dark:bg-gray-700 bg-gray-200 text-white dark:text-white text-gray-800 rounded">
                      {article.category}
                    </span>
                  </div>
                  {/* Bookmark Button */}
                  <button className="absolute top-2 right-2 p-1 bg-gray-800 dark:bg-gray-800 bg-white bg-opacity-75 rounded-full hover:bg-opacity-100 transition-all">
                    <svg className="w-4 h-4 text-white dark:text-white text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                  </button>
                </div>
              ) : (
                <div className="w-full h-32 bg-gray-700 dark:bg-gray-700 bg-gray-200 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-gray-500 dark:text-gray-500 text-gray-400 text-2xl mb-1">📰</div>
                    <div className="text-gray-500 dark:text-gray-500 text-gray-400 text-xs">{article.category}</div>
                  </div>
                </div>
              )}

              {/* Article Content */}
              <div className="p-3">
                <div className="text-cyan-400 text-sm font-medium mb-1">
                  {article.source}
                </div>
                <div className="flex items-center gap-2 text-gray-400 dark:text-gray-400 text-gray-600 text-xs mb-2">
                  <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                  <span>•</span>
                  <span>⚡ Summary</span>
                </div>
                <h4 className="text-white dark:text-white text-gray-900 font-semibold text-sm line-clamp-2">
                  {article.title}
                </h4>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
} 