import re
from typing import List, Optional, Dict, Any
from rapidfuzz import fuzz

# ---------------------------
# Constants & Configuration
# ---------------------------
RISK_KEYWORDS = {
    "HIGH": ["mod", "hack", "cracked", "inject", "cheat", "unlimited", "premium unlocked", "patcher"],
    "MEDIUM": ["vip", "premium", "pro", "paid", "unlocked"],
    "LOW": ["free", "apk", "download", "latest", "update", "android"]
}

SUSPICIOUS_TLDS = [".xyz", ".top", ".club", ".pw", ".online", ".site", ".casa", ".monster"]

KNOWN_APK_MIRRORS = [
    "apkmirror.com", "apkpure.com", "uptodown.com", "apkmody.io", 
    "happymod.com", "rexdl.com", "revdl.com", "apkmonk.com"
]

def get_similarity(a, b, strict=False):
    """Calculate string similarity ratio (0.0 to 1.0).
    - If strict=True: Use fuzz.ratio (Standard Levenshtein) - Sensitive to suffixes.
    - If strict=False: Use fuzz.WRatio (Weighted) - More lenient with suffixes/mods.
    """
    if not a or not b:
        return 0.0
    
    if strict:
        return fuzz.ratio(a.lower(), b.lower()) / 100.0
    return fuzz.WRatio(a.lower(), b.lower()) / 100.0

def clean_app_name(full_name: str, keyword: str = "") -> str:
    """Extracts the core name of an app by removing suffixes, taglines, and promotions."""
    if not full_name: return ""
    
    core = re.sub(r'\s*[\(\[].*?[\)\]]', '', full_name)
    
    separators = [" - ", " – ", " — ", " : ", " | ", ": ", "|"]
    for sep in separators:
        if sep in core:
            parts = core.split(sep)
            if keyword:
                best_match = parts[0]
                best_sim = 0
                for p in parts:
                    sim = fuzz.WRatio(keyword.lower(), p.strip().lower()) / 100.0
                    if sim > best_sim:
                        best_sim = sim
                        best_match = p
                core = best_match
            else:
                core = parts[0]
            break
            
    if keyword:
        kw_words = keyword.lower().split()
        core_words = core.split()
        
        if core_words and kw_words:
            first_word_sim = fuzz.ratio(core_words[0].lower(), kw_words[0].lower()) / 100.0
            if first_word_sim >= 0.85:
                if len(core_words) > len(kw_words) + 1:
                    return keyword.strip()
            
    return core.strip()

def get_primary_name(name: str) -> str:
    """Extracts the primary brand name (the first word) after cleaning."""
    if not name: return ""
    cleaned = clean_app_name(name)
    # Split by any whitespace and take the first token
    words = cleaned.split()
    if words:
        return words[0]
    return cleaned

def detect_lookalike(search_apps: List[Dict[str, Any]], keyword: str, official_apps: Optional[List[Dict[str, Any]]] = None) -> List[Dict[str, Any]]:
    keyword = keyword.lower()

    official_title = ""
    official_package = ""
    official_developer = ""
    
    if official_apps and len(official_apps) > 0:
        main_app = official_apps[0]
        official_title = (main_app.get("app_name") or "").lower()
        official_package = (main_app.get("package") or "").lower()
        official_developer = (main_app.get("developer") or "").lower()

    store_ref_devs = {}
    if official_developer:
        store_ref_devs["google play"] = official_developer

    for app_item in search_apps:
        src = (app_item.get("source") or "").lower()
        if any(x in src for x in ["apple", "huawei"]):
            if src in store_ref_devs: continue 
            
            app_name = (app_item.get("app_name") or "").lower()
            sim = get_similarity(official_title, app_name, strict=True)
            if sim >= 1.0:
                dev = (app_item.get("developer") or "").lower()
                if dev:
                    store_ref_devs[src] = dev

    for app_item in search_apps:
        name = (app_item.get("app_name") or "").lower()
        source = (app_item.get("source") or "").lower()
        link = (app_item.get("link") or "").lower()
        package = (app_item.get("package") or "").lower()
        developer = (app_item.get("developer") or "").lower()

        local_official_dev = store_ref_devs.get(source) or official_developer

        similarity = get_similarity(official_title, name)
        similarity_strict = get_similarity(official_title, name, strict=True)

        is_trusted_store = any(x in source for x in ["google play", "apple"])
        is_official = False
        
        if is_trusted_store:
            if official_package and package == official_package:
                is_official = True
            elif similarity_strict >= 0.95:
                is_official = True
        
        if is_official:
            app_item["is_official"] = True
            app_item["risk_score"] = 0
            app_item["similarity"] = round(similarity, 2)
            app_item["reasons"] = [f"Official app from {source.title()}"]
            app_item["is_suspicious"] = False
            continue

        if is_trusted_store and local_official_dev and developer == local_official_dev:
            app_item["is_official"] = False
            app_item["risk_score"] = 0
            app_item["similarity"] = round(similarity, 2)
            app_item["reasons"] = [f"Same developer on {source.title()}"]
            app_item["is_suspicious"] = False
            continue

        app_item["is_official"] = False
        score = 0
        reasons = []
        if similarity == 1.0:
            score += 3
            reasons.append(f"Exact name match on unverified source (+3)")
        elif similarity > 0.8:
            score += 2
            reasons.append(f"High name similarity ({int(similarity*100)}%) (+2)")
        elif similarity > 0.4:
            score += 1
            reasons.append(f"Moderate name similarity ({int(similarity*100)}%) (+1)")

        if package != official_package:
            if similarity > 0.75:
                score += 5
                reasons.append(f"Official name mimicry detected: Name matches but Package ID is different (+5)")
            elif similarity > 0.5:
                score += 3
                reasons.append(f"Moderate name similarity with package mismatch (+3)")

        for w in RISK_KEYWORDS["HIGH"]:
            if w in name or w in link:
                score += 3
                reasons.append(f"Found high-risk keyword: '{w}' (+3)")
        for w in RISK_KEYWORDS["MEDIUM"]:
            if w in name or w in link:
                score += 2
                reasons.append(f"Found medium-risk keyword: '{w}' (+2)")
        for w in RISK_KEYWORDS["LOW"]:
            if w in name or w in link:
                score += 1
                reasons.append(f"Found low-risk keyword: '{w}' (+1)")

        best_pkg_sim = 0
        if official_package:
            if package == official_package:
                score += 5
                reasons.append(f"Exact match official package ID (+5)")
            elif official_package in link or official_package in package:
                score += 6 
                reasons.append(f"Matched official package ID in URL/Package (+6)")
            else:
                target_str = package if package else link
                segments = re.split(r'[/.\-_?#=&+]', target_str)
                for segment in segments:
                    if len(segment) >= len(official_package) * 0.5:
                        sim = get_similarity(official_package, segment)
                        if sim > best_pkg_sim:
                            best_pkg_sim = sim
                
                if best_pkg_sim > 0.75:
                    score += 5
                    reasons.append(f"Found very similar package ID ({int(best_pkg_sim*100)}%) (+5)")
                elif best_pkg_sim > 0.5:
                    score += 3
                    reasons.append(f"Found similar package ID ({int(best_pkg_sim*100)}%) (+3)")
            
        if local_official_dev:
            is_different_dev = developer and developer.lower() != local_official_dev.lower()
            if is_different_dev and (local_official_dev in name or similarity > 0.7):
                score += 5
                reasons.append(f"Developer name mismatch but app name is very similar (+5)")
            elif is_different_dev and (local_official_dev in name or similarity > 0.5):
                score += 3
                reasons.append(f"Developer name mismatch but app name is very similar (+3)")
            
            if is_trusted_store and is_different_dev and (best_pkg_sim > 0.7 or official_package in package):
                score += 6
                reasons.append(f"Impersonation detected on Store: Similar Package ID with different Developer (+6)")
            elif local_official_dev in name and "play.google.com" not in link:
                if any(tld in source for tld in SUSPICIOUS_TLDS) or "apk" in source:
                    score += 3
                    reasons.append(f"Developer name match on suspicious domain (+3)")

        if not is_trusted_store:
            if keyword in source and not any(m in source for m in KNOWN_APK_MIRRORS):
                if similarity < 1.0: 
                    score += 3
                    reasons.append(f"Keyword in domain name (+3)")
            
            if any(source.endswith(tld) for tld in SUSPICIOUS_TLDS):
                score += 2
                reasons.append(f"Suspicious TLD: {source.split('.')[-1]} (+2)")
                
            if any(x in source for x in ["apk", "mod", "dl", "store"]):
                score += 1
                reasons.append(f"Risk-related term in domain (+1)")

        if official_apps and len(official_apps) > 0:
            official_installs_raw = official_apps[0].get("installs") or ""
            pkg_installs_raw = (app_item.get("installs") or "").lower()
            
            is_huge_official = any(x in official_installs_raw for x in ["M", "B"])
            is_low_result = "k" in pkg_installs_raw or pkg_installs_raw.isdigit() or not pkg_installs_raw
            
            if similarity > 0.8 and is_huge_official and is_low_result:
                score += 5
                reasons.append(f"Popularity Anomaly: High similarity app with significantly lower installs (+5)")
            
            off_score = official_apps[0].get("score") or 0
            res_score = app_item.get("score") or 0
            if off_score > 3.5 and res_score > 0 and res_score < 2.5:
                score += 3
                reasons.append(f"Rating Disparity: Low user rating for a brand-like app (+3)")

        app_item["risk_score"] = score
        app_item["similarity"] = round(similarity, 2)
        app_item["reasons"] = reasons
        
        app_item["is_suspicious"] = score >= 1 or (similarity > 0.7 and score >= 2)

    search_apps.sort(key=lambda x: (x.get("is_official", False), x["risk_score"]), reverse=True)

    return search_apps
