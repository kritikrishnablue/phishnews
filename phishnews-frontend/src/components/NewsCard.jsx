import { useState } from 'react';
import { FaRegThumbsUp, FaRegThumbsDown, FaRegBookmark, FaBookmark, FaRegShareSquare, FaEye, FaEyeSlash } from 'react-icons/fa';
import { userAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function NewsCard({ article, onLike, onBookmark, onShare, showStatus = true }) {
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isRead, setIsRead] = useState(false);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  const articleId = article.url || article.id;

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

  // Handle article click (mark as read)
  const handleArticleClick = async () => {
    if (isAuthenticated && !isRead) {
      try {
        await userAPI.addToHistory(articleId);
        setIsRead(true);
      } catch (error) {
        console.error('Failed to add to reading history:', error);
      }
    }
    
    // Open article in new tab
    window.open(article.url, '_blank');
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6 hover:shadow-lg transition-shadow">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Article Image */}
        {article.urlToImage && (
          <div className="md:w-48 md:h-32 flex-shrink-0">
            <img
              src={article.urlToImage}
              alt={article.title}
              className="w-full h-32 md:h-full object-cover rounded-lg"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
        )}

        {/* Article Content */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            {/* Status badges */}
            {showStatus && (
              <div className="flex gap-2 mb-2">
                {article.status && (
                  <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                    {article.status}
                  </span>
                )}
                {isRead && (
                  <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded flex items-center gap-1">
                    <FaEye className="text-xs" />
                    Read
                  </span>
                )}
                {article.like_count > 0 && (
                  <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
                    {article.like_count} likes
                  </span>
                )}
              </div>
            )}

            {/* Title */}
            <h2 
              className="text-xl font-bold mb-2 text-gray-900 cursor-pointer hover:text-blue-600 transition-colors"
              onClick={handleArticleClick}
            >
              {article.title}
            </h2>

            {/* Description */}
            <p className="text-gray-700 mb-3 line-clamp-3">
              {article.description || article.summary || 'No description available'}
            </p>

            {/* Meta information */}
            <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
              {article.source?.name && (
                <span>Source: {article.source.name}</span>
              )}
              {article.publishedAt && (
                <span>Published: {new Date(article.publishedAt).toLocaleDateString()}</span>
              )}
              {article.author && (
                <span>Author: {article.author}</span>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleLike}
              disabled={loading}
              className={`px-3 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                isLiked 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-green-100'
              }`}
            >
              <FaRegThumbsUp className="text-sm" />
              Like
            </button>

            <button
              onClick={handleDislike}
              disabled={loading}
              className={`px-3 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                isDisliked 
                  ? 'bg-red-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-red-100'
              }`}
            >
              <FaRegThumbsDown className="text-sm" />
              Dislike
            </button>

            <button
              onClick={handleBookmark}
              disabled={loading}
              className={`px-3 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                isBookmarked 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-blue-100'
              }`}
            >
              {isBookmarked ? <FaBookmark className="text-sm" /> : <FaRegBookmark className="text-sm" />}
              {isBookmarked ? 'Bookmarked' : 'Bookmark'}
            </button>

            <button
              onClick={handleShare}
              disabled={loading}
              className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-purple-100 flex items-center gap-2 transition-colors"
            >
              <FaRegShareSquare className="text-sm" />
              Share
            </button>

            <button
              onClick={handleArticleClick}
              className="px-3 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 flex items-center gap-2 transition-colors"
            >
              {isRead ? <FaEyeSlash className="text-sm" /> : <FaEye className="text-sm" />}
              {isRead ? 'Read Again' : 'Read Article'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 