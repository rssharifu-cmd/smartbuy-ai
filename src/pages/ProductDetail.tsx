/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Link } from "../components/Navigation.tsx";
import { Star, Check, X, ShieldAlert, ArrowRight, Tag, HelpCircle, AlertCircle, ShoppingBag, Layers, RefreshCw } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Product, Article } from "../types.ts";

export const ProductDetail: React.FC = () => {
  const [slug, setSlug] = useState<string>("");
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [faqOpen, setFaqOpen] = useState<Record<number, boolean>>({});

  // Sync slug from URL path e.g. /product/soundcore-life-p3i-review
  useEffect(() => {
    const path = window.location.pathname;
    const parts = path.split("/");
    const slugVal = parts[parts.length - 1];
    setSlug(slugVal);
  }, []);

  useEffect(() => {
    if (!slug) return;
    
    async function loadProduct() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/products/${slug}`);
        if (!res.ok) {
          throw new Error("Product review could not be retrieved from active catalog.");
        }
        const data = await res.json();
        setProduct(data.product);
        setRelatedProducts(data.related || []);
        setRelatedArticles(data.relatedArticles || []);
      } catch (err: any) {
        setError(err.message || "Failed to load product.");
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [slug]);

  const toggleFaq = (index: number) => {
    setFaqOpen(prev => ({ ...prev, [index]: !prev[index] }));
  };

  if (loading) {
    return (
      <div className="bg-slate-900 text-slate-100 min-h-screen flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <RefreshCw className="w-10 h-10 text-indigo-400 animate-spin mx-auto" />
          <p className="text-sm text-slate-400">Loading comprehensive expert report...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="bg-slate-900 text-slate-100 min-h-screen flex items-center justify-center p-8">
        <div className="max-w-md text-center space-y-4 bg-slate-950 p-8 rounded-2xl border border-slate-850">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-xl font-bold text-white">Review Not Found</h2>
          <p className="text-sm text-slate-400">The product review slug "{slug}" does not match our current index. Try exploring another category.</p>
          <Link to="/categories" className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all">
            Explore Categories
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 text-slate-100 min-h-screen py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto">
        {/* Breadcrumb Schema navigation bar */}
        <nav className="flex items-center gap-1.5 text-xs text-slate-400 mb-6 font-medium">
          <Link to="/" className="hover:text-indigo-400 transition-colors">Home</Link>
          <span>/</span>
          <Link to={`/categories?slug=${product.category}`} className="hover:text-indigo-400 transition-colors capitalize">{product.category.replace("-", " ")}</Link>
          <span>/</span>
          <span className="text-slate-300 truncate">{product.title}</span>
        </nav>

        {/* Product Review Header Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 bg-slate-950 p-6 sm:p-8 rounded-3xl border border-slate-850 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full blur-3xl opacity-5"></div>
          
          <div className="flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 bg-indigo-950 text-indigo-400 border border-indigo-900/40 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider mb-4">
                <Layers className="w-3.5 h-3.5" />
                Verified Expert Analysis
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight mb-4">
                {product.title}
              </h1>
              
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-1 text-amber-400">
                  <Star className="w-5 h-5 fill-amber-400" />
                  <span className="font-bold text-slate-200 text-lg">{product.rating}</span>
                  <span className="text-xs text-slate-400">/ 5.0 Rating</span>
                </div>
                <div className="h-4 w-[1px] bg-slate-800"></div>
                <div className="text-indigo-400 font-mono font-bold text-lg">{product.price}</div>
              </div>

              <p className="text-slate-300 text-sm leading-relaxed mb-6 italic border-l-2 border-indigo-500 pl-3">
                " {product.buyingAdvice} "
              </p>
            </div>

            <div className="space-y-3">
              <a
                href={product.affiliateLink}
                target="_blank"
                rel="nofollow noopener"
                className="w-full text-center bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-6 rounded-2xl tracking-wide transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-5 h-5" />
                <span>Check Current Price on Amazon</span>
                <ArrowRight className="w-4 h-4" />
              </a>
              <p className="text-[10px] text-center text-slate-500 flex items-center justify-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5 text-indigo-500/50" />
                <span>Earns commissions via verified qualifying purchases.</span>
              </p>
            </div>
          </div>

          <div className="relative group rounded-2xl overflow-hidden shadow-lg h-64 sm:h-auto min-h-[250px]">
            <img
              src={product.image}
              alt={product.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
            />
          </div>
        </div>

        {/* Specs and Pros/Cons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Side-by-side Pros & Cons */}
          <div className="bg-slate-950 p-6 rounded-2xl border border-slate-850">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2 border-b border-slate-900 pb-2.5">
              <Check className="w-5 h-5 text-emerald-400" />
              <span>Pros & Strengths</span>
            </h3>
            <ul className="space-y-3">
              {product.pros.map((pro, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-300">
                  <Check className="w-4 h-4 text-emerald-400 mt-1 flex-shrink-0" />
                  <span>{pro}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-slate-950 p-6 rounded-2xl border border-slate-850">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2 border-b border-slate-900 pb-2.5">
              <X className="w-4 h-4 text-rose-500" />
              <span>Cons & Limits</span>
            </h3>
            <ul className="space-y-3">
              {product.cons.map((con, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-300">
                  <X className="w-4 h-4 text-rose-500 mt-1 flex-shrink-0" />
                  <span>{con}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Expert In-Depth Review Markdown Content */}
        <div className="bg-slate-950 p-6 sm:p-8 rounded-3xl border border-slate-850 mb-12">
          <h2 className="text-xl font-bold text-white mb-6 border-b border-slate-900 pb-3 flex items-center gap-2">
            <Tag className="w-5 h-5 text-indigo-400" />
            <span>AI-Assisted Expert Deep Dive Review</span>
          </h2>
          <div className="prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed space-y-4">
            <ReactMarkdown>{product.content}</ReactMarkdown>
          </div>
        </div>

        {/* Key Specifications Grid */}
        <div className="bg-slate-950 p-6 sm:p-8 rounded-3xl border border-slate-850 mb-12">
          <h3 className="text-xl font-bold text-white mb-6 border-b border-slate-900 pb-3">Key Technical Specifications</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Object.entries(product.specs).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between p-3.5 bg-slate-900 rounded-xl border border-slate-850 text-sm font-mono">
                <span className="text-slate-400 font-sans">{key}</span>
                <span className="text-white font-semibold text-right">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Specifications Comparison Table module */}
        {relatedProducts.length > 0 && (
          <div className="bg-slate-950 p-6 sm:p-8 rounded-3xl border border-slate-850 mb-12 overflow-x-auto">
            <h3 className="text-xl font-bold text-white mb-4">Acoustic & Hardware Comparison Table</h3>
            <p className="text-xs text-slate-400 mb-6">Compare core properties side-by-side with other products in the active database</p>
            
            <table className="w-full text-left border-collapse text-sm min-w-[600px]">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-xs font-mono uppercase tracking-wider">
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-4">Rating</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Primary Strength</th>
                  <th className="py-3 px-4 text-right">Review Hub</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900 text-slate-300">
                {/* Active Product */}
                <tr className="bg-indigo-950/20 text-white font-medium">
                  <td className="py-4 px-4 font-bold flex items-center gap-1.5">
                    <span>{product.title}</span>
                    <span className="bg-indigo-600 text-[9px] uppercase px-1.5 py-0.5 rounded text-white font-mono">Active</span>
                  </td>
                  <td className="py-4 px-4 text-amber-400">★ {product.rating}</td>
                  <td className="py-4 px-4 font-mono font-bold text-indigo-400">{product.price}</td>
                  <td className="py-4 px-4 text-xs max-w-xs truncate">{product.pros[0]}</td>
                  <td className="py-4 px-4 text-right">
                    <span className="text-xs text-slate-500 font-mono">Viewing Review</span>
                  </td>
                </tr>

                {/* Related comparative products */}
                {relatedProducts.map(rp => (
                  <tr key={rp.id} className="hover:bg-slate-900/50">
                    <td className="py-4 px-4 font-medium">{rp.title}</td>
                    <td className="py-4 px-4 text-amber-400">★ {rp.rating}</td>
                    <td className="py-4 px-4 font-mono">{rp.price}</td>
                    <td className="py-4 px-4 text-xs max-w-xs truncate">{rp.pros[0]}</td>
                    <td className="py-4 px-4 text-right">
                      <a
                        href={`/product/${rp.slug}`}
                        onClick={(e) => {
                          e.preventDefault();
                          window.history.pushState({}, "", `/product/${rp.slug}`);
                          window.dispatchEvent(new PopStateEvent("popstate"));
                        }}
                        className="text-indigo-400 hover:text-indigo-300 hover:underline text-xs font-semibold flex items-center justify-end gap-1"
                      >
                        <span>Analyze</span>
                        <ArrowRight className="w-3 h-3" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Collapsible FAQ Section */}
        {product.faq && product.faq.length > 0 && (
          <div className="bg-slate-950 p-6 sm:p-8 rounded-3xl border border-slate-850 mb-12">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <HelpCircle className="w-5.5 h-5.5 text-indigo-400" />
              <span>Frequently Asked Questions (FAQ)</span>
            </h3>
            <div className="space-y-4">
              {product.faq.map((fq, idx) => (
                <div key={idx} className="border border-slate-850 rounded-xl overflow-hidden transition-all bg-slate-900 bg-opacity-35">
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full text-left p-4 flex items-center justify-between text-sm sm:text-base font-bold text-white hover:text-indigo-400 transition-colors"
                  >
                    <span>{fq.question}</span>
                    <span className="text-slate-500 text-lg">{faqOpen[idx] ? "-" : "+"}</span>
                  </button>
                  {faqOpen[idx] && (
                    <div className="p-4 pt-0 border-t border-slate-850 text-xs sm:text-sm text-slate-300 leading-relaxed font-sans bg-slate-950 bg-opacity-35">
                      {fq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Alternatives / Competitor Recommendations */}
        <div className="bg-slate-950 p-6 sm:p-8 rounded-3xl border border-slate-850 mb-12">
          <h3 className="text-xl font-bold text-white mb-4">Recommended Alternatives</h3>
          <p className="text-xs text-slate-400 mb-6">If the {product.title} does not suit your specific requirements, evaluate these top alternative reviews</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {relatedProducts.length > 0 ? (
              relatedProducts.slice(0, 2).map(rp => (
                <div key={rp.id} className="bg-slate-900 border border-slate-850 p-4 rounded-2xl flex gap-4 items-center">
                  <img src={rp.image} alt={rp.title} referrerPolicy="no-referrer" className="w-16 h-16 object-cover rounded-xl flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-white truncate">{rp.title}</h4>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">{rp.price} • Rating: ★{rp.rating}</p>
                    <a
                      href={`/product/${rp.slug}`}
                      onClick={(e) => {
                        e.preventDefault();
                        window.history.pushState({}, "", `/product/${rp.slug}`);
                        window.dispatchEvent(new PopStateEvent("popstate"));
                      }}
                      className="text-xs text-indigo-400 hover:text-indigo-300 hover:underline font-semibold flex items-center gap-1 mt-2"
                    >
                      <span>Read alternative review</span>
                      <ArrowRight className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 italic col-span-2">Updating dynamic alternative parameters daily...</p>
            )}
          </div>
        </div>

        {/* Related articles integration for internal linking */}
        {relatedArticles.length > 0 && (
          <div className="border-t border-slate-800 pt-10">
            <h3 className="text-lg font-bold text-white mb-6">Expert Buying Guides on Similar Hardware</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {relatedArticles.map(art => (
                <div key={art.id} className="group bg-slate-950 border border-slate-850 p-4 rounded-2xl flex items-center gap-4 hover:border-indigo-500/10 transition-colors">
                  <img src={art.image} alt={art.title} referrerPolicy="no-referrer" className="w-16 h-16 object-cover rounded-xl flex-shrink-0" />
                  <div>
                    <span className="text-[10px] text-indigo-400 font-semibold uppercase tracking-wider block">{art.category}</span>
                    <a
                      href={`/article/${art.slug}`}
                      onClick={(e) => {
                        e.preventDefault();
                        window.history.pushState({}, "", `/article/${art.slug}`);
                        window.dispatchEvent(new PopStateEvent("popstate"));
                      }}
                      className="text-sm font-bold text-white hover:text-indigo-400 line-clamp-1 transition-colors block mt-0.5"
                    >
                      {art.title}
                    </a>
                    <span className="text-[10px] text-slate-500 block mt-1">{new Date(art.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
