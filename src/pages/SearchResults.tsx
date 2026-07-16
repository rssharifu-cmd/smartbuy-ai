/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState, useEffect } from "react";
import { Link } from "../components/Navigation.tsx";
import { Sparkles, Search, Check, X, ShieldAlert, ArrowRight, Loader2, ListCollapse, AlertTriangle, Clock, Globe } from "lucide-react";
import { Article, AffiliateTool } from "../types.ts";

interface AISearchResponse {
  aiSummary: string;
  pros: string[];
  cons: string[];
  features: string[];
  buyingAdvice: string;
  articles: Article[];
  tools: AffiliateTool[];
}

export const SearchResults: React.FC = () => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchVal, setSearchVal] = useState("");
  const [results, setResults] = useState<AISearchResponse | null>(null);
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
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Search header & Input bar */}
        <div className="mb-10 text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center justify-center sm:justify-start gap-2.5 text-slate-900 dark:text-white">
            <Sparkles className="w-6 h-6 text-indigo-500" />
            <span>AI Search Intelligence & Grounding</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Real-time semantic analysis grounded in our verified publication catalog and tool library</p>
          
          <form onSubmit={handleSearchSubmit} className="mt-6 flex flex-col sm:flex-row gap-2 bg-slate-50 dark:bg-slate-950 p-2 border border-slate-200 dark:border-slate-900 rounded-2xl shadow-sm max-w-2xl">
            <div className="flex-1 flex items-center gap-2.5 px-3 py-1.5">
              <Search className="w-5 h-5 text-slate-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="Ask AI about content structures, technical SEO..."
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                className="w-full bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs tracking-wider uppercase px-5 py-2.5 rounded-xl transition-all"
            >
              Ask AI
            </button>
          </form>
        </div>

        {/* Loading UI with Reassuring AI messages */}
        {loading ? (
          <div className="border border-slate-150 dark:border-slate-900 p-10 rounded-3xl text-center space-y-6 shadow-md py-20 bg-white dark:bg-slate-950">
            <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mx-auto" />
            <div className="space-y-2 max-w-md mx-auto">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Compiling AI Search Report...</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 animate-pulse leading-relaxed">
                Reading publication archives, parsing semantically linked keywords, cross-referencing expert suggestions, and aligning schemas to output a grounded answer report. Please hold.
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="border border-slate-150 dark:border-slate-900 p-8 rounded-3xl text-center space-y-4 shadow-sm bg-white dark:bg-slate-950">
            <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Grounding Engine Offline</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">{error}</p>
            <div className="pt-4 flex justify-center gap-3">
              <button
                onClick={() => triggerPresetSearch("Generative Engine Optimization")}
                className="bg-slate-100 dark:bg-slate-900 border border-slate-250 dark:border-slate-850 text-slate-700 dark:text-slate-300 hover:text-indigo-500 px-4 py-2 rounded-xl text-xs font-semibold"
              >
                Search GEO
              </button>
              <button
                onClick={() => triggerPresetSearch("Technical SEO Setup")}
                className="bg-slate-100 dark:bg-slate-900 border border-slate-250 dark:border-slate-850 text-slate-700 dark:text-slate-300 hover:text-indigo-500 px-4 py-2 rounded-xl text-xs font-semibold"
              >
                Search Technical SEO
              </button>
            </div>
          </div>
        ) : !query ? (
          <div className="border border-slate-150 dark:border-slate-900 p-8 rounded-3xl text-center space-y-6 shadow-sm py-14 bg-white dark:bg-slate-950">
            <Sparkles className="w-12 h-12 text-indigo-500 mx-auto opacity-75" />
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Ask anything to BlogFlow AI</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">Type a topic, keywords, or a category above. Our semantic engine will synthesize an absolute expert guide for you instantly.</p>
            </div>
          </div>
        ) : results ? (
          <div className="space-y-10">
            
            {/* 1. AI Summary */}
            <div className="border border-slate-200 dark:border-slate-900 p-6 sm:p-8 rounded-3xl shadow-sm relative overflow-hidden bg-white dark:bg-slate-950">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl opacity-20 pointer-events-none"></div>
              
              <h3 className="text-xs uppercase tracking-widest text-indigo-500 font-bold mb-3 flex items-center gap-2 font-mono">
                <Sparkles className="w-4 h-4" />
                <span>AI Search Insight Report</span>
              </h3>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight mb-4 leading-snug">
                Search Summary for: <span className="text-indigo-600 dark:text-indigo-400">"{query}"</span>
              </h2>
              <p className="text-slate-700 dark:text-slate-350 text-sm sm:text-base leading-relaxed font-sans whitespace-pre-wrap">
                {results.aiSummary}
              </p>
            </div>

            {/* 2. Top Matches */}
            {(results.articles && results.articles.length > 0) ? (
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-6 flex items-center gap-2">
                  <ListCollapse className="w-5 h-5 text-indigo-500" />
                  <span>Grounding Publication Source Matches ({results.articles.length})</span>
                </h3>
                
                <div className="space-y-6">
                  {results.articles.map((art) => (
                    <article key={art.id} className="group bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-900 hover:border-indigo-500/20 rounded-2xl p-5 sm:p-6 transition-all flex flex-col sm:flex-row gap-6 shadow-sm">
                      <div className="sm:w-1/3 relative h-36 rounded-xl overflow-hidden flex-shrink-0 bg-slate-100 dark:bg-slate-900">
                        <img src={art.featuredImage} alt={art.title} referrerPolicy="no-referrer" className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500" />
                      </div>

                      <div className="sm:w-2/3 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-900 text-indigo-500 px-2 py-0.5 rounded">
                              {art.category}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 flex items-center gap-0.5">
                              <Clock className="w-3.5 h-3.5" />
                              {art.readingTime} min read
                            </span>
                          </div>

                          <Link to={`/article/${art.slug}`}>
                            <h4 className="text-lg font-bold text-slate-900 dark:text-white hover:text-indigo-500 transition-colors line-clamp-2 leading-snug">{art.title}</h4>
                          </Link>
                          
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                            {art.excerpt || art.metaDescription}
                          </p>
                        </div>

                        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-900 flex items-center justify-between">
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                            {new Date(art.createdAt).toLocaleDateString()}
                          </span>
                          <Link to={`/article/${art.slug}`} className="text-indigo-500 hover:text-indigo-600 font-bold text-xs flex items-center gap-0.5">
                            <span>Read Full Analysis</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            ) : null}

            {/* 3. Matching Tools */}
            {(results.tools && results.tools.length > 0) ? (
              <div className="border-t border-slate-150 dark:border-slate-900 pt-8">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-6 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-indigo-500" />
                  <span>Matching Solutions & Tools ({results.tools.length})</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {results.tools.map((tool) => (
                    <div key={tool.id} className="border border-slate-200 dark:border-slate-900 rounded-3xl p-5 bg-white dark:bg-slate-950 shadow-sm relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none"></div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-sm font-bold text-slate-900 dark:text-white">{tool.name}</span>
                        <span className="text-[10px] bg-indigo-500/10 text-indigo-500 px-2.5 py-0.5 rounded-full font-mono">{tool.category}</span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-4">{tool.description}</p>
                      <a
                        href={tool.affiliateUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full text-center block bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-xl text-xs transition-colors"
                      >
                        {tool.ctaText}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {/* 4. Strengths & Limitations Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-slate-150 dark:border-slate-900 pt-8">
              <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-3xl border border-slate-200 dark:border-slate-900">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 border-b border-slate-200 dark:border-slate-900 pb-2 flex items-center gap-2">
                  <Check className="w-5 h-5 text-emerald-500" />
                  <span>Core Strengths & Pros</span>
                </h3>
                <ul className="space-y-3">
                  {results.pros.map((pro, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-600 dark:text-slate-350 leading-normal">
                      <Check className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span>{pro}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-3xl border border-slate-200 dark:border-slate-900">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 border-b border-slate-200 dark:border-slate-900 pb-2 flex items-center gap-2">
                  <X className="w-4 h-4 text-rose-500" />
                  <span>Key Concerns & Cons</span>
                </h3>
                <ul className="space-y-3">
                  {results.cons.map((con, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-600 dark:text-slate-350 leading-normal">
                      <X className="w-4 h-4 text-rose-500 mt-0.5 flex-shrink-0" />
                      <span>{con}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* 5. Features & Advice */}
            <div className="bg-slate-50 dark:bg-slate-950 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-900 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white mb-4">Critical Evaluation Metrics</h3>
                <ul className="space-y-3">
                  {results.features.map((feat, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-xs sm:text-sm text-slate-600 dark:text-slate-350">
                      <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full flex-shrink-0"></span>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-900 pt-6 md:pt-0 md:pl-8">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white mb-3">AI Strategic Advice</h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-350 leading-relaxed font-sans">
                  {results.buyingAdvice}
                </p>
                <div className="mt-4 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-150 dark:border-slate-800 flex items-start gap-2 text-[10px] text-slate-500 leading-normal">
                  <ShieldAlert className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                  <span>All responses are grounded dynamically using search intent parsing and active publication audits.</span>
                </div>
              </div>
            </div>

          </div>
        ) : null}
      </div>
    </div>
  );
};
