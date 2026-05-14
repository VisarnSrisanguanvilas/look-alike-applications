import requests
import re
from google_play_scraper import search, app
from rapidfuzz import fuzz
from concurrent.futures import ThreadPoolExecutor

def search_googleplay(keyword, limit=50):
    """
    Search for apps on Google Play Store.
    Ensures all metadata fields are present by making parallel detail calls.
    """
    search_results = search(keyword, lang="en", country="th", n_hits=limit)
    
    url = f"https://play.google.com/store/search?q={keyword}&c=apps"
    headers = {"User-Agent": "Mozilla/5.0"}
    pkg_ids = []
    try:
        html = requests.get(url, headers=headers).text
        for p in re.findall(r'/store/apps/details\?id=([a-zA-Z0-9._]+)', html):
            if p not in pkg_ids:
                pkg_ids.append(p)
    except Exception:
        pass

    for r in search_results:
        if r.get("appId") and r.get("appId") not in pkg_ids:
            pkg_ids.append(r.get("appId"))
    target_pkgs = pkg_ids[:15]

    def fetch_full_detail(pkg):
        try:
            d = app(pkg, lang="en", country="th")
            if not d:
                return None
                
            return {
                "app_name": d.get("title"),
                "package": d.get("appId"),
                "developer": d.get("developer"),
                "developer_id": d.get("developerId"),
                "developer_email": d.get("developerEmail"),
                "score": d.get("score"),
                "ratings": d.get("ratings"),
                "installs": d.get("installs"),
                "genre": d.get("genre"),
                "description": d.get("description"),
                "icon": d.get("icon"),
                "version": d.get("version") or "Varies with device",
                "updated": d.get("updated"),
                "android_version": d.get("androidVersionText") or d.get("androidVersion") or "Varies with device",
                "content_rating": d.get("contentRating"),
                "released": d.get("released"),
                "permissions": [p.get("permission") for p in d.get("permissions", [])] if d.get("permissions") else [],
                "source": "google play",
                "link": f"https://play.google.com/store/apps/details?id={d.get('appId')}",
            }
        except Exception:
            return None

    apps = []
    if target_pkgs:
        with ThreadPoolExecutor(max_workers=len(target_pkgs)) as executor:
            results = list(executor.map(fetch_full_detail, target_pkgs))
            apps = [r for r in results if r]

    apps.sort(
        key=lambda a: fuzz.WRatio(keyword.lower(), (a.get("app_name") or "").lower()),
        reverse=True
    )

    return apps
