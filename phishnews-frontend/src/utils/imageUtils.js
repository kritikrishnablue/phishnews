// Utility functions for image handling

// Check if a URL is a valid image URL
export const isValidImageUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  
  // Check for common image extensions
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
  const hasImageExtension = imageExtensions.some(ext => url.toLowerCase().includes(ext));
  
  // Check for image-related keywords in URL
  const imageKeywords = ['image', 'img', 'photo', 'picture', 'media'];
  const hasImageKeyword = imageKeywords.some(keyword => url.toLowerCase().includes(keyword));
  
  // Check if it's a valid HTTP/HTTPS URL
  const isValidHttpUrl = url.startsWith('http://') || url.startsWith('https://');
  
  return isValidHttpUrl && (hasImageExtension || hasImageKeyword || url.length > 10);
};

// Simple image cache to avoid repeated requests
const imageCache = new Map();

// Add CORS proxy to handle blocked images
export const getCorsProxyUrl = (url) => {
  if (!url) return null;
  
  // Check cache first
  if (imageCache.has(url)) {
    return imageCache.get(url);
  }
  
  // Use our backend proxy endpoint
  const backendProxy = `http://localhost:8000/proxy/image?url=${encodeURIComponent(url)}`;
  
  // Cache the proxy URL
  imageCache.set(url, backendProxy);
  
  // Fallback to external proxy services if backend is not available
  const externalProxies = [
    `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
    `https://cors-anywhere.herokuapp.com/${url}`,
    `https://thingproxy.freeboard.io/fetch/${url}`
  ];
  
  // Return backend proxy first, then external ones
  return backendProxy;
};

// Check if an image URL is likely to have CORS issues
export const isLikelyCorsBlocked = (url) => {
  if (!url) return false;
  
  // Common domains that often have CORS issues
  const corsBlockedDomains = [
    'static01.nyt.com',
    'i.abcnewsfe.com',
    'ca-times.brightspotcdn.com',
    'cdn.cnn.com',
    'media.cnn.com',
    'www.reuters.com',
    'media.reuters.com'
  ];
  
  return corsBlockedDomains.some(domain => url.includes(domain));
};

// Get the best available image URL from an article object
export const getBestImageUrl = (article, useProxy = false) => {
  if (!article) return null;
  
  // Check multiple possible image fields
  const possibleImageFields = [
    'urlToImage',
    'image',
    'imageUrl',
    'thumbnail',
    'media',
    'picture',
    'image_url',
    'img',
    'photo'
  ];

  for (const field of possibleImageFields) {
    const value = article[field];
    
    // Skip if null, undefined, or empty string
    if (!value || value === 'null' || value === 'undefined' || value === '') {
      continue;
    }

    // If it's a string, validate it's a proper URL
    if (typeof value === 'string') {
      if (isValidImageUrl(value)) {
        // Use proxy if requested and URL is likely to be CORS blocked
        if (useProxy && isLikelyCorsBlocked(value)) {
          return getCorsProxyUrl(value);
        }
        return value;
      }
    }
  }

  return null;
};

// Preload an image to check if it's accessible
export const preloadImage = (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(url);
    img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
    img.src = url;
  });
};

// Test image with CORS fallback
export const testImageWithFallback = async (url) => {
  try {
    // First try the original URL
    await preloadImage(url);
    return url;
  } catch (error) {
    console.log(`Original image failed: ${url}, trying CORS proxy`);
    
    // If original fails and it's likely CORS blocked, try proxy
    if (isLikelyCorsBlocked(url)) {
      const proxyUrl = getCorsProxyUrl(url);
      try {
        await preloadImage(proxyUrl);
        return proxyUrl;
      } catch (proxyError) {
        console.log(`CORS proxy also failed: ${proxyUrl}`);
        throw proxyError;
      }
    }
    
    throw error;
  }
};

// Debug function to log article image information
export const debugArticleImages = (article) => {
  console.group(`Image Debug for: ${article.title}`);
  console.log('Article object:', article);
  
  const imageFields = Object.keys(article).filter(key => 
    key.toLowerCase().includes('image') || 
    key.toLowerCase().includes('img') || 
    key.toLowerCase().includes('photo') ||
    key.toLowerCase().includes('media')
  );
  
  console.log('Image-related fields:', imageFields);
  
  imageFields.forEach(field => {
    console.log(`${field}:`, article[field]);
  });
  
  const bestUrl = getBestImageUrl(article);
  console.log('Best image URL found:', bestUrl);
  
  console.groupEnd();
  
  return bestUrl;
};

// Generate a placeholder image URL based on category
export const getPlaceholderImageUrl = (category = 'general', articleId = null) => {
  const colors = {
    cybersecurity: '1e40af',
    technology: '059669', 
    business: '7c2d12',
    politics: '581c87',
    science: '1e293b',
    health: 'be185d',
    general: '374151'
  };
  
  const color = colors[category] || colors.general;
  const text = category.charAt(0).toUpperCase() + category.slice(1);
  
  // Use a unique seed based on article ID or timestamp to ensure different images
  const uniqueSeed = articleId || Date.now() + Math.random();
  return `https://picsum.photos/400/250?random=${uniqueSeed}`;
}; 

// Replace the failing microlink.io service with a simpler approach
export const extractImageFromUrl = async (articleUrl) => {
  try {
    // Use a different service or skip extraction for now
    console.log('Skipping image extraction due to rate limits');
    return null;
  } catch (error) {
    console.log('Failed to extract image from URL:', error);
    return null;
  }
};

// Enhanced image URL detection with better fallbacks
export const getEnhancedImageUrl = async (article) => {
  // First try to get image from article object
  const bestUrl = getBestImageUrl(article);
  if (bestUrl) {
    console.log(`✅ Found image URL: ${bestUrl} for article: ${article.title}`);
    
    // Test the image with CORS fallback
    try {
      const workingUrl = await testImageWithFallback(bestUrl);
      return workingUrl;
    } catch (error) {
      console.log(`❌ Image failed to load: ${bestUrl}, using placeholder`);
    }
  }
  
  // Skip URL extraction due to rate limits
  // If no image found, use placeholder based on category
  const category = article.category || 'general';
  const articleId = article.url || article.id || article._id;
  const placeholderUrl = getPlaceholderImageUrl(category, articleId);
  console.log(`️ Using placeholder for article: ${article.title}`);
  return placeholderUrl;
}; 