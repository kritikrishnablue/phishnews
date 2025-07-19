from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles  # 👈 Add this import
import os  # 👈 Add this to check/create directory if needed
from fastapi.security import HTTPBearer
from fastapi.openapi.utils import get_openapi
from fastapi.middleware.cors import CORSMiddleware
import httpx
from fastapi.responses import Response

from app.api.auth import auth_router
from app.api.news import news_router
from app.api.rss import rss_router
from app.api.location import loc_router
from app.api.user import user_router
app = FastAPI()
bearer_scheme = HTTPBearer()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    openapi_schema = get_openapi(
        title="AI News Aggregator API",
        version="1.0.0",
        description="API with JWT authentication",
        routes=app.routes,
    )
    openapi_schema["components"]["securitySchemes"] = {
        "HTTPBearer": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT"
        }
    }
    for path in openapi_schema["paths"].values():
        for method in path.values():
            method.setdefault("security", [{"HTTPBearer": []}])
    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi

# 👇 Add this block to serve /static (favicon or others)
if not os.path.exists("static"):
    os.makedirs("static")

app.mount("/static", StaticFiles(directory="static"), name="static")

# Remove the favicon route since the file doesn't exist
# @app.get("/favicon.ico")
# async def favicon():
#     from fastapi.responses import FileResponse
#     return FileResponse("static/favicon.ico")

# Routers
app.include_router(news_router, prefix="/news")
app.include_router(auth_router, prefix="/auth")
app.include_router(rss_router, prefix="/rss")
app.include_router(loc_router)
app.include_router(user_router, prefix="/user")

@app.get("/proxy/image")
async def proxy_image(url: str):
    """Proxy endpoint to handle CORS issues for images"""
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(url)
            response.raise_for_status()
            
            # Return the image with proper headers
            return Response(
                content=response.content,
                media_type=response.headers.get("content-type", "image/jpeg"),
                headers={
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "GET",
                    "Access-Control-Allow-Headers": "*",
                    "Cache-Control": "public, max-age=3600"
                }
            )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to proxy image: {str(e)}")

@app.get("/")
def read_root():
    return {"message": "✅ AI News Aggregator Backend is Running"}

@app.get("/health")
def health_check():
    try:
        # Test MongoDB connection
        from app.database.mongo import client
        client.admin.command('ping')
        return {
            "status": "healthy",
            "mongodb": "connected",
            "message": "All systems operational"
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "mongodb": "disconnected",
            "error": str(e)
        }
