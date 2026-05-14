from ddgs import DDGS
from urllib.parse import urlparse, parse_qs, unquote
import re
from rapidfuzz import fuzz

BLACKLIST_DOMAINS = [
    "facebook.com", "twitter.com", "instagram.com", "linkedin.com", "youtube.com",
    "wikipedia.org", "reddit.com", "quora.com", "pinterest.com", "medium.com",
    "google.com", "play.google.com", "apple.com", "apps.apple.com",
    "microsoft.com", "amazon.com", "github.com", "stackoverflow.com",
    "apkpure.com", "apkmirror.com",
    "bbc.com", "cnn.com", "nytimes.com", "theguardian.com", "reuters.com",
    "bloomberg.com", "forbes.com", "sanook.com", "pantip.com", "thairath.co.th",
    "kapook.com", "matichon.co.th", "khaosod.co.th", "mgronline.com", "dailynews.co.th"
]

DOWNLOAD_KEYWORDS = [
    "apk", "download", "mod", "mirror", "latest", "android", "free", 
    "premium", "unlocked", "hacked", "cracked", "installer", "update"
]

def extract_real_url(ddg_url):
    try:
        if "duckduckgo.com/l/" in ddg_url:
            parsed = urlparse(ddg_url)
            query = parse_qs(parsed.query)
            if "uddg" in query:
                return unquote(query["uddg"][0])
        return ddg_url
    except:
        return ddg_url

def extract_domain(url):
    try:
        return urlparse(url).netloc.lower()
    except:
        return "unknown"

def get_similarity(a, b):
    """Calculate string similarity ratio (0.0 to 1.0) using rapidfuzz WRatio."""
    if not a or not b:
        return 0.0
    return fuzz.WRatio(a.lower(), b.lower()) / 100.0

def is_likely_download_site(title, url):
    """Preliminary filter for APK/App download platforms."""
    title_lower = title.lower()
    url_lower = url.lower()
    domain = extract_domain(url)
    
    if any(d in domain for d in BLACKLIST_DOMAINS):
        return False
    
    has_download_context = any(k in title_lower or k in url_lower for k in DOWNLOAD_KEYWORDS)
    is_apk_target = ".apk" in url_lower or "apk" in domain
    
    return has_download_context or is_apk_target

def is_relevant_to_keyword(keyword, title, url):
    """Smart matching: Accepts direct containment or fuzzy similarity."""
    kw = keyword.lower()
    t = title.lower()
    u = url.lower()
    
    if kw in t or kw in u:
        return True
    
    kw_words = kw.split()
    if len(kw_words) > 1:
        matches = sum(1 for w in kw_words if len(w) > 2 and (w in t or w in u))
        if matches >= len(kw_words) * 0.5: 
            return True
            
    similarity = get_similarity(keyword, title)
    if similarity > 0.5:
        return True
        
    return False

def build_search_queries(keyword):
    """Generate simplified, high-yield search variations to avoid rate-limiting."""
    return [
        f'"{keyword}" apk download',
        f'"{keyword}" android mod mirror',
        f'download {keyword} apk -site:google.com -site:apple.com',
        f'"{keyword}" latest apk version'
    ]

def search_duckduckgo(keyword):
    results = []
    seen_urls = set()
    queries = build_search_queries(keyword)
    total = len(queries)

    with DDGS() as ddgs:
        for idx, q in enumerate(queries):
            pct = 10 + int((idx / total) * 60)
            yield ("progress", pct, f"Analysis focus: {q}")
            
            try:
                ddgs_results = list(ddgs.text(q, max_results=30))
                found_new = 0
                for r in ddgs_results:
                     real_url = r.get('href')
                     text = r.get('title')
                     if not real_url or "duckduckgo.com" in real_url:
                         continue
                     
                     real_url = extract_real_url(real_url)
                     domain = extract_domain(real_url)
                     
                     if real_url in seen_urls:
                         continue
                     
                     if not is_likely_download_site(text, real_url):
                         continue
                         
                     if not is_relevant_to_keyword(keyword, text, real_url):
                         continue
                         
                     seen_urls.add(real_url)
                     results.append({
                         "app_name": text,
                         "link": real_url,
                         "source": domain,
                         "query": q
                     })
                     found_new += 1
                
                if found_new > 0:
                    yield ("progress", pct + 1, f"Found {found_new} mirrors via '{q}'")
                else:
                    yield ("progress", pct + 1, "Polishing results...")

            except Exception as e:
                if "ConnectError" in str(e) or "No results found" in str(e):
                    yield ("progress", pct + 1, f"Search node busy, skipping query...")
                else:
                    print(f"Engine Warning: {e}")
                continue

    if len(results) == 0:
        yield ("progress", 75, "Warning: Search engine returned zero results. (Possible Network Constraint)")
    else:
        yield ("progress", 75, f"Search completed. Total unique sources identified: {len(results)}")
        
    yield ("done", results)
