/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState, useEffect } from "react";
import { Link } from "../components/Navigation.tsx";
import { Calendar, User, ArrowRight, RefreshCw, AlertCircle, Sparkles, BookOpen, Clock, Tag, ExternalLink, ShieldCheck, Check } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Article, Category, AffiliateTool } from "../types.ts";

export const ArticleDetail: React.FC = () => {
  const [slug, setSlug] = useState<string>("");
  const [article, setArticle] = useState<Article | null>(null);
  const [suggestedTools, setSuggestedTools] = useState<AffiliateTool[]>([]);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [authors, setAuthors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Parse slug from URL path e.g. /article/generative-engine-optimization-guide
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
        
        // Load categories and authors for reference
        const [catRes, authRes] = await Promise.all([
          fetch("/api/categories"),
          fetch("/api/authors")
        ]);
        if (catRes.ok) setCategories(await catRes.json());
        if (authRes.ok) setAuthors(await authRes.json());

        const res = await fetch(`/api/articles/${slug}`);
        if (!res.ok) {
          throw new Error("Expert brief could not be retrieved from active database index.");
        }
        const data = await res.json();
        setArticle(data.article);
        setSuggestedTools(data.relatedTools || []);
        setRelatedArticles(data.relatedArticles || []);

        // Record analytic view triggers
        await fetch("/api/articles/track-click", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug })
        });
      } catch (err: any) {
        setError(err.message || "Failed to load guide.");
      } finally {
        setLoading(false);
      }
    }
    loadArticle();
  }, [slug]);

  // Handle SEO & Canonical Tags Injection
  useEffect(() => {
    if (!article) return;

    // Document Meta Title
    document.title = article.seoTitle || `${article.title} | BlogFlow AI`;

    // Document Meta Description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', article.metaDescription || article.excerpt);

    // Canonical Tag Injection
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', `${window.location.origin}/article/${article.slug}`);
  }, [article]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-white dark:bg-slate-950">
        <div className="text-center space-y-4">
          <RefreshCw className="w-10 h-10 text-indigo-500 animate-spin mx-auto" />
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Retrieving technical analysis...</p>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-white dark:bg-slate-950">
        <div className="max-w-md text-center space-y-4 bg-slate-50 dark:bg-slate-900/40 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-xl font-bold text-slate-950 dark:text-white">Publication Not Found</h2>
          <p className="text-sm text-slate-500 dark:text-slate-450">The article slug "{slug}" does not match our index. Try searching other topics.</p>
          <Link to="/categories" className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all">
            Browse All Categories
          </Link>
        </div>
      </div>
    );
  }

  const assignedAuthor = authors.find(a => a.id === article.authorId) || {
    name: "Sarah Jenkins",
    role: "Chief SEO Architect & Founder",
    bio: "Sarah is a pioneer in Generative Engine Optimization (GEO) with extensive experience analyzing search crawlers and semantic entities.",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150"
  };

  const getCategoryName = (catSlug: string) => {
    const cat = categories.find(c => c.slug === catSlug);
    return cat ? cat.name : catSlug;
  };

  // Build high-fidelity NewsArticle schema JSON-LD
  const schemaMarkup = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "TechArticle",
        "@id": `${window.location.origin}/article/${article.slug}#article`,
        "isPartOf": {
          "@type": "WebPage",
          "@id": `${window.location.origin}/article/${article.slug}`,
          "url": `${window.location.origin}/article/${article.slug}`,
          "name": article.seoTitle || article.title
        },
        "headline": article.title,
        "image": [article.featuredImage],
        "datePublished": article.createdAt,
        "dateModified": article.createdAt,
        "description": article.metaDescription || article.excerpt,
        "author": {
          "@type": "Person",
          "name": assignedAuthor.name,
          "jobTitle": assignedAuthor.role
        },
        "publisher": {
          "@type": "Organization",
          "name": "BlogFlow AI",
          "logo": {
            "@type": "ImageObject",
            "url": `${window.location.origin}/favicon.ico`
          }
        }
      },
      ...(article.faq && article.faq.length > 0 ? [{
        "@type": "FAQPage",
        "mainEntity": article.faq.map(item => ({
          "@type": "Question",
          "name": item.question,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": item.answer
          }
        }))
      }] : [])
    ]
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      {/* Inject rich structured markup dynamically */}
      <script type="application/ld+json">
        {JSON.stringify(schemaMarkup)}
      </script>

      <div className="max-w-5xl mx-auto">
        {/* Breadcrumb Navigation */}
        <nav className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 mb-8 font-medium">
          <Link to="/" className="hover:text-indigo-500 transition-colors">Home</Link>
          <span>/</span>
          <Link to="/categories" className="hover:text-indigo-500 transition-colors">Categories</Link>
          <span>/</span>
          <Link to={`/categories?slug=${article.category}`} className="hover:text-indigo-500 transition-colors capitalize font-semibold text-indigo-600 dark:text-indigo-400">
            {getCategoryName(article.category)}
          </Link>
        </nav>

        {/* Article header banner structure */}
        <header className="mb-10">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
              {getCategoryName(article.category)}
            </span>
            <span className="text-[10px] bg-slate-100 dark:bg-slate-900 text-slate-500 px-3 py-1 rounded-full font-mono flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {article.readingTime} min read
            </span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight mb-6 text-slate-900 dark:text-white font-sans">
            {article.title}
          </h1>

          <p className="text-slate-650 dark:text-slate-350 text-base sm:text-lg mb-8 leading-relaxed italic border-l-2 border-indigo-500 pl-4 bg-slate-50 dark:bg-slate-900/20 py-2 rounded-r-xl">
            {article.excerpt}
          </p>

          {/* Author card strip */}
          <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/30 border border-slate-150 dark:border-slate-900">
            <img
              src={assignedAuthor.avatar}
              alt={assignedAuthor.name}
              className="w-11 h-11 rounded-full object-cover ring-2 ring-indigo-500/10"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{assignedAuthor.name}</span>
                <span className="text-[9px] bg-indigo-600 text-white font-semibold px-1.5 py-0.5 rounded uppercase">Verified Expert</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">{assignedAuthor.role} • Published {new Date(article.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</p>
            </div>
          </div>
        </header>

        {/* Hero banner cover image */}
        <div className="relative rounded-3xl overflow-hidden mb-12 aspect-[16/9] border border-slate-200 dark:border-slate-900 max-h-[480px]">
          <img
            src={article.featuredImage}
            alt={article.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Dynamic content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Main content body (Left column) */}
          <div className="lg:col-span-2 space-y-12">
            
            {/* Markdown rendered body */}
            <article className="prose prose-slate dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 text-base sm:text-[17px] leading-relaxed space-y-6">
              <div className="markdown-body">
                <ReactMarkdown>{article.content}</ReactMarkdown>
              </div>
            </article>

            {/* Affiliate recommended tools cards (Automatically injected in article) */}
            {suggestedTools.length > 0 && (
              <div className="pt-8 border-t border-slate-150 dark:border-slate-900 space-y-6">
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <ShieldCheck className="w-5.5 h-5.5 text-indigo-500" />
                  <span>Recommended Industry Solutions Reviewed</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-450 leading-relaxed">
                  The following tools were selected by our researchers and editorial board. When clicking through our links, we preserve our referrals transparently:
                </p>
                <div className="grid grid-cols-1 gap-6">
                  {suggestedTools.map((tool) => (
                    <div
                      key={tool.id}
                      className="flex flex-col sm:flex-row gap-5 p-6 rounded-3xl border border-slate-200 dark:border-slate-900 bg-white dark:bg-slate-950 hover:shadow-md transition-all relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none"></div>
                      <div className="sm:w-1/4 flex sm:flex-col items-center justify-center bg-slate-50 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-900 h-fit">
                        <div className="bg-indigo-600 text-white p-3 rounded-2xl mb-2 flex items-center justify-center shadow-sm">
                          <Sparkles className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-bold text-slate-900 dark:text-white font-mono text-center block mt-1">
                          {tool.name}
                        </span>
                        <span className="text-[9px] bg-slate-200 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded-full mt-1.5 text-center">
                          {tool.category}
                        </span>
                      </div>
                      <div className="sm:w-3/4 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">{tool.company}</span>
                            <span className="text-[10px] text-slate-400">• Verified Integration</span>
                          </div>
                          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                            {tool.description}
                          </p>
                          <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500 mb-4 bg-slate-50 dark:bg-slate-900/20 p-2.5 rounded-xl font-mono">
                            <span className="flex items-center gap-1">
                              <Check className="w-3 h-3 text-emerald-500" /> 100% Secure URL
                            </span>
                            <span className="flex items-center gap-1">
                              <Check className="w-3 h-3 text-emerald-500" /> Active Commission
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                          <a
                            href={tool.affiliateUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition-colors shadow-sm flex items-center gap-1"
                          >
                            <span>{tool.ctaText}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </a>
                          <a
                            href={tool.officialUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 font-semibold text-xs py-2 flex items-center gap-1"
                          >
                            <span>Official Website</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* FAQ Accordion Section */}
            {article.faq && article.faq.length > 0 && (
              <div className="pt-8 border-t border-slate-150 dark:border-slate-900 space-y-6">
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <BookOpen className="w-5.5 h-5.5 text-indigo-500" />
                  <span>Frequently Asked Questions (FAQ)</span>
                </h3>
                <div className="space-y-4">
                  {article.faq.map((item, i) => (
                    <div key={i} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/20 border border-slate-150 dark:border-slate-900">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2 leading-snug">
                        {item.question}
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-450 leading-relaxed">
                        {item.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Widgets (Right column) */}
          <div className="lg:col-span-1 space-y-8">
            
            {/* Author details box */}
            <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-3xl border border-slate-200 dark:border-slate-900 shadow-sm text-center">
              <img
                src={assignedAuthor.avatar}
                alt={assignedAuthor.name}
                className="w-16 h-16 rounded-full object-cover mx-auto mb-3.5 ring-4 ring-indigo-500/10"
              />
              <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{assignedAuthor.name}</h4>
              <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-mono font-medium mt-1 uppercase tracking-wider">{assignedAuthor.role}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 leading-relaxed">
                {assignedAuthor.bio}
              </p>
            </div>

            {/* Related Informational Guides */}
            <div className="bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-200 dark:border-slate-900 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-900 pb-2">
                <BookOpen className="w-4 h-4 text-indigo-500" /> Related Publications
              </h3>

              <div className="space-y-4">
                {relatedArticles.length > 0 ? (
                  relatedArticles.map(art => (
                    <div key={art.id} className="group">
                      <Link
                        to={`/article/${art.slug}`}
                        className="text-xs font-bold text-slate-800 dark:text-slate-300 group-hover:text-indigo-500 transition-colors line-clamp-2 leading-snug"
                      >
                        {art.title}
                      </Link>
                      <span className="text-[9px] font-mono text-slate-400 dark:text-slate-500 mt-1 block">
                        {new Date(art.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 dark:text-slate-500 italic">Additional studies queued...</p>
                )}
              </div>
            </div>

            {/* Editorial Disclosure Notice */}
            <div className="bg-slate-50 dark:bg-slate-900/20 p-6 rounded-3xl border border-slate-200 dark:border-slate-900 shadow-sm text-xs text-slate-500 leading-relaxed space-y-3">
              <h4 className="font-bold text-slate-800 dark:text-slate-300">Independent Editorial Board</h4>
              <p>
                Our guides are supported by our commission referrals. Our reviews remain strictly independent, factual, and unbiased, matching certified entity tracking.
              </p>
              <Link to="/disclosure" className="text-[10px] text-indigo-500 hover:underline font-bold block pt-1">
                Read our complete disclosure agreement
              </Link>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
