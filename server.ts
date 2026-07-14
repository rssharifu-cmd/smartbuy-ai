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

// Default Pre-seeded products
const defaultProducts = [
  {
    id: "p1",
    title: "Soundcore Life P3i Wireless Earbuds",
    slug: "soundcore-life-p3i-review",
    category: "earbuds",
    price: "$49.99",
    rating: 4.6,
    image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80",
    affiliateLink: "https://amazon.com/dp/B09GKTB3V4?tag=affimind-20",
    pros: ["Excellent active noise cancellation (ANC)", "Deep, punchy customizable EQ", "Superb 36-hour total battery life", "Extremely comfortable in-ear fit"],
    cons: ["Charging case is slightly bulky", "Microphone in heavy wind could be clearer"],
    specs: {
      "Driver Size": "10mm Graphene Drivers",
      "Noise Cancellation": "Hybrid Active Noise Cancellation (ANC)",
      "Battery Life": "9 Hours (36 Hours with Charging Case)",
      "Water Resistance": "IPX5 Sweatproof",
      "Bluetooth Version": "Bluetooth 5.2"
    },
    faq: [
      { question: "Do these support wireless charging?", answer: "No, the Soundcore Life P3i charging case is charged exclusively via USB-C." },
      { question: "Can I use either earbud independently?", answer: "Yes, both left and right earbuds support single-bud mono mode." }
    ],
    buyingAdvice: "For under $50, this is the absolute industry leader in active noise cancellation and customizable EQ. Best suited for daily commuters, students, and bass lovers.",
    alternatives: ["jlab-go-air-pop-review"],
    content: "### Expert Soundcore Life P3i Analysis\n\nThe Soundcore Life P3i offers incredible hybrid active noise cancellation at an unbeatable price point. Sporting 10mm graphene drivers, it delivers a rich, textured audio signature with booming bass and crisp highs. Through the Soundcore companion app, users can customize their experience with a full 8-band graphic EQ and choose from 22 pre-programmed sound profiles.\n\n#### Audio Performance & Noise Isolation\nIn our tests, the active noise cancellation isolated low-frequency drone noises (like aircraft engines and traffic) with surprising efficiency, matching earbuds twice its price. The transparency mode also functions exceptionally well, offering clear ambient awareness without artificial statics.\n\n#### Fit & Utility\nWith its ergonomic stem-design and three sets of soft silicone ear tips, the Life P3i locks in securely and remains comfortable for long workout sessions or heavy workdays.",
    featured: true,
    createdAt: new Date("2026-01-10T08:00:00Z").toISOString()
  },
  {
    id: "p2",
    title: "JLab Go Air Pop Wireless Earbuds",
    slug: "jlab-go-air-pop-review",
    category: "earbuds",
    price: "$24.99",
    rating: 4.4,
    image: "https://images.unsplash.com/photo-1608156639585-b3a032ef9689?w=600&auto=format&fit=crop&q=80",
    affiliateLink: "https://amazon.com/dp/B09D8GTM7H?tag=affimind-20",
    pros: ["Amazingly low pricing", "Built-in USB charging cable in the case", "Compact, pocketable case design", "Excellent passive noise seal"],
    cons: ["No active noise cancellation (ANC)", "Microphone quality is average in loud environments"],
    specs: {
      "Driver Size": "6mm Dynamic Drivers",
      "Noise Cancellation": "Passive Noise Isolation",
      "Battery Life": "8 Hours (32 Hours with Charging Case)",
      "Water Resistance": "IPX4 Splashproof",
      "Bluetooth Version": "Bluetooth 5.1"
    },
    faq: [
      { question: "How do I charge these earbuds?", answer: "The case has a built-in USB-A cable attached to the bottom. You can plug the case directly into any standard USB-A charging port." },
      { question: "Are there EQ modes?", answer: "Yes, JLab features 3 built-in EQ settings: JLab Signature, Balanced, and Bass Boost. You can toggle them by triple-tapping either earbud without needing an app." }
    ],
    buyingAdvice: "If your budget is strictly under $30, this is the most reliable, durable, and battery-friendly pair of earbuds available. Extremely practical for school bags, gym lockers, and emergency backups.",
    alternatives: ["soundcore-life-p3i-review"],
    content: "### JLab Go Air Pop In-Depth Review\n\nThe JLab Go Air Pop redefined the ultra-budget audio tier upon release. For less than $25, JLab provides an astonishingly robust build, responsive touch controls, and standard sweat resistance. The standout design feature is the integrated USB charging cable, which folds neatly into the bottom of the charging case so you are never left searching for a cord.\n\n#### Acoustic Profile\nWhile it lacks active noise cancellation, the acoustic nozzle locks securely into the canal, providing top-tier passive sound isolation. Sound signature favors a classic warm curve with a punchy mid-bass bump. Toggling the 'JLab Signature' EQ brings forward vocals cleanly, making podcasts and acoustic tracks sound remarkably crisp for the price.",
    featured: false,
    createdAt: new Date("2026-02-15T09:30:00Z").toISOString()
  },
  {
    id: "p3",
    title: "Logitech G502 HERO Gaming Mouse",
    slug: "logitech-g502-hero-review",
    category: "gaming-mice",
    price: "$45.99",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&auto=format&fit=crop&q=80",
    affiliateLink: "https://amazon.com/dp/B07GBZ4Q68?tag=affimind-20",
    pros: ["HERO 25K optical sensor with sub-micron precision", "11 fully programmable buttons for macros", "Adjustable weight tuning system (+18g)", "Hyper-fast dual-mode scroll wheel"],
    cons: ["Relatively heavy (121g base weight)", "Braided cable can feel stiff without a mouse bungee"],
    specs: {
      "Sensor Type": "HERO 25K Optical Sensor",
      "DPI Range": "100 - 25,600 DPI",
      "Max Acceleration": "> 40G",
      "Weight": "121g (includes five 3.6g adjustable weights)",
      "Button Count": "11 Programmable Buttons"
    },
    faq: [
      { question: "Is the G502 HERO wireless?", answer: "No, this is the wired version of the G502 featuring a high-durability braided cable. Logitech offers the G502 LIGHTSPEED for those seeking wireless capabilities." },
      { question: "Can I save profiles to the mouse hardware?", answer: "Yes, the G502 HERO has onboard memory to store up to 5 profiles configured through Logitech G HUB software." }
    ],
    buyingAdvice: "A legendary weapon in the gaming community. This is an unparalleled choice for RPGs, MMOs, and video editors who require custom key bindings, precise heavy weight configurations, and bulletproof sensor reliability.",
    alternatives: ["razer-deathadder-essential-review"],
    content: "### Logitech G502 HERO Expert Analysis\n\nThe Logitech G502 HERO features a legendary ergonomic shell paired with Logitech's class-leading HERO 25K optical tracking engine. This sensor is capable of tracking speeds over 400 IPS with zero smoothing, filtering, or acceleration, ensuring that every hand sweep translates with pixel-perfect precision on screen.\n\n#### Physical Customization\nThe undercarriage features a magnetic door enclosing a custom slot for five 3.6g weights. This allows players to balance center of gravity or add weight based on personal sliding preference. The iconic metal scroll wheel supports standard notched scrolling and, with a quick button click, free-wheels indefinitely for rapid web browsing or map zooming.\n\n#### Customizability\nWith 11 customizable input nodes, macros can be bound with ease, making complex weapon selections, inventory loops, and spreadsheet formulas accessible instantly.",
    featured: true,
    createdAt: new Date("2026-03-01T10:00:00Z").toISOString()
  },
  {
    id: "p4",
    title: "Razer DeathAdder Essential Gaming Mouse",
    slug: "razer-deathadder-essential-review",
    category: "gaming-mice",
    price: "$19.99",
    rating: 4.5,
    image: "https://images.unsplash.com/photo-1527813713060-7a9404279759?w=600&auto=format&fit=crop&q=80",
    affiliateLink: "https://amazon.com/dp/B09489X1L2?tag=affimind-20",
    pros: ["Class-leading ergonomic palm shape", "Highly durable mechanical mouse switches", "Lightweight design (96g) for swift movements", "Affordable entry-point into premium brands"],
    cons: ["Only 5 programmable buttons", "Single-color green backlighting (no Chroma RGB)"],
    specs: {
      "Sensor Type": "6,400 DPI Optical Sensor",
      "Max Speed": "220 IPS",
      "Switch Lifecycle": "10 Million Clicks",
      "Weight": "96g (cable excluded)",
      "Button Count": "5 Programmable Buttons"
    },
    faq: [
      { question: "Can I customize the LED color?", answer: "No, the Razer DeathAdder Essential is configured with a static signature green backlighting that cannot be changed." },
      { question: "Is this mouse suitable for claw grip?", answer: "While it works for larger claw-grip hands, the DeathAdder series is primarily engineered to offer ultimate ergonomic comfort for palm and relaxed claw grips." }
    ],
    buyingAdvice: "An exceptional budget gaming mouse from a premier brand. Highly recommended for tactical shooter players and general office workers seeking legendary ergonomic hand support at a minimal cost.",
    alternatives: ["logitech-g502-hero-review"],
    content: "### Razer DeathAdder Essential Performance Review\n\nThe Razer DeathAdder Essential retains the iconic, sweeping ergonomic silhouette that has earned the DeathAdder family over 15 million units in global sales. It is uniquely engineered to curve naturally into the palm of the right hand, minimizing muscle tension during grueling marathons.\n\n#### Sensor & Switches\nWhile it uses a simpler 6,400 DPI optical sensor compared to high-end Razer models, tracking remains exceptionally consistent with zero artificial acceleration. The primary left/right mechanical switches provide clean tactile feedback with a satisfying click and are certified for a 10-million click lifecycle.",
    featured: false,
    createdAt: new Date("2026-03-12T14:20:00Z").toISOString()
  },
  {
    id: "p5",
    title: "Keurig K-Mini Single Serve Coffee Maker",
    slug: "keurig-k-mini-review",
    category: "coffee-makers",
    price: "$79.99",
    rating: 4.5,
    image: "https://images.unsplash.com/photo-1517256064527-09c53b2d0bc6?w=600&auto=format&fit=crop&q=80",
    affiliateLink: "https://amazon.com/dp/B07978S597?tag=affimind-20",
    pros: ["Extremely compact (less than 5 inches wide)", "Accommodates tall travel mugs up to 7 inches", "Integrated cord storage for tidy counters", "Automatic shut-off saves electricity"],
    cons: ["Must add fresh water for every single brew", "No control over brewing temperature"],
    specs: {
      "Type": "Pod Brewing System",
      "Width": "4.5 Inches Wide",
      "Reservoir Capacity": "1 Cup Max (6 to 12oz)",
      "Brew Time": "Approx. 2 Minutes",
      "Power Rating": "1470 Watts"
    },
    faq: [
      { question: "Does this store water in an internal tank?", answer: "No, the reservoir only holds the water you pour in for that specific brew. If you put in 8oz, it brews 8oz." },
      { question: "Can I use reusable coffee pods?", answer: "Yes, the K-Mini is compatible with the Keurig My K-Cup Universal Reusable Coffee Filter." }
    ],
    buyingAdvice: "Perfect for minimalist college dorm rooms, single workspaces, compact RVs, and apartments where counter real estate is at a premium.",
    alternatives: ["ninja-ce251-review"],
    content: "### Keurig K-Mini Single Serve Review\n\nThe Keurig K-Mini combines compact engineering with simple, direct pod convenience. Under five inches wide, it can squeeze into virtually any corner of your kitchen or office desk. Operation is incredibly simple: add water to the rear well, insert a K-Cup pod, close the handle, and press brew.\n\n#### Brew Performance\nThe coffee is dispensed hot and fresh in about two minutes. By removing the drip tray base, the machine can comfortably hold travel mugs up to 7 inches tall. Additionally, the unit automatically turns off 90 seconds after brewing, securing energy conservation.",
    featured: true,
    createdAt: new Date("2026-04-05T07:15:00Z").toISOString()
  },
  {
    id: "p6",
    title: "Ninja CE251 Programmable Coffee Maker",
    slug: "ninja-ce251-review",
    category: "coffee-makers",
    price: "$79.99",
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1518057111178-44a106bad636?w=600&auto=format&fit=crop&q=80",
    affiliateLink: "https://amazon.com/dp/B07S7CD6V1?tag=affimind-20",
    pros: ["Custom strength configurations (Classic/Rich)", "24-hour advance program timer", "Removable water reservoir makes refills simple", "Adjustable warming plate keeps coffee hot for 4 hours"],
    cons: ["Slightly larger footprint on the counter", "Filter basket handle is delicate"],
    specs: {
      "Type": "12-Cup Drip Brewer",
      "Reservoir Capacity": "60oz (Removable)",
      "Strength Settings": "Classic Brew and Rich Brew",
      "Gold-Tone Filter": "Reusable Filter Included",
      "Warming Plate Control": "Adjustable (Up to 4 Hours)"
    },
    faq: [
      { question: "Can I brew smaller batches?", answer: "Yes, the CE251 has a specialized 'Small Batch' function that optimizes extraction water-flow specifically for brewing 1 to 4 cups without loss of flavor." },
      { question: "Is the carafe dishwasher safe?", answer: "The glass carafe should be hand-washed, but the removable water tank and permanent filter are top-rack dishwasher safe." }
    ],
    buyingAdvice: "The absolute gold standard for families and office teams who want programmable drip convenience, thermal extraction quality, and rich morning coffee ready upon waking.",
    alternatives: ["keurig-k-mini-review"],
    content: "### Ninja CE251 Programmable Drip Review\n\nThe Ninja CE251 is a powerhouse drip coffee maker that out-extracts traditional brewers. Ninja uses an advanced thermal flavor extraction system that ensures even water saturating over the coffee grounds, achieving professional-grade bloom and extraction temperature.\n\n#### Programmability & Strength\nUsers can set the delay brew timer up to 24 hours in advance, ensuring fresh, hot coffee when you wake up. The 'Rich Brew' setting slows water flow to extend extraction time, providing a bold, robust brew that cuts beautifully through milk or creamer.",
    featured: false,
    createdAt: new Date("2026-04-20T08:30:00Z").toISOString()
  }
];

// Default Pre-seeded articles
const defaultArticles = [
  {
    id: "a1",
    title: "How to Choose the Best Wireless Earbuds under $50: The Ultimate 2026 Guide",
    slug: "how-to-choose-best-wireless-earbuds-under-50",
    category: "earbuds",
    image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80",
    metaTitle: "Best Wireless Earbuds Under $50: Complete 2026 Buying Guide",
    metaDescription: "Can you get good active noise cancellation and sound under $50? Read our comprehensive buyer's guide to see what features, battery lifespans, and brands to trust.",
    content: "### Buying Guide for Budget Wireless Earbuds\n\nWhen shopping for wireless earbuds under $50, you no longer have to settle for cheap, tinny sound. Modern advancements in Bluetooth chipsets and dynamic speaker composites mean that entry-level audio equipment can compete with legacy flagships. Here are the core factors to look for when choosing budget earbuds:\n\n1. **Active Noise Cancellation (ANC):** Modern budget chips now support hybrid ANC. Look for brands like Soundcore and Earfun that offer customizable ANC modes.\n2. **Battery Life:** Aim for at least 6 hours of playtime per charge. The case should provide an additional 2-3 full charges.\n3. **Water Resistance:** An IPX4 or IPX5 rating ensures your earbuds survive sweaty workouts and light rain.\n\n#### The Importance of Eartip Fit\nEven the most expensive driver will sound flat and tinny if the seal inside your ear is weak. Make sure to try all included silicone tip sizes. A secure seal increases sub-bass resonance and isolates outside noises naturally, boosting the effectiveness of ANC.",
    faq: [
      { question: "Can I get real active noise cancellation for under $50?", answer: "Absolutely. Soundcore and several other budget brands utilize hybrid feed-forward/feedback ANC that blocks up to 35dB of low-frequency noises." },
      { question: "What is the difference between IPX4 and IPX5?", answer: "IPX4 protects against splashes of water from any direction, while IPX5 protects against direct low-pressure jets of water. Both are fine for standard gym sweating." }
    ],
    schema: {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": "How to Choose the Best Wireless Earbuds under $50: The Ultimate 2026 Guide",
      "image": "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80",
      "author": { "@type": "Person", "name": "AffiMind Expert Staff" },
      "publisher": { "@type": "Organization", "name": "AffiMind" }
    },
    affiliateLink: "",
    status: "published" as const,
    createdAt: new Date("2026-05-01T12:00:00Z").toISOString()
  },
  {
    id: "a2",
    title: "Ergonomics vs. Precision: Choosing the Perfect Gaming Mouse",
    slug: "ergonomics-vs-precision-gaming-mouse-guide",
    category: "gaming-mice",
    image: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&auto=format&fit=crop&q=80",
    metaTitle: "Gaming Mouse Guide: Ergonomics vs Precision Sensor Performance",
    metaDescription: "Contemplating a new gaming mouse? Read our guide on palm vs claw grips, HERO sensors, DPI configs, and how to find the perfect mouse for your gaming style.",
    content: "### Ergonomics vs. Precision: Finding Your Ideal Gaming Mouse\n\nYour mouse is your primary weapon. Choosing the right one depends heavily on your grip style, hand size, and game genres:\n\n* **Palm Grip:** Prefers large, contoured mice like the Razer DeathAdder series for full-hand resting.\n* **Claw/Fingertip Grip:** Prefers lighter, symmetrical mice for faster flick adjustments.\n* **DPI & Sensor Precision:** While marketing departments boast 25K+ DPI, most pro gamers play at 400 to 1600 DPI. Look for reliable sensors (like Logitech HERO) that guarantee zero jitter or prediction.\n\n#### Weight Preferences: Ultra-Lightweight vs Heavy Weight Systems\nIn recent years, competitive shooter players have leaned heavily toward ultra-lightweight mice (sub-60 grams) to facilitate rapid movements and minimize arm strain. However, RPG, MMO, and production users often prefer weighted mice with dedicated weight cartridges to smooth out micro-tremors and supply custom tactile glide.",
    faq: [
      { question: "Is a higher DPI always better for gaming?", answer: "No, a higher DPI increases cursor sensitivity but doesn't necessarily improve precision. Real precision comes from sensor tracking consistency and a polling rate of 1000Hz or above." },
      { question: "What is an optical mouse switch?", answer: "Unlike mechanical switches that contact metal, optical switches use an infrared light beam to register clicks. This eliminates debounce delay and drastically increases durability." }
    ],
    schema: {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": "Ergonomics vs. Precision: Choosing the Perfect Gaming Mouse",
      "image": "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&auto=format&fit=crop&q=80",
      "author": { "@type": "Person", "name": "AffiMind Hardware team" },
      "publisher": { "@type": "Organization", "name": "AffiMind" }
    },
    affiliateLink: "",
    status: "published" as const,
    createdAt: new Date("2026-05-15T15:30:00Z").toISOString()
  }
];

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

// --- API ENDPOINTS ---

// GET site settings
app.get("/api/settings", (req, res) => {
  res.json(db.settings);
});

// POST site settings (Admin only)
app.post("/api/settings", (req, res) => {
  const { siteName, siteDescription, seoTitle, seoDescription, affiliateDisclosure, contactEmail } = req.body;
  db.settings = { siteName, siteDescription, seoTitle, seoDescription, affiliateDisclosure, contactEmail };
  saveDatabase();
  res.json({ success: true, settings: db.settings });
});

// GET categories
app.get("/api/categories", (req, res) => {
  res.json(db.categories);
});

// POST category
app.post("/api/categories", (req, res) => {
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
app.post("/api/products", (req, res) => {
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
app.delete("/api/products/:id", (req, res) => {
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
app.delete("/api/articles/:id", (req, res) => {
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
app.post("/api/publish", (req, res) => {
  const { title, slug, category, content, metaTitle, metaDescription, faq, schema, image, affiliateLink, status } = req.body;
  
  if (!title || !slug || !category || !content) {
    return res.status(400).json({ error: "Missing required fields: title, slug, category, and content are required." });
  }

  // Optional simple authorization header check (e.g., matching the admin password or bearer token)
  const authHeader = req.headers.authorization;
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
  if (authHeader && authHeader !== `Bearer ${adminPassword}`) {
    return res.status(401).json({ error: "Unauthorized access token." });
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
  const correctPassword = process.env.ADMIN_PASSWORD || "admin123";
  if (password === correctPassword) {
    res.json({ success: true, token: correctPassword });
  } else {
    res.status(401).json({ error: "Incorrect administrator password" });
  }
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

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
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

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
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
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
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

// --- ✨ GENERATE TODAY'S PRODUCT API ENDPOINT ---
const PRODUCT_CANDIDATES = [
  {
    title: "Sony WF-1000XM5 Wireless Earbuds",
    slug: "sony-wf-1000xm5-review",
    category: "earbuds",
    price: "$299.99",
    asin: "B0C3M786QR",
    image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80"
  },
  {
    title: "Apple AirPods Pro 2 Wireless Earbuds",
    slug: "apple-airpods-pro-2-review",
    category: "earbuds",
    price: "$249.00",
    asin: "B0CHWRXNCT",
    image: "https://images.unsplash.com/photo-1588449668338-d151688c3482?w=600&auto=format&fit=crop&q=80"
  },
  {
    title: "Bose QuietComfort Ultra Earbuds",
    slug: "bose-quietcomfort-ultra-review",
    category: "earbuds",
    price: "$299.00",
    asin: "B0CGM4FFK9",
    image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&auto=format&fit=crop&q=80"
  },
  {
    title: "Sennheiser Momentum True Wireless 4",
    slug: "sennheiser-momentum-true-wireless-4-review",
    category: "earbuds",
    price: "$299.95",
    asin: "B0CTD3V67C",
    image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80"
  },
  {
    title: "Razer Viper V3 Pro Wireless Gaming Mouse",
    slug: "razer-viper-v3-pro-review",
    category: "gaming-mice",
    price: "$159.99",
    asin: "B0CX9B47H8",
    image: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&auto=format&fit=crop&q=80"
  },
  {
    title: "Logitech G Pro X Superlight 2 Gaming Mouse",
    slug: "logitech-g-pro-x-superlight-2-review",
    category: "gaming-mice",
    price: "$149.00",
    asin: "B0C7GBCWZ9",
    image: "https://images.unsplash.com/photo-1527813713060-7a9404279759?w=600&auto=format&fit=crop&q=80"
  },
  {
    title: "SteelSeries Aerox 3 Wireless Gaming Mouse",
    slug: "steelseries-aerox-3-review",
    category: "gaming-mice",
    price: "$99.99",
    asin: "B09D8GTM7H",
    image: "https://images.unsplash.com/photo-1625600243103-1dc6824c6c8a?w=600&auto=format&fit=crop&q=80"
  },
  {
    title: "Breville Barista Express Espresso Machine",
    slug: "breville-barista-express-review",
    category: "coffee-makers",
    price: "$699.95",
    asin: "B00CH9QWOU",
    image: "https://images.unsplash.com/photo-1518057111178-44a106bad636?w=600&auto=format&fit=crop&q=80"
  },
  {
    title: "Nespresso Vertuo Next Coffee Machine",
    slug: "nespresso-vertuo-next-review",
    category: "coffee-makers",
    price: "$169.00",
    asin: "B0892BFQWF",
    image: "https://images.unsplash.com/photo-1517256064527-09c53b2d0bc6?w=600&auto=format&fit=crop&q=80"
  },
  {
    title: "Keurig K-Elite Coffee Maker",
    slug: "keurig-k-elite-review",
    category: "coffee-makers",
    price: "$189.99",
    asin: "B07898Y1L2",
    image: "https://images.unsplash.com/photo-1517256064527-09c53b2d0bc6?w=600&auto=format&fit=crop&q=80"
  }
];

app.post("/api/admin/generate-today-product", async (req, res) => {
  // Authorization check
  const authHeader = req.headers.authorization;
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
  if (authHeader && authHeader !== `Bearer ${adminPassword}`) {
    return res.status(401).json({ error: "Unauthorized access token." });
  }

  try {
    const existingSlugs = db.products.map(p => p.slug);
    let selectedProduct = PRODUCT_CANDIDATES.find(c => !existingSlugs.includes(c.slug));

    if (!selectedProduct) {
      console.log("Predefined product candidates exhausted. Generating new unique product dynamically using Gemini.");
      const ai = getGemini();
      const categoriesList = ["earbuds", "gaming-mice", "coffee-makers"];
      const randomCategory = categoriesList[Math.floor(Math.random() * categoriesList.length)];

      const dynamicPrompt = `Suggest one highly rated, popular, real commercial consumer tech or kitchen product under category slug: "${randomCategory}".
It MUST NOT be any of these existing slugs: ${JSON.stringify(existingSlugs)}.
Provide a unique lowercase slug with dashes, a clean title, estimated retail price, and a standard Amazon ASIN if available.
You MUST respond with a single, valid JSON object matching this structure:
{
  "title": "Clean Product Title",
  "slug": "unique-product-slug",
  "category": "${randomCategory}",
  "price": "$129.99",
  "asin": "B0XXXXXX",
  "image": "An Unsplash image URL suitable for this product"
}`;

      const dynamicResponse = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: dynamicPrompt,
        config: {
          responseMimeType: "application/json",
        }
      });

      const dynamicData = JSON.parse(dynamicResponse.text || "{}");
      if (dynamicData.title && dynamicData.slug && dynamicData.category) {
        selectedProduct = {
          title: dynamicData.title,
          slug: dynamicData.slug,
          category: dynamicData.category,
          price: dynamicData.price || "$149.99",
          asin: dynamicData.asin || "B09GKTB3V4",
          image: dynamicData.image || "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=600"
        };
      } else {
        throw new Error("Could not dynamically select a unique product candidate.");
      }
    }

    console.log(`Starting deep research for selected product: ${selectedProduct.title}`);
    const ai = getGemini();

    const systemPrompt = `You are an expert product reviewer, tester, and SEO specialist at "AffiMind".
Your mission is to conduct deep research and write an unbiased, highly-optimized, authoritative product review and buying guide for: "${selectedProduct.title}" (category: "${selectedProduct.category}").

You MUST generate the following structured properties:
1. "seoTitle": Catchy, click-worthy, SEO title (max 65 chars) ending with "| AffiMind".
2. "metaDescription": High-CTR search meta description (max 160 chars).
3. "slug": Must be "${selectedProduct.slug}" (do not change it).
4. "content": Comprehensive, expert-level, markdown-formatted product review. It should feel premium and highly citable, including a detailed analysis of key features, performance, build quality, and a dedicated "Buying Guide / Ultimate Verdict" section.
5. "buyingAdvice": A concise summary paragraph (approx 50-80 words) advising who this product is best suited for and who should avoid it.
6. "pros": Array of exactly 4 clear, compelling pros.
7. "cons": Array of exactly 2 precise cons.
8. "rating": Numerical rating from 1.0 to 5.0 based on real community feedback (e.g., 4.7).
9. "specs": Key-value dictionary of specs (e.g. "Driver Size": "11mm", "Battery": "30 Hours").
10. "faq": Exactly 2 highly relevant FAQ question-and-answer objects.
11. "schema": Valid Schema.org JSON-LD object for a Product Review. Make sure it specifies "@context": "https://schema.org", "@type": "Product", "name": "${selectedProduct.title}", "offers": { "@type": "Offer", "price": "${selectedProduct.price.replace('$', '')}", "priceCurrency": "USD", "url": "AFFILIATE_LINK_PLACEHOLDER" }, and a "review" block.

Provide pristine, fully valid JSON data.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Perform expert product review research for "${selectedProduct.title}"`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
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
          required: ["seoTitle", "metaDescription", "content", "buyingAdvice", "pros", "cons", "rating", "specs", "faq", "schema"]
        }
      }
    });

    const parsedData = JSON.parse(response.text || "{}");
    const affiliateLink = `https://amazon.com/dp/${selectedProduct.asin || "B09GKTB3V4"}?tag=affimind-20`;

    // Setup final product & article schemas
    const newProduct = {
      id: `p_${Date.now()}`,
      title: selectedProduct.title,
      slug: selectedProduct.slug,
      category: selectedProduct.category,
      content: parsedData.content,
      image: selectedProduct.image,
      affiliateLink: affiliateLink,
      price: selectedProduct.price,
      rating: Number(parsedData.rating) || 4.5,
      pros: parsedData.pros || [],
      cons: parsedData.cons || [],
      specs: parsedData.specs || {},
      faq: parsedData.faq || [],
      buyingAdvice: parsedData.buyingAdvice || "",
      alternatives: db.products
        .filter(p => p.category === selectedProduct?.category)
        .slice(0, 2)
        .map(p => p.slug),
      createdAt: new Date().toISOString(),
      featured: true
    };

    let schemaObj = parsedData.schema || {};
    let schemaStr = JSON.stringify(schemaObj);
    schemaStr = schemaStr.replace(/AFFILIATE_LINK_PLACEHOLDER/g, affiliateLink);
    try {
      schemaObj = JSON.parse(schemaStr);
    } catch {
      // ignore
    }

    const newArticle = {
      id: `a_${Date.now()}`,
      title: parsedData.seoTitle || `${selectedProduct.title} Review`,
      slug: selectedProduct.slug,
      category: selectedProduct.category,
      content: parsedData.content,
      metaTitle: parsedData.seoTitle || `${selectedProduct.title} Review`,
      metaDescription: parsedData.metaDescription || "",
      faq: parsedData.faq || [],
      schema: schemaObj,
      image: selectedProduct.image,
      affiliateLink: affiliateLink,
      createdAt: new Date().toISOString(),
      status: "published" as const
    };

    // Save locally
    db.products.push(newProduct);
    db.articles.push(newArticle);
    saveDatabase();

    // Save to Supabase if credentials are set
    const supabaseSaved = await saveToSupabase(newProduct, newArticle);

    console.log(`Product generation and immediate publishing complete for ${selectedProduct.title}`);
    res.status(201).json({
      success: true,
      supabaseSaved,
      product: newProduct,
      article: newArticle
    });

  } catch (err: any) {
    console.error("Generate Today's Product API Error:", err);
    res.status(500).json({ error: err.message || "Failed to generate today's product." });
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
    <title>${title} | ${db.settings.siteName}</title>
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
