import Image from "next/image";
import Link from "next/link";
import { Shield, Search, Package, ChevronRight } from "lucide-react";

export default function Home() {
  return (
    <div
      className="min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center justify-center p-6"
      style={{ fontFamily: "'IBM Plex Sans', 'DM Sans', system-ui, sans-serif" }}
    >
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg"
              style={{ background: "linear-gradient(135deg, #2563eb, #1e40af)" }}
            >
              <Shield className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2">
            THREAT INTELLIGENCE
          </h1>
          <p className="text-lg text-slate-500 font-medium">
            Next-generation application analysis and look-alike detection engine
          </p>
        </div>

        {/* Navigation Cards */}
        <div className="grid md:grid-cols-2 gap-8 mt-4">
          {/* Google Play Look-alike Card */}
          <Link href="/store" className="group">
            <div className="h-full bg-white rounded-2xl border border-slate-200 p-8 shadow-sm transition-all duration-200 hover:shadow-md hover:border-blue-400 group-hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-6 group-hover:bg-blue-100 transition-colors">
                <Search className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
                Search Engine Analysis
                <ChevronRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
              </h2>
              <p className="text-slate-500 leading-relaxed font-medium mb-6">
                Scan the Google Play Store for look-alike applications. Compare versions, scores, and risk profiles in real-time.
              </p>
              <div className="flex items-center text-sm font-bold text-blue-600">
                Launch Analysis Engine
              </div>
            </div>
          </Link>

          {/* Koodous Search Card */}
          <Link href="/koodous" className="group">
            <div className="h-full bg-white rounded-2xl border border-slate-200 p-8 shadow-sm transition-all duration-200 hover:shadow-md hover:border-emerald-400 group-hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center mb-6 group-hover:bg-emerald-100 transition-colors">
                <Package className="w-6 h-6 text-emerald-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
                Koodous APK Search
                <ChevronRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
              </h2>
              <p className="text-slate-500 leading-relaxed font-medium mb-6">
                Query the Koodous database for known APKs. Perform deep scans across millions of samples to identify threats and malicious clones.
              </p>
              <div className="flex items-center text-sm font-bold text-emerald-600">
                Access Intelligence Database
              </div>
            </div>
          </Link>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center border-t border-slate-200 pt-8">
          <p className="text-xs font-bold tracking-widest text-slate-400 uppercase">
            Look-alike Detection Engine
          </p>
        </div>
      </div>
    </div>
  );
}
