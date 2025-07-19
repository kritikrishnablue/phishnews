from fastapi import APIRouter, Depends, HTTPException
from app.database.mongo import users_collection, news_collection
from app.api.auth import get_current_user
from app.services.user_service import like_article, dislike_article, share_article

user_router = APIRouter()

@user_router.get("/profile")
def get_profile(current_user: dict = Depends(get_current_user)):
    return {
        "email": current_user["email"],
        "preferences": current_user.get("preferences", {"topics": [], "sources": [], "countries": []}),
        "reading_history": current_user.get("reading_history", []),
        "bookmarks": current_user.get("bookmarks", []),
        "liked_articles": current_user.get("liked_articles", [])
    }

@user_router.post("/preferences")
def set_preferences(preferences: dict, current_user: dict = Depends(get_current_user)):
    users_collection.update_one(
        {"email": current_user["email"]},
        {"$set": {"preferences": preferences}}
    )
    return {"message": "Preferences updated", "preferences": preferences}

@user_router.post("/history")
def add_reading_history(item: dict, current_user: dict = Depends(get_current_user)):
    article_id = item.get("article_id") or item.get("url")
    if not article_id:
        raise HTTPException(status_code=400, detail="Missing article_id or url")
    users_collection.update_one(
        {"email": current_user["email"]},
        {"$addToSet": {"reading_history": article_id}}
    )
    return {"message": "Article added to reading history", "article": article_id}

@user_router.get("/recently-viewed")
def get_recently_viewed(current_user: dict = Depends(get_current_user)):
    return {"recently_viewed": current_user.get("reading_history", [])}

@user_router.post("/bookmark")
def bookmark_article(item: dict, current_user: dict = Depends(get_current_user)):
    article_id = item.get("article_id") or item.get("url")
    article_data = item.get("article_data")  # Expect full article data from frontend
    if not article_id:
        raise HTTPException(status_code=400, detail="Missing article_id or url")
    users_collection.update_one(
        {"email": current_user["email"]},
        {"$addToSet": {"bookmarks": article_id}}
    )
    # Save article to DB if not present and article_data is provided
    if article_data and not news_collection.find_one({"url": article_id}):
        news_collection.insert_one(article_data)
    return {"message": "Article bookmarked", "article": article_id}

@user_router.post("/unbookmark")
def unbookmark_article(item: dict, current_user: dict = Depends(get_current_user)):
    article_id = item.get("article_id") or item.get("url")
    if not article_id:
        raise HTTPException(status_code=400, detail="Missing article_id or url")
    users_collection.update_one(
        {"email": current_user["email"]},
        {"$pull": {"bookmarks": article_id}}
    )
    return {"message": "Article unbookmarked", "article": article_id}

@user_router.get("/bookmarks")
def get_bookmarks(current_user: dict = Depends(get_current_user)):
    bookmark_urls = current_user.get("bookmarks", [])
    articles = []
    for url in bookmark_urls:
        article = news_collection.find_one({"url": url})
        if article:
            article["_id"] = str(article["_id"])  # Convert ObjectId to string if present
            articles.append(article)
    return {"bookmarks": articles}

@user_router.post("/like")
def like_article_endpoint(item: dict, current_user: dict = Depends(get_current_user)):
    article_id = item.get("article_id") or item.get("url")
    if not article_id:
        raise HTTPException(status_code=400, detail="Missing article_id or url")
    return like_article(current_user["email"], article_id)

@user_router.post("/dislike")
def dislike_article_endpoint(item: dict, current_user: dict = Depends(get_current_user)):
    article_id = item.get("article_id") or item.get("url")
    if not article_id:
        raise HTTPException(status_code=400, detail="Missing article_id or url")
    return dislike_article(current_user["email"], article_id)

@user_router.post("/share")
def share_article_endpoint(item: dict):
    article_url = item.get("url")
    title = item.get("title", "")
    if not article_url:
        raise HTTPException(status_code=400, detail="Missing article url")
    return share_article(article_url, title) 