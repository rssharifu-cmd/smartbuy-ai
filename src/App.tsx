/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Header, Footer } from "./components/Navigation.tsx";
import { Home } from "./pages/Home.tsx";
import { Categories } from "./pages/Categories.tsx";
import { ProductDetail } from "./pages/ProductDetail.tsx";
import { ArticleDetail } from "./pages/ArticleDetail.tsx";
import { SearchResults } from "./pages/SearchResults.tsx";
import { About } from "./pages/About.tsx";
import { Contact } from "./pages/Contact.tsx";
import { Privacy } from "./pages/Privacy.tsx";
import { Disclosure } from "./pages/Disclosure.tsx";
import { Admin } from "./pages/Admin.tsx";

export default function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [settings, setSettings] = useState({
    siteName: "SmartBuy AI",
    siteDescription: "Optimized AI product recommendations grounded in certified review metrics.",
    affiliateDisclosure: "SmartBuy AI is a participant in the Amazon Services LLC Associates Program and other advertising networks designed to provide a means to earn fees.",
    contactEmail: "support@smartbuyai.com"
  });

  useEffect(() => {
    // Listen for custom pushstate / back navigation trigger events
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
      window.scrollTo({ top: 0, behavior: "smooth" });
    };

    window.addEventListener("popstate", handleLocationChange);
    return () => {
      window.removeEventListener("popstate", handleLocationChange);
    };
  }, []);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch("/api/settings");
        if (res.ok) {
          const data = await res.json();
          setSettings(data);
        }
      } catch (err) {
        console.error("Failed to retrieve editorial settings parameters:", err);
      }
    }
    fetchSettings();
  }, [currentPath]);

  // Route matching routing switch
  const renderActivePage = () => {
    if (currentPath === "/" || currentPath === "/index.html") {
      return <Home />;
    }
    if (currentPath === "/categories") {
      return <Categories />;
    }
    if (currentPath.startsWith("/product/")) {
      return <ProductDetail />;
    }
    if (currentPath.startsWith("/article/")) {
      return <ArticleDetail />;
    }
    if (currentPath === "/search") {
      return <SearchResults />;
    }
    if (currentPath === "/about") {
      return <About />;
    }
    if (currentPath === "/contact") {
      return <Contact />;
    }
    if (currentPath === "/privacy") {
      return <Privacy />;
    }
    if (currentPath === "/disclosure") {
      return <Disclosure />;
    }
    if (currentPath === "/admin") {
      return <Admin />;
    }
    
    // Default Fallback
    return <Home />;
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-900 text-slate-100">
      <Header currentPath={currentPath} />
      <main className="flex-grow">
        {renderActivePage()}
      </main>
      <Footer settings={settings} />
    </div>
  );
}
