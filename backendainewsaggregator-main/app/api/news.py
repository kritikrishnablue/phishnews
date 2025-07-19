from fastapi import APIRouter, Query, Depends
from app.services.news_fetcher import fetch_news
from app.services.rss_fetcher import FEEDS
import feedparser
from app.services.news_saver import save_articles_to_db
from app.services.news_service import get_trending_articles, search_articles
from app.dependencies.geo_dep import geo_dep
from app.api.auth import get_current_user
from app.database.mongo import news_collection

news_router = APIRouter()


def add_engagement_counts(article):
    db_article = news_collection.find_one({"url": article.get("url")})
    article["like_count"] = db_article.get("like_count", 0) if db_article else 0
    article["dislike_count"] = db_article.get("dislike_count", 0) if db_article else 0
    article["share_count"] = db_article.get("share_count", 0) if db_article else 0
    return article


@news_router.get("")
async def get_news(
    category: str = Query(default=None, description="News category"),
    q: str = Query(default=None, description="Search query"),
    country: str = Query(default=None, description="Country code"),
    source: str = Query(default="api", description="api, gnews, rss, or all"),
    geo=Depends(geo_dep)
):
    user_country = country or (geo.get("country_code").lower() if geo else "us")
    articles = []
    if source in ["api", "all"]:
        articles += fetch_news(country=user_country, category=category, q=q, source="newsapi")
    if source in ["gnews", "all"]:
        articles += fetch_news(country=user_country, category=category, q=q, source="gnews")
    if source in ["rss", "all"]:
        # Fetch RSS feeds live (not from DB)
        for rss_url, channel_name in FEEDS:
            feed = feedparser.parse(rss_url)
            for entry in feed.entries:
                url = entry.get("link")
                if not url:
                    continue
                title = entry.get("title", "").strip() or "No Title"
                summary_text = entry.get("summary", "") or entry.get("description", "") or title
                published_at = entry.get("published", None)
                article = {
                    "title": title,
                    "url": url,
                    "description": summary_text,
                    "publishedAt": published_at,
                    "channel": channel_name,
                    "source": "RSS"
                }
                articles.append(article)
    # Deduplicate by URL
    seen = set()
    deduped = []
    for a in articles:
        url = a.get("url")
        if url and url not in seen:
            seen.add(url)
            deduped.append(a)
    return {
        "country": user_country,
        "source": source,
        "articles": deduped
    }


@news_router.post("/save")
async def save_news_to_db(
    category: str = Query(default=None, description="News category"),
    q: str = Query(default=None, description="Search query"),
    country: str = Query(default=None, description="Country code"),
    source: str = Query(default="newsapi", description="newsapi or gnews"),
    geo=Depends(geo_dep)
):
    # 🌍 Use IP location if no country passed
    user_country = country or (geo.get("country_code").lower() if geo else "us")

    articles = fetch_news(country=user_country, category=category, q=q, source=source)
    count = save_articles_to_db(articles, user_country=user_country)

    return {
        "saved": count,
        "country": user_country,
        "source": source,
        "message": f"✅ {count} articles saved to MongoDB with userCountry={user_country.upper()}"
    }


@news_router.get("/trending")
def get_trending():
    articles = get_trending_articles()
    return {"trending": articles}


@news_router.get("/search")
def search_news(
    keywords: str = "",
    start_date: str = "",
    end_date: str = "",
    source: str = Query(default="newsapi", description="newsapi, gnews, or mongo"),
    limit: int = 20
):
    if source == "gnews":
        # GNews does not support date range or limit in the same way, so use keywords as q
        articles = fetch_news(q=keywords, source="gnews")
        return {"results": articles}
    else:
        articles = search_articles(
            keywords=keywords,
            start_date=start_date,
            end_date=end_date,
            source=source if source != "newsapi" else None,
            limit=limit
        )
        return {"results": articles}


@news_router.get("/personalized")
async def get_personalized_news(
    source: str = Query(default="newsapi", description="newsapi or gnews"),
    current_user: dict = Depends(get_current_user)
):
    preferences = current_user.get("preferences", {"topics": [], "sources": [], "countries": []})
    reading_history = current_user.get("reading_history", [])
    bookmarks = current_user.get("bookmarks", [])
    country = preferences.get("countries", [None])[0] if preferences.get("countries") else None
    if not country:
        country = "us"
    category = preferences.get("topics", [None])[0] if preferences.get("topics") else None
    if not category:
        category = None
    articles = fetch_news(
        country=country,
        category=category,
        q=None,
        source=source
    )
    sources = preferences.get("sources", [])
    if sources:
        articles = [a for a in articles if a.get("source", {}).get("name") in sources]
    # Add status for articles
    for article in articles:
        article_id = article.get("url") or article.get("id")
        # Recommended if matches preferences or is bookmarked
        recommended = False
        if article_id in bookmarks:
            recommended = True
        # Check if article matches preferred topics or countries
        if category and (category.lower() in (article.get("title", "") + article.get("description", "")).lower()):
            recommended = True
        if country and country.lower() in (article.get("title", "") + article.get("description", "")).lower():
            recommended = True
        if recommended:
            article["status"] = "Recommended"
        if article_id in reading_history:
            article["status"] = "Read"
        add_engagement_counts(article)
    return {
        "personalized_for": current_user["email"],
        "preferences": preferences,
        "source": source,
        "articles": articles
    }
