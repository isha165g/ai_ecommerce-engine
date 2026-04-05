"use client";
import { useState } from "react";
import { fetchWithAuth } from "@/lib/api";
import Link from "next/link";

type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  tags: string;
}

export default function Shop() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [intent, setIntent] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    
    setLoading(true);
    try {
      const res = await fetchWithAuth("/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query })
      });
      if (res.ok) {
        const data = await res.json();
        setIntent(data.intent_detected);
        setResults(data.recommendations);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-900 text-white p-4 md:p-8 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-900/30 rounded-full filter blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-900/30 rounded-full filter blur-[100px] pointer-events-none"></div>

      <div className="max-w-5xl mx-auto space-y-8 relative z-10 pt-10">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-6xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">AI Intent Search</h1>
          <p className="text-gray-400 text-lg">Describe exactly what you need. Let our AI handle the rest.</p>
        </div>

        <form onSubmit={handleSearch} className="relative max-w-3xl mx-auto">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="E.g., I need a cheap monitor under 150 urgently."
            className="w-full px-6 py-5 bg-black/40 border border-white/20 rounded-2xl backdrop-blur-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-xl placeholder-gray-500 shadow-2xl transition-all"
          />
          <button type="submit" disabled={loading} className="absolute right-3 top-3 bottom-3 px-8 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-bold text-white transition-all shadow-[0_0_15px_rgba(168,85,247,0.4)]">
            {loading ? "Analyzing..." : "Search"}
          </button>
        </form>

        {intent && (
          <div className="max-w-3xl mx-auto p-6 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl flex flex-col md:flex-row gap-6 items-center">
            <div className="flex-shrink-0 bg-blue-500/20 p-4 rounded-xl border border-blue-500/30">
               <span className="text-blue-400 font-medium whitespace-nowrap">🧠 Intent Detected</span>
            </div>
            <div className="flex flex-wrap gap-4 text-sm w-full">
              <div className="bg-black/30 rounded-lg px-4 py-2 border border-white/5 flex-grow">
                <span className="text-gray-400 block text-xs uppercase tracking-wider mb-1">Keywords</span>
                <span className="text-white font-medium">{intent.extracted_keywords.join(', ') || "None"}</span>
              </div>
              <div className="bg-black/30 rounded-lg px-4 py-2 border border-white/5 flex-grow">
                <span className="text-gray-400 block text-xs uppercase tracking-wider mb-1">Budget</span>
                <span className="text-white font-medium">{intent.is_budget_constrained ? `Under ₹${intent.price_limit || 'Any'}` : "Unrestricted"}</span>
              </div>
              <div className="bg-black/30 rounded-lg px-4 py-2 border border-white/5 flex-grow">
                <span className="text-gray-400 block text-xs uppercase tracking-wider mb-1">Urgency</span>
                <span className={`${intent.is_urgent ? 'text-red-400' : 'text-gray-300'} font-medium`}>{intent.is_urgent ? "High Priority" : "Normal"}</span>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
          {results.map(p => (
            <div key={p.id} className="bg-black/40 backdrop-blur-sm p-6 rounded-2xl border border-white/10 hover:border-purple-500/50 hover:shadow-[0_0_30px_rgba(168,85,247,0.15)] transition-all flex flex-col h-full transform hover:-translate-y-1 duration-300">
              <div className="flex-grow">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-bold text-xl line-clamp-2">{p.name}</h3>
                  <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs rounded-full border border-green-500/30 ml-2 whitespace-nowrap">
                    ₹{p.price.toFixed(2)}
                  </span>
                </div>
                <p className="text-gray-400 text-sm line-clamp-3 leading-relaxed">{p.description}</p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/10">
                <Link href={`/product/${p.id}`} className="block w-full text-center py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-colors text-sm">
                  View Details
                </Link>
              </div>
            </div>
          ))}
          {results.length === 0 && intent && !loading && (
             <div className="col-span-full py-20 flex flex-col items-center justify-center text-gray-500 space-y-4">
               <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center">
                 <span className="text-2xl">📦</span>
               </div>
               <p>No products found matching your intent.</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
