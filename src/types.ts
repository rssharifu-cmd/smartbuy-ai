/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Product {
  id: string;
  title: string;
  slug: string;
  category: string;
  content: string; // full markdown review
  image: string;
  affiliateLink: string;
  price: string;
  rating: number;
  pros: string[];
  cons: string[];
  specs: Record<string, string>;
  faq: Array<{ question: string; answer: string }>;
  buyingAdvice: string;
  alternatives: string[]; // related/alternative product slugs or titles
  createdAt: string;
  featured: boolean;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  category: string;
  content: string; // full markdown article
  metaTitle: string;
  metaDescription: string;
  faq: Array<{ question: string; answer: string }>;
  schema: Record<string, any>; // JSON-LD
  image: string;
  affiliateLink?: string;
  createdAt: string;
  status: 'draft' | 'published' | 'scheduled';
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  iconName: string; // Lucide icon name
}

export interface SiteSettings {
  siteName: string;
  siteDescription: string;
  seoTitle: string;
  seoDescription: string;
  affiliateDisclosure: string;
  contactEmail: string;
  adminPasswordHash?: string;
}

export interface AISearchResult {
  aiSummary: string;
  recommendations: Product[];
  pros: string[];
  cons: string[];
  features: string[];
  buyingAdvice: string;
}
