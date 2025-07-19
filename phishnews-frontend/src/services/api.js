const API_BASE_URL = 'http://127.0.0.1:8000';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Auth API
export const authAPI = {
  login: async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Login failed');
    }
    return response.json();
  },

  register: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Registration failed');
    }
    return response.json();
  }
};

// News API
export const newsAPI = {
  getNews: async (params = {}) => {
    const url = new URL(`${API_BASE_URL}/news`);
    Object.keys(params).forEach(key => {
      if (params[key]) url.searchParams.append(key, params[key]);
    });
    
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch news');
    return response.json();
  },

  getTrending: async () => {
    const response = await fetch(`${API_BASE_URL}/news/trending`);
    if (!response.ok) throw new Error('Failed to fetch trending news');
    return response.json();
  },

  searchNews: async (params = {}) => {
    const url = new URL(`${API_BASE_URL}/news/search`);
    Object.keys(params).forEach(key => {
      if (params[key]) url.searchParams.append(key, params[key]);
    });
    
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to search news');
    return response.json();
  },

  getPersonalized: async (source = 'newsapi') => {
    const response = await fetch(`${API_BASE_URL}/news/personalized?source=${source}`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch personalized news');
    return response.json();
  },

  saveNews: async (params = {}) => {
    const url = new URL(`${API_BASE_URL}/news/save`);
    Object.keys(params).forEach(key => {
      if (params[key]) url.searchParams.append(key, params[key]);
    });
    
    const response = await fetch(url, { method: 'POST' });
    if (!response.ok) throw new Error('Failed to save news');
    return response.json();
  }
};

// User API
export const userAPI = {
  getProfile: async () => {
    const response = await fetch(`${API_BASE_URL}/user/profile`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch profile');
    return response.json();
  },

  updatePreferences: async (preferences) => {
    const response = await fetch(`${API_BASE_URL}/user/preferences`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(preferences)
    });
    if (!response.ok) throw new Error('Failed to update preferences');
    return response.json();
  },

  addToHistory: async (articleId) => {
    const response = await fetch(`${API_BASE_URL}/user/history`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ article_id: articleId })
    });
    if (!response.ok) throw new Error('Failed to add to history');
    return response.json();
  },

  getRecentlyViewed: async () => {
    const response = await fetch(`${API_BASE_URL}/user/recently-viewed`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch recently viewed');
    return response.json();
  },

  bookmarkArticle: async (articleId, articleData = null) => {
    const response = await fetch(`${API_BASE_URL}/user/bookmark`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ 
        article_id: articleId,
        article_data: articleData 
      })
    });
    if (!response.ok) throw new Error('Failed to bookmark article');
    return response.json();
  },

  unbookmarkArticle: async (articleId) => {
    const response = await fetch(`${API_BASE_URL}/user/unbookmark`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ article_id: articleId })
    });
    if (!response.ok) throw new Error('Failed to unbookmark article');
    return response.json();
  },

  getBookmarks: async () => {
    const response = await fetch(`${API_BASE_URL}/user/bookmarks`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch bookmarks');
    return response.json();
  },

  likeArticle: async (articleId) => {
    const response = await fetch(`${API_BASE_URL}/user/like`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ article_id: articleId })
    });
    if (!response.ok) throw new Error('Failed to like article');
    return response.json();
  },

  dislikeArticle: async (articleId) => {
    const response = await fetch(`${API_BASE_URL}/user/dislike`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ article_id: articleId })
    });
    if (!response.ok) throw new Error('Failed to dislike article');
    return response.json();
  },

  shareArticle: async (url, title) => {
    const response = await fetch(`${API_BASE_URL}/user/share`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ url, title })
    });
    if (!response.ok) throw new Error('Failed to share article');
    return response.json();
  }
};

// RSS API
export const rssAPI = {
  fetchRSS: async () => {
    const response = await fetch(`${API_BASE_URL}/rss/fetch`, {
      method: 'POST'
    });
    if (!response.ok) throw new Error('Failed to fetch RSS');
    return response.json();
  }
};

// Location API
export const locationAPI = {
  getLocation: async () => {
    const response = await fetch(`${API_BASE_URL}/location`);
    if (!response.ok) throw new Error('Failed to get location');
    return response.json();
  }
}; 