/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Link } from "../components/Navigation.tsx";
import { Sparkles, ArrowRight, BookOpen, Clock, Tag, Compass, Sparkle, Globe, ShieldCheck, Cpu } from "lucide-react";
import { motion } from "motion/react";
import { Article, Category, AffiliateTool } from "../types.ts";

export const Home: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tools, setTools] = useState<AffiliateTool[]>([]);
  const [loading, setLoading] = useState(true);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const [artRes, catRes, toolRes] = await Promise.all([
          fetch("/api/articles?all=false"), // Get only published articles
          fetch("/api/categories"),
          fetch("/api/tools")
        ]);

        if (artRes.ok) setArticles(await artRes.json());
        if (catRes.ok) setCategories(await catRes.json());
        if (toolRes.ok) {
          const allTools = await toolRes.json();
          setTools(allTools.filter((t: AffiliateTool) => t.status === "active").slice(0, 3));
        }
      } catch (err) {
        console.error("Error loading home page resources:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    setNewsletterSubscribed(true);
    setNewsletterEmail("");
  };

  const getCategoryName = (slug: string) => {
    const cat = categories.find(c => c.slug === slug);
    return cat ? cat.name : slug;
  };

  const renderIcon = (name: string) => {
    switch (name) {
      case "Sparkles": return <Sparkles className="w-5 h-5 text-indigo-500" />;
      case "Cpu": return <Cpu className="w-5 h-5 text-indigo-500" />;
      case "BookOpen": return <BookOpen className="w-5 h-5 text-indigo-500" />;
      default: return <Compass className="w-5 h-5 text-indigo-500" />;
    }
  };

  // Sort articles by createdAt descending to ensure newest first
  const sortedArticles = [...articles].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const featuredArticle = sortedArticles.length > 0 ? sortedArticles[0] : null;
  const latestArticles = sortedArticles.length > 1 ? sortedArticles.slice(1) : [];

  return (
    <div className="min-h-screen">
      {/* Editorial Header Hero */}
      <section className="relative overflow-hidden border-b border-slate-100 dark:border-slate-900 py-16 sm:py-24 px-4 bg-gradient-to-b from-transparent to-slate-50/50 dark:to-slate-950/20">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl opacity-20 pointer-events-none"></div>
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 mb-6 border border-indigo-500/20"
          >
            <Sparkle className="w-4.5 h-4.5 animate-spin-slow" />
            AI-First Generative Search Optimisation (GEO)
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] mb-6 font-sans text-slate-900 dark:text-white"
          >
            Publishing High-Quality, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 dark:from-indigo-400 dark:to-purple-400">Citable Content</span> for the LLM Era
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-base sm:text-lg max-w-3xl mx-auto mb-10 leading-relaxed text-slate-600 dark:text-slate-350"
          >
            Traditional organic SEO is evolving. We build authoritative, expert-written resources, structured schemas, and semantic internal link architectures that rank on Google and secure citation metrics in ChatGPT Search, Gemini, Claude, and Perplexity.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap items-center justify-center gap-3"
          >
            <Link
              to="/categories"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-md flex items-center gap-2 text-sm"
            >
              <span>Explore Research Topics</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/about"
              className="bg-slate-100 dark:bg-slate-900 border border-slate-250 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800/80 px-6 py-3 rounded-xl transition-all text-sm font-medium"
            >
              Our Editorial Integrity
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Main Editorial Layout (Bento structure) */}
      <section className="py-16 px-4 max-w-7xl mx-auto">
        {loading ? (
          <div className="space-y-8">
            <div className="h-96 rounded-3xl bg-slate-200 dark:bg-slate-900 animate-pulse"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="h-64 rounded-2xl bg-slate-200 dark:bg-slate-900 animate-pulse"></div>
              <div className="h-64 rounded-2xl bg-slate-200 dark:bg-slate-900 animate-pulse"></div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            {/* Left/Middle Column - Content Feed */}
            <div className="lg:col-span-2 space-y-12">
              
              {/* Featured Article Spot */}
              {featuredArticle && (
                <div id="featured-editorial-card">
                  <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4 flex items-center gap-1.5">
                    <span>●</span> Featured Analysis
                  </h2>
                  <div className="group border border-slate-150 dark:border-slate-900 rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-all bg-white dark:bg-slate-950">
                    <Link to={`/article/${featuredArticle.slug}`} className="block relative overflow-hidden aspect-[16/9]">
                      <img
                        src={featuredArticle.featuredImage}
                        alt={featuredArticle.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                      />
                      <div className="absolute top-4 left-4 bg-indigo-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md">
                        {getCategoryName(featuredArticle.category)}
                      </div>
                    </Link>
                    <div className="p-6 sm:p-8">
                      <div className="flex items-center gap-4 text-xs text-slate-400 dark:text-slate-500 mb-3 font-mono">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {featuredArticle.readingTime} min read
                        </span>
                        <span>•</span>
                        <span>{new Date(featuredArticle.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                      <Link to={`/article/${featuredArticle.slug}`}>
                        <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white hover:text-indigo-500 transition-colors tracking-tight leading-snug mb-3">
                          {featuredArticle.title}
                        </h3>
                      </Link>
                      <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm sm:text-base mb-6">
                        {featuredArticle.excerpt}
                      </p>
                      <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-slate-100 dark:border-slate-900">
                        {/* Author */}
                        <div className="flex items-center gap-2.5">
                          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">By Sarah Jenkins</span>
                          <span className="text-[10px] bg-slate-100 dark:bg-slate-900 text-slate-500 px-2 py-0.5 rounded">Expert Author</span>
                        </div>
                        <Link
                          to={`/article/${featuredArticle.slug}`}
                          className="text-indigo-500 hover:text-indigo-600 text-sm font-semibold flex items-center gap-1.5"
                        >
                          <span>Read Full Analysis</span>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Latest Feed List */}
              <div className="space-y-6">
                <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4 flex items-center gap-1.5">
                  <span>●</span> Latest Publications
                </h2>
                {latestArticles.length === 0 ? (
                  <div className="p-8 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 text-sm">
                    No other articles published yet. Publish more articles from your Admin Editorial CMS.
                  </div>
                ) : (
                  <div className="space-y-6">
                    {latestArticles.map((art) => (
                      <article key={art.id} className="group flex flex-col sm:flex-row gap-6 bg-white dark:bg-slate-950 border border-slate-150 dark:border-slate-900 rounded-2xl p-5 hover:border-indigo-500/20 hover:shadow-md transition-all">
                        <div className="sm:w-1/3 relative overflow-hidden rounded-xl aspect-[4/3] bg-slate-100 dark:bg-slate-900">
                          <img
                            src={art.featuredImage}
                            alt={art.title}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <div className="sm:w-2/3 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-900 text-indigo-500 tracking-wider">
                                {getCategoryName(art.category)}
                              </span>
                              <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 flex items-center gap-0.5">
                                <Clock className="w-3 h-3" /> {art.readingTime} min
                              </span>
                            </div>
                            <Link to={`/article/${art.slug}`}>
                              <h3 className="text-lg font-bold text-slate-900 dark:text-white hover:text-indigo-500 transition-colors line-clamp-2 leading-snug">
                                {art.title}
                              </h3>
                            </Link>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                              {art.excerpt || art.metaDescription}
                            </p>
                          </div>
                          <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 border-t border-slate-100 dark:border-slate-900 pt-3 mt-4 font-mono">
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

            {/* Right Column - Sidebar Widgets */}
            <div className="space-y-8">
              
              {/* Category Topics Widget */}
              <div className="border border-slate-150 dark:border-slate-900 rounded-3xl p-6 bg-white dark:bg-slate-950 shadow-sm">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4 flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-indigo-500" /> Research Categories
                </h3>
                <div className="space-y-3">
                  {categories.map((cat) => (
                    <Link
                      key={cat.id}
                      to={`/categories?slug=${cat.slug}`}
                      className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors group"
                    >
                      <div className="bg-slate-100 dark:bg-slate-900 p-2 rounded-lg group-hover:bg-indigo-600/10 group-hover:text-indigo-500 transition-colors text-slate-500">
                        {renderIcon(cat.iconName)}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-500 transition-colors leading-tight">{cat.name}</h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-normal">{cat.description}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Affiliate Tools Library Spotlight */}
              {tools.length > 0 && (
                <div className="border border-slate-150 dark:border-slate-900 rounded-3xl p-6 bg-white dark:bg-slate-950 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none"></div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-indigo-500" /> Recommended Tools
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
                    Industry-standard software tools and digital products featured inside our research articles:
                  </p>
                  <div className="space-y-4">
                    {tools.map((tool) => (
                      <div key={tool.id} className="border border-slate-100 dark:border-slate-900 rounded-xl p-3 bg-slate-50/50 dark:bg-slate-900/20">
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1">
                            <Globe className="w-3.5 h-3.5 text-indigo-500" /> {tool.name}
                          </span>
                          <span className="text-[9px] bg-indigo-500/10 text-indigo-500 px-2 py-0.5 rounded-full font-mono">
                            {tool.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-2.5">
                          {tool.description}
                        </p>
                        <a
                          href={tool.affiliateUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full text-center block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-1.5 rounded-lg text-xs transition-colors"
                        >
                          {tool.ctaText}
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Newsletter Sub-Widget */}
              <div className="border border-indigo-500/20 rounded-3xl p-6 bg-indigo-950/20 dark:bg-indigo-950/10 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>
                <h3 className="text-sm font-bold text-indigo-500 flex items-center gap-1.5 mb-2">
                  <BookOpen className="w-4 h-4" /> Subscribe to GEO briefs
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-450 leading-relaxed mb-4">
                  Receive highly targeted technical briefs outlining changes in Google AI Overviews & frontier search architectures.
                </p>

                {newsletterSubscribed ? (
                  <div className="p-3 text-xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-center">
                    ✓ Thank you! You have been subscribed.
                  </div>
                ) : (
                  <form onSubmit={handleNewsletter} className="space-y-2">
                    <input
                      type="email"
                      placeholder="Your work email..."
                      required
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
                    />
                    <button
                      type="submit"
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-xl text-xs transition-colors"
                    >
                      Subscribe Briefs
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
