/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Lock, LayoutDashboard, FileText, ShoppingBag, Settings, Plus, Trash2, CheckCircle2, AlertCircle, Copy, Check, LogOut, Code, Wand2, Download, Database, Edit3, Clock, Sparkles, ExternalLink } from "lucide-react";
import { Product, Article, Category, SiteSettings } from "../types.ts";

export const Admin: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetSuccessMsg, setResetSuccessMsg] = useState<string | null>(null);

  // Tabs
  const [activeTab, setActiveTab] = useState<"articles" | "products" | "settings" | "api" | "generate" | "import" | "supabase">("articles");

  // Catalog State
  const [articles, setArticles] = useState<Article[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  // Status Alerts
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Today's Product Generator State
  const [generationState, setGenerationState] = useState<"idle" | "researching" | "writing" | "publishing" | "completed">("idle");
  const [generatedOutput, setGeneratedOutput] = useState<{
    product: Product;
    article: Article;
    supabaseSaved: boolean;
    brief?: {
      deepResearch: string;
      targetAudience: string;
      buyingIntent: string;
      contentOutline: string[];
    };
  } | null>(null);

  // Manual Product Generator Form State
  const [manualProductName, setManualProductName] = useState("");
  const [manualAffiliateLink, setManualAffiliateLink] = useState("");
  const [manualCategory, setManualCategory] = useState("auto");

  // Supabase Connectivity Check State
  const [supabaseStatus, setSupabaseStatus] = useState<{
    checked: boolean;
    configured: boolean;
    connected: boolean;
    tablesExist: boolean;
    message: string;
    url?: string;
    error?: string;
  } | null>(null);
  const [checkingSupabase, setCheckingSupabase] = useState(false);

  // Article Form State
  const [artTitle, setArtTitle] = useState("");
  const [artSlug, setArtSlug] = useState("");
  const [artCategory, setArtCategory] = useState("earbuds");
  const [artContent, setArtContent] = useState("");
  const [artMetaTitle, setArtMetaTitle] = useState("");
  const [artMetaDescription, setArtMetaDescription] = useState("");
  const [artImage, setArtImage] = useState("");
  const [artAffLink, setArtAffLink] = useState("");
  const [artStatus, setArtStatus] = useState<"published" | "draft" | "scheduled">("published");
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);

  // AI Content Generator State
  const [genKeyword, setGenKeyword] = useState("");
  const [genCategory, setGenCategory] = useState("earbuds");
  const [isGenerating, setIsGenerating] = useState(false);
  const [genResult, setGenResult] = useState<any | null>(null);

  // Bulk Product Import State
  const [bulkJson, setBulkJson] = useState("");
  const [isImporting, setIsImporting] = useState(false);

  // Supabase copy state
  const [copiedSql, setCopiedSql] = useState(false);

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
  const [setAdminPass, setSetAdminPass] = useState("");

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
          fetch("/api/articles?all=true"),
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
          setSetAdminPass(s.adminPassword || "");
        }
      } catch (err) {
        console.error("Error loading administrative lists:", err);
      }
    }
    loadData();
    checkSupabaseConnectivity();
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

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setResetSuccessMsg(null);

    if (newPassword.trim().length < 4) {
      setLoginError("Password must be at least 4 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setLoginError("Passwords do not match.");
      return;
    }

    try {
      const res = await fetch("/api/admin/reset-password", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...(sessionStorage.getItem("admin_token") ? { "Authorization": `Bearer ${sessionStorage.getItem("admin_token")}` } : {})
        },
        body: JSON.stringify({ password: newPassword })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setResetSuccessMsg("Password set successfully! Logging in...");
        sessionStorage.setItem("admin_token", data.token);
        setPassword(newPassword);
        setTimeout(() => {
          setIsAuthenticated(true);
          setIsResetting(false);
          setResetSuccessMsg(null);
        }, 1500);
      } else {
        setLoginError(data.error || "Failed to update password.");
      }
    } catch {
      setLoginError("Failed to communicate with reset server.");
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

  // Publish/Edit Article
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
          status: artStatus,
          faq: [
            { question: `Who is the ${artTitle} best for?`, answer: "It is best suited for tech-conscious budget buyers." }
          ],
          schema: {
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": artTitle,
            "image": artImage || "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=600",
            "author": { "@type": "Person", "name": "AffiMind Staff" }
          }
        })
      });

      if (res.ok) {
        showStatus("success", editingArticleId ? "Article updated successfully!" : "Article guide published cleanly!");
        // reset form
        setArtTitle("");
        setArtSlug("");
        setArtContent("");
        setArtMetaTitle("");
        setArtMetaDescription("");
        setArtImage("");
        setArtAffLink("");
        setArtStatus("published");
        setEditingArticleId(null);
        
        // reload articles
        const artRes = await fetch("/api/articles?all=true");
        if (artRes.ok) setArticles(await artRes.json());
      } else {
        const err = await res.json();
        showStatus("error", err.error || "Failed to publish article.");
      }
    } catch {
      showStatus("error", "Server network error.");
    }
  };

  // Populate form to edit article
  const handleEditArticle = (art: Article) => {
    setEditingArticleId(art.id);
    setArtTitle(art.title);
    setArtSlug(art.slug);
    setArtCategory(art.category);
    setArtContent(art.content);
    setArtMetaTitle(art.metaTitle || "");
    setArtMetaDescription(art.metaDescription || "");
    setArtImage(art.image || "");
    setArtAffLink(art.affiliateLink || "");
    setArtStatus((art.status as any) || "published");
    showStatus("success", `Loaded "${art.title}" into the editor. Scroll up to make edits!`);
  };

  // Trigger AI Article Generation using backend Gemini grounding
  const handleAIGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!genKeyword) {
      showStatus("error", "Please provide a keyword or target topic.");
      return;
    }

    setIsGenerating(true);
    setGenResult(null);
    try {
      const res = await fetch("/api/ai/generate-article", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${sessionStorage.getItem("admin_token")}`
        },
        body: JSON.stringify({
          keyword: genKeyword,
          category: genCategory
        })
      });

      if (res.ok) {
        const data = await res.json();
        setGenResult(data);
        showStatus("success", "AI Article successfully compiled with Gemini!");
      } else {
        const err = await res.json();
        showStatus("error", err.error || "Generation pipeline failed.");
      }
    } catch {
      showStatus("error", "Failed to connect to the generation server.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Auto-apply generated AI results to active editor
  const applyAIGeneratedToEditor = () => {
    if (!genResult) return;
    setArtTitle(genResult.title || "");
    setArtSlug(genResult.slug || "");
    setArtCategory(genCategory);
    setArtContent(genResult.content || "");
    setArtMetaTitle(genResult.metaTitle || "");
    setArtMetaDescription(genResult.metaDescription || "");
    setArtImage("https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=600");
    setArtAffLink("");
    setArtStatus("draft");
    setEditingArticleId(null);
    setActiveTab("articles");
    showStatus("success", "Transferred AI draft into editor. Refine or publish below!");
  };

  // Execute Bulk Product Import
  const handleBulkImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkJson.trim()) {
      showStatus("error", "JSON catalog payload is empty.");
      return;
    }

    setIsImporting(true);
    try {
      let parsed;
      try {
        parsed = JSON.parse(bulkJson);
      } catch {
        showStatus("error", "Invalid JSON syntax. Ensure double quotes and brackets are matching.");
        setIsImporting(false);
        return;
      }

      const productsArray = Array.isArray(parsed) ? parsed : (parsed.products || [parsed]);

      const res = await fetch("/api/products/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${sessionStorage.getItem("admin_token")}`
        },
        body: JSON.stringify({ products: productsArray })
      });

      if (res.ok) {
        const data = await res.json();
        showStatus("success", `Successfully imported/updated ${data.count} products!`);
        setBulkJson("");
        // Reload products list
        const prodRes = await fetch("/api/products");
        if (prodRes.ok) setProducts(await prodRes.json());
      } else {
        const err = await res.json();
        showStatus("error", err.error || "Bulk import rejected.");
      }
    } catch {
      showStatus("error", "Import network communication error.");
    } finally {
      setIsImporting(false);
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

  // Check Supabase Connectivity
  const checkSupabaseConnectivity = async () => {
    setCheckingSupabase(true);
    try {
      const res = await fetch("/api/admin/supabase-status");
      if (res.ok) {
        const data = await res.json();
        setSupabaseStatus({ checked: true, ...data });
      } else {
        setSupabaseStatus({
          checked: true,
          configured: false,
          connected: false,
          tablesExist: false,
          message: "Could not contact the backend status endpoint."
        });
      }
    } catch (err: any) {
      setSupabaseStatus({
        checked: true,
        configured: false,
        connected: false,
        tablesExist: false,
        message: err.message || "Failed to query server."
      });
    } finally {
      setCheckingSupabase(false);
    }
  };

  // Generate Manual Product
  const handleGenerateTodayProduct = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!manualProductName.trim()) {
      showStatus("error", "Product Name is required.");
      return;
    }
    if (!manualAffiliateLink.trim()) {
      showStatus("error", "Affiliate Link is required.");
      return;
    }

    setGenerationState("researching");
    setGeneratedOutput(null);

    // Sequence timing simulations for progress visibility (Researching -> Writing -> Publishing -> Completed)
    const timingSequence = [
      { state: "writing" as const, delay: 2500 },
      { state: "publishing" as const, delay: 6000 }
    ];

    const timers = timingSequence.map(t => 
      setTimeout(() => {
        setGenerationState(prev => {
          if (prev !== "completed" && prev !== "idle") {
            return t.state;
          }
          return prev;
        });
      }, t.delay)
    );

    try {
      const res = await fetch("/api/admin/generate-today-product", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${sessionStorage.getItem("admin_token")}`
        },
        body: JSON.stringify({
          productName: manualProductName,
          affiliateLink: manualAffiliateLink,
          category: manualCategory
        })
      });

      // Clear standard sequence timers so final actual state sets cleanly
      timers.forEach(clearTimeout);

      if (res.ok) {
        const data = await res.json();
        setGenerationState("completed");
        setGeneratedOutput(data);
        showStatus("success", `✨ Product review and buying guide for "${manualProductName}" generated and published successfully!`);

        // Clear input form fields
        setManualProductName("");
        setManualAffiliateLink("");
        setManualCategory("auto");

        // Trigger reactive hot reloads of sitemaps/product arrays inside Admin view
        const [artRes, prodRes] = await Promise.all([
          fetch("/api/articles?all=true"),
          fetch("/api/products")
        ]);
        if (artRes.ok) setArticles(await artRes.json());
        if (prodRes.ok) setProducts(await prodRes.json());
      } else {
        const errData = await res.json();
        setGenerationState("idle");
        showStatus("error", errData.error || "Failed to generate product review.");
      }
    } catch (err) {
      timers.forEach(clearTimeout);
      setGenerationState("idle");
      showStatus("error", "Server response timeout or generation pipeline failure.");
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
          contactEmail: setEmail,
          adminPassword: setAdminPass
        })
      });

      if (res.ok) {
        if (setAdminPass) {
          sessionStorage.setItem("admin_token", setAdminPass);
        }
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
            <h1 className="text-2xl font-bold text-white tracking-tight">
              {isResetting ? "Set New Admin Password" : "Admin Gate"}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              {isResetting 
                ? "Define a new security password to gain control of your administrator workspace." 
                : "Provide credentials to modify the product catalog, edit settings, or view API parameters."}
            </p>
          </div>

          {isResetting ? (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">New Security Password *</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Confirm New Password *</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {loginError && (
                <div className="bg-rose-950/40 border border-rose-900/50 p-3 rounded-xl text-xs text-rose-400 font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              {resetSuccessMsg && (
                <div className="bg-emerald-950/40 border border-emerald-900/50 p-3 rounded-xl text-xs text-emerald-400 font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>{resetSuccessMsg}</span>
                </div>
              )}

              <div className="space-y-2 pt-2">
                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-xl text-sm transition-all shadow-md cursor-pointer"
                >
                  Save New Password & Log In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsResetting(false);
                    setLoginError(null);
                  }}
                  className="w-full bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 font-bold py-2 px-4 rounded-xl text-xs transition-all cursor-pointer"
                >
                  Back to Sign In
                </button>
              </div>
            </form>
          ) : (
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

              <div className="space-y-3">
                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-xl text-sm transition-all shadow-md cursor-pointer"
                >
                  Sign In
                </button>
                
                <div className="text-center pt-2 border-t border-slate-900">
                  <button
                    type="button"
                    onClick={() => {
                      setIsResetting(true);
                      setLoginError(null);
                      setNewPassword("");
                      setConfirmPassword("");
                    }}
                    className="text-indigo-400 hover:text-indigo-300 text-xs font-semibold focus:outline-none cursor-pointer"
                  >
                    Forgot or need to set a new password?
                  </button>
                </div>
              </div>
            </form>
          )}
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
              <span>AffiMind Administrative Suite</span>
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

        {/* ✨ Generate Today's Product Action Card (Manual Input Form) */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 mb-8 shadow-2xl relative overflow-hidden backdrop-blur-sm">
          <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
            <Sparkles className="w-48 h-48 text-indigo-400" />
          </div>
          <div className="space-y-6 relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest">AI Editorial Guide Generator</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">Manual Product Review & Buying Guide Generator</h2>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-3xl">
                  Provide a product name and affiliate link. Gemini will automatically research the product, write a professional buying guide, optimize SEO, compile FAQs, generate rich JSON-LD Schema markup, and insert natural internal links before publishing immediately.
                </p>
              </div>

              {/* Supabase Connection Status bar */}
              <div className="flex items-center self-start sm:self-center gap-2 bg-slate-950/80 px-4 py-2 rounded-2xl border border-slate-850">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Supabase Sync:</span>
                {checkingSupabase ? (
                  <span className="text-[11px] text-indigo-400 animate-pulse flex items-center gap-1.5 font-semibold">
                    <span className="w-2 h-2 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></span>
                    Verifying...
                  </span>
                ) : supabaseStatus?.checked ? (
                  supabaseStatus.connected && supabaseStatus.tablesExist ? (
                    <span className="text-[11px] text-emerald-400 font-extrabold flex items-center gap-1.5" title="Auto-Sync and tables verified.">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      Active
                    </span>
                  ) : supabaseStatus.configured ? (
                    <span className="text-[11px] text-amber-400 font-extrabold flex items-center gap-1.5" title="Configure your tables inside the SQL tab.">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                      No Tables
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-400 font-extrabold flex items-center gap-1.5" title="Operating in Local JSON Mode.">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                      Local Only
                    </span>
                  )
                ) : (
                  <button
                    onClick={checkSupabaseConnectivity}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 hover:underline font-extrabold cursor-pointer"
                  >
                    Verify
                  </button>
                )}
              </div>
            </div>

            {/* Manual Generation Form */}
            <form onSubmit={handleGenerateTodayProduct} className="space-y-4 pt-2 border-t border-slate-850/60">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider">Product Name</label>
                  <input
                    type="text"
                    required
                    value={manualProductName}
                    onChange={(e) => setManualProductName(e.target.value)}
                    placeholder="e.g. Sony WH-1000XM5 Wireless Headphones"
                    disabled={generationState !== "idle"}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500/50 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition-all disabled:opacity-50"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider">Affiliate Link</label>
                  <input
                    type="url"
                    required
                    value={manualAffiliateLink}
                    onChange={(e) => setManualAffiliateLink(e.target.value)}
                    placeholder="e.g. https://amazon.com/dp/B09XXXX"
                    disabled={generationState !== "idle"}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500/50 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition-all disabled:opacity-50"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider">Category</label>
                  <select
                    value={manualCategory}
                    onChange={(e) => setManualCategory(e.target.value)}
                    disabled={generationState !== "idle"}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500/50 rounded-xl px-4 py-3 text-sm text-white outline-none transition-all disabled:opacity-50"
                  >
                    <option value="auto">✨ Auto-Detect Category with AI</option>
                    <option value="earbuds">Wireless Earbuds (earbuds)</option>
                    <option value="gaming-mice">Gaming Mice (gaming-mice)</option>
                    <option value="coffee-makers">Coffee Makers (coffee-makers)</option>
                  </select>
                </div>
              </div>

              {/* Action and Progress Area */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-3">
                <button
                  type="submit"
                  disabled={generationState !== "idle"}
                  className={`px-6 py-3.5 rounded-2xl text-sm font-black flex items-center justify-center gap-2.5 transition-all shadow-lg select-none ${
                    generationState === "idle"
                      ? "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:opacity-90 active:scale-[0.98] text-white shadow-indigo-500/10 cursor-pointer"
                      : "bg-slate-800 text-slate-500 border border-slate-750 cursor-not-allowed"
                  }`}
                >
                  {generationState === "idle" ? (
                    <>
                      <Sparkles className="w-4 h-4 text-white animate-pulse" />
                      <span>Generate and Publish Immediately</span>
                    </>
                  ) : (
                    <>
                      <div className="w-4 h-4 border-2 border-slate-500 border-t-transparent rounded-full animate-spin" />
                      <span>Generating Review...</span>
                    </>
                  )}
                </button>

                {/* Progress Tracker UI */}
                {generationState !== "idle" && (
                  <div className="flex items-center gap-2 text-xs font-semibold select-none overflow-x-auto py-1">
                    <span className={generationState === "researching" ? "text-indigo-400 font-extrabold animate-pulse bg-indigo-950/40 px-2.5 py-1 rounded-lg border border-indigo-900/30" : "text-slate-500"}>
                      Researching...
                    </span>
                    <span className="text-slate-700">→</span>
                    <span className={generationState === "writing" ? "text-purple-400 font-extrabold animate-pulse bg-purple-950/40 px-2.5 py-1 rounded-lg border border-purple-900/30" : "text-slate-500"}>
                      Writing...
                    </span>
                    <span className="text-slate-700">→</span>
                    <span className={generationState === "publishing" ? "text-pink-400 font-extrabold animate-pulse bg-pink-950/40 px-2.5 py-1 rounded-lg border border-pink-900/30" : "text-slate-500"}>
                      Publishing...
                    </span>
                    <span className="text-slate-700">→</span>
                    <span className={generationState === "completed" ? "text-emerald-400 font-extrabold bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-900/30" : "text-slate-500"}>
                      Completed.
                    </span>
                  </div>
                )}
              </div>
            </form>

            {/* Generated Output Showcase Card */}
            {generatedOutput && (
              <div className="bg-slate-950 border border-slate-850 rounded-2xl p-4 sm:p-5 mt-4 space-y-4 transition-all animate-fade-in shadow-inner">
                <div className="flex items-center justify-between border-b border-slate-900 pb-2.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Successfully Published Article & Product Review</span>
                  <span className="text-xs text-emerald-400 font-bold bg-emerald-950/50 px-2.5 py-0.5 rounded-full border border-emerald-900/30">Live Immediately</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Product Title</span>
                    <span className="text-sm text-white font-medium block">{generatedOutput.product.title}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Live Article URL Slug</span>
                    <span className="text-sm text-indigo-300 font-mono block">/articles/{generatedOutput.article.slug}</span>
                  </div>
                </div>

                {/* Strategic Research & Planning Report Showcase */}
                {generatedOutput.brief && (
                  <div className="pt-4 border-t border-slate-900 space-y-3 text-left">
                    <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider block">📊 Pre-Generation AI Strategic Research & Planning Report</span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div className="bg-slate-900/40 p-3.5 rounded-xl border border-slate-850/60 space-y-1">
                        <span className="text-[9px] font-black text-indigo-300 uppercase block tracking-wider">1. Deep Product Research Notes</span>
                        <p className="text-slate-350 leading-relaxed whitespace-pre-wrap">{generatedOutput.brief.deepResearch}</p>
                      </div>
                      <div className="bg-slate-900/40 p-3.5 rounded-xl border border-slate-850/60 space-y-1">
                        <span className="text-[9px] font-black text-purple-300 uppercase block tracking-wider">2. Target Audience Profile</span>
                        <p className="text-slate-350 leading-relaxed whitespace-pre-wrap">{generatedOutput.brief.targetAudience}</p>
                      </div>
                      <div className="bg-slate-900/40 p-3.5 rounded-xl border border-slate-850/60 space-y-1">
                        <span className="text-[9px] font-black text-pink-300 uppercase block tracking-wider">3. Commercial Buying Intent Analysis</span>
                        <p className="text-slate-350 leading-relaxed whitespace-pre-wrap">{generatedOutput.brief.buyingIntent}</p>
                      </div>
                      <div className="bg-slate-900/40 p-3.5 rounded-xl border border-slate-850/60 space-y-1">
                        <span className="text-[9px] font-black text-emerald-300 uppercase block tracking-wider">4. Editorial Heading Outline Roadmap</span>
                        <ul className="list-disc list-inside space-y-1 text-slate-350">
                          {generatedOutput.brief.contentOutline.map((item, idx) => (
                            <li key={idx} className="leading-relaxed">{item}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                <div className="pt-2.5 border-t border-slate-900 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <a
                    href={`/articles/${generatedOutput.article.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 transition-colors"
                  >
                    <span>View Published Article</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <span className="text-slate-500">
                    Supabase synced: <span className={generatedOutput.supabaseSaved ? "text-emerald-400 font-bold" : "text-slate-500"}>{generatedOutput.supabaseSaved ? "Yes" : "Skipped/Local"}</span>
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

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
              onClick={() => setActiveTab("generate")}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-2.5 transition-all border ${
                activeTab === "generate" ? "bg-slate-800 border-indigo-500/20 text-white" : "bg-transparent border-transparent text-slate-400 hover:text-white"
              }`}
            >
              <Wand2 className="w-4 h-4 text-pink-400" />
              <span>AI Article Generator</span>
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
              onClick={() => setActiveTab("import")}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-2.5 transition-all border ${
                activeTab === "import" ? "bg-slate-800 border-indigo-500/20 text-white" : "bg-transparent border-transparent text-slate-400 hover:text-white"
              }`}
            >
              <Download className="w-4 h-4 text-cyan-400" />
              <span>Bulk Product Import</span>
            </button>
            <button
              onClick={() => setActiveTab("supabase")}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-2.5 transition-all border ${
                activeTab === "supabase" ? "bg-slate-800 border-indigo-500/20 text-white" : "bg-transparent border-transparent text-slate-400 hover:text-white"
              }`}
            >
              <Database className="w-4 h-4 text-emerald-400" />
              <span>Supabase Schema SQL</span>
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
                    {editingArticleId ? <Edit3 className="w-5 h-5 text-indigo-400" /> : <Plus className="w-5 h-5 text-indigo-400" />}
                    <span>{editingArticleId ? `Edit Article: "${artTitle}"` : "Publish New Article Guide"}</span>
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

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Publish Status (Publish Queue) *</label>
                        <select
                          value={artStatus}
                          onChange={(e) => setArtStatus(e.target.value as any)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-300 focus:outline-none focus:border-indigo-500"
                        >
                          <option value="published">Published (Live on site)</option>
                          <option value="draft">Draft (Saved internally only)</option>
                          <option value="scheduled">Scheduled (Planned release)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Article Content (Markdown) *</label>
                      <textarea
                        rows={8}
                        required
                        placeholder="Write reviews with headings, bold text, comparison bullet points, and related advice..."
                        value={artContent}
                        onChange={(e) => setArtContent(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 resize-none font-mono"
                      ></textarea>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="submit"
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-6 rounded-xl text-xs sm:text-sm tracking-wider transition-all shadow-md cursor-pointer"
                      >
                        {editingArticleId ? "Save Configuration Updates" : "Publish Article Guide"}
                      </button>
                      {editingArticleId && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingArticleId(null);
                            setArtTitle("");
                            setArtSlug("");
                            setArtContent("");
                            setArtMetaTitle("");
                            setArtMetaDescription("");
                            setArtImage("");
                            setArtAffLink("");
                            setArtStatus("published");
                          }}
                          className="bg-slate-850 hover:bg-slate-800 text-slate-300 font-bold py-2.5 px-4 rounded-xl text-xs cursor-pointer"
                        >
                          Cancel Edit
                        </button>
                      )}
                    </div>
                  </form>
                </div>

                {/* Manage current articles */}
                <div className="bg-slate-950 p-6 sm:p-8 rounded-3xl border border-slate-850 shadow-md">
                  <h3 className="text-lg font-bold text-white mb-4">Active Article Index & Queue</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs sm:text-sm">
                      <thead>
                        <tr className="border-b border-slate-900 text-slate-400 font-mono">
                          <th className="py-2.5 px-4">Title</th>
                          <th className="py-2.5 px-4">Category</th>
                          <th className="py-2.5 px-4">Status</th>
                          <th className="py-2.5 px-4">Created</th>
                          <th className="py-2.5 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-900 text-slate-300">
                        {articles.map((art) => (
                          <tr key={art.id} className="hover:bg-slate-900/50">
                            <td className="py-3 px-4 font-semibold max-w-xs truncate">{art.title}</td>
                            <td className="py-3 px-4 capitalize">{art.category}</td>
                            <td className="py-3 px-4">
                              <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                art.status === "draft"
                                  ? "bg-amber-950/40 border border-amber-900/30 text-amber-400"
                                  : art.status === "scheduled"
                                  ? "bg-sky-950/40 border border-sky-900/30 text-sky-400"
                                  : "bg-emerald-950/40 border border-emerald-900/30 text-emerald-400"
                              }`}>
                                {art.status === "draft" ? "Draft" : art.status === "scheduled" ? "Scheduled" : "Published"}
                              </span>
                            </td>
                            <td className="py-3 px-4 font-mono text-[11px] text-slate-500">{new Date(art.createdAt || Date.now()).toLocaleDateString()}</td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleEditArticle(art)}
                                  className="text-indigo-400 hover:text-indigo-300 p-1.5 rounded hover:bg-indigo-500/10 transition-colors"
                                  title="Edit Article"
                                >
                                  <Edit3 className="w-4.5 h-4.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteArticle(art.id)}
                                  className="text-rose-500 hover:text-rose-400 p-1.5 rounded hover:bg-rose-500/10 transition-colors"
                                  title="Delete Article"
                                >
                                  <Trash2 className="w-4.5 h-4.5" />
                                </button>
                              </div>
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

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Administrator Security Password</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={setAdminPass}
                      onChange={(e) => setSetAdminPass(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">Change this field to override the access password for this Admin Panel and secure API publishing.</p>
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
                    AffiMind features an integrated headless ingestion layer to receive bulk articles from automation tools, headless CMS pipelines, or editorial scripts.
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

                <div className="pt-4 border-t border-slate-900 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center text-xs text-slate-500">
                  <span>XML Sitemap: <a href="/sitemap.xml" target="_blank" className="text-indigo-400 hover:underline">/sitemap.xml</a></span>
                  <span>Robots Config: <a href="/robots.txt" target="_blank" className="text-indigo-400 hover:underline">/robots.txt</a></span>
                  <span>RSS Feed: <a href="/rss.xml" target="_blank" className="text-indigo-400 hover:underline">/rss.xml</a></span>
                </div>
              </div>
            )}

            {/* TAB 5: AI ARTICLE GENERATOR */}
            {activeTab === "generate" && (
              <div className="bg-slate-950 p-6 sm:p-8 rounded-3xl border border-slate-850 shadow-md space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                    <Wand2 className="w-5 h-5 text-pink-400" />
                    <span>Grounded AI Affiliate Article Generator</span>
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Generate comprehensive affiliate guides automatically. This tool searches your existing active product database for the matching category, extracts specifications and buying advice, and invokes the **Gemini 3.5 Flash** model to draft professional, high-density SEO review structures.
                  </p>
                </div>

                <form onSubmit={handleAIGenerate} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Target Keyword / Topic</label>
                      <input
                        type="text"
                        required
                        placeholder="Best noise cancelling earbuds under $100"
                        value={genKeyword}
                        onChange={(e) => setGenKeyword(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Category Grounding</label>
                      <select
                        value={genCategory}
                        onChange={(e) => setGenCategory(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-300 focus:outline-none focus:border-indigo-500"
                      >
                        <option value="earbuds">Wireless Earbuds</option>
                        <option value="gaming-mice">Gaming Mice</option>
                        <option value="coffee-makers">Coffee Makers</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isGenerating}
                    className="w-full sm:w-auto bg-gradient-to-r from-pink-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white font-bold py-2.5 px-6 rounded-xl text-xs sm:text-sm tracking-wider transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isGenerating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Grounding & Generating Guide...</span>
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-4.5 h-4.5" />
                        <span>Generate Article with Gemini</span>
                      </>
                    )}
                  </button>
                </form>

                {genResult && (
                  <div className="space-y-4 border-t border-slate-900 pt-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-mono font-bold uppercase text-pink-400 bg-pink-950/40 border border-pink-900/30 px-2 py-0.5 rounded">AI Draft Ready</span>
                        <h4 className="text-base font-bold text-white mt-1">{genResult.title}</h4>
                      </div>
                      <button
                        onClick={applyAIGeneratedToEditor}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Apply to Editor Form</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                        <span className="font-mono text-slate-500 uppercase tracking-wider block mb-1">Generated URL Slug</span>
                        <span className="font-mono text-slate-300">{genResult.slug}</span>
                      </div>
                      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                        <span className="font-mono text-slate-500 uppercase tracking-wider block mb-1">Generated SEO Title</span>
                        <span className="text-slate-300">{genResult.metaTitle}</span>
                      </div>
                    </div>

                    <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-xs">
                      <span className="font-mono text-slate-500 uppercase tracking-wider block mb-1">Generated SEO Description</span>
                      <p className="text-slate-300">{genResult.metaDescription}</p>
                    </div>

                    <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-xs">
                      <span className="font-mono text-slate-500 uppercase tracking-wider block mb-3">Grounded Content (Rich Markdown Preview)</span>
                      <div className="max-h-60 overflow-y-auto font-mono text-xs text-slate-400 leading-relaxed bg-slate-950 p-3 rounded-lg border border-slate-850 whitespace-pre-wrap">
                        {genResult.content}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 6: BULK PRODUCT IMPORT */}
            {activeTab === "import" && (
              <div className="bg-slate-950 p-6 sm:p-8 rounded-3xl border border-slate-850 shadow-md space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                    <Download className="w-5 h-5 text-cyan-400" />
                    <span>Bulk Product Catalog Import API</span>
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Inject product catalogs into the AffiMind database in batch format. Paste a valid JSON array matching the standard product properties below. Existing slugs are auto-updated, and new items are created instantly.
                  </p>
                </div>

                <form onSubmit={handleBulkImport} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Product Catalog JSON Payload</label>
                    <textarea
                      rows={10}
                      required
                      placeholder={`[\n  {\n    "title": "Sony WH-1000XM5",\n    "slug": "sony-wh-1000xm5-review",\n    "category": "earbuds",\n    "price": "$348.00",\n    "rating": 4.8,\n    "pros": ["Unmatched noise cancellation", "Industry-leading call quality"],\n    "cons": ["Expensive", "Does not fold compact"],\n    "buyingAdvice": "The perfect absolute top pick for daily travelers and office executives."\n  }\n]`}
                      value={bulkJson}
                      onChange={(e) => setBulkJson(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-xs text-slate-300 placeholder-slate-700 focus:outline-none focus:border-indigo-500 font-mono resize-none"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={isImporting}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-6 rounded-xl text-xs sm:text-sm tracking-wider transition-all shadow-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isImporting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Processing Catalog Import...</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-4.5 h-4.5" />
                        <span>Run Import Pipeline</span>
                      </>
                    )}
                  </button>
                </form>

                <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-850 space-y-2 text-xs">
                  <h4 className="font-bold text-slate-300">Properties Documentation</h4>
                  <ul className="list-disc pl-5 space-y-1 text-slate-400 font-mono text-[11px]">
                    <li><strong className="text-slate-300">title</strong> (string, required) - Product brand title.</li>
                    <li><strong className="text-slate-300">slug</strong> (string, required, unique) - Lowercase dash-separated URL component.</li>
                    <li><strong className="text-slate-300">category</strong> (string, required) - "earbuds" | "gaming-mice" | "coffee-makers"</li>
                    <li><strong className="text-slate-300">price</strong> (string, required) - Display price (e.g. "$49.99")</li>
                    <li><strong className="text-slate-300">rating</strong> (number, optional) - Decimal value from 1.0 to 5.0</li>
                    <li><strong className="text-slate-300">pros / cons</strong> (array of strings, optional) - Lists of advantages and drawbacks</li>
                    <li><strong className="text-slate-300">buyingAdvice</strong> (string, optional) - Rich summary text of whom this is for</li>
                  </ul>
                </div>
              </div>
            )}

            {/* TAB 7: SUPABASE DATABASE SCHEMA */}
            {activeTab === "supabase" && (
              <div className="bg-slate-950 p-6 sm:p-8 rounded-3xl border border-slate-850 shadow-md space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                    <Database className="w-5 h-5 text-emerald-400" />
                    <span>Supabase Postgres Database Schema</span>
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Deploy this verified PostgreSQL schema onto your **Supabase** database SQL Editor to migrate from file-based storage. It establishes categories, products, articles, and configuration tables with correct foreign keys, check-constraints, indexes, and initial core seed items.
                  </p>
                </div>

                {/* Supabase Connection Diagnosis Card */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-850 pb-3">
                    <div className="flex items-center gap-2">
                      <Database className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Connection Diagnosis Engine</span>
                    </div>
                    <button
                      onClick={checkSupabaseConnectivity}
                      disabled={checkingSupabase}
                      className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      {checkingSupabase ? "Pinging..." : "Re-run Connectivity Test"}
                    </button>
                  </div>

                  {checkingSupabase ? (
                    <div className="py-4 text-center space-y-2">
                      <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                      <p className="text-xs text-slate-400 animate-pulse">Contacting your Supabase instance...</p>
                    </div>
                  ) : supabaseStatus?.checked ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold text-[8px] ${
                          supabaseStatus.connected && supabaseStatus.tablesExist 
                            ? "bg-emerald-500 text-slate-950" 
                            : supabaseStatus.configured 
                            ? "bg-amber-500 text-slate-950" 
                            : "bg-slate-700 text-slate-300"
                        }`}>
                          {supabaseStatus.connected && supabaseStatus.tablesExist ? "✓" : "!"}
                        </div>
                        <div className="text-xs font-bold text-white">
                          Status: {
                            supabaseStatus.connected && supabaseStatus.tablesExist 
                              ? "FULLY OPERATIONAL" 
                              : supabaseStatus.configured 
                              ? "CONFIGURATION INCOMPLETE / ERRORS FOUND" 
                              : "NOT CONFIGURED"
                          }
                        </div>
                      </div>

                      <p className="text-xs text-slate-400 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-850">
                        {supabaseStatus.message}
                      </p>

                      {supabaseStatus.error && (
                        <div className="bg-rose-950/20 border border-rose-900/30 p-3 rounded-xl space-y-1">
                          <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest block">Error Logs</span>
                          <code className="text-[11px] text-rose-300 font-mono block break-words">{supabaseStatus.error}</code>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-[11px]">
                        <div className="bg-slate-950/40 p-2.5 rounded-lg border border-slate-850">
                          <span className="text-slate-500 block">Supabase Endpoint URL</span>
                          <span className="text-slate-350 font-mono block truncate">{supabaseStatus.url || "Not Configured"}</span>
                        </div>
                        <div className="bg-slate-950/40 p-2.5 rounded-lg border border-slate-850">
                          <span className="text-slate-500 block">Tables State (categories, products, articles)</span>
                          <span className={`font-semibold block ${supabaseStatus.tablesExist ? "text-emerald-400" : "text-amber-400"}`}>
                            {supabaseStatus.tablesExist ? "Schemas verified" : "Pending setup"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="py-2 text-center">
                      <button
                        onClick={checkSupabaseConnectivity}
                        className="bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 font-bold px-4 py-2 rounded-xl text-xs transition-all cursor-pointer"
                      >
                        Perform Connection Diagnosis
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wide">
                    <span>PostgreSQL DDL SQL Schema Script</span>
                    <button
                      onClick={() => {
                        const schemaText = `-- Create categories table
CREATE TABLE categories (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    icon_name VARCHAR(50) DEFAULT 'Tag'
);

-- Create products table
CREATE TABLE products (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    category VARCHAR(50) REFERENCES categories(slug) ON DELETE SET NULL,
    price VARCHAR(50) NOT NULL,
    rating DECIMAL(3, 2) DEFAULT 4.0,
    image TEXT,
    affiliate_link TEXT,
    pros TEXT[],
    cons TEXT[],
    specs JSONB DEFAULT '{}'::jsonb,
    faq JSONB DEFAULT '[]'::jsonb,
    buying_advice TEXT,
    alternatives VARCHAR(255)[],
    featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create articles table
CREATE TABLE articles (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    category VARCHAR(50) REFERENCES categories(slug) ON DELETE SET NULL,
    image TEXT,
    meta_title VARCHAR(255),
    meta_description TEXT,
    content TEXT NOT NULL,
    faq JSONB DEFAULT '[]'::jsonb,
    schema JSONB DEFAULT '{}'::jsonb,
    affiliate_link TEXT,
    status VARCHAR(50) DEFAULT 'published' CHECK (status IN ('published', 'draft', 'scheduled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create settings table
CREATE TABLE settings (
    id SERIAL PRIMARY KEY,
    site_name VARCHAR(255) DEFAULT 'AffiMind',
    site_description TEXT,
    seo_title VARCHAR(255),
    seo_description TEXT,
    affiliate_disclosure TEXT,
    contact_email VARCHAR(255)
);

-- Pre-seed core categories
INSERT INTO categories (id, name, slug, description, icon_name) VALUES
('1', 'Wireless Earbuds', 'earbuds', 'Unbiased reviews of the best budget, active noise cancellation, and high-fidelity wireless audio.', 'Headphones'),
('2', 'Gaming Mice', 'gaming-mice', 'Expert precision tests, weight systems, ergonomics, and sensor analyses of professional gaming mice.', 'Mouse'),
('3', 'Coffee Makers', 'coffee-makers', 'Comprehensive reviews of programmable drip brewers, single-serve espresso makers, and budget grinders.', 'Coffee');`;
                        navigator.clipboard.writeText(schemaText);
                        setCopiedSql(true);
                        setTimeout(() => setCopiedSql(false), 3000);
                      }}
                      className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 focus:outline-none"
                    >
                      {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedSql ? "Copied!" : "Copy SQL Script"}</span>
                    </button>
                  </div>
                  <pre className="bg-slate-900 p-4 rounded-xl text-[11px] text-slate-300 font-mono overflow-x-auto whitespace-pre leading-relaxed border border-slate-800 max-h-96">
{`-- Create categories table
CREATE TABLE categories (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    icon_name VARCHAR(50) DEFAULT 'Tag'
);

-- Create products table
CREATE TABLE products (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    category VARCHAR(50) REFERENCES categories(slug) ON DELETE SET NULL,
    price VARCHAR(50) NOT NULL,
    rating DECIMAL(3, 2) DEFAULT 4.0,
    image TEXT,
    affiliate_link TEXT,
    pros TEXT[],
    cons TEXT[],
    specs JSONB DEFAULT '{}'::jsonb,
    faq JSONB DEFAULT '[]'::jsonb,
    buying_advice TEXT,
    alternatives VARCHAR(255)[],
    featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create articles table
CREATE TABLE articles (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    category VARCHAR(50) REFERENCES categories(slug) ON DELETE SET NULL,
    image TEXT,
    meta_title VARCHAR(255),
    meta_description TEXT,
    content TEXT NOT NULL,
    faq JSONB DEFAULT '[]'::jsonb,
    schema JSONB DEFAULT '{}'::jsonb,
    affiliate_link TEXT,
    status VARCHAR(50) DEFAULT 'published' CHECK (status IN ('published', 'draft', 'scheduled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create settings table
CREATE TABLE settings (
    id SERIAL PRIMARY KEY,
    site_name VARCHAR(255) DEFAULT 'AffiMind',
    site_description TEXT,
    seo_title VARCHAR(255),
    seo_description TEXT,
    affiliate_disclosure TEXT,
    contact_email VARCHAR(255)
);

-- Pre-seed core categories
INSERT INTO categories (id, name, slug, description, icon_name) VALUES
('1', 'Wireless Earbuds', 'earbuds', 'Unbiased reviews of the best budget, active noise cancellation, and high-fidelity wireless audio.', 'Headphones'),
('2', 'Gaming Mice', 'gaming-mice', 'Expert precision tests, weight systems, ergonomics, and sensor analyses of professional gaming mice.', 'Mouse'),
('3', 'Coffee Makers', 'coffee-makers', 'Comprehensive reviews of programmable drip brewers, single-serve espresso makers, and budget grinders.', 'Coffee');`}
                  </pre>
                </div>

                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-xs space-y-2">
                  <h4 className="font-bold text-white flex items-center gap-1.5 text-emerald-400">
                    <Database className="w-4 h-4" />
                    <span>How to set up this schema on Supabase</span>
                  </h4>
                  <ol className="list-decimal pl-5 space-y-1.5 text-slate-400">
                    <li>Create a new free project at <a href="https://supabase.com" target="_blank" className="text-indigo-400 hover:underline">supabase.com</a>.</li>
                    <li>Navigate to the **SQL Editor** tab from your Supabase sidebar dashboard.</li>
                    <li>Click **New Query**, paste the copied SQL DDL script, and click **Run**.</li>
                    <li>All 4 tables will be instantly provisioned and seeded, ready for PostgreSQL client queries!</li>
                  </ol>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};
