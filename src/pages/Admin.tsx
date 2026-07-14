/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Lock, LayoutDashboard, FileText, ShoppingBag, Settings, Plus, Trash2, CheckCircle2, AlertCircle, Copy, Check, LogOut, Code } from "lucide-react";
import { Product, Article, Category, SiteSettings } from "../types.ts";

export const Admin: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);

  // Tabs
  const [activeTab, setActiveTab] = useState<"articles" | "products" | "settings" | "api">("articles");

  // Catalog State
  const [articles, setArticles] = useState<Article[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  // Status Alerts
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Article Form State
  const [artTitle, setArtTitle] = useState("");
  const [artSlug, setArtSlug] = useState("");
  const [artCategory, setArtCategory] = useState("earbuds");
  const [artContent, setArtContent] = useState("");
  const [artMetaTitle, setArtMetaTitle] = useState("");
  const [artMetaDescription, setArtMetaDescription] = useState("");
  const [artImage, setArtImage] = useState("");
  const [artAffLink, setArtAffLink] = useState("");

  // Product Form State
  const [prodTitle, setProdTitle] = useState("");
  const [prodSlug, setProdSlug] = useState("");
  const [prodCategory, setProdCategory] = useState("earbuds");
  const [prodPrice, setProdPrice] = useState("");
  const [prodRating, setProdRating] = useState(4.5);
  const [prodImage, setProdImage] = useState("");
  const [prodAffLink, setProdAffLink] = useState("");
  const [prodPros, setProdPros] = useState("");
  const [prodCons, setProdCons] = useState("");
  const [prodSpecs, setProdSpecs] = useState("Driver Size: 10mm\nNoise Cancellation: Yes\nBattery Life: 30 hours\nWaterproof: IPX5");
  const [prodBuyingAdvice, setProdBuyingAdvice] = useState("");
  const [prodContent, setProdContent] = useState("");
  const [prodFeatured, setProdFeatured] = useState(false);

  // Site Settings Form State
  const [setSiteName, setSetSiteName] = useState("");
  const [setSiteDesc, setSetSiteDesc] = useState("");
  const [setSeoTitle, setSetSeoTitle] = useState("");
  const [setSeoDesc, setSetSeoDesc] = useState("");
  const [setDisclosure, setSetDisclosure] = useState("");
  const [setEmail, setSetEmail] = useState("");

  // Copy state for API tokens
  const [copiedToken, setCopiedToken] = useState(false);

  // Authenticate on start from sessionStorage
  useEffect(() => {
    const token = sessionStorage.getItem("admin_token");
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    
    async function loadData() {
      try {
        const [artRes, prodRes, catRes, setRes] = await Promise.all([
          fetch("/api/articles"),
          fetch("/api/products"),
          fetch("/api/categories"),
          fetch("/api/settings")
        ]);

        if (artRes.ok) setArticles(await artRes.json());
        if (prodRes.ok) setProducts(await prodRes.json());
        if (catRes.ok) setCategories(await catRes.json());
        if (setRes.ok) {
          const s = await setRes.json();
          setSettings(s);
          setSetSiteName(s.siteName);
          setSetSiteDesc(s.siteDescription);
          setSetSeoTitle(s.seoTitle);
          setSetSeoDesc(s.seoDescription);
          setSetDisclosure(s.affiliateDisclosure);
          setSetEmail(s.contactEmail);
        }
      } catch (err) {
        console.error("Error loading administrative lists:", err);
      }
    }
    loadData();
  }, [isAuthenticated]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        sessionStorage.setItem("admin_token", data.token);
        setIsAuthenticated(true);
      } else {
        setLoginError(data.error || "Login unauthorized");
      }
    } catch {
      setLoginError("Failed to authenticate.");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("admin_token");
    setIsAuthenticated(false);
  };

  const showStatus = (type: "success" | "error", text: string) => {
    setStatusMsg({ type, text });
    setTimeout(() => setStatusMsg(null), 5000);
  };

  // Publish Article
  const handleArticlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!artTitle || !artSlug || !artContent) {
      showStatus("error", "Title, slug, and core markdown content are required.");
      return;
    }

    try {
      const res = await fetch("/api/publish", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${sessionStorage.getItem("admin_token")}`
        },
        body: JSON.stringify({
          title: artTitle,
          slug: artSlug,
          category: artCategory,
          content: artContent,
          metaTitle: artMetaTitle,
          metaDescription: artMetaDescription,
          image: artImage,
          affiliateLink: artAffLink,
          faq: [
            { question: `Who is the ${artTitle} best for?`, answer: "It is best suited for tech-conscious budget buyers." }
          ],
          schema: {
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": artTitle,
            "image": artImage || "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=600",
            "author": { "@type": "Person", "name": "SmartBuy AI Staff" }
          }
        })
      });

      if (res.ok) {
        showStatus("success", "Article guide published cleanly!");
        // reset form
        setArtTitle("");
        setArtSlug("");
        setArtContent("");
        setArtMetaTitle("");
        setArtMetaDescription("");
        setArtImage("");
        setArtAffLink("");
        
        // reload articles
        const artRes = await fetch("/api/articles");
        if (artRes.ok) setArticles(await artRes.json());
      } else {
        const err = await res.json();
        showStatus("error", err.error || "Failed to publish article.");
      }
    } catch {
      showStatus("error", "Server network error.");
    }
  };

  // Publish Product
  const handleProductPublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodTitle || !prodSlug || !prodPrice) {
      showStatus("error", "Product Title, Slug, and Price are required.");
      return;
    }

    // Parse specs string into key-value object
    const parsedSpecs: Record<string, string> = {};
    prodSpecs.split("\n").forEach(line => {
      const parts = line.split(":");
      if (parts.length >= 2) {
        parsedSpecs[parts[0].trim()] = parts.slice(1).join(":").trim();
      }
    });

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${sessionStorage.getItem("admin_token")}`
        },
        body: JSON.stringify({
          title: prodTitle,
          slug: prodSlug,
          category: prodCategory,
          price: prodPrice,
          rating: Number(prodRating) || 4.5,
          image: prodImage,
          affiliateLink: prodAffLink,
          pros: prodPros.split(",").map(p => p.trim()).filter(Boolean),
          cons: prodCons.split(",").map(p => p.trim()).filter(Boolean),
          specs: parsedSpecs,
          buyingAdvice: prodBuyingAdvice,
          content: prodContent,
          featured: prodFeatured,
          faq: [
            { question: `Is ${prodTitle} durable?`, answer: "Yes, our tests verified that specifications conform to expected lifecycles." }
          ]
        })
      });

      if (res.ok) {
        showStatus("success", "Product review published to index!");
        // Reset form
        setProdTitle("");
        setProdSlug("");
        setProdPrice("");
        setProdImage("");
        setProdAffLink("");
        setProdPros("");
        setProdCons("");
        setProdBuyingAdvice("");
        setProdContent("");
        setProdFeatured(false);

        // reload products
        const prodRes = await fetch("/api/products");
        if (prodRes.ok) setProducts(await prodRes.json());
      } else {
        const err = await res.json();
        showStatus("error", err.error || "Failed to publish product.");
      }
    } catch {
      showStatus("error", "Server network error.");
    }
  };

  // Delete Article
  const handleDeleteArticle = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this article?")) return;
    try {
      const res = await fetch(`/api/articles/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${sessionStorage.getItem("admin_token")}` }
      });
      if (res.ok) {
        showStatus("success", "Article removed from index.");
        setArticles(articles.filter(a => a.id !== id));
      } else {
        showStatus("error", "Failed to delete.");
      }
    } catch {
      showStatus("error", "Server network error.");
    }
  };

  // Delete Product
  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${sessionStorage.getItem("admin_token")}` }
      });
      if (res.ok) {
        showStatus("success", "Product removed from index.");
        setProducts(products.filter(p => p.id !== id));
      } else {
        showStatus("error", "Failed to delete.");
      }
    } catch {
      showStatus("error", "Server network error.");
    }
  };

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${sessionStorage.getItem("admin_token")}`
        },
        body: JSON.stringify({
          siteName: setSiteName,
          siteDescription: setSiteDesc,
          seoTitle: setSeoTitle,
          seoDescription: setSeoDesc,
          affiliateDisclosure: setDisclosure,
          contactEmail: setEmail
        })
      });

      if (res.ok) {
        showStatus("success", "Editorial configuration parameters stored!");
      } else {
        showStatus("error", "Failed to store parameters.");
      }
    } catch {
      showStatus("error", "Server network error.");
    }
  };

  const handleCopyCode = () => {
    const adminPass = sessionStorage.getItem("admin_token") || "admin123";
    const appUrl = window.location.origin;
    const curlCommand = `curl -X POST "${appUrl}/api/publish" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${adminPass}" \\
  -d '{
    "title": "Unboxing the Best Gear under $100",
    "slug": "best-gear-under-100",
    "category": "earbuds",
    "content": "### Direct publishing test...",
    "metaTitle": "Direct Headless Publishing",
    "metaDescription": "Direct publish review via the secure API REST layer."
  }'`;
    
    navigator.clipboard.writeText(curlCommand);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 3000);
  };

  // Render Login Prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="bg-slate-900 text-slate-100 min-h-screen flex items-center justify-center px-4 py-12 font-sans">
        <div className="max-w-md w-full bg-slate-950 p-6 sm:p-8 rounded-3xl border border-slate-850 shadow-xl space-y-6">
          <div className="text-center">
            <div className="bg-indigo-600 p-3 rounded-full w-fit mx-auto text-white shadow-lg shadow-indigo-600/20 mb-4">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Admin Gate</h1>
            <p className="text-xs text-slate-400 mt-1">Provide credentials to modify the product catalog, edit settings, or view API parameters.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Security Password *</label>
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
              />
              <p className="text-[10px] text-slate-500 mt-1.5">Note: Default password is 'admin123' if not overridden in your server secrets environment variables.</p>
            </div>

            {loginError && (
              <div className="bg-rose-950/40 border border-rose-900/50 p-3 rounded-xl text-xs text-rose-400 font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-xl text-sm transition-all shadow-md"
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 text-slate-100 min-h-screen py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* Admin Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-6 mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <LayoutDashboard className="w-7 h-7 text-indigo-400" />
              <span>SmartBuy AI Administrative Suite</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">Configure active sitemaps, publish review indexes, or edit disclosure variables</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 hover:border-rose-500/30 hover:text-rose-400 text-slate-400 px-4 py-2 rounded-xl text-xs font-semibold transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Global Alert Notification */}
        {statusMsg && (
          <div className={`p-4 rounded-xl text-xs sm:text-sm mb-6 flex items-start gap-2.5 border ${
            statusMsg.type === "success"
              ? "bg-emerald-950/40 border-emerald-900/50 text-emerald-400"
              : "bg-rose-950/40 border-rose-900/50 text-rose-400"
          }`}>
            {statusMsg.type === "success" ? <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5" /> : <AlertCircle className="w-4 h-4 text-rose-400 mt-0.5" />}
            <span>{statusMsg.text}</span>
          </div>
        )}

        {/* Dash Grid tabs */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Navigation panel */}
          <div className="lg:col-span-1 space-y-2">
            <button
              onClick={() => setActiveTab("articles")}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-2.5 transition-all border ${
                activeTab === "articles" ? "bg-slate-800 border-indigo-500/20 text-white" : "bg-transparent border-transparent text-slate-400 hover:text-white"
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Publish & Edit Articles</span>
            </button>
            <button
              onClick={() => setActiveTab("products")}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-2.5 transition-all border ${
                activeTab === "products" ? "bg-slate-800 border-indigo-500/20 text-white" : "bg-transparent border-transparent text-slate-400 hover:text-white"
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Publish & Edit Products</span>
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-2.5 transition-all border ${
                activeTab === "settings" ? "bg-slate-800 border-indigo-500/20 text-white" : "bg-transparent border-transparent text-slate-400 hover:text-white"
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Editorial Site Settings</span>
            </button>
            <button
              onClick={() => setActiveTab("api")}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-2.5 transition-all border ${
                activeTab === "api" ? "bg-slate-800 border-indigo-500/20 text-white" : "bg-transparent border-transparent text-slate-400 hover:text-white"
              }`}
            >
              <Code className="w-4 h-4" />
              <span>REST API publishing</span>
            </button>
          </div>

          {/* Form Content Panel */}
          <div className="lg:col-span-3">
            
            {/* PANELS */}

            {/* TAB 1: ARTICLES */}
            {activeTab === "articles" && (
              <div className="space-y-8">
                {/* Form to publish article */}
                <div className="bg-slate-950 p-6 sm:p-8 rounded-3xl border border-slate-850 shadow-md">
                  <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <Plus className="w-5 h-5 text-indigo-400" />
                    <span>Publish New Article Guide</span>
                  </h3>
                  <form onSubmit={handleArticlePublish} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Title *</label>
                        <input
                          type="text"
                          required
                          placeholder="How to Choose a Coffee Maker"
                          value={artTitle}
                          onChange={(e) => setArtTitle(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">URL Slug *</label>
                        <input
                          type="text"
                          required
                          placeholder="how-to-choose-coffee-maker"
                          value={artSlug}
                          onChange={(e) => setArtSlug(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Category *</label>
                        <select
                          value={artCategory}
                          onChange={(e) => setArtCategory(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-300 focus:outline-none focus:border-indigo-500"
                        >
                          <option value="earbuds">Wireless Earbuds</option>
                          <option value="gaming-mice">Gaming Mice</option>
                          <option value="coffee-makers">Coffee Makers</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Image URL</label>
                        <input
                          type="text"
                          placeholder="https://images.unsplash.com/photo-..."
                          value={artImage}
                          onChange={(e) => setArtImage(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Meta SEO Title</label>
                        <input
                          type="text"
                          placeholder="Best Drip Brewers under $100: Comprehensive Analysis"
                          value={artMetaTitle}
                          onChange={(e) => setArtMetaTitle(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Meta SEO Description</label>
                        <input
                          type="text"
                          placeholder="Detailed buyer instructions verifying thermal extraction properties..."
                          value={artMetaDescription}
                          onChange={(e) => setArtMetaDescription(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Affiliate hyperlink (Optional)</label>
                      <input
                        type="text"
                        placeholder="https://amazon.com/dp/..."
                        value={artAffLink}
                        onChange={(e) => setArtAffLink(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Article Content (Markdown) *</label>
                      <textarea
                        rows={8}
                        required
                        placeholder="Write dynamic reviews with headings, lists, and comparisons..."
                        value={artContent}
                        onChange={(e) => setArtContent(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 resize-none font-mono"
                      ></textarea>
                    </div>

                    <button
                      type="submit"
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-6 rounded-xl text-xs sm:text-sm tracking-wider transition-all shadow-md"
                    >
                      Publish Article
                    </button>
                  </form>
                </div>

                {/* Manage current articles */}
                <div className="bg-slate-950 p-6 sm:p-8 rounded-3xl border border-slate-850 shadow-md">
                  <h3 className="text-lg font-bold text-white mb-4">Active Article Index</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs sm:text-sm">
                      <thead>
                        <tr className="border-b border-slate-900 text-slate-400 font-mono">
                          <th className="py-2.5 px-4">Title</th>
                          <th className="py-2.5 px-4">Category</th>
                          <th className="py-2.5 px-4">Slug</th>
                          <th className="py-2.5 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-900 text-slate-300">
                        {articles.map((art) => (
                          <tr key={art.id} className="hover:bg-slate-900/50">
                            <td className="py-3 px-4 font-semibold max-w-xs truncate">{art.title}</td>
                            <td className="py-3 px-4 capitalize">{art.category}</td>
                            <td className="py-3 px-4 font-mono text-slate-500">{art.slug}</td>
                            <td className="py-3 px-4 text-right">
                              <button
                                onClick={() => handleDeleteArticle(art.id)}
                                className="text-rose-500 hover:text-rose-400 p-1 rounded hover:bg-rose-500/10 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}

            {/* TAB 2: PRODUCTS */}
            {activeTab === "products" && (
              <div className="space-y-8">
                {/* Form to publish product */}
                <div className="bg-slate-950 p-6 sm:p-8 rounded-3xl border border-slate-850 shadow-md">
                  <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <Plus className="w-5 h-5 text-indigo-400" />
                    <span>Publish New Product Review</span>
                  </h3>
                  <form onSubmit={handleProductPublish} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Title *</label>
                        <input
                          type="text"
                          required
                          placeholder="SteelSeries Rival 3"
                          value={prodTitle}
                          onChange={(e) => setProdTitle(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Slug *</label>
                        <input
                          type="text"
                          required
                          placeholder="steelseries-rival-3-review"
                          value={prodSlug}
                          onChange={(e) => setProdSlug(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Category *</label>
                        <select
                          value={prodCategory}
                          onChange={(e) => setProdCategory(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-300 focus:outline-none focus:border-indigo-500"
                        >
                          <option value="earbuds">Wireless Earbuds</option>
                          <option value="gaming-mice">Gaming Mice</option>
                          <option value="coffee-makers">Coffee Makers</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Price *</label>
                        <input
                          type="text"
                          required
                          placeholder="$29.99"
                          value={prodPrice}
                          onChange={(e) => setProdPrice(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Rating *</label>
                        <input
                          type="number"
                          step="0.1"
                          min="1"
                          max="5"
                          required
                          value={prodRating}
                          onChange={(e) => setProdRating(Number(e.target.value))}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Image URL</label>
                        <input
                          type="text"
                          placeholder="https://images.unsplash.com/photo-..."
                          value={prodImage}
                          onChange={(e) => setProdImage(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Affiliate Link</label>
                        <input
                          type="text"
                          placeholder="https://amazon.com/dp/..."
                          value={prodAffLink}
                          onChange={(e) => setProdAffLink(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Pros (Comma separated)</label>
                        <input
                          type="text"
                          placeholder="Super light, Mechanical switches, Cheap"
                          value={prodPros}
                          onChange={(e) => setProdPros(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Cons (Comma separated)</label>
                        <input
                          type="text"
                          placeholder="Green LED only, Small side buttons"
                          value={prodCons}
                          onChange={(e) => setProdCons(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Specs (key: value list, one per line)</label>
                        <textarea
                          rows={4}
                          placeholder="Weight: 96g&#10;Sensor: Optical"
                          value={prodSpecs}
                          onChange={(e) => setProdSpecs(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono resize-none"
                        ></textarea>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">AI Buying Advice summary *</label>
                        <textarea
                          rows={4}
                          required
                          placeholder="Perfect budget option for claw grips and casual gaming."
                          value={prodBuyingAdvice}
                          onChange={(e) => setProdBuyingAdvice(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs sm:text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 resize-none"
                        ></textarea>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                      <input
                        type="checkbox"
                        id="featured"
                        checked={prodFeatured}
                        onChange={(e) => setProdFeatured(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-800 text-indigo-600 focus:ring-indigo-500"
                      />
                      <label htmlFor="featured" className="text-xs font-bold text-slate-300 uppercase tracking-wide cursor-pointer">Feature on homepage grid</label>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Product Review (Markdown) *</label>
                      <textarea
                        rows={6}
                        required
                        placeholder="### Expert Review Analysis..."
                        value={prodContent}
                        onChange={(e) => setProdContent(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 resize-none font-mono"
                      ></textarea>
                    </div>

                    <button
                      type="submit"
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-6 rounded-xl text-xs sm:text-sm tracking-wider transition-all shadow-md"
                    >
                      Publish Product
                    </button>
                  </form>
                </div>

                {/* Manage Products */}
                <div className="bg-slate-950 p-6 sm:p-8 rounded-3xl border border-slate-850 shadow-md">
                  <h3 className="text-lg font-bold text-white mb-4 font-sans">Active Product Index</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs sm:text-sm">
                      <thead>
                        <tr className="border-b border-slate-900 text-slate-400 font-mono">
                          <th className="py-2.5 px-4">Title</th>
                          <th className="py-2.5 px-4">Category</th>
                          <th className="py-2.5 px-4">Price</th>
                          <th className="py-2.5 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-900 text-slate-300">
                        {products.map((prod) => (
                          <tr key={prod.id} className="hover:bg-slate-900/50">
                            <td className="py-3 px-4 font-semibold max-w-xs truncate">{prod.title}</td>
                            <td className="py-3 px-4 capitalize">{prod.category}</td>
                            <td className="py-3 px-4 font-mono">{prod.price}</td>
                            <td className="py-3 px-4 text-right">
                              <button
                                onClick={() => handleDeleteProduct(prod.id)}
                                className="text-rose-500 hover:text-rose-400 p-1 rounded hover:bg-rose-500/10 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}

            {/* TAB 3: SETTINGS */}
            {activeTab === "settings" && (
              <div className="bg-slate-950 p-6 sm:p-8 rounded-3xl border border-slate-850 shadow-md">
                <h3 className="text-lg font-bold text-white mb-6">Editorial Site Settings</h3>
                <form onSubmit={handleSaveSettings} className="space-y-4 text-sm">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Site Title Brand</label>
                      <input
                        type="text"
                        required
                        value={setSiteName}
                        onChange={(e) => setSetSiteName(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Contact Email Address</label>
                      <input
                        type="email"
                        required
                        value={setEmail}
                        onChange={(e) => setSetEmail(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">General Site Description</label>
                    <input
                      type="text"
                      required
                      value={setSiteDesc}
                      onChange={(e) => setSetSiteDesc(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">SEO Default Meta Title</label>
                      <input
                        type="text"
                        required
                        value={setSeoTitle}
                        onChange={(e) => setSetSeoTitle(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">SEO Default Meta Description</label>
                      <input
                        type="text"
                        required
                        value={setSeoDesc}
                        onChange={(e) => setSetSeoDesc(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">FTC Affiliate Commission Disclosure Notice</label>
                    <textarea
                      rows={5}
                      required
                      value={setDisclosure}
                      onChange={(e) => setSetDisclosure(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-indigo-500 resize-none leading-relaxed"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-6 rounded-xl text-xs sm:text-sm tracking-wider transition-all shadow-md"
                  >
                    Save Site Configuration
                  </button>
                </form>
              </div>
            )}

            {/* TAB 4: API DOCS */}
            {activeTab === "api" && (
              <div className="bg-slate-950 p-6 sm:p-8 rounded-3xl border border-slate-850 shadow-md space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">Secure REST API publishing</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    SmartBuy AI features an integrated headless ingestion layer to receive bulk articles from automation tools, headless CMS pipelines, or editorial scripts.
                  </p>
                </div>

                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-900/30 px-2 py-0.5 rounded">POST</span>
                    <span className="text-xs font-mono text-slate-400">/api/publish</span>
                  </div>
                  <p className="text-xs text-slate-300">Submit article payloads dynamically. Uses Bearer Authentication matching your administrative password.</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wide">
                    <span>Example Integration payload (curl)</span>
                    <button
                      onClick={handleCopyCode}
                      className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 focus:outline-none"
                    >
                      {copiedToken ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedToken ? "Copied!" : "Copy Command"}</span>
                    </button>
                  </div>
                  <pre className="bg-slate-900 p-4 rounded-xl text-xs text-indigo-300 font-mono overflow-x-auto whitespace-pre leading-relaxed border border-slate-800">
{`curl -X POST "${window.location.origin}/api/publish" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${sessionStorage.getItem("admin_token") || "admin123"}" \\
  -d '{
    "title": "Unboxing the Best Gear under $100",
    "slug": "best-gear-under-100",
    "category": "earbuds",
    "content": "### Direct publishing test...",
    "metaTitle": "Direct Headless Publishing",
    "metaDescription": "Direct publish review via the secure API REST layer."
  }'`}
                  </pre>
                </div>

                <div className="pt-4 border-t border-slate-900 flex flex-col sm:flex-row gap-4 justify-between items-center text-xs text-slate-500">
                  <span>XML Sitemap URL: <a href="/sitemap.xml" target="_blank" className="text-indigo-400 hover:underline">/sitemap.xml</a></span>
                  <span>Robots Config URL: <a href="/robots.txt" target="_blank" className="text-indigo-400 hover:underline">/robots.txt</a></span>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};
