/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Link } from "../components/Navigation.tsx";
import { Sparkles, Search, ArrowRight, Star, Check, Headphones, Mouse, Coffee, BookOpen, Mail } from "lucide-react";
import { motion } from "motion/react";
import { Product, Article, Category } from "../types.ts";

export const Home: React.FC = () => {
  const [searchVal, setSearchVal] = useState("");
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const [prodRes, artRes, catRes] = await Promise.all([
          fetch("/api/products?featured=true"),
          fetch("/api/articles"),
          fetch("/api/categories")
        ]);

        if (prodRes.ok) setFeaturedProducts(await prodRes.json());
        if (artRes.ok) setArticles(await artRes.json());
        if (catRes.ok) setCategories(await catRes.json());
      } catch (err) {
        console.error("Error loading home page resources:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchVal.trim()) return;
    window.history.pushState({}, "", `/search?q=${encodeURIComponent(searchVal.trim())}`);
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  const triggerPresetSearch = (query: string) => {
    window.history.pushState({}, "", `/search?q=${encodeURIComponent(query)}`);
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    setNewsletterSubscribed(true);
    setNewsletterEmail("");
  };

  const renderIcon = (name: string) => {
    switch (name) {
      case "Headphones": return <Headphones className="w-6 h-6 text-indigo-400" />;
      case "Mouse": return <Mouse className="w-6 h-6 text-indigo-400" />;
      case "Coffee": return <Coffee className="w-6 h-6 text-indigo-400" />;
      default: return <Sparkles className="w-6 h-6 text-indigo-400" />;
    }
  };

  return (
    <div className="bg-slate-900 text-slate-100 min-h-screen font-sans">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800 py-20 lg:py-28 px-4">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600 rounded-full blur-3xl opacity-10 animate-pulse"></div>
        <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-emerald-600 rounded-full blur-3xl opacity-5 animate-pulse"></div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 bg-slate-800 bg-opacity-60 border border-slate-700 px-3 py-1.5 rounded-full text-xs font-semibold text-indigo-300 mb-6 uppercase tracking-wider"
          >
            <Sparkles className="w-4 h-4 text-indigo-400" />
            Empowering Generative Engine Search Optimization
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight mb-6 font-sans"
          >
            Find the Absolute <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-emerald-400">Best Products</span> Using AI
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-lg text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Stop wasting hours reading conflicting reviews. Our AI dynamically analyzes, cross-references, and synthesizes specifications and user insights to provide instant, unbiased shopping summaries.
          </motion.p>

          {/* AI Search Box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="max-w-2xl mx-auto mb-6"
          >
            <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3 bg-slate-950 p-2.5 rounded-2xl border border-slate-800 shadow-xl focus-within:border-indigo-500 transition-all">
              <div className="flex-1 flex items-center gap-3 px-3">
                <Search className="w-5 h-5 text-indigo-400 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Ask AI: 'Best earbuds under $50' or 'Best gaming mouse'..."
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                  className="w-full bg-transparent text-slate-100 placeholder-slate-400 text-base focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
              >
                <span>Ask SmartBuy AI</span>
                <Sparkles className="w-4 h-4 text-indigo-300" />
              </button>
            </form>
          </motion.div>

          {/* Prompt Chips */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-2.5"
          >
            <span className="text-xs text-slate-400 font-medium mr-1.5 uppercase tracking-wider">Try typing:</span>
            {["Best earbuds under $50", "Best gaming mouse", "Best coffee maker"].map((preset) => (
              <button
                key={preset}
                onClick={() => triggerPresetSearch(preset)}
                className="bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-indigo-500 px-3 py-1.5 rounded-full text-xs transition-all font-mono"
              >
                "{preset}"
              </button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-16 px-4 bg-slate-950">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-10 border-b border-slate-900 pb-4">
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Featured Categories</h2>
              <p className="text-sm text-slate-400 mt-1">Explore specialized buying reviews across diverse industries</p>
            </div>
            <Link to="/categories" className="text-indigo-400 text-sm hover:text-indigo-300 font-medium flex items-center gap-1.5 hover:underline">
              <span>View All</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {loading ? (
              [1, 2, 3].map((n) => (
                <div key={n} className="bg-slate-900 border border-slate-800 h-40 rounded-2xl animate-pulse"></div>
              ))
            ) : (
              categories.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/categories?slug=${cat.slug}`}
                  className="group bg-slate-900 border border-slate-850 hover:border-indigo-500/50 p-6 rounded-2xl transition-all shadow-md flex flex-col justify-between hover:translate-y-[-2px] relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500 rounded-full blur-3xl opacity-5 group-hover:opacity-10 transition-opacity"></div>
                  <div>
                    <div className="bg-slate-800 p-3 rounded-xl w-fit mb-4 group-hover:bg-indigo-600/20 transition-all">
                      {renderIcon(cat.iconName)}
                    </div>
                    <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors">{cat.name}</h3>
                    <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">{cat.description}</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-300 font-semibold group-hover:text-indigo-300 transition-colors mt-4">
                    <span>Explore reviews</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Trending Reviewed Products */}
      <section className="py-16 px-4 bg-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-10 border-b border-slate-800 pb-4 gap-4">
            <div>
              <div className="inline-flex items-center gap-1 bg-indigo-950 text-indigo-400 px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wide mb-2 border border-indigo-900/40">
                <Star className="w-3.5 h-3.5 fill-indigo-400" />
                Featured Analyses
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Trending Expert Product Reviews</h2>
              <p className="text-sm text-slate-400 mt-1">Data-backed reviews with dynamic comparison metrics</p>
            </div>
            <Link to="/categories" className="text-indigo-400 text-sm hover:text-indigo-300 font-medium flex items-center gap-1.5 hover:underline">
              <span>Compare Products</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {loading ? (
              [1, 2, 3].map((n) => (
                <div key={n} className="bg-slate-950 border border-slate-900 h-96 rounded-2xl animate-pulse"></div>
              ))
            ) : (
              featuredProducts.map((prod) => (
                <article key={prod.id} className="group bg-slate-950 border border-slate-850 hover:border-indigo-500/30 rounded-2xl overflow-hidden transition-all flex flex-col justify-between hover:translate-y-[-2px] shadow-lg">
                  <div className="relative">
                    <img
                      src={prod.image}
                      alt={prod.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-slate-900 bg-opacity-80 backdrop-blur-sm text-xs text-indigo-300 font-mono px-2 py-1 rounded border border-slate-700">
                      {prod.price}
                    </div>
                  </div>
                  
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-semibold tracking-wide uppercase">
                        <span>{prod.category}</span>
                        <div className="flex items-center gap-1 text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded">
                          <Star className="w-3 h-3 fill-emerald-400 text-emerald-400" />
                          <span>{prod.rating}</span>
                        </div>
                      </div>
                      
                      <Link to={`/product/${prod.slug}`}>
                        <h3 className="text-lg font-bold text-white hover:text-indigo-400 transition-colors line-clamp-1">{prod.title}</h3>
                      </Link>
                      
                      <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                        {prod.buyingAdvice}
                      </p>

                      {/* Micro pros list */}
                      <div className="mt-4 pt-4 border-t border-slate-900 space-y-1.5">
                        <p className="text-xs font-bold text-slate-300 uppercase tracking-wide">Key Pros:</p>
                        {prod.pros.slice(0, 2).map((pro, i) => (
                          <div key={i} className="flex items-start gap-1.5 text-xs text-slate-400 leading-normal">
                            <Check className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                            <span className="line-clamp-1">{pro}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-6 flex items-center gap-3 border-t border-slate-900 pt-4">
                      <Link
                        to={`/product/${prod.slug}`}
                        className="flex-1 text-center bg-slate-900 hover:bg-slate-800 border border-slate-850 text-slate-200 py-2 rounded-xl text-xs font-semibold transition-all"
                      >
                        Read Expert Review
                      </Link>
                      <a
                        href={prod.affiliateLink}
                        target="_blank"
                        rel="nofollow noopener"
                        className="flex-1 text-center bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1"
                      >
                        <span>Check Price</span>
                        <ArrowRight className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Latest Articles / Buying Guides */}
      <section className="py-16 px-4 bg-slate-950 border-t border-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-10 pb-4 border-b border-slate-900">
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-indigo-400" />
                Latest Articles & Buying Guides
              </h2>
              <p className="text-sm text-slate-400 mt-1">Generative Engine-optimized reviews and detailed hardware guides</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {loading ? (
              [1, 2].map((n) => (
                <div key={n} className="bg-slate-900 border border-slate-800 h-64 rounded-2xl animate-pulse"></div>
              ))
            ) : (
              articles.slice(0, 4).map((art) => (
                <article key={art.id} className="group flex flex-col sm:flex-row bg-slate-900 border border-slate-850 hover:border-indigo-500/20 rounded-2xl overflow-hidden transition-all">
                  <div className="sm:w-1/3 relative">
                    <img
                      src={art.image}
                      alt={art.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover min-h-[160px] group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-5 sm:w-2/3 flex flex-col justify-between">
                    <div>
                      <span className="text-xs text-indigo-400 font-mono tracking-wider uppercase">{art.category}</span>
                      <Link to={`/article/${art.slug}`}>
                        <h3 className="text-lg font-bold text-white hover:text-indigo-400 transition-colors mt-1 line-clamp-2 leading-snug">{art.title}</h3>
                      </Link>
                      <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                        {art.metaDescription}
                      </p>
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-850 flex items-center justify-between text-xs text-slate-500">
                      <span>{new Date(art.createdAt).toLocaleDateString()}</span>
                      <Link to={`/article/${art.slug}`} className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1">
                        <span>Read Guide</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Newsletter signup & Trust Statement */}
      <section className="py-16 px-4 bg-gradient-to-b from-slate-950 to-slate-900 text-center relative border-t border-slate-900">
        <div className="max-w-2xl mx-auto">
          <div className="bg-indigo-950 bg-opacity-30 border border-indigo-900/50 rounded-3xl p-8 lg:p-12 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full blur-3xl opacity-10"></div>
            
            <Mail className="w-10 h-10 text-indigo-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white tracking-tight mb-2">Subscribe to smart buyer guides</h3>
            <p className="text-sm text-slate-300 mb-6">Receive curated AI-grounded reports, coupon updates, and deep dives once a week. Zero spam, easily opt-out.</p>
            
            {newsletterSubscribed ? (
              <div className="bg-emerald-950/50 border border-emerald-900/60 p-4 rounded-xl text-emerald-400 text-sm font-medium">
                ✓ Success! Thank you for subscribing to our SmartBuy weekly briefings.
              </div>
            ) : (
              <form onSubmit={handleNewsletter} className="flex flex-col sm:flex-row gap-2.5 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your personal email..."
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-5 rounded-xl text-sm transition-all shadow-md"
                >
                  Join List
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
