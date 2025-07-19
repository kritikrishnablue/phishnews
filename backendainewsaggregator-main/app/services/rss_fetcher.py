import feedparser
from datetime import datetime
from app.database.mongo import news_collection
from app.services.summarizer import summarize_text

# 🌍 List of global + Australian RSS feeds and their channel names
FEEDS = [
    ("https://feeds.bbci.co.uk/news/world/rss.xml", "BBC World"),
    ("https://rss.cnn.com/rss/edition_world.rss", "CNN World"),
    ("https://www.aljazeera.com/xml/rss/all.xml", "Al Jazeera"),
    ("https://www.reutersagency.com/feed/?best-topics=world&post_type=best", "Reuters World"),
    ("https://rss.nytimes.com/services/xml/rss/nyt/World.xml", "New York Times"),
    ("https://feeds.a.dj.com/rss/RSSWorldNews.xml", "Wall Street Journal"),
    ("https://www.cnbc.com/id/100727362/device/rss/rss.html", "CNBC World"),
    ("https://www.npr.org/rss/rss.php?id=1004", "NPR World"),
    ("https://feeds.skynews.com/feeds/rss/world.xml", "Sky News"),
    ("https://www.dw.com/en/top-stories/s-9097/rss", "Deutsche Welle"),
    ("https://timesofindia.indiatimes.com/rssfeeds/296589292.cms", "Times of India"),
    # 🇦🇺 Australian feeds
    ("https://www.abc.net.au/news/feed/51120/rss.xml", "ABC News Australia"),
    ("https://www.theguardian.com/au/rss", "The Guardian Australia"),
    ("https://www.sbs.com.au/news/feed", "SBS News"),
    ("https://www.smh.com.au/rss/feed.xml", "Sydney Morning Herald"),
    ("https://www.theage.com.au/rss/world.xml", "The Age"),
    ("https://www.theaustralian.com.au/rss/world.xml", "The Australian"),
    ("https://www.theconversation.com/au/rss/world", "The Conversation"),
    # 🌏 More global and Indian feeds
    # ("https://www.hindustantimes.com/rss/topnews/rssfeed.xml", "Hindustan Times"),
    # ("https://www.thehindu.com/news/national/feeder/default.rss", "The Hindu"),
    # ("https://www.france24.com/en/rss", "France 24"),
    # ("https://www.japantimes.co.jp/feed/", "Japan Times"),
    # ("https://www.scmp.com/rss/91/feed", "South China Morning Post"),
    # ("https://www.lemonde.fr/rss/une.xml", "Le Monde"),
    # ("https://www.elmundo.es/rss/portada.xml", "El Mundo"),
    # ("https://www.cbc.ca/cmlink/rss-world", "CBC World"),
    # ("https://www.latimes.com/world/rss2.0.xml", "LA Times World"),
    # ("https://www.washingtonpost.com/rss/world", "Washington Post World"),
    # ("https://www.indiatoday.in/rss/home", "India Today"),
    # ("https://indianexpress.com/section/india/feed/", "Indian Express"),
    # ("https://www.financialexpress.com/feed/", "Financial Express"),
    # ("https://www.business-standard.com/rss/latest.rss", "Business Standard"),
    # ("https://www.livemint.com/rss/news", "LiveMint"),
    # ("https://www.telegraphindia.com/rssfeed/section/nation.xml", "Telegraph India"),
    # ("https://www.deccanherald.com/rss-feeds/top-news", "Deccan Herald"),
    # ("https://www.outlookindia.com/rss/national-news", "Outlook India"),
    # ("https://www.news18.com/rss/india.xml", "News18 India"),
    # ("https://zeenews.india.com/rss/india-news.xml", "Zee News India"),
    # ("https://www.dnaindia.com/rss/india.xml", "DNA India"),
    # ("https://www.tribuneindia.com/rss/feed.aspx?cat_id=1", "Tribune India"),
    # ("https://www.indiatvnews.com/rssfeedsection/national-331.xml", "India TV News"),
]

def extract_image_from_entry(entry):
    """Extract image URL from RSS entry"""
    # Check multiple possible image fields
    image_fields = [
        'media_content',
        'media_thumbnail',
        'enclosures',
        'links',
        'media_group',
        'image',
        'thumbnail'
    ]
    
    for field in image_fields:
        if hasattr(entry, field):
            value = getattr(entry, field)
            if value:
                # Handle different field types
                if field == 'enclosures' and isinstance(value, list):
                    for enclosure in value:
                        if hasattr(enclosure, 'type') and 'image' in enclosure.type:
                            return enclosure.href
                elif field == 'media_content' and isinstance(value, list):
                    for media in value:
                        if hasattr(media, 'type') and 'image' in media.type:
                            return media.url
                elif field == 'links' and isinstance(value, list):
                    for link in value:
                        if hasattr(link, 'type') and 'image' in link.type:
                            return link.href
                elif isinstance(value, str) and (value.startswith('http') or value.startswith('//')):
                    return value
                elif hasattr(value, 'url'):
                    return value.url
                elif hasattr(value, 'href'):
                    return value.href
    
    return None

def fetch_rss_articles(user_country: str | None = None):
    total_saved = 0

    for rss_url, channel_name in FEEDS:
        print(f"\n🌍 Fetching from {channel_name}...")
        feed = feedparser.parse(rss_url)
        print(f"📡 Found {len(feed.entries)} entries.")

        for entry in feed.entries:
            url = entry.get("link")
            if not url or news_collection.find_one({"url": url}):
                continue

            # 🧹 Clean title
            title = entry.get("title", "")
            if isinstance(title, list):
                title = " ".join(str(t) for t in title)
            if not title:
                title = "No Title"
            title = title.strip()

            # ✂️ Extract summary text
            summary_text = entry.get("summary", "")
            if isinstance(summary_text, list):
                summary_text = " ".join(str(s) for s in summary_text)
            if not summary_text:
                summary_text = entry.get("description", "")
                if isinstance(summary_text, list):
                    summary_text = " ".join(str(s) for s in summary_text)
            if not summary_text:
                summary_text = title

            # 🧠 Summarize
            try:
                ai_summary = summarize_text(summary_text)
            except Exception as e:
                print(f"⚠️ Error summarizing article: {title[:50]}... | Error: {e}")
                ai_summary = summary_text[:150] + "..."  # fallback

            # 🕒 Published date
            published_at = entry.get("published", datetime.utcnow().isoformat())

            # 📦 Construct the article document
            article = {
                "title": title,
                "url": url,
                "original_summary": summary_text,
                "summary": ai_summary,
                "publishedAt": published_at,
                "channel": channel_name,
                "source": "RSS",
                "saved_at": datetime.utcnow(),
            }

            # Add image URL if found
            image_url = extract_image_from_entry(entry)
            if image_url:
                print(f"🖼️ Found image: {image_url[:50]}...")
                article["urlToImage"] = image_url
                article["image"] = image_url

            if user_country:
                article["userCountry"] = user_country.upper()

            # 💾 Insert into MongoDB
            try:
                news_collection.insert_one(article)
                print(f"✅ Saved: {title}")
                total_saved += 1
            except Exception as db_err:
                print(f"❌ DB Insert Failed: {title[:50]}... | Error: {db_err}")

    print(f"\n🎉 Total RSS articles saved: {total_saved}")
    return total_saved
