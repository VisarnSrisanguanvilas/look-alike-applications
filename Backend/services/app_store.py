import requests
from rapidfuzz import fuzz

def search_app_store(keyword, limit=50, country='th'):
    """
    Search for apps on the Apple App Store using the iTunes Search API.
    Fetches a large pool of results then re-sorts by keyword similarity
    instead of relying on Apple's ranking algorithm.
    """
    url = "https://itunes.apple.com/search"
    params = {
        "term": keyword,
        "entity": "software",
        "limit": limit,
        "country": country,
        "lang": "en_us"
    }

    try:
        response = requests.get(url, params=params, timeout=10)
        if response.status_code != 200:
            return []

        data = response.json()
        results = []

        for item in data.get("results", []):
            updated_ts = 0
            release_date = item.get("currentVersionReleaseDate")
            if release_date:
                try:
                    from datetime import datetime
                    dt = datetime.fromisoformat(release_date.replace('Z', '+00:00'))
                    updated_ts = int(dt.timestamp())
                except:
                    pass

            results.append({
                "app_name": item.get("trackName"),
                "package": item.get("bundleId"),
                "developer": item.get("artistName"),
                "icon": item.get("artworkUrl100"),
                "source": "apple app store",
                "link": item.get("trackViewUrl"),
                "score": item.get("averageUserRating"),
                "version": item.get("version"),
                "updated": updated_ts
            })

        results.sort(
            key=lambda a: fuzz.WRatio(keyword.lower(), (a.get("app_name") or "").lower()),
            reverse=True
        )

        return results

    except Exception as e:
        print(f"Error searching App Store: {e}")
        return []
