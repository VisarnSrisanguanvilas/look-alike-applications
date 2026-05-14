import React from "react";
import { Activity, X } from "lucide-react";
import { LookalikeResult } from "@/type/enginesearch";
import { getRiskLevel } from "../utils";

interface RiskBreakdownModalProps {
  app: LookalikeResult | null;
  onClose: () => void;
}

export const RiskBreakdownModal: React.FC<RiskBreakdownModalProps> = ({ app, onClose }) => {
  if (!app) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
              <Activity className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Risk Assessment Details</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Score Breakdown</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6">
          <div className="flex items-center gap-4 mb-6 p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-inner ${getRiskLevel(app.risk_score).bg} ${getRiskLevel(app.risk_score).textColor}`}>
              {app.risk_score}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 truncate max-w-60" title={app.app_name}>
                {app.app_name}
              </p>
              <p className="text-xs text-slate-500 font-medium truncate max-w-60 mt-0.5">
                {app.source}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Risk Factors</p>
            {app.reasons && app.reasons.length > 0 ? (
              app.reasons.map((reason, idx) => (
                <div key={idx} className="flex gap-3 items-start p-3 rounded-lg border border-slate-100 bg-white shadow-sm transition-all hover:border-slate-200">
                  <div className="mt-1 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                  <span className="text-sm text-slate-700 font-medium leading-tight">{reason}</span>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-slate-400 italic text-sm">
                No individual risk factors identified.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
