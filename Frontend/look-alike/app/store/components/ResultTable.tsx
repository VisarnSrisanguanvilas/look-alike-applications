import React, { useState, useMemo } from "react";
import Image from "next/image";
import {
  Package,
  AlertCircle,
  ExternalLink,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronRight,
  Shield,
  ShieldCheck,
  Code,
  User,
  Globe,
  Hash,
  Tag,
  FileSearch,
  Star,
  Download,
  CalendarDays,
  Info,
  CheckCircle,
  RefreshCw,
} from "lucide-react";
import { LookalikeResult } from "@/type/enginesearch";
import { getRiskLevel, getOfficialStyles } from "../utils";

interface ResultTableProps {
  title: string;
  icon: React.ReactNode;
  results: LookalikeResult[];
  countLabel: string;
  titleColor: string;
  countBg: string;
  countText: string;
  countBorder: string;
  hideStoreColumn?: boolean;
  isVersionSource?: boolean;
  isSha256Source?: boolean;
  setScoreBreakdownApp: (app: LookalikeResult) => void;
}

export const ResultTable: React.FC<ResultTableProps> = ({
  title,
  icon,
  results,
  countLabel,
  titleColor,
  countBg,
  countText,
  countBorder,
  hideStoreColumn = false,
  isVersionSource = false,
  isSha256Source = false,
  setScoreBreakdownApp,
}) => {
  const [sortConfig, setSortConfig] = useState<{ key: keyof LookalikeResult; direction: "asc" | "desc" }>({
    key: "risk_score",
    direction: "desc",
  });
  const [selectedApp, setSelectedApp] = useState<LookalikeResult | null>(null);

  const requestSort = (key: keyof LookalikeResult) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedResults = useMemo(() => {
    const sortableItems = [...results];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        const key = sortConfig.key as keyof LookalikeResult;
        const aValue = a[key] ?? "";
        const bValue = b[key] ?? "";
        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [results, sortConfig]);

  // Auto-select first item
  const displayedApp = selectedApp ?? (sortedResults[0] || null);

  const SortBtn = ({ column, label }: { column: keyof LookalikeResult; label: string }) => {
    const active = sortConfig.key === column;
    return (
      <button
        onClick={() => requestSort(column)}
        className={`flex items-center gap-1 text-xs font-bold uppercase tracking-wide transition-colors ${active ? "text-blue-600" : "text-slate-400 hover:text-slate-700"
          }`}
      >
        {label}
        {active ? (
          sortConfig.direction === "asc" ? (
            <ArrowUp className="w-3 h-3" />
          ) : (
            <ArrowDown className="w-3 h-3" />
          )
        ) : (
          <ArrowUpDown className="w-3 h-3 opacity-50" />
        )}
      </button>
    );
  };

  if (results.length === 0) return null;

  return (
    <div className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-sm flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-slate-100 px-6 py-4 flex items-center justify-between bg-white shadow-sm">
        <div className="flex items-center gap-2">
          {icon}
          <span className={`text-sm font-bold ${titleColor}`}>{title}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <SortBtn column="app_name" label="Name" />
            <span className="text-slate-200">|</span>
            <SortBtn column="risk_score" label="Risk" />
          </div>
          <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${countBg} ${countText} border ${countBorder}`}>
            {results.length} {countLabel}
          </span>
        </div>
      </div>

      {/* Split Panel */}
      <div className="flex h-195 divide-x divide-slate-200">
        {/* Left: App List */}
        <div className="w-96 shrink-0 overflow-y-auto flex flex-col divide-y divide-slate-100 bg-slate-50/40">
          {sortedResults.map((item, i) => {
            const risk = getRiskLevel(item.risk_score);
            const isSelected = displayedApp?.link === item.link && displayedApp?.app_name === item.app_name;
            return (
              <button
                key={i}
                onClick={() => setSelectedApp(item)}
                className={`w-full text-left px-5 py-5 flex items-center gap-4 transition-all group ${isSelected
                  ? "bg-blue-50 border-l-4 border-blue-500"
                  : item.is_suspicious
                    ? "hover:bg-red-50/40 border-l-4 border-transparent"
                    : "hover:bg-slate-50 border-l-4 border-transparent"
                  }`}
              >
                {/* App Icon */}
                <div className="shrink-0 relative">
                  {item.icon ? (
                    <Image
                      src={item.icon}
                      alt={item.app_name}
                      width={44}
                      height={44}
                      className="w-11 h-11 rounded-xl object-cover border border-slate-200 shadow-sm"
                      unoptimized
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shadow-sm">
                      <Package className="w-5 h-5 text-slate-400" />
                    </div>
                  )}
                  {/* Rank badge */}
                  <span className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-slate-700 text-white text-[9px] font-black flex items-center justify-center leading-none">
                    {i + 1}
                  </span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800 truncate leading-snug">{item.app_name}</p>
                  {!hideStoreColumn && item.developer && (
                    <p className="text-xs text-slate-400 truncate mt-1.5">{item.developer}</p>
                  )}
                  {hideStoreColumn && item.source && (
                    <p className="text-xs text-slate-400 truncate mt-1.5 font-mono">{item.source}</p>
                  )}
                </div>

                {/* Risk + chevron */}
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  {item.is_official ? (
                    (() => {
                      const official = getOfficialStyles();
                      return (
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-md ${official.textColor} ${official.bg} border ${official.border} uppercase`}>
                          {official.label}
                        </span>
                      );
                    })()
                  ) : item.is_suspicious ? (
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-md ${risk.textColor} ${risk.bg} border ${risk.border} uppercase`}>
                      {risk.label}
                    </span>
                  ) : (
                    <span className="text-xs font-bold px-2.5 py-1 rounded-md text-sky-700 bg-sky-50 border border-sky-200 uppercase">
                      Safe
                    </span>
                  )}
                  <ChevronRight className={`w-4 h-4 transition-colors ${isSelected ? "text-blue-500" : "text-slate-300 group-hover:text-slate-500"}`} />
                </div>
              </button>
            );
          })}
        </div>

        {/* Right: Detail Panel */}
        <div className="flex-1 overflow-y-auto bg-white p-7">
          {displayedApp ? (
            <AppDetail
              app={displayedApp}
              hideStoreColumn={hideStoreColumn}
              isVersionSource={isVersionSource}
              isSha256Source={isSha256Source}
              onScoreBreakdown={() => setScoreBreakdownApp(displayedApp)}
            />
          ) : (
            <div className="h-full flex flex-col items-center justify-center gap-2 text-slate-400">
              <FileSearch className="w-8 h-8" />
              <p className="text-sm font-semibold">Select an app to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ─── Detail Panel Component ─── */

interface AppDetailProps {
  app: LookalikeResult;
  hideStoreColumn: boolean;
  isVersionSource: boolean;
  isSha256Source: boolean;
  onScoreBreakdown: () => void;
}

const AppDetail: React.FC<AppDetailProps> = ({
  app,
  hideStoreColumn,
  isVersionSource,
  isSha256Source,
  onScoreBreakdown,
}) => {
  const risk = getRiskLevel(app.risk_score);

  return (
    <div className="flex flex-col gap-6 h-full">
      {/* App Header */}
      <div className="flex items-start gap-5">
        {app.icon ? (
          <Image
            src={app.icon}
            alt={app.app_name}
            width={72}
            height={72}
            className="w-18 h-18 rounded-2xl object-cover border border-slate-200 shadow-md shrink-0"
            unoptimized
          />
        ) : (
          <div className="w-18 h-18 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center shadow-md shrink-0">
            <Package className="w-8 h-8 text-slate-400" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-black text-slate-900 leading-tight truncate">{app.app_name}</h3>
          {app.developer && !hideStoreColumn && (
            <p className="text-sm text-slate-500 mt-1 truncate">{app.developer}</p>
          )}
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            {/* Risk Badge */}
            {app.is_official ? (
              (() => {
                const official = getOfficialStyles();
                return (
                  <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-md border ${official.textColor} ${official.bg} ${official.border}`}>
                    <ShieldCheck className={`w-3 h-3 ${official.iconColor}`} />
                    {official.label}
                  </span>
                );
              })()
            ) : app.is_suspicious ? (
              <button
                onClick={onScoreBreakdown}
                className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-md border cursor-pointer transition-opacity hover:opacity-80 ${risk.textColor} ${risk.bg} ${risk.border}`}
              >
                <AlertCircle className="w-3 h-3" />
                {risk.label} RISK ( {app.risk_score} )
              </button>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-md border text-sky-700 bg-sky-50 border-sky-200">
                <ShieldCheck className="w-3 h-3" />
                SAFE
              </span>
            )}
            {/* Similarity */}
            {app.similarity !== undefined && (
              <span className="inline-flex items-center gap-1 text-xs font-mono font-bold px-2 py-1 rounded border border-slate-200 bg-slate-50 text-slate-600">
                <Shield className="w-3 h-3 text-slate-400" />
                {(app.similarity * 100).toFixed(1)}% similar
              </span>
            )}
            {/* Score */}
            {app.score !== undefined && app.score > 0 && (
              <span className="inline-flex items-center gap-1 text-xs font-mono font-bold px-2 py-1 rounded border border-amber-200 bg-amber-50 text-amber-700">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                {app.score.toFixed(1)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Metadata Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Package ID */}
        {!hideStoreColumn && app.package && (
          <div className="col-span-2">
            <DetailRow icon={<Code className="w-3.5 h-3.5" />} label="Package ID">
              <code className="text-xs text-blue-600 font-mono break-all">{app.package}</code>
            </DetailRow>
          </div>
        )}

        {/* Developer */}
        {!hideStoreColumn && app.developer && (
          <DetailRow icon={<User className="w-3.5 h-3.5" />} label={isSha256Source ? "SHA256" : isVersionSource ? "Version" : "Developer"}>
            {isSha256Source ? (
              <code className="text-xs text-slate-400 font-mono break-all">{app.sha256 ?? "—"}</code>
            ) : (
              <span className="text-sm font-semibold text-slate-700">{isVersionSource ? app.version : app.developer}</span>
            )}
          </DetailRow>
        )}

        {/* Version */}
        {app.version && !isSha256Source && !isVersionSource && (
          <DetailRow icon={<Tag className="w-3.5 h-3.5" />} label="Version">
            <span className="text-sm font-mono text-slate-600">{app.version}</span>
          </DetailRow>
        )}

        {/* Source (for web search) */}
        {hideStoreColumn && app.source && (
          <DetailRow icon={<Globe className="w-3.5 h-3.5" />} label="Source">
            <span className="text-sm font-mono text-slate-600 break-all">{app.source}</span>
          </DetailRow>
        )}

        {/* SHA256 */}
        {isSha256Source && app.sha256 && (
          <div className="col-span-2">
            <DetailRow icon={<Hash className="w-3.5 h-3.5" />} label="SHA256">
              <code className="text-xs text-slate-400 font-mono break-all">{app.sha256}</code>
            </DetailRow>
          </div>
        )}

        {/* Installs (Added) */}
        {app.installs && (
          <DetailRow icon={<Download className="w-3.5 h-3.5" />} label="Installs">
            <span className="text-sm font-bold text-slate-700">{app.installs}</span>
          </DetailRow>
        )}

        {/* Released (Added) */}
        {app.released && (
          <DetailRow icon={<CalendarDays className="w-3.5 h-3.5" />} label="Released">
            <span className="text-sm font-semibold text-slate-600">
              {typeof app.released === 'number'
                ? new Date(app.released * (String(app.released).length > 10 ? 1 : 1000)).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                : app.released}
            </span>
          </DetailRow>
        )}

        {/* Updated (Added) */}
        {app.updated && (
          <DetailRow icon={<RefreshCw className="w-3.5 h-3.5" />} label="Last Updated">
            <span className="text-sm font-semibold text-slate-600">
              {typeof app.updated === 'number'
                ? new Date(app.updated * (String(app.updated).length > 10 ? 1 : 1000)).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                : app.updated}
            </span>
          </DetailRow>
        )}

        {/* MD5 (Aptoide specific) */}
        {app.md5 && (
          <div className="col-span-2">
            <DetailRow icon={<Hash className="w-3.5 h-3.5" />} label="MD5">
              <code className="text-xs text-slate-400 font-mono break-all">{app.md5}</code>
            </DetailRow>
          </div>
        )}

        {/* App ID (Huawei specific) */}
        {app.appid && (
          <DetailRow icon={<Info className="w-3.5 h-3.5" />} label="App ID">
            <span className="text-sm font-mono text-slate-600 font-semibold">{app.appid}</span>
          </DetailRow>
        )}
      </div>

      {/* Reasons */}
      {app.reasons && app.reasons.length > 0 && (
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            {app.is_suspicious ? "Risk Details / Analysis" : "Information / Verification"}
          </p>
          <div className="flex flex-col gap-2">
            {app.reasons.map((reason, idx) => (
              <div
                key={idx}
                className={`flex items-start gap-3 text-sm rounded-xl px-4 py-3 border ${app.is_suspicious
                  ? "text-red-600 bg-red-50/60 border-red-100"
                  : "text-emerald-700 bg-emerald-50/60 border-emerald-100"
                  }`}
              >
                {app.is_suspicious ? (
                  <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                ) : (
                  <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                )}
                <span className="leading-relaxed">{reason}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Link */}
      <div className="mt-auto pt-4 border-t border-slate-100">
        <a
          href={app.link}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          View on Store
        </a>
      </div>
    </div>
  );
};


const DetailRow = ({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) => (
  <div className="flex items-start gap-4 px-5 py-4 rounded-xl bg-slate-50 border border-slate-100">
    <div className="text-slate-400 mt-0.5 shrink-0">{icon}</div>
    <div className="flex-1 min-w-0">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">{label}</p>
      <div>{children}</div>
    </div>
  </div>
);
