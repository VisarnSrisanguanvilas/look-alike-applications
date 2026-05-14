import httpx

def search_aptoide(keyword, limit=20):
    """
    Search for apps on Aptoide using their public API.
    """
    results = []
    arch_q = "bXlDUFU9YXJtNjQtdjhhLGFybWVhYmktdjdhLGFybWVhYmkmbGVhbmJhY2s9MA"
    api_url = (
        f"https://ws2-cache.aptoide.com/api/7/apps/search"
        f"?query={keyword}&limit={limit}&offset=0"
        f"&country=TH&language=th&aab=1&mature=false"
        f"&q={arch_q}&origin=SITE&store_name=aptoide-web"
    )
    
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36"
    }

    try:
        with httpx.Client(headers=headers, timeout=10) as client:
            response = client.get(api_url)
            if response.status_code == 200:
                data = response.json()
                items = data.get("datalist", {}).get("list", [])
                
                for item in items:
                    package = item.get("package", "")
                    if not package:
                        continue
                        
                    if any(r["package"] == package for r in results):
                        continue

                    name = item.get("name", "Unknown")
                    icon = item.get("icon", "")
                    
                    dev_obj = item.get("developer") or {}
                    developer = dev_obj.get("name", "Aptoide Developer") if isinstance(dev_obj, dict) else "Aptoide Developer"
                    
                    file_obj = item.get("file") or {}
                    version = file_obj.get("vername", "N/A") if isinstance(file_obj, dict) else "N/A"
                    
                    uname = item.get("uname")
                    if uname:
                        link = f"https://{uname}.en.aptoide.com/app"
                    else:
                        link = f"https://en.aptoide.com/search?query={package}"
                    
                    stats_obj = item.get("stats") or {}
                    installs = str(stats_obj.get("pdownloads", 0))
                    if int(installs) >= 1000000:
                        installs = f"{int(installs) // 1000000}M+"
                    elif int(installs) >= 1000:
                        installs = f"{int(installs) // 1000}K+"
                    
                    score = stats_obj.get("prating", {}).get("avg", 0)
                    updated = item.get("updated")
                    md5 = file_obj.get("md5sum") if isinstance(file_obj, dict) else None
                    
                    results.append({
                        "app_name": name,
                        "package": package,
                        "developer": developer,
                        "version": version,
                        "icon": icon,
                        "installs": installs,
                        "score": score,
                        "updated": updated,
                        "md5": md5,
                        "source": "aptoide",
                        "link": link
                    })
                    
                    if len(results) >= limit:
                        break
                        
                return results
            else:
                print(f"Aptoide API Failed: Status {response.status_code}")
                
    except Exception as e:
        print(f"Aptoide Search Error: {e}")
        
    return []
