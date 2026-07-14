/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Link } from "../components/Navigation.tsx";
import { Headphones, Mouse, Coffee, Star, Check, ArrowRight, Sparkles, BookOpen } from "lucide-react";
import { Product, Article, Category } from "../types.ts";

export const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<"products" | "articles">("products");
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
        const [catRes, prodRes, artRes] = await Promise.all([
          fetch("/api/categories"),
          fetch("/api/products"),
          fetch("/api/articles")
        ]);

        if (catRes.ok) setCategories(await catRes.json());
        if (prodRes.ok) setProducts(await prodRes.json());
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
    // Update URL without reloading page
    const newUrl = slug === "all" ? "/categories" : `/categories?slug=${slug}`;
    window.history.pushState({}, "", newUrl);
  };

  const filteredProducts = selectedCategory === "all"
    ? products
    : products.filter(p => p.category === selectedCategory);

  const filteredArticles = selectedCategory === "all"
    ? articles
    : articles.filter(a => a.category === selectedCategory);

  const renderIcon = (name: string, active: boolean) => {
    const style = `w-5 h-5 ${active ? "text-indigo-400" : "text-slate-400"}`;
    switch (name) {
      case "Headphones": return <Headphones className={style} />;
      case "Mouse": return <Mouse className={style} />;
      case "Coffee": return <Coffee className={style} />;
      default: return <Sparkles className={style} />;
    }
  };

  return (
    <div className="bg-slate-900 text-slate-100 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">Compare Product Categories</h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
            Choose a category below to access our deep-dive, side-by-side product analyses, comprehensive key features, and dynamic AI-generated guides.
          </p>
        </div>

        {/* Category Pill Filters */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-10 pb-4 border-b border-slate-800">
          <button
            onClick={() => handleCategoryClick("all")}
            className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all flex items-center gap-2 ${
              selectedCategory === "all"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/25"
                : "bg-slate-950 text-slate-300 border border-slate-850 hover:border-slate-750 hover:text-white"
            }`}
          >
            <span>All Reviews</span>
          </button>
          
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryClick(cat.slug)}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all flex items-center gap-2 ${
                selectedCategory === cat.slug
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/25"
                  : "bg-slate-950 text-slate-300 border border-slate-850 hover:border-slate-750 hover:text-white"
              }`}
            >
              {renderIcon(cat.iconName, selectedCategory === cat.slug)}
              <span>{cat.name}</span>
            </button>
          ))}
        </div>

        {/* Dynamic Category description info card */}
        {selectedCategory !== "all" && !loading && (
          <div className="bg-slate-950 border border-slate-850 p-6 rounded-2xl mb-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full blur-3xl opacity-5"></div>
            <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              {renderIcon(categories.find(c => c.slug === selectedCategory)?.iconName || "", true)}
              <span>{categories.find(c => c.slug === selectedCategory)?.name} Guide Hub</span>
            </h2>
            <p className="text-sm text-slate-400 max-w-4xl leading-relaxed">
              {categories.find(c => c.slug === selectedCategory)?.description} All product analyses are continuously cross-referenced for specification compliance, market feedback, and pricing fairness.
            </p>
          </div>
        )}

        {/* TAB Switch (Products vs Articles) */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <button
            onClick={() => setActiveTab("products")}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all border ${
              activeTab === "products"
                ? "bg-slate-800 text-white border-indigo-500/30"
                : "bg-transparent text-slate-400 border-transparent hover:text-white"
            }`}
          >
            Product Reviews ({filteredProducts.length})
          </button>
          <button
            onClick={() => setActiveTab("articles")}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all border ${
              activeTab === "articles"
                ? "bg-slate-800 text-white border-indigo-500/30"
                : "bg-transparent text-slate-400 border-transparent hover:text-white"
            }`}
          >
            Guides & Articles ({filteredArticles.length})
          </button>
        </div>

        {/* Main Content Listing Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-slate-950 border border-slate-850 h-80 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : activeTab === "products" ? (
          filteredProducts.length === 0 ? (
            <div className="text-center py-20 bg-slate-950 rounded-2xl border border-slate-850">
              <p className="text-slate-400">No product reviews available in this category yet.</p>
              <Link to="/" className="text-indigo-400 text-sm mt-4 hover:underline">Back to homepage</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {filteredProducts.map((prod) => (
                <article key={prod.id} className="group bg-slate-950 border border-slate-850 hover:border-indigo-500/20 rounded-2xl overflow-hidden transition-all flex flex-col justify-between shadow-lg hover:translate-y-[-2px]">
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

                      {/* Specs snippet */}
                      <div className="mt-4 pt-4 border-t border-slate-900 grid grid-cols-2 gap-2 text-xs text-slate-400">
                        {Object.entries(prod.specs).slice(0, 2).map(([key, val]) => (
                          <div key={key} className="bg-slate-900 p-1.5 rounded">
                            <span className="text-[10px] uppercase text-slate-500 block font-bold">{key}</span>
                            <span className="text-slate-300 font-mono font-medium line-clamp-1">{val}</span>
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
                        <span>Buy Now</span>
                        <ArrowRight className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )
        ) : (
          filteredArticles.length === 0 ? (
            <div className="text-center py-20 bg-slate-950 rounded-2xl border border-slate-850">
              <p className="text-slate-400">No guides or articles available in this category yet.</p>
              <Link to="/" className="text-indigo-400 text-sm mt-4 hover:underline">Back to homepage</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {filteredArticles.map((art) => (
                <article key={art.id} className="group flex flex-col sm:flex-row bg-slate-950 border border-slate-850 hover:border-indigo-500/20 rounded-2xl overflow-hidden transition-all shadow-md">
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

                    <div className="mt-4 pt-4 border-t border-slate-900 flex items-center justify-between text-xs text-slate-500">
                      <span>{new Date(art.createdAt).toLocaleDateString()}</span>
                      <Link to={`/article/${art.slug}`} className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1">
                        <span>Read Guide</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
};
