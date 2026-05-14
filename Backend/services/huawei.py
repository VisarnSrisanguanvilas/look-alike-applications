from playwright.sync_api import sync_playwright
import os


def search_huawei(keyword: str, limit: int = 15) -> list[dict]:
    search_url = f"https://appgallery.huawei.com/search/{keyword}"

    by_appid: dict[str, dict] = {}
    list_apps: dict[str, dict] = {}

    def _handle_response(response):
        if "method=internal.getTabDetail" not in response.url:
            return
        if response.status != 200:
            return
        try:
            data = response.json()
        except Exception:
            return

        for layout in data.get("layoutData", []):
            layout_name = layout.get("layoutName", "")
            data_list   = layout.get("dataList", [])

            if layout_name == "detailhiddencard":
                for item in data_list:
                    appid   = item.get("appid")
                    package = item.get("package")
                    if not appid or not package:
                        continue
                    entry = by_appid.setdefault(appid, {})
                    entry.setdefault("appid",   appid)
                    entry.setdefault("package", package)
                    entry.setdefault("name",    item.get("name", ""))
                    entry.setdefault("icon",    item.get("icon", ""))
                    entry.setdefault("sha256",  item.get("sha256", ""))
                    entry.setdefault("installs", item.get("downCountDesc", ""))

            elif layout_name == "detailappinfocard":
                pass

            elif layout_name == "detailheadcard":
                for item in data_list:
                    appid = item.get("appid")
                    if not appid:
                        continue
                    entry = by_appid.setdefault(appid, {})
                    entry.setdefault("name", item.get("name", ""))
                    entry.setdefault("icon", item.get("icoUri", ""))

            else:
                for container in data_list:
                    items = (
                        container.get("list", [])
                        if isinstance(container, dict)
                        else []
                    )
                    if not items:
                        items = data_list

                    for item in items:
                        package = item.get("package")
                        name    = item.get("name")
                        appid   = item.get("appid")
                        if not package or not name:
                            continue
                        if package in list_apps:
                            continue
                        list_apps[package] = {
                            "appid":   appid or "",
                            "package": package,
                            "name":    name,
                            "icon":    item.get("icon", ""),
                            "sha256":  item.get("sha256", ""),
                            "installs": item.get("downCountDesc", ""),
                        }
                    break

    try:
        with sync_playwright() as pw:
            ws_endpoint = os.getenv("PLAYWRIGHT_WS_ENDPOINT")
            
            if ws_endpoint:
                print(f"[Huawei] Connecting to remote browser at {ws_endpoint}")
                browser = pw.chromium.connect_over_cdp(ws_endpoint)
            else:
                print("[Huawei] Launching local browser (fallback)")
                browser = pw.chromium.launch(headless=True)
                
            context = browser.new_context(
                user_agent=(
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                    "AppleWebKit/537.36 (KHTML, like Gecko) "
                    "Chrome/124.0.0.0 Safari/537.36"
                ),
                locale="en-US",
            )
            page = context.new_page()
            page.on("response", _handle_response)

            page.goto(search_url, wait_until="networkidle", timeout=30000)

            if not by_appid and not list_apps:
                page.wait_for_timeout(4000)

            if not by_appid and not list_apps:
                page.mouse.wheel(0, 2000)
                page.wait_for_timeout(3000)

            browser.close()

    except Exception as e:
        print(f"[Huawei] Playwright failed: {e}")
        return []

    results: list[dict] = []
    seen_pkgs: set[str] = set()

    for appid, entry in by_appid.items():
        pkg = entry.get("package", "")
        if not pkg or pkg in seen_pkgs:
            continue
        seen_pkgs.add(pkg)
        results.append({
            "app_name": entry.get("name", "Unknown"),
            "package":  pkg,
            "sha256":   entry.get("sha256", ""),
            "icon":     entry.get("icon", ""),
            "installs": entry.get("installs", ""),
            "appid":    entry.get("appid", ""),
            "source":   "huawei",
            "link":     f"https://appgallery.huawei.com/app/{appid}",
        })

    for pkg, entry in list_apps.items():
        if pkg in seen_pkgs:
            continue
        seen_pkgs.add(pkg)
        appid = entry.get("appid", "")
        results.append({
            "app_name": entry.get("name", "Unknown"),
            "package":  pkg,
            "sha256":   entry.get("sha256", ""),
            "icon":     entry.get("icon", ""),
            "source":   "huawei",
            "link":     f"https://appgallery.huawei.com/app/{appid}" if appid else "",
            "installs": entry.get("installs", ""),
            "appid":    entry.get("appid", ""),
        })

    return results[:limit]
