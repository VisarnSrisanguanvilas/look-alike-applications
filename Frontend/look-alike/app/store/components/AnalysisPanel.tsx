import React, { useState } from "react";
import Image from "next/image";
import { Loader2, AlertCircle, CheckCircle, Shield, ShieldCheck, LayoutGrid } from "lucide-react";
import { LookalikeResult } from "@/type/enginesearch";
import { ResultTable } from "./ResultTable";

export type TabId = "all" | "gp" | "ios" | "huawei" | "apkpure" | "aptoide" | "se";

interface AnalysisPanelProps {
  loadingLookalikes: boolean;
  allLookalikes: LookalikeResult[];
  gpResults: LookalikeResult[];
  iosResults: LookalikeResult[];
  huaweiResults: LookalikeResult[];
  apkpureResults: LookalikeResult[];
  aptoideResults: LookalikeResult[];
  seResults: LookalikeResult[];
  progress: number;
  displayProgress: number;
  progressStep: string;
  progressHistory: string[];
  setScoreBreakdownApp: (app: LookalikeResult) => void;
}

export const AnalysisPanel: React.FC<AnalysisPanelProps> = ({
  loadingLookalikes,
  allLookalikes,
  gpResults,
  iosResults,
  huaweiResults,
  apkpureResults,
  aptoideResults,
  seResults,
  progress,
  displayProgress,
  progressStep,
  progressHistory,
  setScoreBreakdownApp,
}) => {
  const [activeTab, setActiveTab] = useState<TabId>("all");

  const highRiskCount = allLookalikes.filter((l) => l.risk_score >= 4).length;
  const mediumRiskCount = allLookalikes.filter((l) => l.risk_score < 4 && l.risk_score >= 2).length;
  const lowRiskCount = allLookalikes.filter((l) => l.risk_score < 2 && l.risk_score >= 1).length;
  const safeRiskCount = allLookalikes.filter((l) => l.risk_score < 1).length;

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-1 h-4 rounded-full bg-red-500" />
        <span className="text-xs font-bold tracking-widest text-slate-600 uppercase">
          Step 2 — Look-alike Analysis
        </span>
        {loadingLookalikes && <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-400 ml-1" />}
        {!loadingLookalikes && allLookalikes.length > 0 && (
          <div className="ml-auto flex items-center gap-2">
            {highRiskCount > 0 && (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-md border border-red-200 bg-red-50 text-red-700">
                <AlertCircle className="w-3 h-3" /> {highRiskCount} HIGH RISK
              </span>
            )}
            {mediumRiskCount > 0 && (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-md border border-amber-200 bg-amber-50 text-amber-700">
                <AlertCircle className="w-3 h-3" /> {mediumRiskCount} MEDIUM RISK
              </span>
            )}
            {lowRiskCount > 0 && (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-md border border-emerald-200 bg-emerald-50 text-emerald-700">
                <AlertCircle className="w-3 h-3" /> {lowRiskCount} LOW RISK
              </span>
            )}
            {safeRiskCount > 0 && (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-md border border-sky-200 bg-sky-50 text-sky-700">
                <CheckCircle className="w-3 h-3" /> {safeRiskCount} SAFE
              </span>
            )}
            <span className="text-sm font-mono font-semibold px-2.5 py-1 rounded border border-slate-200 bg-white text-slate-700">
              {allLookalikes.length} records
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-6">
        {allLookalikes.length > 0 ? (
          <>
            <div className="flex border-b border-slate-200 overflow-x-auto hide-scrollbar">
              {[
                { id: "all", label: "Overview", count: allLookalikes.length, icon: <LayoutGrid className="w-3.5 h-3.5 opacity-70" /> },
                { id: "gp", label: "Google Play", count: gpResults.length, icon: <Image src="/assets/images/google-play.png" alt="GP" width={14} height={14} className="w-3.5 h-3.5" /> },
                { id: "ios", label: "App Store", count: iosResults.length, icon: <Image src="/assets/images/app-store.png" alt="IOS" width={14} height={14} className="w-4 h-4 " /> },
                { id: "huawei", label: "AppGallery", count: huaweiResults.length, icon: <Image src="/assets/svg/huawei_icon.svg" alt="Huawei" width={14} height={14} className="w-4 h-4 " /> },
                { id: "apkpure", label: "APKPure", count: apkpureResults.length, icon: <Image src="/assets/images/apkpure-logo-freelogovectors.net_-400x377.png" alt="APKPure" width={14} height={14} className="w-3.5 h-3.5 object-contain" /> },
                { id: "aptoide", label: "Aptoide", count: aptoideResults.length, icon: <Image src="/assets/images/aptoide-logo.png" alt="Aptoide" width={14} height={14} className="w-4 h-4 object-contain" /> },
                { id: "se", label: "Web Search", count: seResults.length, icon: <Image src="/assets/images/duckduckgo.png" alt="DuckDuckGo" width={14} height={14} className="w-5 h-5 object-contain" /> },
              ].map((tab) => (
                <button
                  key={tab.id}
                  className={`px-4 py-2.5 text-sm font-bold whitespace-nowrap border-b-2 transition-colors flex items-center gap-2 ${activeTab === tab.id
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
                    }`}
                  onClick={() => setActiveTab(tab.id as TabId)}
                >
                  {tab.icon}
                  {tab.label}
                  {tab.count > 0 && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${activeTab === tab.id ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-500"
                      }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-8">
              {/* Google Play Card */}
              {(activeTab === "all" || activeTab === "gp") && (
                <ResultTable
                  title="Google Play Store Results"
                  icon={<Image src="/assets/images/google-play.png" alt="GP" width={14} height={14} className="w-3.5 h-3.5" />}
                  results={gpResults}
                  countLabel="apps"
                  titleColor="text-slate-900"
                  countBg="bg-slate-50"
                  countText="text-slate-600"
                  countBorder="border-slate-100"
                  setScoreBreakdownApp={setScoreBreakdownApp}
                />
              )}

              {/* App Store Card */}
              {(activeTab === "all" || activeTab === "ios") && (
                <ResultTable
                  title="Apple App Store Results"
                  icon={<Image src="/assets/images/app-store.png" alt="GP" width={14} height={14} className="w-4 h-4" />}
                  results={iosResults}
                  countLabel="apps"
                  titleColor="text-slate-900"
                  countBg="bg-slate-50"
                  countText="text-slate-600"
                  countBorder="border-slate-100"
                  setScoreBreakdownApp={setScoreBreakdownApp}
                />
              )}

              {(activeTab === "all" || activeTab === "huawei") && (
                <ResultTable
                  title="Huawei AppGallery Results"
                  icon={
                    <Image
                      src="/assets/svg/huawei_icon.svg"
                      alt="Huawei AppGallery"
                      width={14}
                      height={14}
                      className="w-4 h-4"
                    />
                  }
                  results={huaweiResults}
                  countLabel="apps"
                  titleColor="text-slate-900"
                  countBg="bg-slate-50"
                  countText="text-slate-600"
                  countBorder="border-slate-100"
                  isSha256Source={true}
                  setScoreBreakdownApp={setScoreBreakdownApp}
                />
              )}

              {/* APKPure Card */}
              {(activeTab === "all" || activeTab === "apkpure") && (
                <ResultTable
                  title="APKPure Search Results"
                  icon={<Image src="/assets/images/apkpure-logo-freelogovectors.net_-400x377.png" alt="APKPure" width={14} height={14} className="w-3.5 h-3.5 object-contain" />}
                  results={apkpureResults}
                  countLabel="apps"
                  titleColor="text-slate-900"
                  countBg="bg-slate-50"
                  countText="text-slate-600"
                  countBorder="border-slate-100"
                  setScoreBreakdownApp={setScoreBreakdownApp}
                />
              )}

              {/* Aptoide Card */}
              {(activeTab === "all" || activeTab === "aptoide") && (
                <ResultTable
                  title="Aptoide Search Results"
                  icon={<Image src="/assets/images/aptoide-logo.png" alt="Aptoide" width={14} height={14} className="w-4 h-4 object-contain" />}
                  results={aptoideResults}
                  countLabel="apps"
                  titleColor="text-slate-900"
                  countBg="bg-slate-50"
                  countText="text-slate-600"
                  countBorder="border-slate-100"
                  setScoreBreakdownApp={setScoreBreakdownApp}
                />
              )}

              {/* Web Search Card */}
              {(activeTab === "all" || activeTab === "se") && (
                <ResultTable
                  title="Web Search / APK Mirrors Results"
                  icon={<Image src="/assets/images/duckduckgo.png" alt="DuckDuckGo" width={14} height={14} className="w-5 h-5 object-contain" />}
                  results={seResults}
                  countLabel="results"
                  titleColor="text-slate-700"
                  countBg="bg-slate-50"
                  countText="text-slate-600"
                  countBorder="border-slate-100"
                  hideStoreColumn={true}
                  setScoreBreakdownApp={setScoreBreakdownApp}
                />
              )}
            </div>
          </>
        ) : (
          <div className="py-20 flex flex-col items-center gap-4">
            {loadingLookalikes ? (
              <div className="w-full max-w-2xl mx-auto">
                <div className="relative mb-10">
                  {/* Scanning Animation */}
                  <div className="flex justify-center mb-8 relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-32 h-32 rounded-full border-2 border-blue-500/20 animate-ping" />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-24 h-24 rounded-full border-2 border-blue-500/40 animate-pulse" />
                    </div>
                    <div className="w-20 h-20 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30 z-10">
                      <Shield className="w-10 h-10 text-white animate-pulse" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-end border-b border-slate-200 pb-2">
                      <div>
                        <h3 className="text-lg font-bold text-slate-800">Threat Analysis in Progress</h3>
                        <p className="text-sm text-slate-500 font-semibold">{progressStep || "Initializing scanners..."}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-black text-blue-600 tabular-nums">{displayProgress}%</span>
                      </div>
                    </div>

                    <div className="h-3 rounded-full bg-slate-100 overflow-hidden shadow-inner border border-slate-200">
                      <div
                        className="h-full rounded-full bg-linear-to-r from-blue-600 to-indigo-500 transition-all duration-700 ease-out relative"
                        style={{ width: `${displayProgress}%` }}
                      >
                        <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-size-[20px_20px] animate-[shimmer_2s_linear_infinite]" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Analysis Log */}
                <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col h-64">
                  <div className="px-4 py-2 bg-slate-800 flex items-center justify-between border-b border-slate-700">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">system_engine.log</span>
                    <div className="w-10" />
                  </div>
                  <div
                    className="p-4 flex-1 overflow-y-auto font-mono text-[11px] leading-relaxed scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent"
                    ref={(el) => { if (el) el.scrollTop = el.scrollHeight; }}
                  >
                    {progressHistory.map((msg, idx) => (
                      <div key={idx} className="flex gap-3 mb-1.5 group">
                        <span className="text-slate-500 shrink-0 font-bold">[{new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}]</span>
                        <span className="text-slate-400 shrink-0 select-none">›</span>
                        <span className={idx === progressHistory.length - 1 ? "text-emerald-400 font-bold" : "text-slate-300"}>
                          {msg}
                          {idx === progressHistory.length - 1 && <span className="inline-block w-1.5 h-3.5 bg-emerald-400 ml-1 animate-pulse align-middle" />}
                        </span>
                      </div>
                    ))}
                    {progress < 100 && (
                      <div className="flex gap-3 text-blue-400/70 animate-pulse">
                        <span className="text-slate-500 shrink-0">[{new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}]</span>
                        <span className="text-slate-400 shrink-0">›</span>
                        <span>Running heuristics...</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="w-12 h-12 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                </div>
                <p className="text-sm font-semibold text-slate-500">No look-alike applications detected.</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
