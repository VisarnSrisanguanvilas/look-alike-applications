import React from "react";
import Image from "next/image";
import { Info, Package, ChevronRight, Loader2, Search } from "lucide-react";
import { PlayApp } from "@/type/enginesearch";

interface AppSelectionListProps {
  apps: PlayApp[];
  loadingApps: boolean;
  handleSelectApp: (app: PlayApp) => void;
}

export const AppSelectionList: React.FC<AppSelectionListProps> = ({
  apps,
  loadingApps,
  handleSelectApp,
}) => {
  return (
    <div>
      {apps.length > 0 && (
        <div className="flex items-center gap-2 mb-3">
          <Info className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Select the official application to begin analysis
          </span>
          <span className="ml-auto text-sm font-mono font-semibold px-2.5 py-0.5 rounded border border-slate-200 bg-white text-slate-600">
            {apps.length} result{apps.length !== 1 ? "s" : ""}
          </span>
        </div>
      )}

      <div className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-sm">
        {apps.length > 0 ? (
          <div className="divide-y divide-slate-100 max-h-140 overflow-y-auto">
            {apps.map((app, i) => (
              <div
                key={i}
                className="group flex gap-4 px-5 py-4 cursor-pointer hover:bg-blue-50 transition-colors duration-150"
                onClick={() => handleSelectApp(app)}
              >
                {app.icon ? (
                  <Image
                    src={app.icon}
                    alt={app.app_name}
                    width={44}
                    height={44}
                    className="w-11 h-11 rounded-xl object-cover shrink-0 border border-slate-200"
                    unoptimized
                  />
                ) : (
                  <div className="w-11 h-11 rounded-xl bg-slate-100 border border-slate-200 shrink-0 flex items-center justify-center">
                    <Package className="w-4 h-4 text-slate-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-slate-900 truncate">{app.app_name}</p>
                  <p className="text-sm text-slate-500 truncate mt-0.5">{app.developer}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-sm text-amber-600 font-bold font-mono">
                      {app.score?.toFixed(1) ?? "-"}
                    </span>
                    <span className="text-slate-300">|</span>
                    <span className="text-sm text-slate-500 font-medium">{app.installs}</span>
                  </div>
                </div>
                <div className="flex items-center shrink-0">
                  <div className="flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-lg border transition-colors border-slate-200 text-slate-600 group-hover:border-blue-400 group-hover:text-blue-700 group-hover:bg-blue-50">
                    Select <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center">
            {loadingApps ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-7 h-7 animate-spin text-blue-500" />
                <p className="text-sm font-semibold text-slate-500">Querying Google Play Store...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 text-slate-400">
                <div className="w-12 h-12 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center">
                  <Search className="w-5 h-5" />
                </div>
                <p className="text-sm font-semibold">Enter an application name above to begin.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
