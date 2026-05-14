"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Search,
    Loader2,
    ExternalLink,
    ShieldAlert,
    ShieldCheck,
    Package,
    Shield,
    Database,
    Activity,
    Hash,
    Tag,
    Info,
    ArrowLeft,
} from "lucide-react";
import { AppResult } from "@/type/koodous";
import Image from "next/image";
import Link from "next/link";
import axios from "axios";

export default function LookAlikeSearch() {
    const [keyword, setKeyword] = useState("");
    const [results, setResults] = useState<AppResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSearch = async () => {
        if (!keyword.trim()) return;
        setLoading(true);
        setSearched(true);
        setError(null);
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
            const response = await axios.get(`${API_URL}/koodous/search`, {
                params: { keyword },
            });
            setResults(response.data.results || []);
        } catch (err: any) {
            console.error(err);
            const msg = err.response?.data?.detail || "Connection failed. Please check if the backend is running.";
            setError(msg);
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    const detectedCount = results.filter((r) => r.is_detected).length;

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
                        Koodous APK Intelligence
                    </span>
                </div>
            </div>

            {/* ── Search Panel ── */}
            <div className="bg-white border-b border-slate-200">
                <div className="container mx-auto px-6 py-10">
                    <div className="">
                        <div className="flex items-center gap-2 mb-1.5">
                            <div className="w-1 h-5 rounded-full bg-blue-600" />
                            <p className="text-xs font-bold tracking-widest text-blue-600 uppercase">
                                APK Threat Database
                            </p>
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900 mb-1 tracking-tight">
                            Koodous Search
                        </h1>
                        <p className="text-sm text-slate-500 mb-6 font-medium">
                            Query the Koodous APK database to identify malicious or look-alike applications by name or package identifier.
                        </p>
                        <div className="flex gap-2.5">
                            <div className="relative flex-1">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                <Input
                                    placeholder="Application name or package identifier (e.g. kbank)..."
                                    className="pl-10 h-11 text-sm bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus-visible:ring-blue-500/40 focus-visible:border-blue-500"
                                    value={keyword}
                                    onChange={(e) => setKeyword(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                />
                            </div>
                            <Button
                                onClick={handleSearch}
                                disabled={loading}
                                className="h-11 px-6 text-sm font-bold gap-2 bg-blue-600 hover:bg-blue-700 text-white border-0 shadow-sm"
                            >
                                {loading ? (
                                    <Loader2 className="animate-spin w-4 h-4" />
                                ) : (
                                    <><Search className="w-3.5 h-3.5" /> Search</>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Error Display ── */}
            {error && (
                <div className="container mx-auto px-6 mt-6">
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                        <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-bold text-red-800">Search Error</p>
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Results ── */}
            <div className="container mx-auto px-6 py-7">
                {results.length > 0 ? (
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-1 h-4 rounded-full bg-blue-600" />
                            <span className="text-xs font-bold tracking-widest text-slate-600 uppercase">
                                Query Results
                            </span>
                            <div className="ml-auto flex items-center gap-2">
                                {detectedCount > 0 && (
                                    <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-md border border-red-200 bg-red-50 text-red-700">
                                        <ShieldAlert className="w-3 h-3" /> {detectedCount} MALWARE DETECTED
                                    </span>
                                )}
                                <span className="text-sm font-mono font-semibold px-2.5 py-1 rounded border border-slate-200 bg-white text-slate-700">
                                    {results.length} record{results.length !== 1 ? "s" : ""}
                                </span>
                            </div>
                        </div>

                        <div className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-sm">
                            {/* Status Banner */}
                            <div className="border-b border-slate-100 px-5 py-2.5 flex items-center gap-2 bg-white">
                                <Activity className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <span className="text-sm text-slate-600 font-semibold">
                                    Koodous database scan completed for{" "}
                                    <span className="font-bold text-slate-900 font-mono">{keyword}</span>
                                </span>
                            </div>

                            <div className="overflow-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-slate-100 bg-slate-50 sticky top-0 z-10">
                                            <th className="px-5 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-widest w-10">#</th>
                                            <th className="px-5 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">
                                                <span className="inline-flex items-center gap-1.5">
                                                    <Database className="w-3 h-3" /> Application
                                                </span>
                                            </th>
                                            <th className="px-5 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">
                                                <span className="inline-flex items-center gap-1.5">
                                                    <Package className="w-3 h-3" /> Package
                                                </span>
                                            </th>
                                            <th className="px-5 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">
                                                <span className="inline-flex items-center gap-1.5">
                                                    <Shield className="w-3 h-3" /> Status
                                                </span>
                                            </th>
                                            <th className="px-5 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">
                                                <span className="inline-flex items-center gap-1.5">
                                                    <Hash className="w-3 h-3" /> SHA256
                                                </span>
                                            </th>
                                            <th className="px-5 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-widest">Ref.</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {results.map((item, i) => (
                                            <tr
                                                key={item.id || item.sha256}
                                                className={`transition-colors ${item.is_detected ? "hover:bg-red-50" : "hover:bg-slate-50"}`}
                                            >
                                                <td className="px-5 py-4">
                                                    <span className="text-sm font-mono font-semibold text-slate-400">
                                                        {String(i + 1).padStart(2, "0")}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4 min-w-50">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 shrink-0 flex items-center justify-center overflow-hidden">
                                                            {item.image ? (
                                                                <Image
                                                                    src={item.image}
                                                                    alt={item.app}
                                                                    width={36}
                                                                    height={36}
                                                                    className="object-cover w-full h-full"
                                                                />
                                                            ) : (
                                                                <Package className="w-4 h-4 text-slate-400" />
                                                            )}
                                                        </div>
                                                        <span className="font-bold text-sm text-slate-900">
                                                            {item.app || "Unknown Application"}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4 min-w-40">
                                                    <span className="text-sm text-slate-600 font-mono font-medium">
                                                        {item.package_name}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4 min-w-50">
                                                    <div className="flex flex-col gap-2 items-start">
                                                        {item.is_detected ? (
                                                            <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-md border border-red-200 bg-red-50 text-red-700">
                                                                <ShieldAlert className="w-3.5 h-3.5" /> MALWARE DETECTED
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-700">
                                                                <ShieldCheck className="w-4 h-4" /> CLEAN
                                                            </span>
                                                        )}
                                                        {item.tags && item.tags.length > 0 && (
                                                            <div className="flex flex-wrap gap-1">
                                                                {item.tags.map((tag) => (
                                                                    <span
                                                                        key={tag}
                                                                        className="inline-flex items-center gap-1 text-xs font-mono font-semibold px-1.5 py-0.5 rounded border border-slate-200 text-slate-600 bg-slate-50"
                                                                    >
                                                                        <Tag className="w-2 h-2" /> {tag}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4 min-w-50">
                                                    <span className="text-sm text-slate-500 break-all font-mono leading-relaxed">
                                                        {item.sha256}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4 text-right">
                                                    <a href={`https://koodous.com/apks/${item.sha256}`} target="_blank" rel="noreferrer">
                                                        <button className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-800 hover:border-slate-300 hover:bg-slate-50 transition-colors bg-white">
                                                            <ExternalLink className="w-3.5 h-3.5" />
                                                        </button>
                                                    </a>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="">
                        <div className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-sm">
                            <div className="py-20 flex flex-col items-center gap-4">
                                {loading ? (
                                    <>
                                        <Loader2 className="w-7 h-7 animate-spin text-blue-500" />
                                        <p className="text-sm font-semibold text-slate-500">Querying Koodous database...</p>
                                    </>
                                ) : searched ? (
                                    <>
                                        <div className="w-12 h-12 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center">
                                            <ShieldCheck className="w-5 h-5 text-emerald-600" />
                                        </div>
                                        <p className="text-sm font-semibold text-slate-500">No records found for the given query.</p>
                                    </>
                                ) : (
                                    <>
                                        <div className="w-12 h-12 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center">
                                            <Info className="w-5 h-5 text-slate-400" />
                                        </div>
                                        <p className="text-sm font-semibold text-slate-500">Enter an application name or package identifier to begin.</p>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}