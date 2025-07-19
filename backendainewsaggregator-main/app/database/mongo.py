import os
from pymongo import MongoClient
from motor.motor_asyncio import AsyncIOMotorClient

# Try MongoDB Atlas first, fallback to local
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")

try:
    client = MongoClient(MONGO_URL, serverSelectionTimeoutMS=5000)
    # Test the connection
    client.admin.command('ping')
    print("✅ Connected to MongoDB")
except Exception as e:
    print(f"❌ MongoDB connection failed: {e}")
    print("🔄 Using in-memory storage for testing...")
    # Use a simple in-memory storage for testing
    class MockCollection:
        def __init__(self):
            self.data = []
        
        def insert_one(self, doc):
            doc['_id'] = len(self.data) + 1
            self.data.append(doc)
            return type('Result', (), {'inserted_id': doc['_id']})()
        
        def find_one(self, query):
            return next((item for item in self.data if all(item.get(k) == v for k, v in query.items())), None)
        
        def find(self, query=None):
            if query is None:
                return self.data
            return [item for item in self.data if all(item.get(k) == v for k, v in query.items())]
    
    # Create mock collections
    news_collection = MockCollection()
    users_collection = MockCollection()
else:
    db = client.news_aggregator
    news_collection = db.news
    users_collection = db.users
