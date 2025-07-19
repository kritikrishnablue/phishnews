# News Aggregator Frontend

A modern, responsive React frontend for the News Aggregator application with comprehensive features for browsing, searching, and personalizing news content.

## Features

### 🔐 Authentication & User Management
- **User Registration & Login**: Secure authentication with JWT tokens
- **Profile Management**: Comprehensive user profile with preferences and statistics
- **Session Management**: Automatic token validation and session persistence
- **Protected Routes**: Authentication-required pages with proper redirects

### 📰 News Browsing
- **Multiple News Sources**: NewsAPI, GNews, and RSS feeds
- **Advanced Filtering**: Filter by country, category, source, and keywords
- **Trending Articles**: View trending news based on engagement metrics
- **Real-time Updates**: Live news fetching with loading states

### 🎯 Personalized Experience
- **User Preferences**: Set preferred countries, topics, and sources
- **Reading History**: Track articles you've read
- **Personalized Feed**: AI-powered news recommendations
- **Smart Filtering**: Content filtered based on your preferences

### 💾 Content Management
- **Bookmarking**: Save articles for later reading
- **Like/Dislike**: Rate articles to improve recommendations
- **Reading Status**: Track which articles you've read
- **Share Functionality**: Share articles on social media platforms

### 🔍 Advanced Search
- **Filter Search**: Quick filtering by basic criteria
- **Advanced Search**: Date ranges, keywords, and source-specific search
- **Database Search**: Search through saved articles
- **Search History**: Track your search patterns

### 📊 Analytics & Insights
- **User Statistics**: Reading patterns and engagement metrics
- **Content Analytics**: Article popularity and engagement tracking
- **Personalization Stats**: How well recommendations match preferences
- **Search Analytics**: Search effectiveness and result quality

## Technology Stack

- **React 19**: Latest React with hooks and modern patterns
- **React Router**: Client-side routing with protected routes
- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **React Icons**: Comprehensive icon library
- **Context API**: State management for authentication and user data
- **Fetch API**: Modern HTTP client for API communication

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── NewsCard.jsx    # Article display component
│   ├── Filters.jsx     # Search and filter controls
│   └── Navbar.jsx      # Navigation component
├── pages/              # Page components
│   ├── Home.jsx        # Main news browsing page
│   ├── Search.jsx      # Advanced search functionality
│   ├── Personalized.jsx # User-specific news feed
│   ├── Bookmarks.jsx   # Saved articles management
│   ├── Profile.jsx     # User profile and preferences
│   ├── Login.jsx       # Authentication page
│   └── Register.jsx    # User registration page
├── services/           # API and external services
│   └── api.js         # Centralized API client
├── context/           # React context providers
│   └── AuthContext.jsx # Authentication state management
└── App.jsx            # Main application component
```

## API Integration

The frontend integrates with a comprehensive backend API that provides:

### Authentication Endpoints
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `GET /user/profile` - Get user profile

### News Endpoints
- `GET /news` - Fetch news with filters
- `GET /news/trending` - Get trending articles
- `GET /news/search` - Advanced search functionality
- `GET /news/personalized` - Personalized news feed
- `POST /news/save` - Save news to database

### User Management Endpoints
- `POST /user/preferences` - Update user preferences
- `POST /user/bookmark` - Bookmark an article
- `POST /user/unbookmark` - Remove bookmark
- `GET /user/bookmarks` - Get user bookmarks
- `POST /user/like` - Like an article
- `POST /user/dislike` - Dislike an article
- `POST /user/share` - Share article links
- `POST /user/history` - Add to reading history
- `GET /user/recently-viewed` - Get reading history

### Additional Services
- `GET /location` - Get user location for geo-targeting
- `POST /rss/fetch` - Fetch RSS feeds

## Key Features

### Enhanced NewsCard Component
- **Interactive Actions**: Like, dislike, bookmark, share, and read
- **Status Indicators**: Show if article is read, recommended, or bookmarked
- **Engagement Metrics**: Display like counts and engagement scores
- **Responsive Design**: Optimized for mobile and desktop
- **Error Handling**: Graceful fallbacks for missing images or data

### Smart Authentication
- **Token Management**: Automatic token refresh and validation
- **Session Persistence**: Remember user login across browser sessions
- **Protected Routes**: Redirect unauthenticated users appropriately
- **Error Handling**: User-friendly error messages and recovery

### Advanced Search Capabilities
- **Dual Search Modes**: Filter search and advanced search
- **Date Range Filtering**: Search articles by publication date
- **Source-Specific Search**: Search within specific news sources
- **Result Limits**: Configurable result counts
- **Search Analytics**: Track search effectiveness

### Personalized Experience
- **Preference Management**: Set preferred countries, topics, and sources
- **Reading History**: Automatic tracking of read articles
- **Smart Recommendations**: AI-powered content suggestions
- **Engagement Tracking**: Monitor user interactions for better personalization

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Backend API running on `http://127.0.0.1:8000`

### Installation
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Environment Setup
The frontend automatically connects to the backend API. Ensure the backend is running and accessible at the configured URL.

## Usage

### For Users
1. **Register/Login**: Create an account or sign in
2. **Browse News**: Use filters to find relevant content
3. **Personalize**: Set preferences in your profile
4. **Engage**: Like, bookmark, and share articles
5. **Search**: Use advanced search for specific content
6. **Track Progress**: Monitor your reading history and engagement

### For Developers
1. **Component Structure**: Modular, reusable components
2. **State Management**: Context API for global state
3. **API Integration**: Centralized API service layer
4. **Error Handling**: Comprehensive error boundaries and user feedback
5. **Responsive Design**: Mobile-first approach with Tailwind CSS

## Contributing

1. Follow the existing code structure and patterns
2. Use the established API service layer for backend communication
3. Implement proper error handling and loading states
4. Ensure responsive design for all new components
5. Add appropriate TypeScript types if migrating to TypeScript

## Future Enhancements

- **Real-time Updates**: WebSocket integration for live news updates
- **Offline Support**: Service worker for offline reading
- **Push Notifications**: Browser notifications for breaking news
- **Advanced Analytics**: Detailed user behavior tracking
- **Social Features**: Comments and community features
- **Multi-language Support**: Internationalization (i18n)
- **Dark Mode**: Theme switching capability
- **Progressive Web App**: PWA features for mobile experience
