/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Link } from "../components/Navigation.tsx";
import { Sparkles, Search, Star, Check, X, ShieldAlert, ArrowRight, HelpCircle, Loader2, ListCollapse, AlertTriangle } from "lucide-react";
import { AISearchResult, Product } from "../types.ts";

export const SearchResults: React.FC = () => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchVal, setSearchVal] = useState("");
  const [results, setResults] = useState<AISearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Parse the query parameter on start and load results
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q") || "";
    setQuery(q);
    setSearchVal(q);
  }, []);

  useEffect(() => {
    if (!query) {
      setLoading(false);
      return;
    }

    async function fetchAISearch() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("/api/ai/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query })
        });

        if (!res.ok) {
          throw new Error("Our AI search grounding engine encountered an issue processing this request.");
        }

        const data = await res.json();
        setResults(data);
      } catch (err: any) {
        console.error("AI Search Error:", err);
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    }
    fetchAISearch();
  }, [query]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchVal.trim()) return;
    window.history.pushState({}, "", `/search?q=${encodeURIComponent(searchVal.trim())}`);
    window.dispatchEvent(new PopStateEvent("popstate"));
    setQuery(searchVal.trim());
  };

  const triggerPresetSearch = (preset: string) => {
    window.history.pushState({}, "", `/search?q=${encodeURIComponent(preset)}`);
    window.dispatchEvent(new PopStateEvent("popstate"));
    setQuery(preset);
    setSearchVal(preset);
  };

  return (
    <div className="bg-slate-900 text-slate-100 min-h-screen py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto">
        
        {/* Search header & Input bar */}
        <div className="mb-10 text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center justify-center sm:justify-start gap-2.5">
            <Sparkles className="w-6 h-6 text-indigo-400 fill-indigo-400/20" />
            <span>AI Product Recommendation Report</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">Real-time specifications analysis grounded in our verified product catalog</p>
          
          <form onSubmit={handleSearchSubmit} className="mt-6 flex flex-col sm:flex-row gap-2 bg-slate-950 p-2 border border-slate-850 rounded-2xl shadow-md max-w-2xl">
            <div className="flex-1 flex items-center gap-2.5 px-3 py-1.5">
              <Search className="w-5 h-5 text-slate-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="Ask AI: 'Best earbuds under $50'..."
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-400 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs tracking-wider uppercase px-5 py-2.5 rounded-xl transition-all"
            >
              Search
            </button>
          </form>
        </div>

        {/* Loading UI with Reassuring AI messages */}
        {loading ? (
          <div className="bg-slate-950 border border-slate-850 p-10 rounded-3xl text-center space-y-6 shadow-xl py-20">
            <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mx-auto" />
            <div className="space-y-2 max-w-md mx-auto">
              <h3 className="text-lg font-bold text-white tracking-tight">SmartBuy AI is compiling reviews...</h3>
              <p className="text-xs text-slate-400 animate-pulse leading-relaxed">
                Reading physical drivers, cross-referencing acoustic reviews, balancing pricing, and organizing specs tables to deliver the optimal list. Please hold.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-900 max-w-sm mx-auto grid grid-cols-3 gap-2 text-[10px] text-slate-500 font-mono">
              <div>1. READ SPECS</div>
              <div>2. GROUND DATA</div>
              <div>3. COMPILING</div>
            </div>
          </div>
        ) : error ? (
          <div className="bg-slate-950 border border-slate-850 p-8 rounded-3xl text-center space-y-4 shadow-md">
            <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
            <h3 className="text-lg font-bold text-white">Temporary AI Grounding Issue</h3>
            <p className="text-sm text-slate-400 max-w-md mx-auto">{error}</p>
            <div className="pt-4 flex justify-center gap-3">
              <button
                onClick={() => triggerPresetSearch("Best earbuds under $50")}
                className="bg-slate-900 border border-slate-800 text-slate-300 hover:text-white px-4 py-2 rounded-xl text-xs font-semibold"
              >
                Search Earbuds
              </button>
              <button
                onClick={() => triggerPresetSearch("Best gaming mouse")}
                className="bg-slate-900 border border-slate-800 text-slate-300 hover:text-white px-4 py-2 rounded-xl text-xs font-semibold"
              >
                Search Gaming Mouse
              </button>
            </div>
          </div>
        ) : !query ? (
          <div className="bg-slate-950 border border-slate-850 p-8 rounded-3xl text-center space-y-6 shadow-md py-14">
            <Sparkles className="w-12 h-12 text-indigo-500 mx-auto opacity-75" />
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white">Ask anything to SmartBuy AI</h3>
              <p className="text-sm text-slate-400 max-w-md mx-auto">Type a budget, a brand, or a product category in the bar above. Our generative engine will synthesize an absolute expert guide for you.</p>
            </div>
          </div>
        ) : results ? (
          <div className="space-y-10">
            
            {/* 1. AI Summary */}
            <div className="bg-slate-950 border border-slate-850 p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full blur-3xl opacity-5"></div>
              
              <h3 className="text-sm uppercase tracking-wider text-indigo-400 font-bold mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span>AI Shopping Analysis</span>
              </h3>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-4 leading-snug">
                Search Summary for: <span className="text-indigo-300">"{query}"</span>
              </h2>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-sans">
                {results.aiSummary}
              </p>
            </div>

            {/* 2. Top Recommendations */}
            <div>
              <h3 className="text-lg font-extrabold text-white tracking-tight mb-6 flex items-center gap-2">
                <ListCollapse className="w-5 h-5 text-indigo-400" />
                <span>Top Recommended Match Reviews</span>
              </h3>
              
              <div className="space-y-6">
                {results.recommendations.map((prod) => (
                  <article key={prod.id} className="group bg-slate-950 border border-slate-850 hover:border-indigo-500/10 rounded-2xl p-5 sm:p-6 transition-all flex flex-col sm:flex-row gap-6 shadow-lg">
                    <div className="sm:w-1/3 relative h-40 rounded-xl overflow-hidden flex-shrink-0">
                      <img src={prod.image} alt={prod.title} referrerPolicy="no-referrer" className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500" />
                      <div className="absolute top-2 left-2 bg-slate-900 bg-opacity-80 backdrop-blur-sm text-[11px] text-indigo-300 font-mono px-2 py-0.5 rounded border border-slate-700">
                        {prod.price}
                      </div>
                    </div>

                    <div className="sm:w-2/3 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-semibold tracking-wide uppercase">
                          <span>{prod.category}</span>
                          <div className="flex items-center gap-1 text-amber-400">
                            <span>★</span>
                            <span className="font-bold text-slate-200">{prod.rating}</span>
                          </div>
                        </div>

                        <Link to={`/product/${prod.slug}`}>
                          <h4 className="text-lg font-bold text-white hover:text-indigo-400 transition-colors">{prod.title}</h4>
                        </Link>
                        
                        <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                          {prod.buyingAdvice}
                        </p>

                        <div className="mt-3.5 flex flex-wrap gap-1.5">
                          {prod.pros.slice(0, 2).map((pro, i) => (
                            <span key={i} className="inline-flex items-center gap-1 bg-slate-900 text-[10px] text-slate-300 px-2.5 py-1 rounded-md border border-slate-850">
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span>{pro}</span>
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="mt-6 pt-4 border-t border-slate-900 flex items-center gap-3">
                        <Link to={`/product/${prod.slug}`} className="flex-1 text-center bg-slate-900 border border-slate-850 text-slate-200 py-2 rounded-xl text-xs font-semibold hover:bg-slate-800 transition-all">
                          Read Full Analytical Review
                        </Link>
                        <a href={prod.affiliateLink} target="_blank" rel="nofollow noopener" className="flex-1 text-center bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1">
                          <span>Buy Now</span>
                          <ArrowRight className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            {/* 3. Pros, Cons & Advice Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-850">
                <h3 className="text-base font-bold text-white mb-4 border-b border-slate-900 pb-2 flex items-center gap-2">
                  <Check className="w-5 h-5 text-emerald-400" />
                  <span>Category Strengths (Pros)</span>
                </h3>
                <ul className="space-y-3">
                  {results.pros.map((pro, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300 leading-normal">
                      <Check className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <span>{pro}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-850">
                <h3 className="text-base font-bold text-white mb-4 border-b border-slate-900 pb-2 flex items-center gap-2">
                  <X className="w-4 h-4 text-rose-500" />
                  <span>Category Limitations (Cons)</span>
                </h3>
                <ul className="space-y-3">
                  {results.cons.map((con, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300 leading-normal">
                      <X className="w-4 h-4 text-rose-500 mt-0.5 flex-shrink-0" />
                      <span>{con}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* 4. Features & buying advice */}
            <div className="bg-slate-950 p-6 sm:p-8 rounded-3xl border border-slate-850 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-base font-bold text-white mb-4">Key Criteria to Evaluate</h3>
                <ul className="space-y-3">
                  {results.features.map((feat, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-xs sm:text-sm text-slate-300">
                      <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full flex-shrink-0"></span>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="border-t md:border-t-0 md:border-l border-slate-900 pt-6 md:pt-0 md:pl-8">
                <h3 className="text-base font-bold text-white mb-3">AI Expert Buying Advice</h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                  {results.buyingAdvice}
                </p>
                <div className="mt-4 p-3 bg-slate-900 rounded-xl border border-slate-850 flex items-start gap-2 text-[10px] text-slate-500 leading-normal">
                  <ShieldAlert className="w-4 h-4 text-indigo-400 mt-0.5 flex-shrink-0" />
                  <span>All AI summaries are cross-compiled using actual market catalogs and continuous API grounding for accuracy.</span>
                </div>
              </div>
            </div>

          </div>
        ) : null}
      </div>
    </div>
  );
};
