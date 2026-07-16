/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Link } from "../components/Navigation.tsx";
import { Compass, Sparkles, BookOpen, Cpu, Clock, ArrowRight, Rss } from "lucide-react";
import { Article, Category } from "../types.ts";

export const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  // Sync category state from URL query parameter if present
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const catParam = params.get("slug");
    if (catParam) {
      setSelectedCategory(catParam);
    }
  }, []);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [catRes, artRes] = await Promise.all([
          fetch("/api/categories"),
          fetch("/api/articles?all=false") // Fetch published only
        ]);

        if (catRes.ok) setCategories(await catRes.json());
        if (artRes.ok) setArticles(await artRes.json());
      } catch (err) {
        console.error("Error loading categories resources:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleCategoryClick = (slug: string) => {
    setSelectedCategory(slug);
    const newUrl = slug === "all" ? "/categories" : `/categories?slug=${slug}`;
    window.history.pushState({}, "", newUrl);
  };

  const filteredArticles = selectedCategory === "all"
    ? articles
    : articles.filter(a => a.category === selectedCategory);

  const renderIcon = (name: string, active: boolean) => {
    const style = `w-5 h-5 ${active ? "text-indigo-500" : "text-slate-400"}`;
    switch (name) {
      case "Sparkles": return <Sparkles className={style} />;
      case "Cpu": return <Cpu className={style} />;
      case "BookOpen": return <BookOpen className={style} />;
      default: return <Compass className={style} />;
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3 text-slate-900 dark:text-white">Research Hub & Categories</h1>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
            Choose a research stream below to explore expert technical briefs, in-depth tutorials, comparison guides, and AI-optimized SEO frameworks.
          </p>
        </div>

        {/* Category Pill Filters */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-10 pb-4 border-b border-slate-100 dark:border-slate-900">
          <button
            onClick={() => handleCategoryClick("all")}
            className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all flex items-center gap-2 ${
              selectedCategory === "all"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
                : "bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:text-indigo-500 hover:border-indigo-500"
            }`}
          >
            <span>All Research ({articles.length})</span>
          </button>
          
          {categories.map((cat) => {
            const count = articles.filter(a => a.category === cat.slug).length;
            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.slug)}
                className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all flex items-center gap-2 ${
                  selectedCategory === cat.slug
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
                    : "bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:text-indigo-500 hover:border-indigo-500"
                }`}
              >
                {renderIcon(cat.iconName, selectedCategory === cat.slug)}
                <span>{cat.name} ({count})</span>
              </button>
            );
          })}
        </div>

        {/* Dynamic Category description info card */}
        {selectedCategory !== "all" && !loading && (
          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-900 p-6 rounded-3xl mb-10 relative overflow-hidden shadow-sm">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl opacity-20 pointer-events-none"></div>
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              {renderIcon(categories.find(c => c.slug === selectedCategory)?.iconName || "", true)}
              <span>{categories.find(c => c.slug === selectedCategory)?.name}</span>
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-4xl leading-relaxed">
              {categories.find(c => c.slug === selectedCategory)?.description} All publications are structured to respect search spiders, content freshness indexes, and dynamic LLM crawlers.
            </p>
          </div>
        )}

        {/* Articles Listing Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-slate-100 dark:bg-slate-900 h-64 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-900 shadow-sm">
            <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400 font-medium text-base">No guides or articles available in this research stream yet.</p>
            <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">Publish drafts using the Editorial CMS Admin Dashboard.</p>
            <Link to="/" className="text-indigo-500 hover:text-indigo-600 text-sm mt-4 inline-block font-semibold">Back to homepage</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredArticles.map((art) => (
              <article key={art.id} className="group flex flex-col sm:flex-row bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-900 rounded-2xl overflow-hidden shadow-sm hover:border-indigo-500/20 hover:shadow-md transition-all">
                <div className="sm:w-1/3 relative overflow-hidden aspect-[4/3] sm:aspect-auto">
                  <img
                    src={art.featuredImage}
                    alt={art.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover min-h-[160px] group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-6 sm:w-2/3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-900 text-indigo-500">
                        {categories.find(c => c.slug === art.category)?.name || art.category}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 flex items-center gap-0.5">
                        <Clock className="w-3 h-3" /> {art.readingTime} min
                      </span>
                    </div>
                    <Link to={`/article/${art.slug}`}>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white hover:text-indigo-500 transition-colors line-clamp-2 leading-snug">{art.title}</h3>
                    </Link>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                      {art.excerpt || art.metaDescription}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-900 flex items-center justify-between text-xs text-slate-450 dark:text-slate-500 font-mono">
                    <span>{new Date(art.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    <Link to={`/article/${art.slug}`} className="text-indigo-500 hover:text-indigo-600 font-bold flex items-center gap-0.5">
                      <span>Read Guide</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
