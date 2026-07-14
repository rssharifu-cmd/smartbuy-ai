/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Link } from "../components/Navigation.tsx";
import { Calendar, User, ArrowRight, RefreshCw, AlertCircle, Sparkles, BookOpen } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Article, Product } from "../types.ts";

export const ArticleDetail: React.FC = () => {
  const [slug, setSlug] = useState<string>("");
  const [article, setArticle] = useState<Article | null>(null);
  const [suggestedProducts, setSuggestedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Parse slug from URL path e.g. /article/best-coffee-makers-under-50-guide
  useEffect(() => {
    const path = window.location.pathname;
    const parts = path.split("/");
    const slugVal = parts[parts.length - 1];
    setSlug(slugVal);
  }, []);

  useEffect(() => {
    if (!slug) return;
    
    async function loadArticle() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/articles/${slug}`);
        if (!res.ok) {
          throw new Error("Expert buying guide could not be retrieved from active database index.");
        }
        const data = await res.json();
        setArticle(data.article);
        setSuggestedProducts(data.suggestedProducts || []);
      } catch (err: any) {
        setError(err.message || "Failed to load guide.");
      } finally {
        setLoading(false);
      }
    }
    loadArticle();
  }, [slug]);

  if (loading) {
    return (
      <div className="bg-slate-900 text-slate-100 min-h-screen flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <RefreshCw className="w-10 h-10 text-indigo-400 animate-spin mx-auto" />
          <p className="text-sm text-slate-400">Retrieving informational guide...</p>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="bg-slate-900 text-slate-100 min-h-screen flex items-center justify-center p-8">
        <div className="max-w-md text-center space-y-4 bg-slate-950 p-8 rounded-2xl border border-slate-850">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-xl font-bold text-white">Guide Not Found</h2>
          <p className="text-sm text-slate-400">The guide slug "{slug}" does not match our current index. Try exploring another guide.</p>
          <Link to="/categories" className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all">
            Explore Categories
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 text-slate-100 min-h-screen py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto">
        
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-slate-400 mb-6 font-medium">
          <Link to="/" className="hover:text-indigo-400 transition-colors">Home</Link>
          <span>/</span>
          <Link to={`/categories?slug=${article.category}`} className="hover:text-indigo-400 transition-colors capitalize">{article.category.replace("-", " ")}</Link>
          <span>/</span>
          <span className="text-slate-300 truncate">Guides</span>
        </nav>

        {/* Hero banner */}
        <div className="relative rounded-3xl overflow-hidden mb-10 h-64 sm:h-96 border border-slate-800">
          <img src={article.image} alt={article.title} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
          
          <div className="absolute bottom-6 left-6 right-6 sm:bottom-10 sm:left-10 sm:right-10">
            <span className="bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md mb-3 inline-block">
              {article.category} Guide
            </span>
            <h1 className="text-xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
              {article.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 mt-4 font-medium font-mono">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4 text-indigo-400" />
                <span>{new Date(article.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <User className="w-4 h-4 text-indigo-400" />
                <span>SmartBuy AI Editorial Team</span>
              </div>
            </div>
          </div>
        </div>

        {/* Layout Column */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-slate-950 p-6 sm:p-8 rounded-3xl border border-slate-850">
              <div className="prose prose-invert max-w-none text-slate-300 text-sm sm:text-base leading-relaxed space-y-4">
                <ReactMarkdown>{article.content}</ReactMarkdown>
              </div>
            </div>
          </div>

          {/* Side Suggested products sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-850">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>Highly Rated Gear</span>
              </h3>
              
              <div className="space-y-4">
                {suggestedProducts.length > 0 ? (
                  suggestedProducts.map(prod => (
                    <div key={prod.id} className="border-b border-slate-900 pb-4 last:border-0 last:pb-0">
                      <img src={prod.image} alt={prod.title} referrerPolicy="no-referrer" className="w-full h-24 object-cover rounded-xl mb-2" />
                      <h4 className="text-xs font-bold text-white line-clamp-1">{prod.title}</h4>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">{prod.price} • Rating: ★{prod.rating}</p>
                      <Link
                        to={`/product/${prod.slug}`}
                        className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 mt-2 hover:underline"
                      >
                        <span>Analyze Review</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 italic">Continuous active index tracking underway...</p>
                )}
              </div>
            </div>

            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-850">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">Editorial Notice</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                Our guides are completely independent. Our commission referrals support continuing product tests without impacting retail consumer pricing.
              </p>
              <Link to="/disclosure" className="text-[10px] text-indigo-400 hover:underline font-bold mt-3 block">
                Read disclosure agreement
              </Link>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
