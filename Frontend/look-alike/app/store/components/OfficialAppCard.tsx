import React from "react";
import Image from "next/image";
import { ArrowLeft, ShieldCheck, Tag, Download, Package, Mail, ExternalLink, Calendar, Info, Lock, RefreshCw } from "lucide-react";
import { PlayApp } from "@/type/enginesearch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DOMPurify from "dompurify";
import { getOfficialStyles } from "../utils";

export const OfficialAppCard: React.FC<{
  selectedApp: PlayApp;
  handleReset: () => void;
}> = ({
  selectedApp,
  handleReset,
}) => {
  const official = getOfficialStyles();

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-1 h-4 rounded-full ${official.bg.replace('bg-', 'bg-').replace('100', '500')}`} /> 
        <span className={`text-xs font-bold tracking-widest ${official.textColor} uppercase`}>
          Official Application — Verified
        </span>
        <button
          className="ml-auto flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors"
          onClick={handleReset}
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Change Selection
        </button>
      </div>

      <div className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-sm">
        <div className={`px-6 py-5 border-b border-slate-100 ${official.bg}/60`}>
          <div className="flex gap-5 items-start">
            {selectedApp.icon ? (
              <Image
                src={selectedApp.icon}
                alt={selectedApp.app_name}
                width={64}
                height={64}
                className="w-16 h-16 rounded-2xl object-cover shrink-0 border border-slate-200 shadow-sm"
                unoptimized
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 shrink-0 flex items-center justify-center">
                <Package className="w-6 h-6 text-slate-400" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-bold text-xl text-slate-900 truncate">{selectedApp.app_name}</h2>
                <div className={`flex items-center gap-1 px-2 py-0.5 rounded-md border ${official.border} ${official.bg} ${official.textColor} text-xs font-bold`}>
                  <ShieldCheck className={`w-3 h-3 ${official.iconColor}`} /> {official.label}
                </div>
              </div>
              <p className="text-sm text-slate-600 mt-0.5 font-semibold">{selectedApp.developer}</p>

              <div className="flex flex-wrap gap-2 mt-2.5">
                {selectedApp.genre && (
                  <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md border border-slate-200 text-slate-600 bg-white font-semibold">
                    <Tag className="w-2.5 h-2.5" /> {selectedApp.genre}
                  </span>
                )}
                {selectedApp.version && (
                  <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md border border-slate-200 text-slate-600 bg-white font-mono font-semibold">
                    v{selectedApp.version}
                  </span>
                )}
                {selectedApp.content_rating && (
                  <Badge variant="secondary" className="bg-slate-100 text-slate-700 border-slate-200 text-[10px] font-bold">
                    <Info className="w-2.5 h-2.5 mr-1" /> {selectedApp.content_rating}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 divide-x divide-slate-100 border-b border-slate-100 bg-slate-50">
          <div className="py-4 px-3 text-center">
            <div className="text-amber-600 text-base font-bold font-mono">
              {selectedApp.score?.toFixed(1) ?? "—"}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5 font-semibold uppercase tracking-wider">
              {selectedApp.ratings?.toLocaleString() ?? "0"} ratings
            </div>
          </div>
          <div className="py-4 px-3 text-center">
            <div className="flex justify-center mb-1">
              <Download className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <div className="text-sm font-bold text-slate-800">{selectedApp.installs ?? "—"}</div>
            <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">installs</div>
          </div>
          <div className="py-4 px-3 text-center">
            <div className="flex justify-center mb-1">
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="text-sm font-bold text-slate-800 truncate px-1">
              {selectedApp.released ?? "—"}
            </div>
            <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Released</div>
          </div>
          <div className="py-4 px-3 text-center">
            <div className="flex justify-center mb-1">
              <RefreshCw className="w-3.5 h-3.5 text-indigo-600" />
            </div>
            <div className="text-sm font-bold text-slate-800 truncate px-1">
              {typeof selectedApp.updated === 'number'
                ? new Date(selectedApp.updated * (String(selectedApp.updated).length > 10 ? 1 : 1000)).toLocaleDateString('en-GB', { month: 'short', day: '2-digit', year: 'numeric' })
                : selectedApp.updated ?? "—"}
            </div>
            <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Last update</div>
          </div>
        </div>

        <div className="px-5 py-4 space-y-3">
          <div className="flex gap-2.5 items-start">
            <Package className="w-3.5 h-3.5 mt-0.5 text-slate-400 shrink-0" />
            <code className="text-sm text-slate-600 break-all font-mono leading-relaxed">
              {selectedApp.package}
            </code>
          </div>
          {selectedApp.developer_email && (
            <div className="flex gap-2.5 items-center">
              <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="text-sm text-slate-600 font-mono">{selectedApp.developer_email}</span>
            </div>
          )}
          {selectedApp.permissions && selectedApp.permissions.length > 0 && (
            <div className="flex gap-2.5 items-start pt-1">
              <Lock className="w-3.5 h-3.5 mt-0.5 text-slate-400 shrink-0" />
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Permissions</span>
                <div className="flex flex-wrap gap-1.5 mt-0.5">
                  {selectedApp.permissions.slice(0, 5).map((p, i) => (
                    <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                      {p.split('.').pop()}
                    </span>
                  ))}
                  {selectedApp.permissions.length > 5 && (
                    <span className="text-[10px] px-1.5 py-0.5 text-slate-400 italic">
                      +{selectedApp.permissions.length - 5} more...
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
          {selectedApp.description && (
            <div className="pt-3 border-t border-slate-100">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                Description
              </p>

              <p
                className="text-sm text-slate-600 leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(selectedApp.description),
                }}
              />
            </div>
          )}
        </div>

        <div className="px-5 pb-4">
          <a href={`https://play.google.com/store/apps/details?id=${selectedApp.package}`} target="_blank" rel="noreferrer">
            <Button variant="outline" size="sm" className="w-full cursor-pointer gap-2 text-sm h-9 border-slate-200 text-slate-700 hover:text-slate-900 hover:border-slate-300 bg-white font-semibold">
              <ExternalLink className="w-3.5 h-3.5" /> View on Google Play Store
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
};
