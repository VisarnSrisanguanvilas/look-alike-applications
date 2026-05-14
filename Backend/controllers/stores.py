from fastapi import APIRouter
from services.google_play import search_googleplay
from schemas import AppSearchResponse

router = APIRouter(prefix="/google-play", tags=["Store Search"])

@router.get("/search", response_model=AppSearchResponse)
def search_google_play_apps(keyword: str):
    """
    Search for applications on the official Google Play Store.
    
    - **keyword**: The application name or query to search for.
    """
    try:
        return {"results": search_googleplay(keyword)}
    except Exception as e:
        return {"error": str(e)}
