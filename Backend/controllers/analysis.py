from fastapi import APIRouter, Query
from typing import Optional
from fastapi.responses import StreamingResponse
import asyncio
import json
import os

from services.app_store import search_app_store
from services.google_play import search_googleplay
from services.search_engine import search_duckduckgo
from services.apkpure import search_apkpure
from services.aptoide import search_aptoide
from services.huawei import search_huawei
from services.analysis import detect_lookalike, clean_app_name, get_primary_name

router = APIRouter(prefix="/lookalike", tags=["Threat Analysis"])

_STORES_START_PCT = 50
_STORES_END_PCT   = 93
_DDG_START_PCT    = 5
_DDG_END_PCT      = 50

def _scale_ddg_pct(raw: int) -> int:
    """Map DDG's 10-75 range → 5-50 range."""
    clamped = max(10, min(75, raw))
    return int(_DDG_START_PCT + (clamped - 10) / (75 - 10) * (_DDG_END_PCT - _DDG_START_PCT))

@router.get("/analyze")
async def analyze_lookalikes(
    keyword: str,
    official_name: Optional[str] = Query(None),
    official_package: Optional[str] = Query(None),
    official_developer: Optional[str] = Query(None)
):
    """
    Performs a deep look-alike analysis across multiple stores using a keyword.
    
    This endpoint uses Server-Sent Events (SSE) to provide real-time progress updates.
    """
    search_query = clean_app_name(official_name or keyword)
    primary_query = get_primary_name(official_name or keyword)
    
    queries = list(set([official_name or keyword, search_query, primary_query]))
    if not queries: queries = [keyword]

    async def event_stream():
        try:
            loop = asyncio.get_running_loop()

            def _send(pct: int, step: str) -> str:
                return f"event: progress\ndata: {json.dumps({'progress': pct, 'step': step})}\n\n"

            yield _send(5, "Starting search engine scan...")

            ddg_queue: asyncio.Queue = asyncio.Queue()
            num_queries = len(queries)

            def _run_ddg_all():
                """Blocking: iterate multiple DDG queries and push events to queue."""
                for i, q in enumerate(queries):
                    q_start_pct = i / num_queries
                    q_end_pct = (i + 1) / num_queries
                    
                    for ev in search_duckduckgo(q):
                        kind = ev[0]
                        if kind == "progress":
                            raw_pct = ev[1]
                            scaled_pct = int(10 + (raw_pct - 10) / (75 - 10) * (75 - 10) * (q_end_pct - q_start_pct) + (q_start_pct * (75 - 10))) 
                            local_pct = 10 + int(((i + (ev[1]-10)/65) / num_queries) * 65)
                            asyncio.run_coroutine_threadsafe(ddg_queue.put(("progress", local_pct, f"[{i+1}/{num_queries}] {ev[2]}")), loop)
                        elif kind == "done":
                            asyncio.run_coroutine_threadsafe(ddg_queue.put(("done", ev[1])), loop)
                
                asyncio.run_coroutine_threadsafe(ddg_queue.put(None), loop)

            ddg_task = asyncio.create_task(asyncio.to_thread(_run_ddg_all))

            all_se_results = []
            seen_urls = set()
            
            while True:
                ev = await ddg_queue.get()
                if ev is None:       
                    break
                kind = ev[0]
                if kind == "progress":
                    _, raw_pct, step = ev
                    yield _send(_scale_ddg_pct(raw_pct), step)
                elif kind == "done":
                    for res in ev[1]:
                        link = res.get("link")
                        if link not in seen_urls:
                            seen_urls.add(link)
                            all_se_results.append(res)

            se_results = all_se_results
            await ddg_task  

            STORE_CONFIGS = [
                ("Google Play",      search_googleplay),
                ("APKPure",          search_apkpure),
                ("Apple App Store",  search_app_store),
                ("Aptoide",          search_aptoide),
                ("Huawei AppGallery", search_huawei),
            ]
            NUM_STORES = len(STORE_CONFIGS)
            PCT_PER_STORE = (_STORES_END_PCT - _STORES_START_PCT) / NUM_STORES      

            yield _send(_STORES_START_PCT, "Parallel store scans initiated...")

            store_queue: asyncio.Queue = asyncio.Queue()

            async def _run_store(name: str, func):
                await store_queue.put(("scanning", name))
                try:
                    data = await asyncio.to_thread(func)
                except Exception as e:
                    print(f"[Store Error] {name}: {e}")
                    data = []
                await store_queue.put(("result", name, data))
                await store_queue.put(("store_done", name))


            store_tasks = []
            for store_name, search_fn in STORE_CONFIGS:
                for q in queries:
                    task_name = f"{store_name} ({q})"
                    store_tasks.append(asyncio.create_task(_run_store(store_name, lambda q_val=q, fn=search_fn: fn(q_val))))

            store_results: dict[str, list] = {name: [] for name, _ in STORE_CONFIGS}
            completed = 0
            current_pct = _STORES_START_PCT
            pending = NUM_STORES

            while pending > 0:
                msg = await store_queue.get()
                kind = msg[0]

                if kind == "scanning":
                    yield _send(int(current_pct), f"Scanning {msg[1]}...")

                elif kind == "result":
                    existing_data = store_results.get(msg[1], [])
                    new_data = msg[2]
                    
                    seen_links = {item.get("link") for item in existing_data if item.get("link")}
                    for item in new_data:
                        link = item.get("link")
                        if link not in seen_links:
                            existing_data.append(item)
                            seen_links.add(link)
                    
                    store_results[msg[1]] = existing_data

                elif kind == "store_done":
                    completed += 1
                    total_tasks = NUM_STORES * len(queries)
                    current_pct = _STORES_START_PCT + (completed / total_tasks) * (_STORES_END_PCT - _STORES_START_PCT)
                    
                    name = msg[1]
                    count = len(store_results.get(name, []))
                    yield _send(int(current_pct), f"✓ {name} update: {count} total apps found")
                    
                    if completed == total_tasks:
                        pending = 0

            await asyncio.gather(*store_tasks) 

            official_apps = store_results["Google Play"]
            
            if official_name or official_package:
                selected_official = {
                    "app_name":  official_name or "",
                    "package":   official_package or "",
                    "developer": official_developer or "",
                    "source":    "google play",
                }
                official_apps = [selected_official] + (official_apps or [])
            apkpure_apps   = store_results["APKPure"]
            apple_apps     = store_results["Apple App Store"]
            aptoide_apps   = store_results["Aptoide"]
            huawei_apps    = store_results["Huawei AppGallery"]

            gp_search_results = []
            if official_apps:
                for gp_app in official_apps:
                    gp_search_results.append({
                        "app_name":  gp_app.get("app_name"),
                        "package":   gp_app.get("package"),
                        "developer": gp_app.get("developer"),
                        "icon":      gp_app.get("icon"),
                        "source":    "google play",
                        "link":      gp_app.get("link"),
                        "installs":  gp_app.get("installs"),
                        "score":     gp_app.get("score"),
                        "version":   gp_app.get("version"),
                        "updated":   gp_app.get("updated"),
                        "released":  gp_app.get("released"),
                    })

            combined = se_results + gp_search_results + apple_apps + apkpure_apps + aptoide_apps + huawei_apps

            yield _send(93, f"Aggregated {len(combined)} entries — running heuristic analysis...")

            final_results = await asyncio.to_thread(
                detect_lookalike, combined, keyword, official_apps
            )

            yield _send(97, "Heuristic analysis complete — grouping results...")

            gp_results      = [r for r in final_results if r.get("source") == "google play"]
            apple_results   = [r for r in final_results if r.get("source") == "apple app store"]
            apkpure_results = [r for r in final_results if r.get("source") == "apkpure"]
            aptoide_results = [r for r in final_results if r.get("source") == "aptoide"]
            huawei_results  = [r for r in final_results if r.get("source") == "huawei"]
            se_final        = [r for r in final_results if r.get("source") not in [
                "google play", "apple app store", "apkpure", "aptoide", "huawei"
            ]]

            yield _send(100, "Done")

            result_payload = json.dumps({
                "results": {
                    "google_play":      gp_results,
                    "apple_app_store":  apple_results,
                    "apkpure":          apkpure_results,
                    "aptoide":          aptoide_results,
                    "huawei":           huawei_results,
                    "search_engine":    se_final,
                }
            })
            yield f"event: result\ndata: {result_payload}\n\n"

        except Exception as e:
            yield f"event: error\ndata: {json.dumps({'error': str(e)})}\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection":    "keep-alive",
        },
    )
