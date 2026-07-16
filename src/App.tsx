/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Header, Footer } from "./components/Navigation.tsx";
import { Home } from "./pages/Home.tsx";
import { Categories } from "./pages/Categories.tsx";
import { ArticleDetail } from "./pages/ArticleDetail.tsx";
import { SearchResults } from "./pages/SearchResults.tsx";
import { About } from "./pages/About.tsx";
import { Contact } from "./pages/Contact.tsx";
import { Privacy } from "./pages/Privacy.tsx";
import { Disclosure } from "./pages/Disclosure.tsx";
import { Admin } from "./pages/Admin.tsx";

export default function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved ? saved === "dark" : true; // Default to dark theme for professional tech vibe
  });
  
  const [settings, setSettings] = useState({
    siteName: "BlogFlow AI",
    siteDescription: "A professional AI-first publishing platform optimized for high SEO rankings and generative engine citations.",
    affiliateDisclosure: "BlogFlow AI participates in select affiliate programs. When you purchase software or services through our links, we may earn an affiliate commission at no extra cost to you.",
    contactEmail: "editorial@blogflowai.com"
  });

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
      window.scrollTo({ top: 0, behavior: "smooth" });
    };

    window.addEventListener("popstate", handleLocationChange);
    window.addEventListener("pushstate-navigation", handleLocationChange);
    return () => {
      window.removeEventListener("popstate", handleLocationChange);
      window.removeEventListener("pushstate-navigation", handleLocationChange);
    };
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch("/api/settings");
        if (res.ok) {
          const data = await res.json();
          setSettings(data);
        }
      } catch (err) {
        console.error("Failed to retrieve site settings:", err);
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

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className={`flex flex-col min-h-screen transition-colors duration-300 ${darkMode ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"}`}>
      <Header currentPath={currentPath} darkMode={darkMode} toggleTheme={toggleTheme} settings={settings} />
      <main className="flex-grow">
        {renderActivePage()}
      </main>
      <Footer settings={settings} />
    </div>
  );
}
