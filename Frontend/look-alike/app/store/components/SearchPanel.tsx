import React from "react";
import { Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SearchPanelProps {
  keyword: string;
  setKeyword: (val: string) => void;
  handleSearchApps: () => void;
  loadingApps: boolean;
}

export const SearchPanel: React.FC<SearchPanelProps> = ({
  keyword,
  setKeyword,
  handleSearchApps,
  loadingApps,
}) => {
  return (
    <div className="bg-white border-b border-slate-200">
      <div className="container mx-auto px-6 py-10">
        <div className="">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-1 h-5 rounded-full bg-blue-600" />
            <p className="text-xs font-bold tracking-widest text-blue-600 uppercase">
              Step 1 — Target Application
            </p>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1 tracking-tight">
            Application Lookup
          </h1>
          <p className="text-sm text-slate-500 mb-6 font-medium">
            Enter an application name to retrieve listings from Google Play Store for analysis.
          </p>
          <div className="flex gap-2.5">
            <div className="relative flex-1 ">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="e.g. kbank, scb, truemoney..."
                className="pl-10 h-11 text-sm bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus-visible:ring-blue-500/40 focus-visible:border-blue-500"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearchApps()}
              />
            </div>
            <Button
              onClick={handleSearchApps}
              disabled={loadingApps}
              className="h-11 px-6 text-sm font-bold gap-2 bg-blue-600 hover:bg-blue-700 text-white border-0 shadow-sm"
            >
              {loadingApps ? (
                <Loader2 className="animate-spin w-4 h-4" />
              ) : (
                <><Search className="w-3.5 h-3.5" /> Search</>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
