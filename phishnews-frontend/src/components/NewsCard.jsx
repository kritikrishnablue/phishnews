import { useState, useEffect } from 'react';
import { FaBookmark, FaShare, FaThumbsUp, FaThumbsDown, FaEye, FaExternalLinkAlt, FaPlay } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';
import { debugArticleImages, getEnhancedImageUrl, isLikelyCorsBlocked, getCorsProxyUrl, testImageWithFallback } from '../utils/imageUtils';
import ArticleSummary from './ArticleSummary';

export default function NewsCard({ article, onLike, onBookmark, onShare, showStatus = true }) {
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isRead, setIsRead] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [enhancedImageUrl, setEnhancedImageUrl] = useState(null);
  const { isAuthenticated } = useAuth();

  const articleId = article.url || article.id;

  // Check if article has video content
  const hasVideo = article.urlToImage?.includes('video') || 
                   article.title?.toLowerCase().includes('video') ||
                   article.description?.toLowerCase().includes('video') ||
                   article.url?.includes('youtube') ||
                   article.url?.includes('vimeo');

  // Generate category based on article content
  const getCategory = () => {
    if (article.category) return article.category;
    if (article.title?.toLowerCase().includes('cybersecurity') || article.title?.toLowerCase().includes('security')) return 'cybersecurity';
    if (article.title?.toLowerCase().includes('technology') || article.title?.toLowerCase().includes('tech')) return 'technology';
    if (article.title?.toLowerCase().includes('business')) return 'business';
    if (article.title?.toLowerCase().includes('politics')) return 'politics';
    if (article.title?.toLowerCase().includes('science')) return 'science';
    if (article.title?.toLowerCase().includes('health')) return 'health';
    return 'general';
  };

  // Enhanced getImageUrl function - MOVED TO TOP
  const getImageUrl = () => {
    // First try enhanced image URL
    if (enhancedImageUrl) {
      return enhancedImageUrl;
    }
    
    // Fallback to original logic
    if (article.urlToImage && article.urlToImage !== 'null' && article.urlToImage !== '') {
      return article.urlToImage;
    }
    if (article.image && article.image !== 'null' && article.image !== '') {
      return article.image;
    }
    if (article.urlToImage && typeof article.urlToImage === 'string' && article.urlToImage.length > 0) {
      return article.urlToImage;
    }
    
    // Final fallback to unique placeholder
    const category = getCategory();
    const articleId = article.url || article.id || article._id;
    return `https://picsum.photos/400/250?random=${articleId || Date.now() + Math.random()}`;
  };

  // Enable debugging
  useEffect(() => {
    debugArticleImages(article);
  }, [article]);

  // Get enhanced image URL
  useEffect(() => {
    const loadEnhancedImage = async () => {
      const url = await getEnhancedImageUrl(article);
      setEnhancedImageUrl(url);
    };
    loadEnhancedImage();
  }, [article]);

  // Handle image load
  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
  };

  // Handle image error with better fallback
  const handleImageError = (e) => {
    console.log('Image failed to load:', e.target.src);
    setImageError(true);
    setImageLoading(false);
    
    // If this is a CORS-blocked image, try the proxy version
    if (isLikelyCorsBlocked(e.target.src) && !e.target.src.includes('cors-anywhere')) {
      const proxyUrl = getCorsProxyUrl(e.target.src);
      console.log('Trying CORS proxy:', proxyUrl);
      e.target.src = proxyUrl;
      return;
    }
    
    // Try to load a unique fallback image
    const articleId = article.url || article.id || article._id;
    const fallbackUrl = `https://picsum.photos/400/250?random=${articleId || Date.now() + Math.random()}`;
    if (e.target.src !== fallbackUrl) {
      e.target.src = fallbackUrl;
    }
  };

  // Handle like
  const handleLike = async () => {
    if (!isAuthenticated) {
      alert('Please login to like articles');
      return;
    }

    setLoading(true);
    try {
      await userAPI.likeArticle(articleId);
      setIsLiked(true);
      setIsDisliked(false);
      if (onLike) onLike(article);
    } catch (error) {
      console.error('Failed to like article:', error);
      alert('Failed to like article');
    } finally {
      setLoading(false);
    }
  };

  // Handle dislike
  const handleDislike = async () => {
    if (!isAuthenticated) {
      alert('Please login to dislike articles');
      return;
    }

    setLoading(true);
    try {
      await userAPI.dislikeArticle(articleId);
      setIsDisliked(true);
      setIsLiked(false);
    } catch (error) {
      console.error('Failed to dislike article:', error);
      alert('Failed to dislike article');
    } finally {
      setLoading(false);
    }
  };

  // Handle bookmark
  const handleBookmark = async () => {
    if (!isAuthenticated) {
      alert('Please login to bookmark articles');
      return;
    }

    setLoading(true);
    try {
      if (isBookmarked) {
        await userAPI.unbookmarkArticle(articleId);
        setIsBookmarked(false);
      } else {
        await userAPI.bookmarkArticle(articleId, article);
        setIsBookmarked(true);
      }
      if (onBookmark) onBookmark(article);
    } catch (error) {
      console.error('Failed to bookmark article:', error);
      alert('Failed to bookmark article');
    } finally {
      setLoading(false);
    }
  };

  // Handle share
  const handleShare = async () => {
    if (!isAuthenticated) {
      alert('Please login to share articles');
      return;
    }

    setLoading(true);
    try {
      const shareData = await userAPI.shareArticle(article.url, article.title);
      if (onShare) onShare(article);
      
      // Show share options
      const shareText = `Share "${article.title}"\n\n` +
        Object.entries(shareData)
          .filter(([key]) => key !== 'share_url')
          .map(([platform, url]) => `${platform}: ${url}`)
          .join('\n');
      
      alert(shareText);
    } catch (error) {
      console.error('Failed to share article:', error);
      alert('Failed to share article');
    } finally {
      setLoading(false);
    }
  };

  // Handle article click (mark as read and show summary)
  const handleArticleClick = async () => {
    if (isAuthenticated && !isRead) {
      try {
        await userAPI.addToHistory(articleId);
        setIsRead(true);
      } catch (error) {
        console.error('Failed to add to reading history:', error);
      }
    }
    
    setShowSummary(true);
  };

  // Handle read original article
  const handleReadOriginal = () => {
    window.open(article.url, '_blank');
  };

  const category = getCategory();
  const imageUrl = getImageUrl();

  // Debug logging - only in development
  if (process.env.NODE_ENV === 'development') {
    if (imageUrl) {
      console.log('✅ Found image URL:', imageUrl, 'for article:', article.title);
      
      // Check if it's likely to be CORS blocked
      if (isLikelyCorsBlocked(imageUrl)) {
        console.log('⚠️ Image likely to be CORS blocked:', imageUrl);
      }
    } else {
      console.log('❌ No image URL found for article:', article.title);
      // Uncomment the next line to see detailed debugging
      // debugArticleImages(article);
    }
  }

  return (
    <>
      <div className="bg-gray-800 dark:bg-gray-800 bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow border border-gray-200 dark:border-gray-700">
        {/* Article Image/Video */}
        <div className="relative">
          {imageUrl && !imageError ? (
            <div className="relative">
              <img
                src={imageUrl}
                alt={article.title}
                className="w-full h-48 object-cover"
                onLoad={handleImageLoad}
                onError={handleImageError}
                loading="lazy"
                crossOrigin="anonymous"
              />
              {imageLoading && (
                <div className="absolute inset-0 bg-gray-700 dark:bg-gray-700 bg-gray-300 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
                </div>
              )}
              {/* Video Play Button Overlay */}
              {hasVideo && !imageLoading && (
                <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                  <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
                    <FaPlay className="text-white text-lg ml-1" />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="w-full h-48 bg-gray-700 dark:bg-gray-700 bg-gray-200 flex items-center justify-center">
              <div className="text-center">
                <FaEye className="text-gray-500 dark:text-gray-500 text-gray-400 text-4xl mx-auto mb-2" />
                <p className="text-gray-500 dark:text-gray-500 text-gray-400 text-sm">{category}</p>
              </div>
            </div>
          )}
          
          {/* Category Tag */}
          <div className="absolute top-3 left-3">
            <span className="px-2 py-1 text-xs font-medium bg-gray-700 dark:bg-gray-700 bg-gray-200 text-white dark:text-white text-gray-800 rounded">
              {category}
            </span>
          </div>
          
          {/* Video Badge */}
          {hasVideo && (
            <div className="absolute top-3 right-12">
              <span className="px-2 py-1 text-xs font-medium bg-red-500 text-white rounded flex items-center gap-1">
                <FaPlay className="text-xs" />
                Video
              </span>
            </div>
          )}
          
          {/* Bookmark Button */}
          <button
            onClick={handleBookmark}
            className="absolute top-3 right-3 p-2 bg-gray-800 dark:bg-gray-800 bg-white bg-opacity-75 rounded-full hover:bg-opacity-100 transition-all"
          >
            {isBookmarked ? (
              <FaBookmark className="text-cyan-400 text-sm" />
            ) : (
              <FaBookmark className="text-white dark:text-white text-gray-800 text-sm" />
            )}
          </button>
        </div>

        {/* Article Content */}
        <div className="p-4">
          {/* Source and Date */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-cyan-400 text-sm font-medium">
              {article.source?.name || article.source || 'News Source'}
            </span>
            <span className="text-gray-400 dark:text-gray-400 text-gray-600 text-xs">
              {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString() : 'Unknown date'}
            </span>
          </div>

          {/* AI Summary Badge */}
          <div className="flex items-center gap-1 mb-2">
            <span className="text-cyan-400 text-xs">⚡</span>
            <span className="text-gray-300 dark:text-gray-300 text-gray-700 text-xs">AI Summary</span>
          </div>

          {/* Title */}
          <h3 className="text-white dark:text-white text-gray-900 font-bold text-lg mb-2 line-clamp-2 cursor-pointer hover:text-cyan-400 transition-colors">
            {article.title}
          </h3>

          {/* Description */}
          <p className="text-gray-300 dark:text-gray-300 text-gray-700 text-sm mb-4 line-clamp-3">
            {article.description || article.summary || 'No description available'}
          </p>

          {/* Meta and Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-gray-400 dark:text-gray-400 text-gray-600 text-xs">
              <span>4 min read</span>
              <span>•</span>
              <span>{hasVideo ? 'Video + Article' : 'Read full article'}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleArticleClick}
                className="flex items-center gap-1 px-3 py-1 text-cyan-400 hover:text-cyan-300 transition-colors text-sm"
              >
                <FaExternalLinkAlt className="text-xs" />
                {hasVideo ? 'Watch & Read' : 'Read full article'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Article Summary Modal */}
      {showSummary && (
        <ArticleSummary
          article={article}
          onClose={() => setShowSummary(false)}
          onBookmark={handleBookmark}
          onShare={handleShare}
        />
      )}
    </>
  );
} 