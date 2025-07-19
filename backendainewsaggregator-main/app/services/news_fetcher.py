import httpx
import os

NEWSAPI_KEY = os.getenv("NEWSAPI_KEY")
GNEWS_API_KEY = os.getenv("GNEWS_API_KEY")
print("Loaded NEWSAPI_KEY:", NEWSAPI_KEY)  # Debug print
print("Loaded GNEWS_API_KEY:", GNEWS_API_KEY)  # Debug print

BASE_URL = "https://newsapi.org/v2/top-headlines"
GNEWS_BASE_URL = "https://gnews.io/api/v4/top-headlines"

def fetch_news(country="in", category=None, q=None, source="newsapi"):
    if source == "gnews":
        return fetch_gnews(country=country, category=category, q=q)
    params = {
        "apiKey": NEWSAPI_KEY,
        "country": country,
        "pageSize": 10,
    }
    if category:
        params["category"] = category
    if q:
        params["q"] = q
    try:
        response = httpx.get(BASE_URL, params=params)
        response.raise_for_status()
        print("NewsAPI response:", response.json())  # Debug print
        return response.json().get("articles", [])
    except Exception as e:
        print("❌ Error fetching news:", e)
        return []

def fetch_gnews(country="in", category=None, q=None):
    params = {
        "token": GNEWS_API_KEY,
        "lang": "en",
        "country": country,
        "max": 10,
    }
    if category:
        params["topic"] = category
    if q:
        params["q"] = q
    try:
        response = httpx.get(GNEWS_BASE_URL, params=params)
        response.raise_for_status()
        print("GNews response:", response.json())  # Debug print
        return response.json().get("articles", [])
    except Exception as e:
        print("❌ Error fetching GNews:", e)
        return []
