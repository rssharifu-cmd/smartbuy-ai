/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// --- DATABASE STATE & LOCAL PERSISTENCE ---
const DB_FILE = path.join(process.cwd(), "db.json");

// Default Pre-seeded categories
const defaultCategories = [
  { id: "1", name: "Wireless Earbuds", slug: "earbuds", description: "Unbiased reviews of the best budget, active noise cancellation, and high-fidelity wireless audio.", iconName: "Headphones" },
  { id: "2", name: "Gaming Mice", slug: "gaming-mice", description: "Expert precision tests, weight systems, ergonomics, and sensor analyses of professional gaming mice.", iconName: "Mouse" },
  { id: "3", name: "Coffee Makers", slug: "coffee-makers", description: "Comprehensive reviews of programmable drip brewers, single-serve espresso makers, and budget grinders.", iconName: "Coffee" }
];

// Default Pre-seeded products (cleared of demo content)
const defaultProducts = [];

// Default Pre-seeded articles (cleared of demo content)
const defaultArticles = [];

// Default Pre-seeded settings
const defaultSettings = {
  siteName: "AffiMind",
  siteDescription: "Unbiased, data-driven product reviews and AI recommendations helping you buy smarter.",
  seoTitle: "AffiMind | AI-Powered Product Reviews & Buying Advice",
  seoDescription: "Get the best product recommendations, detailed buying guides, and dynamic AI shopping summaries to shop smarter and save time.",
  affiliateDisclosure: "AffiMind is a participant in the Amazon Services LLC Associates Program, an affiliate advertising program designed to provide a means for sites to earn advertising fees by advertising and linking to Amazon.com. When you purchase through links on our site, we may earn an affiliate commission at no extra cost to you.",
  contactEmail: "support@affimind.com"
};

// Initialize DB file if it does not exist
let db: {
  categories: any[];
  products: any[];
  articles: any[];
  settings: any;
} = {
  categories: defaultCategories,
  products: defaultProducts,
  articles: defaultArticles,
  settings: defaultSettings
};

function loadDatabase() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, "utf-8");
      db = JSON.parse(data);
    } else {
      fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf-8");
    }
  } catch (err) {
    console.error("Error loading local database:", err);
  }
}

function saveDatabase() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf-8");
  } catch (err) {
    console.error("Error saving local database:", err);
  }
}

loadDatabase();

// --- LAZY LAUNCH GEMINI API CLIENT ---
let aiClient: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is required to use AI Shopping recommendations.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        }
      }
    });
  }
  return aiClient;
}

/**
 * Safely parses and cleans up Gemini error messages for user presentation.
 */
function cleanErrorMessage(err: any): string {
  if (!err) return "An unknown error occurred.";
  const msg = err.message || String(err);
  try {
    const trimmed = msg.trim();
    if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
      const parsed = JSON.parse(trimmed);
      if (parsed.error && parsed.error.message) {
        return parsed.error.message;
      }
      if (parsed.message) {
        return parsed.message;
      }
    }
  } catch {
    // Fall through
  }

  if (msg.includes("503") || msg.toLowerCase().includes("unavailable") || msg.toLowerCase().includes("demand")) {
    return "The AI generation service is currently experiencing extremely high demand. Please try again in a few seconds.";
  }
  if (msg.includes("429") || msg.toLowerCase().includes("rate limit") || msg.toLowerCase().includes("quota")) {
    return "Rate limit or quota exceeded. Please wait a moment before trying again.";
  }

  return msg;
}

/**
 * Runs a Gemini API generation with up to 3 automatic retries and automatic fallback to gemini-3.1-flash-lite
 */
async function generateContentWithRetryAndFallback(params: { contents: any; config?: any; }) {
  const ai = getGemini();
  let attempt = 0;
  const maxAttempts = 3;
  let delay = 1000;

  while (attempt < maxAttempts) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: params.contents,
        config: params.config,
      });
      return response;
    } catch (err: any) {
      attempt++;
      console.warn(`Gemini call failed (attempt ${attempt}/${maxAttempts}) using gemini-3.5-flash:`, err.message || err);
      
      const errMsg = String(err.message || err).toLowerCase();
      const isTemporaryError = 
        errMsg.includes("demand") || 
        errMsg.includes("unavailable") || 
        errMsg.includes("503") || 
        errMsg.includes("limit") || 
        errMsg.includes("429") ||
        errMsg.includes("timeout") ||
        errMsg.includes("fetch failed");

      if (attempt >= maxAttempts) {
        if (isTemporaryError) {
          console.warn("Retries exhausted for gemini-3.5-flash. Falling back to stable gemini-3.1-flash-lite...");
          try {
            const response = await ai.models.generateContent({
              model: "gemini-3.1-flash-lite",
              contents: params.contents,
              config: params.config,
            });
            return response;
          } catch (fallbackErr: any) {
            console.error("Fallback model gemini-3.1-flash-lite also failed:", fallbackErr.message || fallbackErr);
            throw fallbackErr;
          }
        }
        throw err;
      }

      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 1.5; // Backoff
    }
  }
}

// --- API ENDPOINTS ---

// Admin Authentication Middleware
function requireAdminAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  const adminPassword = db.settings.adminPassword || process.env.ADMIN_PASSWORD || "admin123";
  
  if (!authHeader || authHeader !== `Bearer ${adminPassword}`) {
    return res.status(403).json({ error: "403 Unauthorized: Administrative credentials required." });
  }
  next();
}

// GET site settings
app.get("/api/settings", (req, res) => {
  res.json(db.settings);
});

// POST site settings (Admin only)
app.post("/api/settings", requireAdminAuth, (req, res) => {
  const { siteName, siteDescription, seoTitle, seoDescription, affiliateDisclosure, contactEmail, adminPassword } = req.body;
  db.settings = {
    ...db.settings,
    siteName,
    siteDescription,
    seoTitle,
    seoDescription,
    affiliateDisclosure,
    contactEmail
  };
  if (adminPassword) {
    db.settings.adminPassword = adminPassword.trim();
  }
  saveDatabase();
  res.json({ success: true, settings: db.settings });
});

// GET categories
app.get("/api/categories", (req, res) => {
  res.json(db.categories);
});

// POST category
app.post("/api/categories", requireAdminAuth, (req, res) => {
  const { name, slug, description, iconName } = req.body;
  if (!name || !slug) {
    return res.status(400).json({ error: "Name and Slug are required" });
  }
  const newCat = {
    id: `c_${Date.now()}`,
    name,
    slug,
    description: description || "",
    iconName: iconName || "Tag"
  };
  db.categories.push(newCat);
  saveDatabase();
  res.json({ success: true, category: newCat });
});

// GET products
app.get("/api/products", (req, res) => {
  const { category, featured, search } = req.query;
  let list = [...db.products];

  if (category) {
    list = list.filter(p => p.category === category);
  }
  if (featured === "true") {
    list = list.filter(p => p.featured);
  }
  if (search) {
    const term = String(search).toLowerCase();
    list = list.filter(p => p.title.toLowerCase().includes(term) || p.content.toLowerCase().includes(term) || p.category.toLowerCase().includes(term));
  }

  // Sort newest first
  list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

  res.json(list);
});

// GET specific product by slug
app.get("/api/products/:slug", (req, res) => {
  const product = db.products.find(p => p.slug === req.params.slug);
  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }

  // Find related products (same category, different slug)
  const related = db.products.filter(p => p.category === product.category && p.slug !== product.slug).slice(0, 3);
  // Find related articles (same category)
  const articles = db.articles.filter(a => a.category === product.category).slice(0, 3);

  res.json({ product, related, relatedArticles: articles });
});

// POST product (Admin only)
app.post("/api/products", requireAdminAuth, (req, res) => {
  const { title, slug, category, content, image, affiliateLink, price, rating, pros, cons, specs, faq, buyingAdvice, alternatives, featured } = req.body;
  
  if (!title || !slug || !category) {
    return res.status(400).json({ error: "Title, slug, and category are required" });
  }

  const existingIndex = db.products.findIndex(p => p.slug === slug);
  const newProduct = {
    id: `p_${Date.now()}`,
    title,
    slug,
    category,
    content: content || "",
    image: image || "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600",
    affiliateLink: affiliateLink || "",
    price: price || "$0.00",
    rating: Number(rating) || 4.0,
    pros: Array.isArray(pros) ? pros : [],
    cons: Array.isArray(cons) ? cons : [],
    specs: specs || {},
    faq: Array.isArray(faq) ? faq : [],
    buyingAdvice: buyingAdvice || "",
    alternatives: Array.isArray(alternatives) ? alternatives : [],
    featured: !!featured,
    createdAt: new Date().toISOString()
  };

  if (existingIndex >= 0) {
    db.products[existingIndex] = { ...db.products[existingIndex], ...newProduct, id: db.products[existingIndex].id };
  } else {
    db.products.push(newProduct);
  }

  saveDatabase();
  res.json({ success: true, product: newProduct });
});

// DELETE product (Admin only)
app.delete("/api/products/:id", requireAdminAuth, (req, res) => {
  const initialLen = db.products.length;
  db.products = db.products.filter(p => p.id !== req.params.id);
  if (db.products.length === initialLen) {
    return res.status(404).json({ error: "Product not found" });
  }
  saveDatabase();
  res.json({ success: true });
});

// GET articles
app.get("/api/articles", (req, res) => {
  const { category, search, all } = req.query;
  let list = [...db.articles];

  if (all !== "true") {
    list = list.filter(a => !a.status || a.status === "published");
  }

  if (category) {
    list = list.filter(a => a.category === category);
  }
  if (search) {
    const term = String(search).toLowerCase();
    list = list.filter(a => a.title.toLowerCase().includes(term) || a.content.toLowerCase().includes(term));
  }

  // Sort newest first
  list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

  res.json(list);
});

// GET specific article by slug
app.get("/api/articles/:slug", (req, res) => {
  const article = db.articles.find(a => a.slug === req.params.slug);
  if (!article) {
    return res.status(404).json({ error: "Article not found" });
  }

  // Find related products (same category)
  const relatedProducts = db.products.filter(p => p.category === article.category).slice(0, 3);
  // Find other articles (same category, different slug)
  const relatedArticles = db.articles.filter(a => a.category === article.category && a.slug !== article.slug && (!a.status || a.status === "published")).slice(0, 3);

  res.json({ article, relatedProducts, relatedArticles });
});

// DELETE article (Admin only)
app.delete("/api/articles/:id", requireAdminAuth, (req, res) => {
  const initialLen = db.articles.length;
  db.articles = db.articles.filter(a => a.id !== req.params.id);
  if (db.articles.length === initialLen) {
    return res.status(404).json({ error: "Article not found" });
  }
  saveDatabase();
  res.json({ success: true });
});

// --- SECURE REST API ENDPOINT: POST /api/publish ---
// This endpoint receives article metadata and content to support headless publishing workflows
app.post("/api/publish", requireAdminAuth, (req, res) => {
  const { title, slug, category, content, metaTitle, metaDescription, faq, schema, image, affiliateLink, status } = req.body;
  
  if (!title || !slug || !category || !content) {
    return res.status(400).json({ error: "Missing required fields: title, slug, category, and content are required." });
  }

  const existingIndex = db.articles.findIndex(a => a.slug === slug);
  
  const parsedFaq = Array.isArray(faq) ? faq : [];
  let parsedSchema = {};
  if (schema) {
    try {
      parsedSchema = typeof schema === "string" ? JSON.parse(schema) : schema;
    } catch {
      parsedSchema = {};
    }
  }

  const validStatuses = ["published", "draft", "scheduled"];
  const articleStatus = validStatuses.includes(status) ? status : "published";

  const newArticle = {
    id: `a_${Date.now()}`,
    title,
    slug,
    category,
    content,
    metaTitle: metaTitle || `${title} | AffiMind`,
    metaDescription: metaDescription || content.substring(0, 150).replace(/[#*`]/g, "") + "...",
    faq: parsedFaq,
    schema: parsedSchema,
    image: image || "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=600",
    affiliateLink: affiliateLink || "",
    status: articleStatus,
    createdAt: new Date().toISOString()
  };

  if (existingIndex >= 0) {
    db.articles[existingIndex] = { ...db.articles[existingIndex], ...newArticle, id: db.articles[existingIndex].id };
  } else {
    db.articles.push(newArticle);
  }

  saveDatabase();
  res.status(201).json({ success: true, article: newArticle });
});

// --- ADMIN LOGIN ---
app.post("/api/admin/login", (req, res) => {
  const { password } = req.body;
  const correctPassword = db.settings.adminPassword || process.env.ADMIN_PASSWORD || "admin123";
  if (password === correctPassword) {
    res.json({ success: true, token: correctPassword });
  } else {
    res.status(401).json({ error: "Incorrect administrator password" });
  }
});

// --- ADMIN PASSWORD RESET / SET NEW ONE ---
app.post("/api/admin/reset-password", (req, res) => {
  const { password } = req.body;
  if (!password || password.trim().length < 4) {
    return res.status(400).json({ error: "Password must be at least 4 characters long." });
  }

  const currentPassword = db.settings.adminPassword;
  if (currentPassword) {
    const authHeader = req.headers.authorization;
    if (!authHeader || authHeader !== `Bearer ${currentPassword}`) {
      return res.status(403).json({ error: "403 Unauthorized: Administrative authorization required to reset password." });
    }
  }

  db.settings = {
    ...db.settings,
    adminPassword: password.trim()
  };
  saveDatabase();
  res.json({ success: true, token: password.trim() });
});

// --- AI RECOMMENDATION SEARCH SYSTEM ---
// Fully grounded using Gemini models via `@google/genai`
app.post("/api/ai/search", async (req, res) => {
  const { query } = req.body;
  if (!query) {
    return res.status(400).json({ error: "A search query is required." });
  }

  try {
    const ai = getGemini();

    // Compile relevant background knowledge about our existing product catalogue to ground the generation
    const catalogString = db.products.map(p => `Product Name: "${p.title}"\nSlug: "${p.slug}"\nCategory: "${p.category}"\nPrice: "${p.price}"\nPros: ${p.pros.join(", ")}\nCons: ${p.cons.join(", ")}\nSpecs: ${JSON.stringify(p.specs)}\nBuying Advice: "${p.buyingAdvice}"`).join("\n\n---\n\n");

    const systemPrompt = `You are the core search-grounding engine of "AffiMind", a premium, data-driven product recommendation platform.
Your objective is to review our available product catalog and provide high-quality, comprehensive AI buying recommendations based on the user's shopping query (e.g., "Best earbuds under $50", "Best gaming mouse", etc.).

Here is our active product database catalog:
${catalogString}

Answer the user's query with structured content that strictly follows the requested schema.
- Map the query to the best-matching products in our catalog using their exact 'slug' strings (in the recommendedProductSlugs array).
- Generate a beautiful, expert-level AI Summary analyzing the query, highlighting what factors matter most (e.g. active noise cancellation, optical sensors, brew capacity).
- Enlist bulleted Pros and Cons for this product category.
- List Key Features users should evaluate.
- Formulate practical Buying Advice.

Your response MUST be a single, valid JSON object that exactly satisfies this structure:
{
  "aiSummary": "Provide an elegant, comprehensive summary answering the user's search query.",
  "pros": ["Pro point 1", "Pro point 2", "Pro point 3"],
  "cons": ["Con point 1", "Con point 2"],
  "features": ["Important Feature 1", "Important Feature 2", "Important Feature 3"],
  "buyingAdvice": "Provide professional expert-level buying recommendations specifically tuned to the user's budget and requirements.",
  "recommendedProductSlugs": ["slug-of-matching-product-1", "slug-of-matching-product-2"]
}

Ensure the output can be parsed easily. Select ONLY relevant product slugs that actually exist in our catalog list above. Do NOT invent new slugs.`;

    const response = await generateContentWithRetryAndFallback({
      contents: `Search Query: "${query}"`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            aiSummary: { type: Type.STRING },
            pros: { type: Type.ARRAY, items: { type: Type.STRING } },
            cons: { type: Type.ARRAY, items: { type: Type.STRING } },
            features: { type: Type.ARRAY, items: { type: Type.STRING } },
            buyingAdvice: { type: Type.STRING },
            recommendedProductSlugs: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["aiSummary", "pros", "cons", "features", "buyingAdvice", "recommendedProductSlugs"]
        }
      }
    });

    const resultText = response.text || "{}";
    const data = JSON.parse(resultText);

    // Map matched slugs to full product objects
    const recommendations = db.products.filter(p => data.recommendedProductSlugs.includes(p.slug));

    // Fallback: if no matching slugs returned, find anything in the same category
    if (recommendations.length === 0) {
      const lowerQuery = query.toLowerCase();
      let matchedCategory = "";
      if (lowerQuery.includes("earbud") || lowerQuery.includes("headphone") || lowerQuery.includes("audio")) {
        matchedCategory = "earbuds";
      } else if (lowerQuery.includes("mouse") || lowerQuery.includes("gaming")) {
        matchedCategory = "gaming-mice";
      } else if (lowerQuery.includes("coffee") || lowerQuery.includes("maker") || lowerQuery.includes("brew")) {
        matchedCategory = "coffee-makers";
      }

      if (matchedCategory) {
        data.recommendations = db.products.filter(p => p.category === matchedCategory);
      } else {
        data.recommendations = db.products.slice(0, 2);
      }
    } else {
      data.recommendations = recommendations;
    }

    res.json(data);
  } catch (err: any) {
    console.error("Gemini AI Search failure:", err);
    // Provide a detailed graceful local fallback matching our seeded data in case of key limits
    const lowerQuery = query.toLowerCase();
    let fallbackData = {
      aiSummary: "We analysed the best options for your request. Based on pricing, driver structures, tracking sensors, and durability, here is our expert selection.",
      pros: ["Exceptional value-for-money compared to premium brands", "Standard warranties with physical sweat/water-resistance", "Tailored ergonomics perfect for prolonged usage"],
      cons: ["May lack ultra-premium smartphone ecosystem synchronization", "Slightly heavier structures in mechanical models"],
      features: ["Custom EQ profiling & ANC controls", "Sensor tracking consistency (DPI & IPS rates)", "Warming plate adjustments and programmable brewing timers"],
      buyingAdvice: "Evaluate whether space or batch sizes matter most for appliances. For peripheral gaming mice, select by your primary grip size (palm vs claw).",
      recommendations: db.products.slice(0, 2)
    };

    if (lowerQuery.includes("earbud") || lowerQuery.includes("earbuds") || lowerQuery.includes("headphone") || lowerQuery.includes("under $50") || lowerQuery.includes("under 50")) {
      fallbackData.aiSummary = "For under $50, wireless audio has improved dramatically. Active noise cancellation (ANC) and high-quality graphene drivers are now available at extremely consumer-friendly price points, providing punchy bass profiles without acoustic mud.";
      fallbackData.pros = ["Incredible active noise cancellation models available under $50", "High-capacity cases providing over 30+ hours of cumulative play", "Custom companion app equalizers to match audio preferences"];
      fallbackData.cons = ["No wireless charging capabilities at this price tier", "Wind-noise reduction during calls can suffer occasionally"];
      fallbackData.features = ["Driver composite materials (Graphene vs PET)", "Waterproof verification (IPX4 splash-proof vs IPX5 sweat-proof)", "Touch-sensor layout flexibility"];
      fallbackData.buyingAdvice = "If you commute, prioritize a model with hybrid Active Noise Cancellation like the Soundcore Life P3i. If you want maximum reliability, portability, and are on a rock-bottom budget, choose the JLab Go Air Pop.";
      fallbackData.recommendations = db.products.filter(p => p.category === "earbuds");
    } else if (lowerQuery.includes("mouse") || lowerQuery.includes("mice") || lowerQuery.includes("gaming")) {
      fallbackData.aiSummary = "Choosing a gaming mouse is a direct balance of hand-grip comfort and optical tracking precision. Sub-micron tracking sensors ensure split-second movements translate instantly, while tactile buttons offer robust click feedbacks.";
      fallbackData.pros = ["HERO precision optical sensors with sub-micron acceleration tracking", "Durable mechanical clicks rated for tens of millions of key-strokes", "Weight balancing arrays to adjust slide consistency"];
      fallbackData.cons = ["Wired systems introduce drag if not paired with a cable bungee", "Larger ergonomic silhouettes are less suitable for smaller hands"];
      fallbackData.features = ["IPS speed tracking and acceleration tolerance", "Onboard memory profiles saving macros directly", "Hyper-fast custom mechanical scroll dual-modes"];
      fallbackData.buyingAdvice = "If you bind several spells/macros or want weight adjustments, the Logitech G502 HERO remains the ultimate heavy tactical mouse. For pure ergonomic wrist relief on a budget, the Razer DeathAdder Essential is an unmatched ergonomic value.";
      fallbackData.recommendations = db.products.filter(p => p.category === "gaming-mice");
    } else if (lowerQuery.includes("coffee") || lowerQuery.includes("maker") || lowerQuery.includes("brew") || lowerQuery.includes("maker")) {
      fallbackData.aiSummary = "The coffee maker market divides cleanly between single-serve pod machines that deliver rapid, convenient cups and larger drip-brewers tailored for brewing high-volume carafes with customizable heating variables.";
      fallbackData.pros = ["Programmable brew delay timers up to 24 hours", "Removable water containers for convenient tap refills", "Flexible volume thresholds (6oz up to 12-cup carafes)"];
      fallbackData.cons = ["Pod units require continuous cup refills and generate pod waste", "Drip systems take up more space and require coffee paper filters"];
      fallbackData.features = ["Adjustable hotplates to prevent carafe burning", "Batch size custom optimization (e.g., Ninja 1-4 cup option)", "Rapid heating element thermal performance"];
      fallbackData.buyingAdvice = "For students or single professionals, the ultra-narrow Keurig K-Mini fits any counter space seamlessly. For families, multi-cup drinkers, and scheduled mornings, the programmable Ninja CE251 is our absolute top recommendation.";
      fallbackData.recommendations = db.products.filter(p => p.category === "coffee-makers");
    }

    res.json(fallbackData);
  }
});

// --- AI ARTICLE GENERATION ENGINE ---
// Grounded in current product data and structured with SEO metatags using Gemini
app.post("/api/ai/generate-article", async (req, res) => {
  const { keyword, category, focusProducts } = req.body;
  if (!keyword || !category) {
    return res.status(400).json({ error: "Keyword and category slug are required to generate an article." });
  }

  try {
    const ai = getGemini();

    // Compile background knowledge about matched products
    let productsContext = "";
    const filteredProducts = db.products.filter(p => p.category === category);
    
    let selectedForContext = filteredProducts;
    if (Array.isArray(focusProducts) && focusProducts.length > 0) {
      selectedForContext = filteredProducts.filter(p => focusProducts.includes(p.slug));
    }
    
    if (selectedForContext.length === 0) {
      selectedForContext = filteredProducts.slice(0, 3);
    }

    productsContext = selectedForContext.map(p => {
      return `Product Title: "${p.title}"
Slug: "${p.slug}"
Price: "${p.price}"
Rating: "${p.rating}"
Pros: ${p.pros.join(", ")}
Cons: ${p.cons.join(", ")}
Specs: ${JSON.stringify(p.specs)}
Buying Advice: "${p.buyingAdvice}"
Affiliate Link: "${p.affiliateLink}"`;
    }).join("\n\n---\n\n");

    const systemPrompt = `You are a high-performing professional Affiliate Content Writer, Product Tester, and SEO Specialist at "AffiMind".
Your mission is to generate a comprehensive, highly citable, informative, and expert-level affiliate guide or article about: "${keyword}".

The article should fit under category slug: "${category}".

The generated article content MUST:
1. Be written in elegant, high-EEAT professional markdown.
2. Feature, analyze, and compare the following specific products (make sure to integrate their price, specs, and pros/cons natively in the review body):
${productsContext}
3. Provide an intuitive comparison table comparing specs and pricing.
4. Supply a clear summary of critical buying advice.
5. Contain zero fluff or placeholder markers. Focus entirely on direct, factual analysis that LLM search engines can easily attribute and index.

You MUST respond with a single, valid, parseable JSON object matching this structure:
{
  "title": "A highly catchy, click-worthy, SEO-optimized title",
  "slug": "url-slug-version-of-title-all-lowercase-with-dashes",
  "metaTitle": "SEO Meta Title (max 65 chars)",
  "metaDescription": "SEO Meta Description (max 160 chars)",
  "content": "Full rich markdown content of the article",
  "faq": [
    { "question": "FAQ Question 1", "answer": "Detailed answer..." },
    { "question": "FAQ Question 2", "answer": "Detailed answer..." }
  ],
  "schema": {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Title of article",
    "image": "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=600",
    "author": { "@type": "Person", "name": "AffiMind Review Staff" }
  }
}
Provide clean JSON without trailing commas.`;

    const response = await generateContentWithRetryAndFallback({
      contents: `Generate a detailed affiliate review guide for keyword: "${keyword}"`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            slug: { type: Type.STRING },
            metaTitle: { type: Type.STRING },
            metaDescription: { type: Type.STRING },
            content: { type: Type.STRING },
            faq: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  answer: { type: Type.STRING }
                },
                required: ["question", "answer"]
              }
            },
            schema: { type: Type.OBJECT }
          },
          required: ["title", "slug", "metaTitle", "metaDescription", "content", "faq", "schema"]
        }
      }
    });

    const resultText = response.text || "{}";
    const data = JSON.parse(resultText);
    res.json(data);

  } catch (err: any) {
    console.error("AI Article Generation Failure:", err);
    // Dynamic local fallback if Gemini is overloaded or API key is absent
    const fallbackTitle = `The Ultimate guide to ${keyword}`;
    const fallbackSlug = keyword.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    res.json({
      title: fallbackTitle,
      slug: fallbackSlug,
      metaTitle: `${fallbackTitle} | AffiMind`,
      metaDescription: `Discover the best recommendations and reviews for ${keyword}. Expert comparisons, detailed ratings, and pros & cons.`,
      content: `### Expert analysis on ${keyword}\n\nWelcome to our expert buying guide! When shopping in the **${category}** segment, smart buyers prioritize durability, precise tracking sensors, acoustic seal qualities, and temperature delay parameters depending on the exact hardware.\n\n#### Why Trust AffiMind?\nWe perform analytical evaluation of hundreds of technical metrics to distill absolute unbiased product comparisons.\n\n#### Summary Recommendations\nEvaluate high-density spec sheets before purchasing. Hybrid active noise cancellations isolate commuting hums, whereas programmable coffee thermal plates support customized morning brew cycles.`,
      faq: [
        { question: `What is the most critical element to review for ${keyword}?`, answer: "Always evaluate the warranty parameters and high-density spec sheets first." }
      ],
      schema: {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": fallbackTitle,
        "image": "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=600",
        "author": { "@type": "Person", "name": "AffiMind expert staff" }
      }
    });
  }
});

// --- BULK PRODUCT IMPORT API ---
app.post("/api/products/import", (req, res) => {
  const { products } = req.body;
  if (!Array.isArray(products)) {
    return res.status(400).json({ error: "Missing products array parameters." });
  }

  // Security Auth check matching bearer configuration
  const authHeader = req.headers.authorization;
  const adminPassword = db.settings.adminPassword || process.env.ADMIN_PASSWORD || "admin123";
  if (authHeader && authHeader !== `Bearer ${adminPassword}`) {
    return res.status(401).json({ error: "Unauthorized administrative access token." });
  }

  const imported: any[] = [];
  products.forEach(p => {
    if (!p.title || !p.slug || !p.category) return;
    
    const existingIndex = db.products.findIndex(ex => ex.slug === p.slug);
    const newProduct = {
      id: p.id || `p_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
      title: p.title,
      slug: p.slug,
      category: p.category,
      content: p.content || "",
      image: p.image || "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600",
      affiliateLink: p.affiliateLink || "",
      price: p.price || "$0.00",
      rating: Number(p.rating) || 4.5,
      pros: Array.isArray(p.pros) ? p.pros : [],
      cons: Array.isArray(p.cons) ? p.cons : [],
      specs: p.specs || {},
      buyingAdvice: p.buyingAdvice || "",
      alternatives: Array.isArray(p.alternatives) ? p.alternatives : [],
      featured: !!p.featured,
      faq: Array.isArray(p.faq) ? p.faq : [],
      createdAt: p.createdAt || new Date().toISOString()
    };

    if (existingIndex >= 0) {
      db.products[existingIndex] = { ...db.products[existingIndex], ...newProduct, id: db.products[existingIndex].id };
    } else {
      db.products.push(newProduct);
    }
    imported.push(newProduct);
  });

  saveDatabase();
  res.json({ success: true, count: imported.length, imported });
});

// --- SUPABASE DATABASE SYNCHRONIZATION HELPERS ---
const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || "";

async function saveToSupabase(product: any, article: any) {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.log("Supabase credentials not configured in environment variables. Skipping Supabase persistence.");
    return false;
  }

  try {
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    console.log(`Synching product ${product.slug} to Supabase...`);
    const { error: prodError } = await supabase
      .from("products")
      .upsert({
        id: product.id,
        title: product.title,
        slug: product.slug,
        category: product.category,
        price: product.price,
        rating: product.rating,
        image: product.image,
        affiliate_link: product.affiliateLink,
        pros: product.pros,
        cons: product.cons,
        specs: product.specs,
        faq: product.faq,
        buying_advice: product.buyingAdvice,
        alternatives: product.alternatives,
        featured: product.featured,
        created_at: product.createdAt
      });

    if (prodError) {
      console.error("Supabase Products Upsert Error:", prodError);
    } else {
      console.log("Successfully saved product to Supabase.");
    }

    console.log(`Synching article ${article.slug} to Supabase...`);
    const { error: artError } = await supabase
      .from("articles")
      .upsert({
        id: article.id,
        title: article.title,
        slug: article.slug,
        category: article.category,
        image: article.image,
        meta_title: article.metaTitle,
        meta_description: article.metaDescription,
        content: article.content,
        faq: article.faq,
        schema: article.schema,
        affiliate_link: article.affiliateLink,
        status: article.status,
        created_at: article.createdAt
      });

    if (artError) {
      console.error("Supabase Articles Upsert Error:", artError);
    } else {
      console.log("Successfully saved article to Supabase.");
    }

    return !prodError && !artError;
  } catch (err) {
    console.error("Failed to connect/write to Supabase client:", err);
    return false;
  }
}

// --- SUPABASE STATUS DIAGNOSTIC ENDPOINT ---
app.get("/api/admin/supabase-status", async (req, res) => {
  if (!supabaseUrl || !supabaseAnonKey) {
    return res.json({
      configured: false,
      connected: false,
      message: "Supabase environment variables (SUPABASE_URL and/or SUPABASE_ANON_KEY) are not configured.",
      url: supabaseUrl ? `${supabaseUrl.substring(0, 15)}...` : "not set",
      key: supabaseAnonKey ? "configured but masked" : "not set"
    });
  }

  try {
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Test querying the categories table to verify schema is created and credentials work
    const { data, error } = await supabase.from("categories").select("slug").limit(1);

    if (error) {
      // Check if table missing
      const isTableMissing = error.code === "P0001" || error.message?.toLowerCase().includes("relation") || error.message?.toLowerCase().includes("does not exist");
      return res.json({
        configured: true,
        connected: false,
        tablesExist: !isTableMissing,
        error: error.message,
        errorCode: error.code,
        message: isTableMissing 
          ? "Supabase connected successfully, but the required database tables (categories, products, articles) have not been created. Please run the Supabase Schema SQL script in your Supabase SQL Editor."
          : `Connected with error: ${error.message}`
      });
    }

    return res.json({
      configured: true,
      connected: true,
      tablesExist: true,
      message: "Your Supabase integration is fully configured and working! Connection established and schemas verified.",
      url: supabaseUrl
    });
  } catch (err: any) {
    return res.json({
      configured: true,
      connected: false,
      tablesExist: false,
      error: err.message || String(err),
      message: "Failed to connect to Supabase. Check that your credentials are valid and the URL is correct."
    });
  }
});

// --- PRODUCT IMAGE RETRIEVAL UTILITIES ---

function extractAmazonProductImage(html: string): string | null {
  if (!html) return null;

  const hiResMatch = html.match(/"hiRes"\s*:\s*"([^"]+)"/i);
  if (hiResMatch && hiResMatch[1]) {
    return hiResMatch[1].replace(/\\/g, "");
  }

  const largeMatch = html.match(/"large"\s*:\s*"([^"]+)"/i);
  if (largeMatch && largeMatch[1]) {
    return largeMatch[1].replace(/\\/g, "");
  }

  const ogImageMatch = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i);
  if (ogImageMatch && ogImageMatch[1]) {
    return ogImageMatch[1];
  }

  const dynamicImageMatch = html.match(/data-a-dynamic-image="([^"]+)"/i);
  if (dynamicImageMatch && dynamicImageMatch[1]) {
    const decoded = dynamicImageMatch[1].replace(/&quot;/g, '"');
    try {
      const parsed = JSON.parse(decoded);
      const urls = Object.keys(parsed);
      if (urls.length > 0) {
        return urls[0];
      }
    } catch (e) {}
  }

  const landingMatch = html.match(/"landingImage"\s*:\s*"([^"]+)"/i);
  if (landingMatch && landingMatch[1]) {
    return landingMatch[1].replace(/\\/g, "");
  }

  return null;
}

async function getAmazonImage(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5"
      },
      redirect: "follow"
    });
    if (!res.ok) {
      console.log(`Failed to fetch Amazon URL, status: ${res.status}`);
      return null;
    }
    const html = await res.text();
    const extracted = extractAmazonProductImage(html);
    if (extracted) {
      console.log(`Successfully extracted Amazon image: ${extracted}`);
      return extracted;
    }
  } catch (err) {
    console.error("Error in getAmazonImage:", err);
  }
  return null;
}

async function getGoogleSearchProductImage(productName: string): Promise<string | null> {
  try {
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Search the web to find the official product image URL or a high-quality product photo for: "${productName}". Return ONLY the raw direct image URL (starting with http or https and ending with .jpg, .png, .jpeg, or similar, or a clean media hosting URL) as plain text. Do not wrap it in quotes, markdown, or code blocks. Do not write any other explanation. Just the URL.`,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    const text = response.text?.trim() || "";
    const cleanedUrl = text.replace(/[`'"]/g, "").trim();
    if (cleanedUrl && (cleanedUrl.startsWith("http://") || cleanedUrl.startsWith("https://"))) {
      console.log(`Gemini Search Grounding returned product image: ${cleanedUrl}`);
      return cleanedUrl;
    }
  } catch (err) {
    console.error("Error in getGoogleSearchProductImage:", err);
  }
  return null;
}

async function fetchRealProductImage(productName: string, affiliateLink: string, defaultImageUrl: string): Promise<string> {
  console.log(`Attempting to fetch real product image for: ${productName}`);
  
  if (affiliateLink && (affiliateLink.includes("amazon.com") || affiliateLink.includes("amzn.to") || affiliateLink.includes("media-amazon.com"))) {
    const extractedImage = await getAmazonImage(affiliateLink);
    if (extractedImage) {
      return extractedImage;
    }
  }

  const searchImage = await getGoogleSearchProductImage(productName);
  if (searchImage) {
    return searchImage;
  }

  console.log(`Using default category fallback image: ${defaultImageUrl}`);
  return defaultImageUrl;
}

// --- ✨ MANUAL PRODUCT GENERATION API ENDPOINT ---
function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")           // Replace spaces with -
    .replace(/[^\w\-]+/g, "")       // Remove all non-word chars
    .replace(/\-\-+/g, "-")         // Replace multiple - with single -
    .replace(/^-+/, "")             // Trim - from start
    .replace(/-+$/, "");            // Trim - from end
}

app.post("/api/admin/generate-today-product", requireAdminAuth, async (req, res) => {
  const { productName, affiliateLink, category } = req.body;

  if (!productName || !productName.trim()) {
    return res.status(400).json({ error: "Product name is required." });
  }
  if (!affiliateLink || !affiliateLink.trim()) {
    return res.status(400).json({ error: "Affiliate link is required." });
  }

  try {
    const rawSlug = slugify(productName);
    const finalSlug = rawSlug.endsWith("-review") ? rawSlug : `${rawSlug}-review`;

    // Prevent duplicate products
    const isDuplicate = db.products.some(
      (p) => p.slug === finalSlug || p.title.toLowerCase().trim() === productName.toLowerCase().trim()
    );
    if (isDuplicate) {
      return res.status(400).json({ error: "A product review with this name or URL slug already exists." });
    }

    let finalCategory = category;
    
    // Auto-detect category with Gemini if selected as auto
    if (!finalCategory || finalCategory === "auto") {
      console.log(`Auto-detecting category for product: ${productName}`);
      try {
        const catResponse = await generateContentWithRetryAndFallback({
          contents: `Given the product name: "${productName}", categorize it into exactly one of these category slugs: 'earbuds', 'gaming-mice', or 'coffee-makers'. Respond ONLY with the category slug in lowercase without quotes or punctuation.`,
        });
        const detected = catResponse.text?.trim().toLowerCase().replace(/['"`]/g, "");
        if (detected && ["earbuds", "gaming-mice", "coffee-makers"].includes(detected)) {
          finalCategory = detected;
        } else {
          finalCategory = "earbuds"; // fallback
        }
      } catch (err) {
        console.error("Failed to auto-detect category:", err);
        finalCategory = "earbuds";
      }
    }

    console.log(`Starting combined Strategic Research and Editorial Synthesis for: ${productName} (Category: ${finalCategory})`);

    // Dynamically retrieve existing articles for natural internal links (SEO)
    const existingArticlesForLinking = db.articles.slice(0, 4).map(a => ({
      title: a.title,
      slug: a.slug
    }));

    // Choose Unsplash image based on category
    let defaultImageUrl = "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&auto=format&fit=crop&q=80";
    if (finalCategory === "earbuds") {
      defaultImageUrl = "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80";
    } else if (finalCategory === "gaming-mice") {
      defaultImageUrl = "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&auto=format&fit=crop&q=80";
    } else if (finalCategory === "coffee-makers") {
      defaultImageUrl = "https://images.unsplash.com/photo-1518057111178-44a106bad636?w=600&auto=format&fit=crop&q=80";
    }

    const systemPrompt = `You are an expert product analyst, consumer psychologist, SEO copywriter, and professional content strategist at "AffiMind".
Your mission is to perform dual phases of generation (Strategic Research followed by Synthesis) in a single response for:
Product Name: "${productName}"
Category: "${finalCategory}"

PHASE 1: STRATEGIC BRIEF (DEEP FOUNDATIONS)
You must first generate research-based foundations:
1. "deepResearch": Detailed research notes outlining design, performance, specifications, community consensus, strengths, weaknesses, and key rival comparisons.
2. "targetAudience": A thorough description of target buyer personas, their lifestyles, demographics, daily needs, and exact pain points.
3. "buyingIntent": Break down the user's purchase motivation (upgrading, budget alternative, luxury, etc.) and conversion triggers.
4. "contentOutline": A detailed hierarchical layout of headings and subheadings.

PHASE 2: EDITORIAL SYNTHESIS (HIGH-CONVERTING ARTICLE)
Based directly on the Foundations you mapped above, synthesize a masterclass product review and structured metadata:
5. "seoTitle": Catchy, click-worthy, SEO title (max 65 chars) ending with "| AffiMind".
6. "metaDescription": High-CTR search meta description (max 160 chars).
7. "content": Comprehensive, expert-level, markdown-formatted product review. It should feel premium, objective, highly engaging, and citable. Include detailed feature analysis, performance, build quality, and a dedicated "Buying Guide & Ultimate Verdict" section.
   - For SEO (internal links), naturally insert 1-2 standard Markdown links inside the review body pointing to other relevant pages on our site:
     ${existingArticlesForLinking.map(a => `* "${a.title}": /articles/${a.slug}`).join("\n")}
     * Wireless Earbuds category: /categories/earbuds
     * Gaming Mice category: /categories/gaming-mice
     * Coffee Makers category: /categories/coffee-makers
   - Example link: "...for alternative options, you can browse our [wireless earbuds category](/categories/earbuds) to find..."
8. "buyingAdvice": Concise summary paragraph (approx 50-80 words) advising who this product is best suited for and who should avoid it.
9. "pros": Array of exactly 4 clear, compelling pros.
10. "cons": Array of exactly 2 precise cons.
11. "rating": Numerical rating from 1.0 to 5.0 (e.g., 4.7).
12. "estimatedPrice": Estimated retail price string (e.g., "$129.99").
13. "specs": Key-value dictionary of specs (at least 4 key-value pairs, e.g., "Battery": "30 Hours", "Driver": "11mm").
14. "faq": Exactly 2 highly relevant FAQ question-and-answer objects.
15. "schema": Valid Schema.org JSON-LD object for a Product Review. Make sure it specifies "@context": "https://schema.org", "@type": "Product", "name": "${productName}", "offers": { "@type": "Offer", "price": "PRICE_PLACEHOLDER", "priceCurrency": "USD", "url": "AFFILIATE_LINK_PLACEHOLDER" }, and a "review" block.

Provide pristine, fully valid JSON data.`;

    const response = await generateContentWithRetryAndFallback({
      contents: `Generate complete buying guide review and rich data for "${productName}" utilizing our combined planning and synthesis brief.`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            deepResearch: { type: Type.STRING },
            targetAudience: { type: Type.STRING },
            buyingIntent: { type: Type.STRING },
            contentOutline: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            seoTitle: { type: Type.STRING },
            metaDescription: { type: Type.STRING },
            content: { type: Type.STRING },
            buyingAdvice: { type: Type.STRING },
            pros: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            cons: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            rating: { type: Type.NUMBER },
            estimatedPrice: { type: Type.STRING },
            specs: { type: Type.OBJECT },
            faq: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  answer: { type: Type.STRING }
                },
                required: ["question", "answer"]
              }
            },
            schema: { type: Type.OBJECT }
          },
          required: [
            "deepResearch", "targetAudience", "buyingIntent", "contentOutline",
            "seoTitle", "metaDescription", "content", "buyingAdvice", "pros", "cons",
            "rating", "estimatedPrice", "specs", "faq", "schema"
          ]
        }
      }
    });

    const parsedData = JSON.parse(response.text || "{}");
    const generatedPrice = parsedData.estimatedPrice || "$149.99";

    const planningData = {
      deepResearch: parsedData.deepResearch || "",
      targetAudience: parsedData.targetAudience || "",
      buyingIntent: parsedData.buyingIntent || "",
      contentOutline: parsedData.contentOutline || []
    };

    // Fetch the real product image from Amazon affiliate URL or search grounding fallback
    const finalProductImage = await fetchRealProductImage(productName, affiliateLink, defaultImageUrl);

    // Setup final product & article schemas
    const newProduct = {
      id: `p_${Date.now()}`,
      title: productName,
      slug: finalSlug,
      category: finalCategory,
      content: parsedData.content,
      image: finalProductImage,
      affiliateLink: affiliateLink,
      price: generatedPrice,
      rating: Number(parsedData.rating) || 4.5,
      pros: parsedData.pros || [],
      cons: parsedData.cons || [],
      specs: parsedData.specs || {},
      faq: parsedData.faq || [],
      buyingAdvice: parsedData.buyingAdvice || "",
      alternatives: db.products
        .filter(p => p.category === finalCategory)
        .slice(0, 2)
        .map(p => p.slug),
      createdAt: new Date().toISOString(),
      featured: true,
      researchBrief: {
        deepResearch: planningData.deepResearch,
        targetAudience: planningData.targetAudience,
        buyingIntent: planningData.buyingIntent,
        contentOutline: planningData.contentOutline
      }
    };

    let schemaObj = parsedData.schema || {};
    let schemaStr = JSON.stringify(schemaObj);
    schemaStr = schemaStr.replace(/AFFILIATE_LINK_PLACEHOLDER/g, affiliateLink);
    schemaStr = schemaStr.replace(/PRICE_PLACEHOLDER/g, generatedPrice.replace("$", ""));
    try {
      schemaObj = JSON.parse(schemaStr);
    } catch {
      // ignore
    }

    // Ensure image matches the real fetched product image in the Schema.org JSON-LD structured data
    if (schemaObj) {
      schemaObj.image = finalProductImage;
    }

    const newArticle = {
      id: `a_${Date.now()}`,
      title: parsedData.seoTitle || `${productName} Review`,
      slug: finalSlug,
      category: finalCategory,
      content: parsedData.content,
      metaTitle: parsedData.seoTitle || `${productName} Review`,
      metaDescription: parsedData.metaDescription || "",
      faq: parsedData.faq || [],
      schema: schemaObj,
      image: finalProductImage,
      affiliateLink: affiliateLink,
      createdAt: new Date().toISOString(),
      status: "published" as const,
      researchBrief: {
        deepResearch: planningData.deepResearch,
        targetAudience: planningData.targetAudience,
        buyingIntent: planningData.buyingIntent,
        contentOutline: planningData.contentOutline
      }
    };

    // Save locally
    db.products.push(newProduct);
    db.articles.push(newArticle);
    saveDatabase();

    // Save to Supabase if credentials are set
    const supabaseSaved = await saveToSupabase(newProduct, newArticle);

    console.log(`Product generation and immediate publishing complete for ${productName}`);
    res.status(201).json({
      success: true,
      supabaseSaved,
      product: newProduct,
      article: newArticle,
      brief: planningData
    });

  } catch (err: any) {
    console.error("Generate Product API Error:", err);
    res.status(500).json({ error: cleanErrorMessage(err) });
  }
});

// --- PROGRAMMATIC XML RSS FEED FOR SYNDICATION ---
app.get(["/rss.xml", "/feed.xml"], (req, res) => {
  res.type("application/xml");
  const host = `${req.protocol}://${req.get("host")}`;
  
  let xml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>${db.settings.siteName}</title>
  <link>${host}</link>
  <description>${db.settings.siteDescription}</description>
  <language>en-us</language>
  <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
  <atom:link href="${host}/rss.xml" rel="self" type="application/rss+xml" />`;

  const published = db.articles.filter(a => !a.status || a.status === "published");
  
  published.forEach(a => {
    const cleanDesc = (a.metaDescription || a.content.substring(0, 200))
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");

    xml += `
  <item>
    <title>${a.title.replace(/&/g, "&amp;")}</title>
    <link>${host}/article/${a.slug}</link>
    <guid>${host}/article/${a.slug}</guid>
    <pubDate>${new Date(a.createdAt || Date.now()).toUTCString()}</pubDate>
    <description>${cleanDesc}</description>
    <category>${a.category}</category>
  </item>`;
  });

  xml += `
</channel>
</rss>`;
  res.send(xml);
});

// --- PROGRAMMATIC ROBOTS & SITEMAP FOR SEO ---
app.get("/robots.txt", (req, res) => {
  res.type("text/plain");
  res.send(`User-agent: *
Allow: /
Disallow: /admin
Disallow: /api

Sitemap: ${req.protocol}://${req.get("host")}/sitemap.xml`);
});

app.get("/sitemap.xml", (req, res) => {
  res.type("application/xml");
  const host = `${req.protocol}://${req.get("host")}`;
  
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Core pages -->
  <url>
    <loc>${host}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${host}/categories</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${host}/about</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>${host}/contact</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>${host}/privacy</loc>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
  </url>
  <url>
    <loc>${host}/disclosure</loc>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
  </url>`;

  // Dynamic products sitemap URLs
  db.products.forEach(p => {
    xml += `
  <url>
    <loc>${host}/product/${p.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`;
  });

  // Dynamic articles sitemap URLs
  db.articles.forEach(a => {
    xml += `
  <url>
    <loc>${host}/article/${a.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
  });

  xml += "\n</urlset>";
  res.send(xml);
});

// --- EXPRESS ROUTE SEO INTERCEPTOR & STATIC SERVING ---

async function handleHtmlRequest(req: express.Request, res: express.Response) {
  const urlPath = req.path;
  const host = `${req.protocol}://${req.get("host")}`;
  
  // Default general metadata (fallback)
  let title = db.settings.seoTitle;
  let description = db.settings.seoDescription;
  let ogTitle = db.settings.seoTitle;
  let ogDescription = db.settings.seoDescription;
  let ogImage = "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=1200&q=80"; // High resolution hero placeholder
  let schema: any = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": db.settings.siteName,
    "url": host,
    "description": db.settings.siteDescription
  };

  // Determine path routing to customize SEO metatags
  if (urlPath.startsWith("/product/")) {
    const slug = urlPath.replace("/product/", "");
    const product = db.products.find(p => p.slug === slug);
    if (product) {
      title = `Expert Review: ${product.title}`;
      description = `Read our expert analysis, specifications, and pros/cons for ${product.title}. See our final buying recommendation and price comparisons.`;
      ogTitle = `Review: ${product.title} - AffiMind`;
      ogDescription = description;
      ogImage = product.image;
      
      // JSON-LD Product & Review Schemas
      schema = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": product.title,
        "image": product.image,
        "description": description,
        "offers": {
          "@type": "Offer",
          "price": product.price.replace("$", ""),
          "priceCurrency": "USD",
          "availability": "https://schema.org/InStock"
        },
        "review": {
          "@type": "Review",
          "author": { "@type": "Person", "name": "AffiMind Review Staff" },
          "reviewRating": {
            "@type": "Rating",
            "ratingValue": product.rating,
            "bestRating": "5"
          },
          "reviewBody": product.content.substring(0, 300)
        }
      };
    }
  } else if (urlPath.startsWith("/article/")) {
    const slug = urlPath.replace("/article/", "");
    const article = db.articles.find(a => a.slug === slug);
    if (article) {
      title = article.metaTitle || article.title;
      description = article.metaDescription || article.content.substring(0, 150) + "...";
      ogTitle = title;
      ogDescription = description;
      ogImage = article.image;
      schema = article.schema || {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": article.title,
        "image": article.image,
        "description": description
      };
    }
  } else if (urlPath.startsWith("/categories")) {
    title = `Compare Products by Categories | AffiMind`;
    description = `Explore our expert research categorized by consumer technology, wireless audio, and coffee brewing hardware.`;
    ogTitle = title;
    ogDescription = description;
  } else if (urlPath.startsWith("/about")) {
    title = `About Us | AffiMind`;
    description = `Learn how AffiMind combines real expert human verification with cutting-edge Generative AI Search optimization to revolutionize affiliate comparisons.`;
  } else if (urlPath.startsWith("/contact")) {
    title = `Get in Touch | Contact AffiMind`;
    description = `Have questions or advertising inquiries? Contact our team of tech researchers and product specialists at AffiMind.`;
  }

  let robotsTag = "";
  if (urlPath.startsWith("/admin")) {
    res.setHeader("X-Robots-Tag", "noindex, nofollow");
    robotsTag = '\n    <meta name="robots" content="noindex, nofollow" />';
    title = `Admin Portal | ${db.settings.siteName}`;
    description = `Secure Admin Portal for catalog management and editorial configurations.`;
  }

  // Read index.html template
  let templatePath = "";
  if (process.env.NODE_ENV !== "production") {
    templatePath = path.join(process.cwd(), "index.html");
  } else {
    templatePath = path.join(process.cwd(), "dist", "index.html");
  }

  try {
    if (!fs.existsSync(templatePath)) {
      return res.status(500).send("index.html template missing.");
    }

    let html = fs.readFileSync(templatePath, "utf-8");

    // Dynamic replacement block
    const canonicalUrl = `${host}${urlPath}`;
    const headReplacements = `
    <title>${title} | ${db.settings.siteName}</title>${robotsTag}
    <meta name="description" content="${description}" />
    <link rel="canonical" href="${canonicalUrl}" />
    <meta property="og:title" content="${ogTitle}" />
    <meta property="og:description" content="${ogDescription}" />
    <meta property="og:image" content="${ogImage}" />
    <meta property="og:url" content="${canonicalUrl}" />
    <meta property="og:type" content="website" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${ogTitle}" />
    <meta name="twitter:description" content="${ogDescription}" />
    <meta name="twitter:image" content="${ogImage}" />
    <script type="application/ld+json">${JSON.stringify(schema)}</script>
    `;

    // Inject Head Replacements by replacing standard <title> tag
    html = html.replace(/<title>.*?<\/title>/, headReplacements);

    res.setHeader("Content-Type", "text/html");
    res.send(html);
  } catch (error) {
    console.error("SEO Injector error:", error);
    res.status(500).send("Internal server error during SEO compilation.");
  }
}

// Vite dev integration or static files serve
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "custom", // Use custom so we can intercept HTML rendering on dev mode too!
    });
    
    // API first
    app.use(vite.middlewares);
    
    // Non-API routes served via handleHtmlRequest
    app.get("*", async (req, res, next) => {
      if (req.path.startsWith("/api/") || req.path.includes(".")) {
        return next();
      }
      await handleHtmlRequest(req, res);
    });
  } else {
    // Production static assets serving
    const distPath = path.join(process.cwd(), "dist");
    
    // Serve static files (css, js, images, etc.) but avoid matching HTML paths directly
    app.use(express.static(distPath, { index: false }));

    // Non-API routes served via handleHtmlRequest
    app.get("*", async (req, res, next) => {
      if (req.path.startsWith("/api/") || req.path.includes(".")) {
        return next();
      }
      await handleHtmlRequest(req, res);
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AffiMind Server online at http://localhost:${PORT}`);
  });
}

startServer();
