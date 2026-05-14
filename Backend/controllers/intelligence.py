from fastapi import APIRouter, HTTPException
import requests
import os
from schemas import KoodousSearchResponse

router = APIRouter(prefix="/koodous", tags=["Malware Intelligence"])

KOODOUS_API_KEY = os.getenv("KOODOUS_API_KEY")

@router.get("/search", response_model=KoodousSearchResponse)
def search_koodous(keyword: str):
    """
    Search the Koodous APK database for potential malware or known samples.
    
    - **keyword**: The application name or package identifier to search for.
    """
    try:
        response = requests.get(
            "https://developer.koodous.com/apks/",
            params={"search": keyword},
            headers={"Authorization": f"Token {KOODOUS_API_KEY}"},
            timeout=5
        )

        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code if response.status_code in [400, 401, 403, 404] else 500,
                detail=f"Koodous API error: {response.status_code} - {response.text}"
            )

        data = response.json()

        results = [
            {
                "id": item.get("id"),
                "app": item.get("app"),
                "package_name": item.get("package_name"),
                "sha256": item.get("sha256"),
                "image": item.get("image"),
                "is_detected": item.get("detected") or False,
                "tags": item.get("tags") or []
            }
            for item in data.get("results", [])
        ]

        return {"results": results}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
