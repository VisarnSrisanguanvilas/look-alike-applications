from playwright.sync_api import sync_playwright
import json
import os

def is_likely_app_page(title, url):
    """
    Heuristic to filter out non-app pages (guides, news, collections).
    """
    exclude_keywords = ["how to", "guide", "news", "collection", "best of", "top", "list"]
    title_lower = title.lower()
    url_lower = url.lower()
    
    if any(kw in title_lower for kw in exclude_keywords):
        return False
        
    exclude_paths = ["/howto/", "/news/", "/topic/", "/list/", "/collection/"]
    if any(path in url_lower for path in exclude_paths):
        return False
        
    return True

def search_apkpure(keyword, limit=20):
    """
    Search for apps on APKPure using Playwright to scrape the Thai-localized search page.
    This ensures results match what users see on the official website.
    """
    results = []
    search_url = f"https://apkpure.com/search?q={keyword}"

    try:
        with sync_playwright() as p:
            ws_endpoint = os.getenv("PLAYWRIGHT_WS_ENDPOINT")
            
            if ws_endpoint:
                print(f"[APKPure] Connecting to remote browser at {ws_endpoint}")
                browser = p.chromium.connect_over_cdp(ws_endpoint)
            else:
                print("[APKPure] Launching local browser (fallback)")
                browser = p.chromium.launch(headless=True)
                
            context = browser.new_context(
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36"
            )
            page = context.new_page()

            page.goto(search_url, wait_until="domcontentloaded", timeout=30000)
            
            try:
                page.wait_for_selector(".search-res", timeout=5000)
            except:
                pass

            try:
                featured_card = page.locator(".search-title").first
                if featured_card.count() > 0 or page.locator(".first-info").count() > 0:
                    hero_selectors = [".search-title", ".first-info", ".detail-info", "#search .first"]
                    for sel in hero_selectors:
                        hero = page.locator(sel).first
                        if hero.count() > 0:
                            try:
                                hero_title_el = hero.locator(".p1, h1, .title, .name").first
                                hero_title = hero_title_el.inner_text().strip() if hero_title_el.count() > 0 else ""

                                hero_link_el = hero.locator("a").first
                                if hero_link_el.count() > 0:
                                    hero_href = hero_link_el.get_attribute("href") or ""
                                    hero_pkg = hero_link_el.get_attribute("data-dt-app") or ""
                                    if not hero_pkg and hero_href:
                                        hero_pkg = hero_href.split("/")[-1]

                                    if hero_pkg and "." in hero_pkg:
                                        hero_link = f"https://apkpure.com{hero_href}" if hero_href.startswith("/") else hero_href
                                        hero_img = hero.locator("img").first
                                        hero_icon = (hero_img.get_attribute("src") or hero_img.get_attribute("data-original") or "") if hero_img.count() > 0 else ""
                                        hero_dev_el = hero.locator(".p2, .developer, .dev-name").first
                                        hero_dev = hero_dev_el.inner_text().strip() if hero_dev_el.count() > 0 else ""

                                        if hero_title and is_likely_app_page(hero_title, hero_link):
                                            results.append({
                                                "app_name": hero_title,
                                                "package": hero_pkg,
                                                "developer": hero_dev,
                                                "icon": hero_icon,
                                                "source": "apkpure",
                                                "link": hero_link
                                            })
                                        break
                            except:
                                continue
            except:
                pass

            items = page.locator(".search-res li").all()

            seen_packages = {r["package"] for r in results}

            for item in items[:limit]:
                try:
                    title_elem = item.locator(".p1")
                    title = title_elem.inner_text().strip() if title_elem.count() > 0 else "Unknown"
                    
                    link_elem = item.locator("a.dd")
                    if link_elem.count() == 0:
                        link_elem = item.locator("a").first()
                    
                    if link_elem.count() > 0:
                        relative_url = link_elem.get_attribute("href")
                        package = link_elem.get_attribute("data-dt-app")
                        
                        if not package and relative_url:
                            package = relative_url.split("/")[-1]
                        
                        if not package or "." not in package:
                            continue

                        if package in seen_packages:
                            continue

                        link = f"https://apkpure.com{relative_url}" if relative_url.startswith("/") else relative_url
                        
                        if not is_likely_app_page(title, link):
                            continue

                        img_elem = item.locator("img")
                        icon = img_elem.get_attribute("src") or img_elem.get_attribute("data-original") if img_elem.count() > 0 else ""
                        
                        dev_elem = item.locator(".p2")
                        developer = dev_elem.inner_text().strip() if dev_elem.count() > 0 else "APKPure Mirror"
                        
                        seen_packages.add(package)
                        results.append({
                            "app_name": title,
                            "package": package,
                            "developer": developer,
                            "icon": icon,
                            "source": "apkpure",
                            "link": link
                        })
                except:
                    continue

            browser.close()
            return results

    except Exception as e:
        print(f"APKPure Scraper Failed: {e}")

    return []
