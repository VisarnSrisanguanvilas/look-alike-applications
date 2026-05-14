from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from controllers import intelligence, stores, analysis

# ------------------------
# setup
# ------------------------
load_dotenv()

app = FastAPI(
    title="Look-alike Application Intelligence API",
    description="""
    This API provides intelligence capabilities for identifying and analyzing application look-alikes 
    and potential brand impersonations across multiple application stores.
    
    Supported Stores:
    - Google Play
    - Apple App Store
    - APKPure
    - Aptoide
    - Huawei AppGallery
    """,
    version="1.1.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health", tags=["System"])
def health_check():
    return {"status": "ok"}

# ------------------------
# Controllers / Routers
# ------------------------
app.include_router(intelligence.router)
app.include_router(stores.router)
app.include_router(analysis.router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)