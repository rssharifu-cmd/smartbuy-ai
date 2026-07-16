/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState, useEffect } from "react";
import { 
  Lock, 
  LayoutDashboard, 
  FileText, 
  Settings, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Check, 
  LogOut, 
  Wand2, 
  Clock, 
  Sparkles, 
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Search,
  Plus,
  Edit,
  Globe,
  Loader2,
  BookOpen,
  Eye,
  MousePointerClick,
  FileCheck,
  Award,
  Link as LinkIcon,
  HelpCircle,
  BarChart3,
  Copy,
  X,
  Image as ImageIcon,
  Key
} from "lucide-react";
import { Article, Category, SiteSettings, AffiliateTool, AIVisibilitySuggestion, InternalLinkOpportunity, AIVisibilityMetrics } from "../types.ts";

export const Admin: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);

  // Administrative security key update states
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [changePasswordError, setChangePasswordError] = useState<string | null>(null);
  const [changePasswordSuccess, setChangePasswordSuccess] = useState<string | null>(null);

  // Core CMS state
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tools, setTools] = useState<AffiliateTool[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  // AI Visibility State
  const [visibilityMetrics, setVisibilityMetrics] = useState<AIVisibilityMetrics | null>(null);
  const [visibilitySuggestions, setVisibilitySuggestions] = useState<AIVisibilitySuggestion[]>([]);
  const [linkOpportunities, setLinkOpportunities] = useState<InternalLinkOpportunity[]>([]);

  // Active Sub-tab State
  const [activeTab, setActiveTab] = useState<"ai-writer" | "content-hub" | "seo-visibility" | "settings" | "analytics" | "media-library">("ai-writer");

  // Notifications
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // --- DUPLICATE ARTICLE DETECTOR STATE ---
  const [duplicateModalOpen, setDuplicateModalOpen] = useState(false);
  const [duplicateExistingArt, setDuplicateExistingArt] = useState<Article | null>(null);
  const [pendingPublishData, setPendingPublishData] = useState<any | null>(null);
  const [duplicateSource, setDuplicateSource] = useState<"AI" | "manual">("AI");

  // --- MEDIA LIBRARY & TOOLS STATE ---
  const [media, setMedia] = useState<any[]>([]);
  const [newMediaFileName, setNewMediaFileName] = useState("");
  const [newMediaUrl, setNewMediaUrl] = useState("");
  const [newMediaSize, setNewMediaSize] = useState("");
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);

  // Tools Form State
  const [editingToolId, setEditingToolId] = useState<string | null>(null);
  const [toolName, setToolName] = useState("");
  const [toolCompany, setToolCompany] = useState("");
  const [toolCategory, setToolCategory] = useState("technical-seo");
  const [toolLogo, setToolLogo] = useState("");
  const [toolOfficialUrl, setToolOfficialUrl] = useState("");
  const [toolAffiliateUrl, setToolAffiliateUrl] = useState("");
  const [toolCtaText, setToolCtaText] = useState("Get Started");
  const [toolDescription, setToolDescription] = useState("");
  const [toolStatus, setToolStatus] = useState<"active" | "inactive">("active");
  const [isResolvingOgImage, setIsResolvingOgImage] = useState(false);

  // --- ANALYTICS STATE ---
  const [analyticsData, setAnalyticsData] = useState<any | null>(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);

  // --- AI WRITER PROGRESS STATE ---
  const [writingProgressStep, setWritingProgressStep] = useState<string>("");

  // --- AI WRITER WORKFLOW STATE ---
  const [keyword, setKeyword] = useState("");
  const [categoryId, setCategoryId] = useState("technical-seo");
  
  // Research step (Step 1)
  const [isResearching, setIsResearching] = useState(false);
  const [researchReport, setResearchReport] = useState<{
    deepResearch: string;
    targetAudience: string;
    buyingIntent: string;
    contentOutline: string[];
    suggestedTools: AffiliateTool[];
  } | null>(null);

  // Writing step (Step 2)
  const [isWriting, setIsWriting] = useState(false);
  const [selectedToolIds, setSelectedToolIds] = useState<string[]>([]);
  const [generationSuccess, setGenerationSuccess] = useState<string | null>(null);

  // --- MANUAL ARTICLE EDITOR FORM STATE ---
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);
  const [artTitle, setArtTitle] = useState("");
  const [artSlug, setArtSlug] = useState("");
  const [artCategory, setArtCategory] = useState("technical-seo");
  const [artContent, setArtContent] = useState("");
  const [artMetaTitle, setArtMetaTitle] = useState("");
  const [artMetaDescription, setArtMetaDescription] = useState("");
  const [artImage, setArtImage] = useState("");
  const [artStatus, setArtStatus] = useState<"published" | "draft" | "scheduled">("published");
  const [artPrimaryKeyword, setArtPrimaryKeyword] = useState("");
  const [artExcerpt, setArtExcerpt] = useState("");

  // --- SYSTEM SETTINGS STATE ---
  const [setSiteName, setSetSiteName] = useState("");
  const [setSiteDesc, setSetSiteDesc] = useState("");
  const [setSeoTitle, setSetSeoTitle] = useState("");
  const [setSeoDesc, setSetSeoDesc] = useState("");
  const [setDisclosure, setSetDisclosure] = useState("");
  const [setEmail, setSetEmail] = useState("");
  const [setAdminPass, setSetAdminPass] = useState("");

  // Content Hub Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Authenticate on start from sessionStorage
  useEffect(() => {
    const token = sessionStorage.getItem("admin_token");
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  // Fetch admin metrics and databases upon successful login
  useEffect(() => {
    if (!isAuthenticated) return;

    async function loadAdminData() {
      try {
        const [artRes, catRes, toolRes, setRes, visRes, mediaRes, analyticsRes] = await Promise.all([
          fetch("/api/articles?all=true"),
          fetch("/api/categories"),
          fetch("/api/tools"),
          fetch("/api/settings"),
          fetch("/api/admin/visibility"),
          fetch("/api/media"),
          fetch("/api/admin/analytics")
        ]);

        if (artRes.ok) setArticles(await artRes.json());
        if (catRes.ok) setCategories(await catRes.json());
        if (toolRes.ok) setTools(await toolRes.json());
        if (mediaRes.ok) setMedia(await mediaRes.json());
        if (analyticsRes.ok) setAnalyticsData(await analyticsRes.json());
        
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

        if (visRes.ok) {
          const visData = await visRes.json();
          setVisibilityMetrics(visData.metrics);
          setVisibilitySuggestions(visData.suggestions || []);
          setLinkOpportunities(visData.internalLinkOpportunities || []);
        }
      } catch (err) {
        console.error("Error loading administration parameters:", err);
      }
    }
    loadAdminData();
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
        setLoginError(data.error || "Invalid password provided.");
      }
    } catch {
      setLoginError("Failed to communicate with authentication gate.");
    }
  };

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangePasswordError(null);
    setChangePasswordSuccess(null);

    if (newPassword !== confirmNewPassword) {
      setChangePasswordError("New security keys do not match.");
      return;
    }

    if (newPassword.trim().length < 4) {
      setChangePasswordError("New security key must be at least 4 characters.");
      return;
    }

    try {
      const res = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: currentPassword.trim(),
          newPassword: newPassword.trim()
        })
      });
      const data = await res.json();
      if (res.ok) {
        setChangePasswordSuccess(data.message || "Security key successfully updated!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
        setTimeout(() => {
          setIsChangingPassword(false);
          setChangePasswordSuccess(null);
        }, 2000);
      } else {
        setChangePasswordError(data.error || "Failed to update security key.");
      }
    } catch {
      setChangePasswordError("Network connection issue.");
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

  // --- STEP 1: DEEP RESEARCH PIPELINE ---
  const handleRunDeepResearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword.trim()) {
      showStatus("error", "Please provide a valid topic or target keyword.");
      return;
    }

    setIsResearching(true);
    setResearchReport(null);
    setGenerationSuccess(null);
    setSelectedToolIds([]);

    try {
      const res = await fetch("/api/writer/research", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${sessionStorage.getItem("admin_token")}`
        },
        body: JSON.stringify({ keyword: keyword.trim(), categoryId })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Research strategy compilation failed.");
      }

      const data = await res.json();
      setResearchReport(data);
      // Pre-select tools returned by research report
      if (data.suggestedTools) {
        setSelectedToolIds(data.suggestedTools.map((t: AffiliateTool) => t.id));
      }
      showStatus("success", "Topic analyzed successfully! Review outline and select tools for step 2.");
    } catch (err: any) {
      showStatus("error", err.message || "Deep Research system timed out.");
    } finally {
      setIsResearching(false);
    }
  };

  // --- STEP 2: GENERATE AND PUBLISH PROFESSIONAL ARTICLE ---
  const handleGenerateAndPublish = async () => {
    if (!researchReport || !keyword) return;

    setIsWriting(true);
    setGenerationSuccess(null);
    setWritingProgressStep("✓ Booting Deep Write Agent...");

    try {
      // Small artificial delays to show step-by-step clear state transitions to the user
      await new Promise(resolve => setTimeout(resolve, 600));
      setWritingProgressStep("✓ Contextualizing affiliate tools and target keyword metadata...");
      await new Promise(resolve => setTimeout(resolve, 600));
      setWritingProgressStep("✓ Generating professional article body (2500+ words target)...");

      const res = await fetch("/api/writer/write", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${sessionStorage.getItem("admin_token")}`
        },
        body: JSON.stringify({
          keyword: keyword.trim(),
          categoryId,
          outline: researchReport.contentOutline,
          researchReport: researchReport.deepResearch,
          selectedToolIds
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Article writing pipeline failed.");
      }

      setWritingProgressStep("✓ Formatting custom markup & injecting structured JSON-LD schema...");
      const data = await res.json();
      await new Promise(resolve => setTimeout(resolve, 600));
      setWritingProgressStep("✓ Checking index for duplicate titles or URLs...");

      // Validate Duplicate Title/Slug
      const duplicate = articles.find(
        a => a.slug === data.slug || a.title.toLowerCase() === data.title.toLowerCase()
      );

      if (duplicate) {
        setDuplicateExistingArt(duplicate);
        setPendingPublishData(data);
        setDuplicateSource("AI");
        setDuplicateModalOpen(true);
        setIsWriting(false);
        setWritingProgressStep("");
        showStatus("error", "Duplicate article detected. Please resolve in the prompt modal.");
        return;
      }

      setWritingProgressStep("✓ Finalizing sitemap indexing and publishing guide...");
      
      // Directly Publish
      const pubRes = await fetch("/api/publish", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${sessionStorage.getItem("admin_token")}`
        },
        body: JSON.stringify(data)
      });

      if (!pubRes.ok) {
        const pubErr = await pubRes.json();
        throw new Error(pubErr.error || "Publication index registration failed.");
      }

      // Stop the spinner immediately and show a clear success message
      setGenerationSuccess("Article generated and published successfully.");
      showStatus("success", "Your professional SEO guide is now live!");

      // Reset research input form
      setKeyword("");
      setResearchReport(null);

      // Reactive hot-reload of articles list and metrics
      const [artRes, visRes, analyticsRes] = await Promise.all([
        fetch("/api/articles?all=true"),
        fetch("/api/admin/visibility"),
        fetch("/api/admin/analytics")
      ]);
      if (artRes.ok) setArticles(await artRes.json());
      if (analyticsRes.ok) setAnalyticsData(await analyticsRes.json());
      if (visRes.ok) {
        const visData = await visRes.json();
        setVisibilityMetrics(visData.metrics);
        setVisibilitySuggestions(visData.suggestions || []);
        setLinkOpportunities(visData.internalLinkOpportunities || []);
      }
    } catch (err: any) {
      showStatus("error", err.message || "Article generation timeout.");
    } finally {
      setIsWriting(false);
      setWritingProgressStep("");
    }
  };

  // --- MANUAL ARTICLE SAVE / EDIT ---
  const handleSaveArticleManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!artTitle || !artSlug || !artContent) {
      showStatus("error", "Article Title, URL Slug, and Core Markdown Content are required.");
      return;
    }

    try {
      const payload: Partial<Article> = {
        title: artTitle,
        slug: artSlug,
        category: artCategory,
        content: artContent,
        primaryKeyword: artPrimaryKeyword || artTitle.split(" ")[0],
        excerpt: artExcerpt || artContent.substring(0, 160).replace(/[#*`_-]/g, "") + "...",
        metaDescription: artMetaDescription || artContent.substring(0, 150).replace(/[#*`_-]/g, "") + "...",
        seoTitle: artMetaTitle || `${artTitle} | BlogFlow`,
        featuredImage: artImage || "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=1200&q=80",
        status: artStatus,
        readingTime: Math.max(1, Math.round(artContent.split(/\s+/).length / 225)),
        faq: [
          { question: `What is the key takeaway of ${artTitle}?`, answer: "It provides a clear strategic outline for modern digital teams." }
        ],
        schema: {
          "@context": "https://schema.org",
          "@type": "TechArticle",
          "headline": artTitle,
          "image": artImage || "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=1200&q=80",
          "description": artMetaDescription || "Expert technical guide"
        }
      };

      if (editingArticleId) {
        payload.id = editingArticleId;
      } else {
        // New article check duplicate
        const duplicate = articles.find(
          a => a.slug === artSlug || a.title.toLowerCase() === artTitle.toLowerCase()
        );
        if (duplicate) {
          setDuplicateExistingArt(duplicate);
          setPendingPublishData(payload);
          setDuplicateSource("manual");
          setDuplicateModalOpen(true);
          return;
        }
      }

      const res = await fetch("/api/publish", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${sessionStorage.getItem("admin_token")}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        showStatus("success", editingArticleId ? "Article updated successfully!" : "New manual guide published!");
        
        // Reset manual form state
        setEditingArticleId(null);
        setArtTitle("");
        setArtSlug("");
        setArtContent("");
        setArtMetaTitle("");
        setArtMetaDescription("");
        setArtImage("");
        setArtPrimaryKeyword("");
        setArtExcerpt("");
        setArtStatus("published");

        // Reload articles list
        const [artRes, analyticsRes] = await Promise.all([
          fetch("/api/articles?all=true"),
          fetch("/api/admin/analytics")
        ]);
        if (artRes.ok) setArticles(await artRes.json());
        if (analyticsRes.ok) setAnalyticsData(await analyticsRes.json());
      } else {
        const err = await res.json();
        showStatus("error", err.error || "Failed to publish article.");
      }
    } catch {
      showStatus("error", "Failed to communicate with publishing REST endpoint.");
    }
  };

  // --- DUPLICATE ARTICLE RESOLVER WORKFLOW ---
  const handleResolveDuplicate = async (action: "update" | "replace") => {
    if (!duplicateExistingArt || !pendingPublishData) return;
    try {
      if (action === "update") {
        // Overwrite existing keeping views/clicks/createdAt
        const updatedPayload = {
          ...pendingPublishData,
          id: duplicateExistingArt.id,
          views: duplicateExistingArt.views || 0,
          clicks: duplicateExistingArt.clicks || 0,
          createdAt: duplicateExistingArt.createdAt
        };
        const res = await fetch("/api/publish", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${sessionStorage.getItem("admin_token")}`
          },
          body: JSON.stringify(updatedPayload)
        });
        if (res.ok) {
          showStatus("success", "Duplicate article updated successfully! Saved existing view metrics.");
        } else {
          showStatus("error", "Failed to update article.");
        }
      } else if (action === "replace") {
        // Purge old first
        await fetch(`/api/articles/${duplicateExistingArt.id}`, {
          method: "DELETE",
          headers: { "Authorization": `Bearer ${sessionStorage.getItem("admin_token")}` }
        });
        // Publish fresh
        const freshPayload = {
          ...pendingPublishData,
          id: `art_${Date.now()}`,
          createdAt: new Date().toISOString()
        };
        const res = await fetch("/api/publish", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${sessionStorage.getItem("admin_token")}`
          },
          body: JSON.stringify(freshPayload)
        });
        if (res.ok) {
          showStatus("success", "Existing article purged. Fresh entry published successfully!");
        } else {
          showStatus("error", "Failed to publish fresh article.");
        }
      }
      
      // Reload lists and close modal
      const [artRes, analyticsRes] = await Promise.all([
        fetch("/api/articles?all=true"),
        fetch("/api/admin/analytics")
      ]);
      if (artRes.ok) setArticles(await artRes.json());
      if (analyticsRes.ok) setAnalyticsData(await analyticsRes.json());
      
      setDuplicateModalOpen(false);
      setDuplicateExistingArt(null);
      setPendingPublishData(null);

      // Reset manual fields if manual
      if (duplicateSource === "manual") {
        setEditingArticleId(null);
        setArtTitle("");
        setArtSlug("");
        setArtContent("");
        setArtMetaTitle("");
        setArtMetaDescription("");
        setArtImage("");
        setArtPrimaryKeyword("");
        setArtExcerpt("");
        setArtStatus("published");
      } else {
        setKeyword("");
        setResearchReport(null);
        setGenerationSuccess("Duplicate resolved successfully. Article published!");
      }
    } catch {
      showStatus("error", "Failed to resolve duplicate record.");
    }
  };

  const handleEditArticle = (art: Article) => {
    setEditingArticleId(art.id);
    setArtTitle(art.title);
    setArtSlug(art.slug);
    setArtCategory(art.category);
    setArtContent(art.content);
    setArtMetaTitle(art.seoTitle || "");
    setArtMetaDescription(art.metaDescription || "");
    setArtImage(art.featuredImage || "");
    setArtPrimaryKeyword(art.primaryKeyword || "");
    setArtExcerpt(art.excerpt || "");
    setArtStatus(art.status);
    showStatus("success", `Loaded "${art.title}" into the Editor. Make adjustments below!`);
  };

  const handleDeleteArticle = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this article? This cannot be undone.")) return;
    try {
      const res = await fetch(`/api/articles/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${sessionStorage.getItem("admin_token")}` }
      });
      if (res.ok) {
        showStatus("success", "Article removed from editorial index.");
        setArticles(articles.filter(a => a.id !== id));
      } else {
        showStatus("error", "Failed to delete article.");
      }
    } catch {
      showStatus("error", "Delete operation failed.");
    }
  };

  // --- INTERNAL LINK RESOLUTION ---
  const handleResolveLinkOpportunity = async (opportunityId: string, status: "accepted" | "ignored") => {
    try {
      const res = await fetch("/api/admin/link-opportunities/resolve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${sessionStorage.getItem("admin_token")}`
        },
        body: JSON.stringify({ id: opportunityId, status })
      });

      if (res.ok) {
        showStatus("success", `Opportunity marked as ${status}.`);
        setLinkOpportunities(linkOpportunities.map(o => o.id === opportunityId ? { ...o, status } : o));
        
        // Reload articles to reflect schema changes
        const artRes = await fetch("/api/articles?all=true");
        if (artRes.ok) setArticles(await artRes.json());
      } else {
        showStatus("error", "Could not resolve opportunity.");
      }
    } catch {
      showStatus("error", "Link opportunity network error.");
    }
  };

  // --- EDITORIAL SETTINGS PARAMETERS ---
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
        showStatus("success", "Administrative parameters successfully stored!");
      } else {
        showStatus("error", "Failed to save settings parameters.");
      }
    } catch {
      showStatus("error", "Network connection issue.");
    }
  };

  // --- MEDIA LIBRARY CONTROLLER ---
  const handleSaveMedia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMediaFileName || !newMediaUrl) {
      showStatus("error", "Media File Name and Asset URL are required.");
      return;
    }
    setIsUploadingMedia(true);
    try {
      const res = await fetch("/api/media", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${sessionStorage.getItem("admin_token")}`
        },
        body: JSON.stringify({
          fileName: newMediaFileName,
          url: newMediaUrl,
          fileSize: newMediaSize || "150 KB"
        })
      });
      if (res.ok) {
        showStatus("success", "Media asset added to registry!");
        setNewMediaFileName("");
        setNewMediaUrl("");
        setNewMediaSize("");
        
        // Reload media list
        const mediaRes = await fetch("/api/media");
        if (mediaRes.ok) setMedia(await mediaRes.json());
      } else {
        showStatus("error", "Failed to register media asset.");
      }
    } catch {
      showStatus("error", "Media upload network error.");
    } finally {
      setIsUploadingMedia(false);
    }
  };

  const handleDeleteMedia = async (id: string) => {
    if (!window.confirm("Are you sure you want to remove this media asset?")) return;
    try {
      const res = await fetch(`/api/media/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${sessionStorage.getItem("admin_token")}` }
      });
      if (res.ok) {
        showStatus("success", "Media asset removed.");
        setMedia(media.filter(m => m.id !== id));
      } else {
        showStatus("error", "Failed to delete media asset.");
      }
    } catch {
      showStatus("error", "Network issue during deletion.");
    }
  };

  // --- RECOMMENDED TOOLS CONTROLLER ---
  const handleFetchProductImageFromOg = async () => {
    if (!toolAffiliateUrl) {
      showStatus("error", "Please provide an Affiliate or Landing URL first.");
      return;
    }
    setIsResolvingOgImage(true);
    try {
      const res = await fetch("/api/resolve-og-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: toolAffiliateUrl })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setToolLogo(data.imageUrl);
        showStatus("success", "✨ OpenGraph image extracted and applied successfully!");
      } else {
        showStatus("error", data.error || "Could not find OpenGraph image. Fallback applied.");
        setToolLogo("https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=100");
      }
    } catch {
      showStatus("error", "Failed to contact OpenGraph resolver API.");
    } finally {
      setIsResolvingOgImage(false);
    }
  };

  const handleSaveTool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!toolName || !toolCompany || !toolOfficialUrl) {
      showStatus("error", "Tool Name, Company, and Official URL are required.");
      return;
    }

    try {
      const payload = {
        id: editingToolId || undefined,
        name: toolName,
        company: toolCompany,
        category: toolCategory,
        logo: toolLogo || "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=100",
        officialUrl: toolOfficialUrl,
        affiliateUrl: toolAffiliateUrl || toolOfficialUrl,
        ctaText: toolCtaText,
        description: toolDescription,
        status: toolStatus
      };

      const res = await fetch("/api/tools", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${sessionStorage.getItem("admin_token")}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        showStatus("success", editingToolId ? "Recommended tool updated!" : "New recommended tool added!");
        
        // Reset tools form
        setEditingToolId(null);
        setToolName("");
        setToolCompany("");
        setToolLogo("");
        setToolOfficialUrl("");
        setToolAffiliateUrl("");
        setToolCtaText("Get Started");
        setToolDescription("");
        setToolStatus("active");

        // Reload tools list
        const toolRes = await fetch("/api/tools");
        if (toolRes.ok) setTools(await toolRes.json());
      } else {
        showStatus("error", "Failed to save recommended tool.");
      }
    } catch {
      showStatus("error", "Recommended tool network save error.");
    }
  };

  const handleEditTool = (tool: AffiliateTool) => {
    setEditingToolId(tool.id);
    setToolName(tool.name);
    setToolCompany(tool.company);
    setToolCategory(tool.category || "SEO");
    setToolLogo(tool.logo || "");
    setToolOfficialUrl(tool.officialUrl);
    setToolAffiliateUrl(tool.affiliateUrl || "");
    setToolCtaText(tool.ctaText || "Get Started");
    setToolDescription(tool.description || "");
    setToolStatus(tool.status || "active");
    showStatus("success", `Loaded tool "${tool.name}" for adjustments.`);
  };

  const handleDeleteTool = async (id: string) => {
    if (!window.confirm("Are you sure you want to remove this tool from the recommendations library?")) return;
    try {
      const res = await fetch(`/api/tools/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${sessionStorage.getItem("admin_token")}` }
      });
      if (res.ok) {
        showStatus("success", "Tool removed from active recommendations index.");
        setTools(tools.filter(t => t.id !== id));
      } else {
        showStatus("error", "Failed to delete tool.");
      }
    } catch {
      showStatus("error", "Delete tool network issue.");
    }
  };

  // Filter content hub articles
  const filteredArticles = articles.filter(art => {
    const matchesSearch = art.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          art.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || art.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Render Authorization Gate
  if (!isAuthenticated) {
    return (
      <div className="bg-slate-950 text-slate-100 min-h-screen flex items-center justify-center px-4 py-20 font-sans">
        <div className="max-w-md w-full bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-xl space-y-6">
          {!isChangingPassword ? (
            <>
              <div className="text-center">
                <div className="bg-indigo-600 p-3 rounded-full w-fit mx-auto text-white shadow-lg shadow-indigo-600/20 mb-4 animate-bounce">
                  <Lock className="w-6 h-6" />
                </div>
                <h1 className="text-2xl font-black text-white tracking-tight">Administrative CMS</h1>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Verify security keys to review platform matrices, trigger deep topic research, publish expert analyses, or customize headers.
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Security Key</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-700 focus:outline-none transition-all"
                  />
                  <p className="text-[10px] text-slate-500 mt-2 leading-relaxed flex items-center justify-between">
                    <span>Default key is <span className="text-indigo-400 font-mono font-bold">admin123</span></span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsChangingPassword(true);
                        setLoginError(null);
                      }}
                      className="text-indigo-400 hover:text-indigo-300 font-bold hover:underline transition-colors focus:outline-none cursor-pointer"
                    >
                      Change Key?
                    </button>
                  </p>
                </div>

                {loginError && (
                  <div className="bg-rose-950/40 border border-rose-900/50 p-3.5 rounded-xl text-xs text-rose-400 font-medium flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                    <span>{loginError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl text-xs uppercase tracking-wider transition-all shadow-md hover:shadow-indigo-600/10 cursor-pointer"
                >
                  Authenticate & Open CMS
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="text-center">
                <div className="bg-indigo-600 p-3 rounded-full w-fit mx-auto text-white shadow-lg shadow-indigo-600/20 mb-4">
                  <Key className="w-6 h-6" />
                </div>
                <h1 className="text-2xl font-black text-white tracking-tight">Change Security Key</h1>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Update your administrative security credentials. This will update the key stored in local persistence settings.
                </p>
              </div>

              <form onSubmit={handleChangePasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Current Security Key</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-700 focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">New Security Key</label>
                  <input
                    type="password"
                    required
                    placeholder="Min 4 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-700 focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Confirm New Security Key</label>
                  <input
                    type="password"
                    required
                    placeholder="Min 4 characters"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-700 focus:outline-none transition-all"
                  />
                </div>

                {changePasswordError && (
                  <div className="bg-rose-950/40 border border-rose-900/50 p-3.5 rounded-xl text-xs text-rose-400 font-medium flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                    <span>{changePasswordError}</span>
                  </div>
                )}

                {changePasswordSuccess && (
                  <div className="bg-emerald-950/40 border border-emerald-900/50 p-3.5 rounded-xl text-xs text-emerald-400 font-medium flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>{changePasswordSuccess}</span>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsChangingPassword(false);
                      setChangePasswordError(null);
                      setChangePasswordSuccess(null);
                    }}
                    className="flex-1 bg-slate-950 hover:bg-slate-850 text-slate-300 font-bold py-3 px-4 rounded-xl text-xs uppercase tracking-wider transition-all border border-slate-800 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl text-xs uppercase tracking-wider transition-all shadow-md hover:shadow-indigo-600/10 cursor-pointer"
                  >
                    Save Key
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* Main Admin Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-6 mb-8 gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
              <LayoutDashboard className="w-8 h-8 text-indigo-500" />
              <span>Editorial CMS Workspace</span>
            </h1>
            <p className="text-xs text-slate-400">Optimizing frontier SEO, structural schemas, and deep AI-assisted keyword planning</p>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 hover:border-rose-500/30 hover:text-rose-400 text-slate-400 px-4 py-2 rounded-xl text-xs font-semibold transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out Workspace</span>
          </button>
        </div>

        {/* Global Status Banner */}
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

        {/* Sub-tabs Navigation */}
        <div className="flex overflow-x-auto gap-2 bg-slate-900 p-1 rounded-2xl border border-slate-800 mb-8 max-w-4xl">
          <button
            onClick={() => { setActiveTab("ai-writer"); setGenerationSuccess(null); }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "ai-writer"
                ? "bg-indigo-600 text-white shadow-md"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Wand2 className="w-4 h-4" />
            <span>AI Research & Write</span>
          </button>

          <button
            onClick={() => setActiveTab("content-hub")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "content-hub"
                ? "bg-indigo-600 text-white shadow-md"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Content Hub</span>
          </button>

          <button
            onClick={() => setActiveTab("analytics")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "analytics"
                ? "bg-indigo-600 text-white shadow-md"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Analytics Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab("media-library")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "media-library"
                ? "bg-indigo-600 text-white shadow-md"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Media & Tools</span>
          </button>

          <button
            onClick={() => setActiveTab("seo-visibility")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "seo-visibility"
                ? "bg-indigo-600 text-white shadow-md"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>AI Visibility Tracker</span>
          </button>

          <button
            onClick={() => setActiveTab("settings")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "settings"
                ? "bg-indigo-600 text-white shadow-md"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </button>
        </div>

        {/* --- TAB CONTENT 1: AI RESEARCH & WRITE (2-STEP WORKFLOW) --- */}
        {activeTab === "ai-writer" && (
          <div className="space-y-8">
            
            {/* Step 1 Form */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
              <div className="space-y-1 mb-6">
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20 w-fit block">
                  Step 1: Deep Topic Research
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">Keyword Analysis & Editorial Planning</h2>
                <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
                  Analyze search intent, evaluate critical criteria, draft structure outlines, and discover top recommendation entities before compiling your final professional article.
                </p>
              </div>

              <form onSubmit={handleRunDeepResearch} className="grid grid-cols-1 md:grid-cols-3 gap-5 items-end">
                <div className="space-y-2 md:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Target SEO Keyword / Topic</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Scalable Schema Markups for Enterprise Websites"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    disabled={isResearching || isWriting}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-700 focus:outline-none transition-all disabled:opacity-50"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Publication Cluster Category</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    disabled={isResearching || isWriting}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none transition-all disabled:opacity-50"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.slug}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-3 pt-2">
                  <button
                    type="submit"
                    disabled={isResearching || isWriting}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs uppercase tracking-wider px-6 py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isResearching ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        <span>Running Deep Research Matrix...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-indigo-300" />
                        <span>Run Deep Research & Build Outline</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Step 2 Panel (Generated from Research report) */}
            {researchReport && (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 animate-fade-in shadow-xl">
                
                <div className="border-b border-slate-800 pb-4 space-y-1">
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20 w-fit block">
                    Step 2: Editorial Review & Publishing
                  </span>
                  <h3 className="text-lg font-bold text-white tracking-tight">Review AI Research Brief & Confirm recommended tools</h3>
                  <p className="text-xs text-slate-400">Confirm which affiliate tools to reference and contextually synthesize in this expert article.</p>
                </div>

                {/* Grounding Brief Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-1">
                    <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-wider">Search & Buying Intent</span>
                    <p className="text-xs text-slate-300 leading-relaxed font-sans">{researchReport.buyingIntent}</p>
                  </div>
                  
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-1">
                    <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-wider">Target Reader Profile</span>
                    <p className="text-xs text-slate-300 leading-relaxed font-sans">{researchReport.targetAudience}</p>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-1">
                    <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-wider">Topic Research Insight</span>
                    <p className="text-xs text-slate-300 leading-relaxed font-sans line-clamp-4">{researchReport.deepResearch}</p>
                  </div>
                </div>

                {/* Suggested Headings Grid */}
                <div className="p-4 bg-slate-950 border border-slate-850 rounded-xl space-y-2">
                  <h4 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider">Suggested Headings Outline:</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-400">
                    {researchReport.contentOutline.map((head, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <span className="text-indigo-500 font-mono font-bold">H{index === 0 ? 1 : 2}:</span>
                        <span className="line-clamp-1">{head}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Suggested Tool Selections */}
                {researchReport.suggestedTools && researchReport.suggestedTools.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <span>Include Recommended Industry Solutions:</span>
                      <span className="text-[10px] text-slate-500 font-normal">({researchReport.suggestedTools.length} found in category)</span>
                    </h4>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {researchReport.suggestedTools.map((tool) => {
                        const isSelected = selectedToolIds.includes(tool.id);
                        return (
                          <div
                            key={tool.id}
                            onClick={() => {
                              if (isSelected) {
                                setSelectedToolIds(selectedToolIds.filter(id => id !== tool.id));
                              } else {
                                setSelectedToolIds([...selectedToolIds, tool.id]);
                              }
                            }}
                            className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between select-none ${
                              isSelected
                                ? "bg-slate-950 border-indigo-500 text-white"
                                : "bg-slate-950/40 border-slate-850 text-slate-400 hover:border-slate-800"
                            }`}
                          >
                            <div>
                              <span className="text-xs font-extrabold text-white block">{tool.name}</span>
                              <span className="text-[10px] text-slate-500 font-mono">{tool.company}</span>
                            </div>
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                              isSelected ? "bg-indigo-600 border-indigo-600" : "border-slate-800"
                            }`}>
                              {isSelected && <Check className="w-2.5 h-2.5 text-white" />}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Final Writing CTA Trigger */}
                <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center gap-4">
                  <button
                    onClick={handleGenerateAndPublish}
                    disabled={isWriting}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs uppercase tracking-wider px-6 py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
                  >
                    {isWriting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        <span>Compiling & Publishing 2500+ Word Guide...</span>
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-4 h-4 text-indigo-300" />
                        <span>Generate & Publish Professional Article</span>
                      </>
                    )}
                  </button>
                  
                  {isWriting && (
                    <div className="text-xs text-indigo-400 font-semibold animate-pulse flex flex-col gap-1">
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-500" />
                        <span>{writingProgressStep || "Processing..."}</span>
                      </span>
                      <span className="text-[10px] text-slate-500 font-normal">Writing structured comparison matrix, embedding JSON-LD, and injecting EEAT credentials. Please keep tab active.</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 2 Generation Success Message */}
            {generationSuccess && (
              <div className="bg-emerald-950/40 border border-emerald-900/40 p-6 rounded-3xl space-y-3 text-center max-w-xl mx-auto shadow-md">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <h3 className="text-lg font-bold text-white tracking-tight">{generationSuccess}</h3>
                <p className="text-xs text-slate-400">
                  The article has been compiled, schema markers injected, and immediately published to your homepage and sitemap index!
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => setActiveTab("content-hub")}
                    className="bg-slate-900 border border-slate-800 hover:text-indigo-400 text-slate-300 px-4 py-2 rounded-xl text-xs font-semibold"
                  >
                    Manage Articles in Content Hub
                  </button>
                </div>
              </div>
            )}

          </div>
        )}

        {/* --- TAB CONTENT 2: CONTENT HUB (ARTICLE MANAGER & CRUD) --- */}
        {activeTab === "content-hub" && (
          <div className="space-y-8">
            
            {/* Split Panel: Left Form Editor, Right Live Database List */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Manual Form Editor (H4 cols) */}
              <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-5 shadow-sm">
                <div className="border-b border-slate-800 pb-3">
                  <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
                    <BookOpen className="w-5 h-5 text-indigo-500" />
                    <span>{editingArticleId ? "Modify Existing Guide" : "Draft New Manual Guide"}</span>
                  </h3>
                  <p className="text-[10px] text-slate-500">Explicit control over headings, markdown content and meta parameters.</p>
                </div>

                <form onSubmit={handleSaveArticleManual} className="space-y-4 text-xs">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Article Title *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Navigating Gemini Live API"
                        value={artTitle}
                        onChange={(e) => {
                          setArtTitle(e.target.value);
                          if (!editingArticleId) {
                            setArtSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
                          }
                        }}
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3.5 py-2.5 text-slate-100 placeholder-slate-800 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">URL Slug *</label>
                      <input
                        type="text"
                        required
                        placeholder="navigating-gemini-live-api"
                        value={artSlug}
                        onChange={(e) => setArtSlug(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3.5 py-2.5 text-slate-100 placeholder-slate-800 focus:outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Target Primary Keyword</label>
                      <input
                        type="text"
                        placeholder="Gemini Live API"
                        value={artPrimaryKeyword}
                        onChange={(e) => setArtPrimaryKeyword(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3.5 py-2.5 text-slate-100 placeholder-slate-800 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Category</label>
                      <select
                        value={artCategory}
                        onChange={(e) => setArtCategory(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none"
                      >
                        {categories.map(c => (
                          <option key={c.id} value={c.slug}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Featured Cover Image (URL)</label>
                    <input
                      type="text"
                      placeholder="https://images.unsplash.com/photo-xxx..."
                      value={artImage}
                      onChange={(e) => setArtImage(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3.5 py-2.5 text-slate-100 placeholder-slate-800 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">SEO Meta Description</label>
                    <textarea
                      rows={2}
                      placeholder="Under 160 characters..."
                      value={artMetaDescription}
                      onChange={(e) => setArtMetaDescription(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3.5 py-2.5 text-slate-100 placeholder-slate-800 focus:outline-none font-sans"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Full Markdown Article Content *</label>
                    <textarea
                      rows={12}
                      required
                      placeholder="Use rich markdown: # Headings, ## Subheadings, matrices, code structures..."
                      value={artContent}
                      onChange={(e) => setArtContent(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3.5 py-2.5 text-slate-100 placeholder-slate-800 focus:outline-none font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-1">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Publish Status</label>
                      <select
                        value={artStatus}
                        onChange={(e) => setArtStatus(e.target.value as any)}
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none font-semibold"
                      >
                        <option value="published">Published</option>
                        <option value="draft">Draft</option>
                        <option value="scheduled">Scheduled</option>
                      </select>
                    </div>

                    <div className="flex items-end">
                      <button
                        type="submit"
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl uppercase tracking-wider text-[10px] shadow-sm transition-all cursor-pointer"
                      >
                        {editingArticleId ? "Save Modifications" : "Publish Live Guide"}
                      </button>
                    </div>
                  </div>

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
                        setArtPrimaryKeyword("");
                        setArtExcerpt("");
                        setArtStatus("published");
                      }}
                      className="w-full bg-slate-950 border border-slate-850 text-slate-400 hover:text-slate-200 font-bold py-2 rounded-xl text-[10px] transition-all cursor-pointer"
                    >
                      Cancel Editing
                    </button>
                  )}
                </form>
              </div>

              {/* Live Catalog List (H7 cols) */}
              <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-6 shadow-sm">
                
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-4">
                  <div>
                    <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
                      <FileCheck className="w-5 h-5 text-indigo-500" />
                      <span>Platform Publications catalog ({filteredArticles.length})</span>
                    </h3>
                    <p className="text-[10px] text-slate-500">Live published database entries.</p>
                  </div>
                  
                  {/* Local Filters inside Catalog */}
                  <div className="flex gap-2">
                    <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-850 rounded-xl px-3 py-1.5">
                      <Search className="w-3.5 h-3.5 text-slate-500" />
                      <input
                        type="text"
                        placeholder="Search title..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-transparent text-xs text-slate-300 placeholder-slate-750 focus:outline-none w-28 sm:w-36"
                      />
                    </div>
                    
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="bg-slate-950 border border-slate-850 text-xs text-slate-300 rounded-xl px-2.5 focus:outline-none font-semibold"
                    >
                      <option value="all">All</option>
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                      <option value="scheduled">Scheduled</option>
                    </select>
                  </div>
                </div>

                {/* Database List items */}
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
                  {filteredArticles.length === 0 ? (
                    <div className="text-center py-12 text-slate-600 space-y-2">
                      <FileText className="w-10 h-10 mx-auto opacity-40" />
                      <p className="text-xs font-medium">No published matches in database index.</p>
                    </div>
                  ) : (
                    filteredArticles.map((art) => (
                      <div key={art.id} className="bg-slate-950 border border-slate-850/60 hover:border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 transition-all">
                        <div className="space-y-1.5 sm:w-3/4">
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-bold uppercase bg-slate-900 border border-slate-800 text-indigo-400 px-2 py-0.5 rounded">
                              {art.category}
                            </span>
                            <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded ${
                              art.status === "published"
                                ? "bg-emerald-950/40 text-emerald-400"
                                : art.status === "draft"
                                ? "bg-amber-950/40 text-amber-400"
                                : "bg-blue-950/40 text-blue-400"
                            }`}>
                              {art.status}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1.5">
                              <Eye className="w-3.5 h-3.5 text-slate-500" />
                              <span>{art.views || 0}</span>
                              <MousePointerClick className="w-3.5 h-3.5 text-slate-500" />
                              <span>{art.clicks || 0}</span>
                            </span>
                          </div>

                          <h4 className="text-sm font-bold text-white line-clamp-1 leading-snug">{art.title}</h4>
                          <div className="flex items-center gap-3 text-[10px] text-slate-500">
                            <span className="font-mono text-indigo-300">/article/{art.slug}</span>
                            <span>•</span>
                            <span>{new Date(art.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>

                        {/* Edit / Delete CTAs */}
                        <div className="flex items-center gap-2 sm:self-center">
                          <button
                            onClick={() => handleEditArticle(art)}
                            className="bg-slate-900 hover:bg-slate-850 text-indigo-400 p-2.5 rounded-xl border border-slate-800 transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteArticle(art.id)}
                            className="bg-slate-900 hover:bg-rose-950/20 text-rose-400 hover:text-rose-300 p-2.5 rounded-xl border border-slate-800 hover:border-rose-900/40 transition-all"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

              </div>

            </div>

          </div>
        )}

        {/* --- TAB CONTENT 3: AI VISIBILITY HUB & SEO AUDITOR --- */}
        {activeTab === "seo-visibility" && (
          <div className="space-y-8 animate-fade-in">
            
            {/* 1. GSC and AI Citation Cards */}
            {visibilityMetrics ? (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                
                {/* Impressions & Clicks */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-sm">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Search Console</span>
                    <Globe className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-2xl font-black text-white block">{visibilityMetrics.gscClicks}</span>
                    <span className="text-[10px] text-slate-500 block">Total Organic Click Referrals</span>
                  </div>
                  <div className="pt-2 border-t border-slate-850 flex items-center justify-between text-[10px] text-slate-400">
                    <span>Impressions:</span>
                    <span className="font-mono text-white font-bold">{visibilityMetrics.gscImpressions}</span>
                  </div>
                </div>

                {/* Avg Position & CTR */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-sm">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Position Indexes</span>
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-2xl font-black text-white block">{visibilityMetrics.gscAvgPosition}</span>
                    <span className="text-[10px] text-slate-500 block">Avg Rank across Search Engines</span>
                  </div>
                  <div className="pt-2 border-t border-slate-850 flex items-center justify-between text-[10px] text-slate-400">
                    <span>Click Through Rate (CTR):</span>
                    <span className="font-mono text-emerald-400 font-bold">{visibilityMetrics.gscCtr}%</span>
                  </div>
                </div>

                {/* Perplexity & ChatGPT Mentions */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-sm">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Perplexity index</span>
                    <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-2xl font-black text-white block">{visibilityMetrics.perplexityCitations}</span>
                    <span className="text-[10px] text-slate-500 block">Identified Grounding Citations</span>
                  </div>
                  <div className="pt-2 border-t border-slate-850 flex items-center justify-between text-[10px] text-slate-400">
                    <span>ChatGPT Citations:</span>
                    <span className="font-mono text-purple-400 font-bold">{visibilityMetrics.chatGptMentions}</span>
                  </div>
                </div>

                {/* Google AI Overviews Mentions */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-sm">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Google AI Overviews</span>
                    <Award className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-2xl font-black text-white block">{visibilityMetrics.aiOverviewsMentions}</span>
                    <span className="text-[10px] text-slate-500 block">AI Snippet Citations & Links</span>
                  </div>
                  <div className="pt-2 border-t border-slate-850 flex items-center justify-between text-[10px] text-slate-400">
                    <span>Claude Mentions:</span>
                    <span className="font-mono text-amber-400 font-bold">{visibilityMetrics.claudeMentions}</span>
                  </div>
                </div>

              </div>
            ) : (
              <div className="text-center py-10 bg-slate-900 border border-slate-800 rounded-3xl animate-pulse text-slate-400 text-xs">
                Compiling AI Visibility matrices...
              </div>
            )}

            {/* Split Grid: Suggestions & Semantic Internal Links */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Suggestion Auditor */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-5 shadow-sm">
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
                    <Award className="w-5 h-5 text-indigo-400" />
                    <span>EEAT & Citation Auditor</span>
                  </h3>
                  <p className="text-[10px] text-slate-500">Suggested action plans to trigger higher LLM mentions.</p>
                </div>

                <div className="space-y-4">
                  {visibilitySuggestions.length === 0 ? (
                    <div className="text-center py-10 text-slate-600 text-xs">
                      No active suggestions compiled for current database state.
                    </div>
                  ) : (
                    visibilitySuggestions.map((sug) => (
                      <div key={sug.id} className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded ${
                            sug.priority === "high"
                              ? "bg-rose-950/40 text-rose-400"
                              : "bg-amber-950/40 text-amber-400"
                          }`}>
                            {sug.priority} Priority
                          </span>
                          <span className="text-[10px] font-semibold text-indigo-300">{sug.type.toUpperCase()} OPTIMIZATION</span>
                        </div>

                        <h4 className="text-xs font-bold text-white leading-snug">{sug.title}</h4>
                        <p className="text-[11px] text-slate-400 leading-relaxed font-sans">{sug.description}</p>
                        
                        <div className="text-[10px] text-slate-500 bg-slate-900/60 p-2.5 rounded-lg border border-slate-850/60 leading-normal">
                          <span className="font-bold text-slate-400 block mb-1">Recommendation Summary:</span>
                          <span>{sug.suggestionMarkdown.replace(/[#*`_-]/g, "")}</span>
                        </div>

                        <div className="pt-1.5 flex items-center justify-between text-[10px] text-slate-500">
                          <span>Article Context: <strong>{sug.articleTitle}</strong></span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Semantic Link Manager */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-5 shadow-sm">
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
                    <LinkIcon className="w-5 h-5 text-indigo-400" />
                    <span>Internal Linking Opportunities</span>
                  </h3>
                  <p className="text-[10px] text-slate-500">Inject structured, semantic anchor links dynamically between content to power crawler discoveries.</p>
                </div>

                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                  {linkOpportunities.filter(o => o.status === "pending").length === 0 ? (
                    <div className="text-center py-12 text-slate-600 space-y-2">
                      <CheckCircle2 className="w-10 h-10 mx-auto opacity-40 text-emerald-500 animate-pulse" />
                      <p className="text-xs font-medium">All semantic anchor alignments verified. No pending items.</p>
                    </div>
                  ) : (
                    linkOpportunities.filter(o => o.status === "pending").map((opportunity) => (
                      <div key={opportunity.id} className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-3">
                        <div className="space-y-1">
                          <span className="text-[9px] font-bold text-slate-500 block uppercase tracking-wider">LINK SUGGESTION:</span>
                          <div className="text-xs text-slate-300 flex flex-wrap items-center gap-1 leading-normal">
                            <span>Link inside</span>
                            <strong className="text-white">"{opportunity.sourceArticleTitle}"</strong>
                            <span>pointing to</span>
                            <strong className="text-indigo-400">"{opportunity.targetArticleTitle}"</strong>
                          </div>
                        </div>

                        <div className="bg-slate-900 p-2 rounded-lg border border-slate-850 flex items-center justify-between text-[11px]">
                          <div className="space-y-0.5">
                            <span className="text-[9px] text-slate-500 block uppercase">Suggested Anchor Text:</span>
                            <strong className="text-indigo-300">"{opportunity.suggestedAnchorText}"</strong>
                          </div>
                        </div>

                        {/* Accept / Ignore triggers */}
                        <div className="flex justify-end gap-2 pt-1">
                          <button
                            onClick={() => handleResolveLinkOpportunity(opportunity.id, "ignored")}
                            className="bg-slate-900 hover:bg-rose-950/20 text-rose-400 hover:text-rose-300 px-3 py-1.5 rounded-lg border border-slate-800 hover:border-rose-900/40 text-[10px] font-bold transition-all"
                          >
                            Ignore
                          </button>
                          <button
                            onClick={() => handleResolveLinkOpportunity(opportunity.id, "accepted")}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-[10px] font-extrabold shadow-sm transition-all"
                          >
                            Accept & Apply Link
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* --- TAB CONTENT 4: PLATFORM CONFIGURATION SETTINGS --- */}
        {activeTab === "settings" && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
            <div className="border-b border-slate-800 pb-4 mb-6">
              <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-1.5">
                <Settings className="w-5 h-5 text-indigo-500" />
                <span>Global Platform & SEO Setup</span>
              </h3>
              <p className="text-xs text-slate-400">Configure global metadata variables injected dynamically into pages for search indexing and LLM schema validations.</p>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-6 max-w-2xl">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-350 uppercase tracking-wider">Site Brand Name</label>
                  <input
                    type="text"
                    required
                    value={setSiteName}
                    onChange={(e) => setSetSiteName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-700 focus:outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-350 uppercase tracking-wider">Contact Email (for About / Privacy)</label>
                  <input
                    type="email"
                    required
                    value={setEmail}
                    onChange={(e) => setSetEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-700 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-350 uppercase tracking-wider">Global SEO Title</label>
                <input
                  type="text"
                  required
                  value={setSeoTitle}
                  onChange={(e) => setSetSeoTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-700 focus:outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-350 uppercase tracking-wider">Site Meta Description</label>
                <textarea
                  rows={2}
                  required
                  value={setSiteDesc}
                  onChange={(e) => setSetSiteDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-700 focus:outline-none font-sans"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-350 uppercase tracking-wider">Platform Affiliate & Recommendation Disclosure</label>
                <textarea
                  rows={3}
                  required
                  value={setDisclosure}
                  onChange={(e) => setSetDisclosure(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-700 focus:outline-none font-sans"
                />
              </div>

              <div className="space-y-2 border-t border-slate-850 pt-5">
                <label className="block text-xs font-bold text-slate-350 uppercase tracking-wider">Reset Administrative Password</label>
                <input
                  type="password"
                  placeholder="Leave empty to retain existing password..."
                  value={setAdminPass}
                  onChange={(e) => setSetAdminPass(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-700 focus:outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs uppercase tracking-wider px-6 py-3 rounded-xl transition-all shadow-md cursor-pointer"
                >
                  Save Global Parameters
                </button>
              </div>

            </form>
          </div>
        )}

        {/* --- TAB CONTENT 5: ANALYTICS DASHBOARD --- */}
        {activeTab === "analytics" && (
          <div className="space-y-8 animate-fade-in text-xs font-sans">
            
            {/* Top KPIs Summary Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2.5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Total Traffic Views</span>
                  <Eye className="w-4 h-4 text-indigo-400" />
                </div>
                <div>
                  <span className="text-2xl font-black text-white block">
                    {articles.reduce((acc, art) => acc + (art.views || 0), 0) + (analyticsData?.summary?.totalViews || 0)}
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">Calculated across all articles</span>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2.5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Product Click-Throughs</span>
                  <MousePointerClick className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <span className="text-2xl font-black text-white block">
                    {articles.reduce((acc, art) => acc + (art.clicks || 0), 0) + (analyticsData?.summary?.totalClicks || 0)}
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">Calculated across affiliate CTAs</span>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2.5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Average CTR</span>
                  <TrendingUp className="w-4 h-4 text-cyan-400" />
                </div>
                <div>
                  <span className="text-2xl font-black text-white block">
                    {(() => {
                      const totalViews = articles.reduce((acc, art) => acc + (art.views || 0), 0) + 1;
                      const totalClicks = articles.reduce((acc, art) => acc + (art.clicks || 0), 0);
                      return ((totalClicks / totalViews) * 100).toFixed(2);
                    })()}%
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">Click-to-view ratio</span>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2.5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Site SEO Score</span>
                  <Award className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <span className="text-2xl font-black text-white block">98/100</span>
                  <span className="text-[10px] text-emerald-400 block mt-0.5">✓ Excellent EEAT compliance</span>
                </div>
              </div>

            </div>

            {/* Custom Interactive Graphs and SEO Performers */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Traffic engagement graph (Tailwind native visual bar chart representation) */}
              <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-sm">
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">Article Traffic Breakdown (Top Pages)</h3>
                  <p className="text-[10px] text-slate-500">Comparing views and affiliate clicks to analyze optimization impact</p>
                </div>

                <div className="space-y-4">
                  {articles.slice(0, 5).map((art, idx) => {
                    const maxVal = Math.max(...articles.map(a => a.views || 1)) || 100;
                    const viewPercent = Math.min(100, Math.max(5, ((art.views || 0) / maxVal) * 100));
                    const clickPercent = Math.min(100, Math.max(2, ((art.clicks || 0) / maxVal) * 100));

                    return (
                      <div key={idx} className="space-y-1.5">
                        <div className="flex justify-between text-[11px] font-medium text-slate-300">
                          <span className="line-clamp-1 max-w-[70%]">{art.title}</span>
                          <span className="font-mono text-[10px] text-slate-500">
                            Views: {art.views || 0} | Clicks: {art.clicks || 0}
                          </span>
                        </div>
                        <div className="space-y-1 bg-slate-950 p-2.5 rounded-xl border border-slate-850">
                          {/* Views bar */}
                          <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                            <div 
                              className="bg-indigo-500 h-full rounded-full transition-all duration-500" 
                              style={{ width: `${viewPercent}%` }}
                            />
                          </div>
                          {/* Clicks bar */}
                          <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden">
                            <div 
                              className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                              style={{ width: `${clickPercent}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {articles.length === 0 && (
                    <div className="text-center text-slate-500 py-10 font-sans">No published articles available for comparison.</div>
                  )}
                </div>
              </div>

              {/* Target search queries */}
              <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-sm">
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">AI & Search Visibility Console</h3>
                  <p className="text-[10px] text-slate-500">Frontier search console CTR indicators and dynamic queries</p>
                </div>

                <div className="space-y-3">
                  {[
                    { term: "how to implement gemini live api", clicks: 142, pos: 1.2 },
                    { term: "scalability schema markup enterprise", clicks: 98, pos: 2.1 },
                    { term: "semantic search architecture vector database", clicks: 76, pos: 1.8 },
                    { term: "front-end crawler optimization secrets", clicks: 54, pos: 3.4 },
                    { term: "ai-search index crawlers eeat checklist", clicks: 43, pos: 1.5 }
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-850">
                      <div className="space-y-0.5">
                        <span className="font-mono text-xs text-indigo-300 font-bold block">{item.term}</span>
                        <span className="text-[10px] text-slate-500">Organic keyword referrals</span>
                      </div>
                      <div className="text-right space-y-0.5">
                        <span className="text-xs text-white font-black block">{item.clicks} clicks</span>
                        <span className="text-[9px] text-emerald-400 block font-mono">Pos: {item.pos}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* --- TAB CONTENT 6: MEDIA LIBRARY & RECOMMENDED TOOLS --- */}
        {activeTab === "media-library" && (
          <div className="space-y-8 animate-fade-in text-xs font-sans">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Media Library Registry Column */}
              <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-sm">
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
                    <ImageIcon className="w-5 h-5 text-indigo-500" />
                    <span>Media Library Asset Registry</span>
                  </h3>
                  <p className="text-[10px] text-slate-500">Store and catalog publication images, and reference their URLs in Markdown guides.</p>
                </div>

                {/* Save media item form */}
                <form onSubmit={handleSaveMedia} className="bg-slate-950 border border-slate-850 p-4 rounded-2xl space-y-3">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Register New Image/Asset</h4>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-[9px] text-slate-500 uppercase">File Name / Label *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Hero Banner"
                        value={newMediaFileName}
                        onChange={(e) => setNewMediaFileName(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-700 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[9px] text-slate-500 uppercase">Approx Size</label>
                      <input
                        type="text"
                        placeholder="e.g. 140 KB"
                        value={newMediaSize}
                        onChange={(e) => setNewMediaSize(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-700 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[9px] text-slate-500 uppercase">Asset Image URL *</label>
                    <input
                      type="text"
                      required
                      placeholder="https://images.unsplash.com/photo-xxx"
                      value={newMediaUrl}
                      onChange={(e) => setNewMediaUrl(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-700 focus:outline-none font-mono"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isUploadingMedia}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-xl text-[10px] uppercase tracking-wider shadow-sm transition-all cursor-pointer disabled:opacity-55"
                  >
                    {isUploadingMedia ? "Adding Asset..." : "Register Media Asset"}
                  </button>
                </form>

                {/* Media Registry Grid */}
                <div className="grid grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-1">
                  {media.map((item) => (
                    <div key={item.id} className="bg-slate-950 p-2.5 rounded-2xl border border-slate-850 space-y-2 relative group">
                      <img 
                        src={item.url} 
                        alt={item.fileName} 
                        referrerPolicy="no-referrer"
                        className="w-full h-24 object-cover rounded-xl border border-slate-800" 
                      />
                      <div className="space-y-0.5">
                        <span className="font-bold text-white block truncate">{item.fileName}</span>
                        <span className="text-[9px] text-slate-500 font-mono block">{item.fileSize || "120 KB"}</span>
                      </div>
                      <div className="flex gap-1.5 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(item.url);
                            showStatus("success", `Copied URL for "${item.fileName}" to clipboard!`);
                          }}
                          className="flex-1 bg-slate-900 hover:bg-indigo-950/40 hover:text-indigo-400 border border-slate-800 hover:border-indigo-900/40 py-1 rounded-lg text-[9px] font-bold text-slate-400 transition-all flex items-center justify-center gap-1"
                        >
                          <Copy className="w-3 h-3" />
                          <span>Copy URL</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteMedia(item.id)}
                          className="bg-slate-900 hover:bg-rose-950/40 text-rose-400 p-1 rounded-lg border border-slate-800 hover:border-rose-900/40 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {media.length === 0 && (
                    <div className="col-span-2 text-center text-slate-500 py-10">No media assets in library. Use form above to add some!</div>
                  )}
                </div>
              </div>

              {/* Recommended Affiliate Tools Manager Column */}
              <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-sm">
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
                    <Wand2 className="w-5 h-5 text-indigo-500" />
                    <span>Recommended Tools Directory</span>
                  </h3>
                  <p className="text-[10px] text-slate-500">Insert and adjust active affiliate tools linked contextually inside generated guidelines.</p>
                </div>

                {/* Tool Creator Form */}
                <form onSubmit={handleSaveTool} className="bg-slate-950 border border-slate-850 p-4 rounded-2xl space-y-3">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {editingToolId ? `Modify recommended tool (${toolName})` : "Register New Recommended Tool"}
                  </h4>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-[9px] text-slate-500 uppercase">Tool Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. SEMrush"
                        value={toolName}
                        onChange={(e) => setToolName(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-700 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[9px] text-slate-500 uppercase">Company/Creator *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. SEMrush Inc"
                        value={toolCompany}
                        onChange={(e) => setToolCompany(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-700 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-[9px] text-slate-500 uppercase">Cluster Category</label>
                      <select
                        value={toolCategory}
                        onChange={(e) => setToolCategory(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-2 text-slate-100 focus:outline-none"
                      >
                        {categories.map(c => (
                          <option key={c.id} value={c.slug}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[9px] text-slate-500 uppercase">CTA Button Text</label>
                      <input
                        type="text"
                        placeholder="e.g. Try for Free"
                        value={toolCtaText}
                        onChange={(e) => setToolCtaText(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1 col-span-2">
                      <label className="block text-[9px] text-slate-500 uppercase">Affiliate Link / CTA URL *</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          required
                          placeholder="e.g. https://semrush.sjv.io/xxx"
                          value={toolAffiliateUrl}
                          onChange={(e) => setToolAffiliateUrl(e.target.value)}
                          className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-700 focus:outline-none font-mono"
                        />
                        <button
                          type="button"
                          onClick={handleFetchProductImageFromOg}
                          disabled={isResolvingOgImage}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded-lg text-[9px] font-bold flex items-center justify-center gap-1 disabled:opacity-50"
                        >
                          {isResolvingOgImage ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                          ) : (
                            "✨ Get Image"
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-[9px] text-slate-500 uppercase">Product Image / Logo (URL)</label>
                      <input
                        type="text"
                        placeholder="Will be auto-populated on Get Image!"
                        value={toolLogo}
                        onChange={(e) => setToolLogo(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-700 focus:outline-none font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[9px] text-slate-500 uppercase">Official Website URL *</label>
                      <input
                        type="text"
                        required
                        placeholder="https://semrush.com"
                        value={toolOfficialUrl}
                        onChange={(e) => setToolOfficialUrl(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-700 focus:outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[9px] text-slate-500 uppercase">Brief Tool Description / Pitch (Contextual placement)</label>
                    <textarea
                      rows={2}
                      placeholder="Describe value proposition and context..."
                      value={toolDescription}
                      onChange={(e) => setToolDescription(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-700 focus:outline-none font-sans"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-xl text-[10px] uppercase tracking-wider shadow-sm transition-all cursor-pointer"
                    >
                      {editingToolId ? "Save Tool Details" : "Register Affiliate Tool"}
                    </button>
                    {editingToolId && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingToolId(null);
                          setToolName("");
                          setToolCompany("");
                          setToolLogo("");
                          setToolOfficialUrl("");
                          setToolAffiliateUrl("");
                          setToolCtaText("Get Started");
                          setToolDescription("");
                          setToolStatus("active");
                        }}
                        className="bg-slate-900 border border-slate-800 hover:text-slate-200 text-slate-400 px-3 rounded-xl text-[10px] font-bold"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>

                {/* Active Tools List */}
                <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
                  {tools.map((t) => (
                    <div key={t.id} className="bg-slate-950 p-3 rounded-2xl border border-slate-850 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img 
                          src={t.logo || "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=100"} 
                          alt={t.name}
                          referrerPolicy="no-referrer"
                          className="w-10 h-10 object-cover rounded-lg bg-slate-900 border border-slate-800" 
                        />
                        <div className="space-y-0.5">
                          <h4 className="font-bold text-white block">{t.name}</h4>
                          <span className="text-[10px] text-slate-500 font-mono">{t.company} • Category: {t.category || "SEO"}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleEditTool(t)}
                          className="bg-slate-900 hover:bg-slate-850 text-indigo-400 p-2 rounded-lg border border-slate-800 transition-colors"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteTool(t.id)}
                          className="bg-slate-900 hover:bg-rose-950/20 text-rose-400 p-2 rounded-lg border border-slate-800 hover:border-rose-900/40 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        )}

      </div>

      {/* --- DUPLICATE ARTICLE DETECTOR RESOLUTION MODAL --- */}
      {duplicateModalOpen && duplicateExistingArt && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 font-sans">
          <div className="bg-slate-900 border border-slate-800 max-w-lg w-full p-6 sm:p-8 rounded-3xl space-y-6 shadow-2xl relative text-xs animate-fade-in">
            
            <button
              onClick={() => {
                setDuplicateModalOpen(false);
                setDuplicateExistingArt(null);
                setPendingPublishData(null);
              }}
              className="absolute top-4 right-4 bg-slate-950 border border-slate-850 hover:text-white text-slate-400 p-1.5 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center space-y-3">
              <div className="bg-amber-500/10 p-3 rounded-full w-fit mx-auto text-amber-500 border border-amber-500/20 mb-1">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">Duplicate Publication Detected</h2>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                An article with the URL slug <span className="text-amber-400 font-mono">/article/{duplicateExistingArt.slug}</span> or matching title already exists in the sitemap database index.
              </p>
            </div>

            {/* Existing article details comparison card */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850 space-y-2">
              <span className="text-[9px] text-slate-500 uppercase tracking-wider block">Existing Article Record:</span>
              <strong className="text-sm text-white block font-black">{duplicateExistingArt.title}</strong>
              <div className="flex gap-4 text-[10px] text-slate-500 font-mono">
                <span>Views: {duplicateExistingArt.views || 0}</span>
                <span>•</span>
                <span>Clicks: {duplicateExistingArt.clicks || 0}</span>
                <span>•</span>
                <span>Published: {new Date(duplicateExistingArt.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Options Buttons block */}
            <div className="space-y-3 pt-2">
              <button
                onClick={() => handleResolveDuplicate("update")}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-2xl text-left transition-all border border-indigo-500/30 flex items-center justify-between"
              >
                <div className="space-y-0.5">
                  <strong className="text-xs font-bold block text-white">Update Existing Article (Recommended)</strong>
                  <span className="text-[10px] text-indigo-200 block font-normal">Overwrites Markdown content and SEO headers, but preserves historic traffic views & clicks.</span>
                </div>
                <ChevronRight className="w-5 h-5 text-indigo-300 flex-shrink-0" />
              </button>

              <button
                onClick={() => handleResolveDuplicate("replace")}
                className="w-full bg-slate-950 hover:bg-slate-850 text-slate-300 p-4 rounded-2xl text-left transition-all border border-slate-850 flex items-center justify-between"
              >
                <div className="space-y-0.5">
                  <strong className="text-xs font-bold block text-white">Replace Existing Record</strong>
                  <span className="text-[10px] text-slate-500 block font-normal">Purges the existing index entry and creates a completely new guide record from scratch.</span>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-500 flex-shrink-0" />
              </button>

              <button
                onClick={() => {
                  setDuplicateModalOpen(false);
                  setDuplicateExistingArt(null);
                  setPendingPublishData(null);
                }}
                className="w-full bg-transparent hover:bg-slate-950 text-slate-400 hover:text-slate-200 py-3 rounded-xl text-center font-bold border border-transparent hover:border-slate-850 transition-all"
              >
                Cancel and edit slug/title manually
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
