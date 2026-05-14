"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { ArrowLeft, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LookalikeResult, PlayApp } from "@/type/enginesearch";
import axios from "axios";

// Import extracted components
import { SearchPanel } from "./components/SearchPanel";
import { AppSelectionList } from "./components/AppSelectionList";
import { OfficialAppCard } from "./components/OfficialAppCard";
import { AnalysisPanel } from "./components/AnalysisPanel";
import { RiskBreakdownModal } from "./components/RiskBreakdownModal";

export default function GooglePlaySearch() {
    const [keyword, setKeyword] = useState("");
    const [apps, setApps] = useState<PlayApp[]>([]);
    const [selectedApp, setSelectedApp] = useState<PlayApp | null>(null);

    const [gpResults, setGpResults] = useState<LookalikeResult[]>([]);
    const [iosResults, setIosResults] = useState<LookalikeResult[]>([]);
    const [apkpureResults, setApkpureResults] = useState<LookalikeResult[]>([]);
    const [aptoideResults, setAptoideResults] = useState<LookalikeResult[]>([]);
    const [huaweiResults, setHuaweiResults] = useState<LookalikeResult[]>([]);
    const [seResults, setSeResults] = useState<LookalikeResult[]>([]);

    const [loadingApps, setLoadingApps] = useState(false);
    const [loadingLookalikes, setLoadingLookalikes] = useState(false);

    const [progress, setProgress] = useState(0);
    const [displayProgress, setDisplayProgress] = useState(0);
    const [progressStep, setProgressStep] = useState("");
    const [progressHistory, setProgressHistory] = useState<string[]>([]);

    const [scoreBreakdownApp, setScoreBreakdownApp] = useState<LookalikeResult | null>(null);

    const handleSearchApps = async () => {
        if (!keyword.trim()) return;
        setLoadingApps(true);
        setApps([]);
        setSelectedApp(null);
        setGpResults([]);
        setIosResults([]);
        setApkpureResults([]);
        setAptoideResults([]);
        setHuaweiResults([]);
        setSeResults([]);
        try {
            const res = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/google-play/search`,
                { params: { keyword } }
            );
            setApps(res.data.results || []);
        } catch (err) {
            console.error("Apps error:", err);
            setApps([]);
        } finally {
            setLoadingApps(false);
        }
    };

    const handleSelectApp = (app: PlayApp) => {
        setSelectedApp(app);
        setLoadingLookalikes(true);
        setGpResults([]);
        setIosResults([]);
        setApkpureResults([]);
        setAptoideResults([]);
        setHuaweiResults([]);
        setSeResults([]);
        setProgress(0);
        setDisplayProgress(0);
        setProgressStep("");
        setProgressHistory(["Initializing connection to Threat Intel Engine..."]);
        const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const params = new URLSearchParams();
        params.append("keyword", keyword);
        if (app.app_name) params.append("official_name", app.app_name);
        if (app.package) params.append("official_package", app.package);
        if (app.developer) params.append("official_developer", app.developer);

        const es = new EventSource(
            `${API}/lookalike/analyze?${params.toString()}`
        );
        es.addEventListener("progress", (e) => {
            const data = JSON.parse(e.data);
            if (data.progress !== undefined) setProgress(data.progress);
            if (data.step) {
                setProgressStep(data.step);
                setProgressHistory((prev) => {
                    if (prev[prev.length - 1] === data.step) return prev;
                    return [...prev, data.step];
                });
            }
        });
        es.addEventListener("result", (e) => {
            const data = JSON.parse(e.data);
            setGpResults(data.results?.google_play || []);
            setIosResults(data.results?.apple_app_store || []);
            setApkpureResults(data.results?.apkpure || []);
            setAptoideResults(data.results?.aptoide || []);
            setHuaweiResults(data.results?.huawei || []);
            setSeResults(data.results?.search_engine || []);
            setLoadingLookalikes(false);
            setProgress(100);
            setProgressHistory((prev) => [...prev, "Analysis complete. Results ready."]);
            es.close();
        });
        es.addEventListener("error", () => {
            setLoadingLookalikes(false);
            es.close();
        });
    };

    // Smooth Progress Logic
    useEffect(() => {
        if (displayProgress < progress) {
            const timer = setTimeout(() => {
                setDisplayProgress((prev) => {
                    const diff = progress - prev;
                    // Faster increment if the gap is larger
                    const step = Math.max(1, Math.min(5, Math.floor(diff / 5)));
                    return Math.min(progress, prev + step);
                });
            }, 50); // Update every 50ms for smooth counting
            return () => clearTimeout(timer);
        }
    }, [displayProgress, progress]);

    const handleReset = () => {
        setSelectedApp(null);
        setGpResults([]);
        setIosResults([]);
        setApkpureResults([]);
        setAptoideResults([]);
        setHuaweiResults([]);
        setSeResults([]);
    };

    const allLookalikes = [
        ...gpResults,
        ...iosResults,
        ...apkpureResults,
        ...aptoideResults,
        ...huaweiResults,
        ...seResults
    ];

    return (
        <div
            className="min-h-screen bg-slate-50 text-slate-900"
            style={{ fontFamily: "'IBM Plex Sans', 'DM Sans', system-ui, sans-serif" }}
        >
            {/* ── Top Nav Bar ── */}
            <div className="border-b border-slate-200 bg-white shadow-sm">
                <div className="container mx-auto px-6 h-14 flex items-center gap-3">
                    <Link href="/">
                        <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100">
                            <ArrowLeft className="w-4 h-4" />
                        </Button>
                    </Link>
                    <div className="flex items-center gap-2.5">
                        <div
                            className="w-7 h-7 rounded flex items-center justify-center"
                            style={{ background: "linear-gradient(135deg, #2563eb, #1e40af)" }}
                        >
                            <Shield className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-bold text-sm tracking-wide text-slate-800">
                            THREAT INTELLIGENCE
                        </span>
                    </div>
                    <div className="h-4 w-px bg-slate-200 mx-1" />
                    <span className="text-xs text-slate-500 font-semibold tracking-widest uppercase">
                        Look-alike Detection Engine
                    </span>
                </div>
            </div>

            <SearchPanel
                keyword={keyword}
                setKeyword={setKeyword}
                handleSearchApps={handleSearchApps}
                loadingApps={loadingApps}
            />

            <div className="container mx-auto px-6 py-7">
                {!selectedApp && (
                    <AppSelectionList
                        apps={apps}
                        loadingApps={loadingApps}
                        handleSelectApp={handleSelectApp}
                    />
                )}

                {selectedApp && (
                    <div className="flex flex-col gap-6">
                        <OfficialAppCard
                            selectedApp={selectedApp}
                            handleReset={handleReset}
                        />

                        <AnalysisPanel
                            loadingLookalikes={loadingLookalikes}
                            allLookalikes={allLookalikes}
                            gpResults={gpResults}
                            iosResults={iosResults}
                            huaweiResults={huaweiResults}
                            apkpureResults={apkpureResults}
                            aptoideResults={aptoideResults}
                            seResults={seResults}
                            progress={progress}
                            displayProgress={displayProgress}
                            progressStep={progressStep}
                            progressHistory={progressHistory}
                            setScoreBreakdownApp={setScoreBreakdownApp}
                        />
                    </div>
                )}
            </div>

            <RiskBreakdownModal
                app={scoreBreakdownApp}
                onClose={() => setScoreBreakdownApp(null)}
            />
        </div>
    );
}