/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Author {
  id: string;
  name: string;
  role: string;
  bio: string;
  avatar: string;
  twitter?: string;
  linkedin?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  iconName: string; // Lucide icon name
}

export interface AffiliateTool {
  id: string;
  name: string;
  company: string;
  logo: string; // URL or name of Lucide icon
  description: string;
  officialUrl: string;
  affiliateUrl: string;
  category: string;
  ctaText: string;
  status: 'active' | 'inactive';
}

export interface InternalLinkOpportunity {
  id: string;
  sourceArticleId: string;
  sourceArticleTitle: string;
  targetArticleId: string;
  targetArticleTitle: string;
  suggestedAnchorText: string;
  status: 'pending' | 'accepted' | 'ignored';
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  category: string; // Category slug
  tags: string[];
  featuredImage: string;
  excerpt: string;
  content: string; // Full markdown article
  readingTime: number; // in minutes
  affiliateTools: string[]; // List of AffiliateTool IDs
  createdAt: string;
  publishDate?: string; // For scheduled posts
  status: 'draft' | 'published' | 'scheduled';
  seoTitle: string;
  metaDescription: string;
  faq: Array<{ question: string; answer: string }>;
  schema: Record<string, any>; // JSON-LD object
  authorId: string; // Author ID
  internalLinks: Array<{ url: string; anchorText: string }>;
  researchReport?: string; // Step 1 Research report
  views?: number;
  clicks?: number;
  isTrending?: boolean;
  isPopular?: boolean;
  isEditorsPick?: boolean;
}

export interface MediaItem {
  id: string;
  fileName: string;
  url: string;
  fileSize: string;
  createdAt: string;
}

export interface SiteSettings {
  siteName: string;
  siteDescription: string;
  seoTitle: string;
  seoDescription: string;
  affiliateDisclosure: string;
  contactEmail: string;
  adminPassword?: string;
  supabaseUrl?: string;
  supabaseAnonKey?: string;
}

export interface AIVisibilitySuggestion {
  id: string;
  articleId: string;
  articleTitle: string;
  type: 'update' | 'citation' | 'eeat' | 'faq' | 'schema';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  suggestionMarkdown: string;
}

export interface AIVisibilityMetrics {
  gscClicks: number;
  gscImpressions: number;
  gscAvgPosition: number;
  gscCtr: number;
  aiOverviewsMentions: number;
  perplexityCitations: number;
  chatGptMentions: number;
  claudeMentions: number;
  referralTraffic: number;
}
