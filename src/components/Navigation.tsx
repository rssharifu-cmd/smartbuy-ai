/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Sparkles, Search, Menu, X, Shield, Info, Mail, ExternalLink, Sun, Moon, Rss } from "lucide-react";

// Custom Link that handles state-based client-side routing
export const Link: React.FC<{
  to: string;
  className?: string;
  children: React.ReactNode;
  id?: string;
}> = ({ to, className = "", children, id }) => {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Standard middle clicks / command clicks should open in a new tab
    if (e.metaKey || e.ctrlKey || e.shiftKey) return;
    
    e.preventDefault();
    window.history.pushState({}, "", to);
    // Dispatch popstate event to let our App route listener know the URL has changed
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  return (
    <a href={to} onClick={handleClick} className={className} id={id}>
      {children}
    </a>
  );
};

export const Header: React.FC<{
  currentPath: string;
  darkMode: boolean;
  toggleTheme: () => void;
  settings: { siteName: string };
}> = ({ currentPath, darkMode, toggleTheme, settings }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchVal, setSearchVal] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchVal.trim()) return;
    window.history.pushState({}, "", `/search?q=${encodeURIComponent(searchVal.trim())}`);
    window.dispatchEvent(new PopStateEvent("popstate"));
    setSearchVal("");
  };

  return (
    <header id="site-header" className={`sticky top-0 z-50 border-b backdrop-blur-md bg-opacity-95 shadow-sm transition-colors duration-300 ${
      darkMode 
        ? "bg-slate-950/90 border-slate-900 text-slate-100" 
        : "bg-white/90 border-slate-200 text-slate-900"
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-sans font-extrabold text-xl tracking-tight hover:opacity-90 transition-opacity">
            <div className="bg-indigo-600 text-white p-2 rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <span className={darkMode ? "text-white" : "text-slate-900"}>
              {settings.siteName || "BlogFlow"}<span className="text-indigo-500 font-normal"> AI</span>
            </span>
          </Link>

          {/* Search bar Desktop */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-sm mx-8 relative">
            <input
              type="text"
              placeholder="Search articles, keywords, topics..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className={`w-full pl-10 pr-4 py-1.5 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                darkMode 
                  ? "bg-slate-900 border-slate-800 text-slate-100 placeholder-slate-400 focus:bg-slate-850" 
                  : "bg-slate-100 border-slate-200 text-slate-900 placeholder-slate-500 focus:bg-white"
              }`}
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
          </form>

          {/* Desktop Navigation links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium">
            <Link to="/" className={`hover:text-indigo-500 transition-colors ${currentPath === "/" ? "text-indigo-500 font-semibold" : darkMode ? "text-slate-300" : "text-slate-650"}`}>Home</Link>
            <Link to="/categories" className={`hover:text-indigo-500 transition-colors ${currentPath === "/categories" ? "text-indigo-500 font-semibold" : darkMode ? "text-slate-300" : "text-slate-650"}`}>Categories</Link>
            <Link to="/about" className={`hover:text-indigo-500 transition-colors ${currentPath === "/about" ? "text-indigo-500 font-semibold" : darkMode ? "text-slate-300" : "text-slate-650"}`}>About</Link>
            <Link to="/contact" className={`hover:text-indigo-500 transition-colors ${currentPath === "/contact" ? "text-indigo-500 font-semibold" : darkMode ? "text-slate-300" : "text-slate-650"}`}>Contact</Link>
            <Link to="/admin" className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold hover:opacity-90 transition-opacity flex items-center gap-1.5 ${
              darkMode 
                ? "bg-slate-800 text-slate-200 border border-slate-700" 
                : "bg-slate-900 text-white"
            }`}>
              CMS Panel
            </Link>
          </nav>

          {/* Theme selector + mobile menu toggle */}
          <div className="flex items-center gap-4">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-full hover:bg-opacity-80 transition-colors ${
                darkMode ? "bg-slate-900 hover:bg-slate-800 text-amber-400" : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
              aria-label="Toggle Theme"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden text-slate-400 hover:text-white p-1 rounded-md focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer menu */}
      {mobileMenuOpen && (
        <div className={`lg:hidden px-4 pt-4 pb-6 space-y-4 border-t ${
          darkMode ? "bg-slate-950 border-slate-900 text-slate-100" : "bg-white border-slate-200 text-slate-900"
        }`}>
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <input
              type="text"
              placeholder="Search articles..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-xl text-sm ${
                darkMode 
                  ? "bg-slate-900 border-slate-800 text-slate-100 placeholder-slate-400" 
                  : "bg-slate-100 border-slate-200 text-slate-900 placeholder-slate-500"
              }`}
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          </form>

          <nav className="flex flex-col gap-3 font-medium">
            <Link to="/" className="py-2 border-b border-slate-800 hover:text-indigo-500">Home</Link>
            <Link to="/categories" className="py-2 border-b border-slate-800 hover:text-indigo-500">Categories</Link>
            <Link to="/about" className="py-2 border-b border-slate-800 hover:text-indigo-500">About</Link>
            <Link to="/contact" className="py-2 border-b border-slate-800 hover:text-indigo-500">Contact</Link>
            <Link to="/admin" className="py-2 text-indigo-500 font-semibold">CMS Panel</Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export const Footer: React.FC<{
  settings: { siteName: string; siteDescription: string; affiliateDisclosure: string; contactEmail: string };
}> = ({ settings }) => {
  return (
    <footer id="site-footer" className="bg-slate-950 border-t border-slate-900 text-slate-400 py-12 text-sm leading-relaxed mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & description */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 font-sans font-extrabold text-xl text-white tracking-tight mb-4">
              <div className="bg-indigo-600 text-white p-1 rounded-xl">
                <Sparkles className="w-4 h-4" />
              </div>
              <span>{settings.siteName || "BlogFlow"}<span className="text-indigo-500 font-normal"> AI</span></span>
            </Link>
            <p className="max-w-md text-slate-400 text-sm mb-4">
              {settings.siteDescription}
            </p>
            <div className="flex items-center gap-2 text-slate-300 font-medium">
              <Mail className="w-4 h-4 text-indigo-400" />
              <a href={`mailto:${settings.contactEmail}`} className="hover:text-white underline decoration-indigo-500 underline-offset-4">{settings.contactEmail}</a>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-white font-semibold text-sm tracking-wider uppercase mb-4">Explore</h4>
            <ul className="space-y-2 text-slate-400">
              <li><Link to="/" className="hover:text-white">Home Page</Link></li>
              <li><Link to="/categories" className="hover:text-white">Topic Categories</Link></li>
              <li><Link to="/about" className="hover:text-white">About Editorial</Link></li>
              <li><Link to="/contact" className="hover:text-white">Contact & Support</Link></li>
            </ul>
          </div>

          {/* SEO & Legal */}
          <div>
            <h4 className="text-white font-semibold text-sm tracking-wider uppercase mb-4">SEO & FEEDS</h4>
            <ul className="space-y-2 text-slate-400">
              <li><Link to="/disclosure" className="hover:text-white flex items-center gap-1.5"><Shield className="w-3.5 h-3.5" /> Affiliate Disclosure</Link></li>
              <li><Link to="/privacy" className="hover:text-white flex items-center gap-1.5"><Info className="w-3.5 h-3.5" /> Privacy Policy</Link></li>
              <li><a href="/sitemap.xml" target="_blank" rel="noreferrer" className="hover:text-white flex items-center gap-1"><ExternalLink className="w-3.5 h-3.5" /> XML Sitemap</a></li>
              <li><a href="/rss.xml" target="_blank" rel="noreferrer" className="hover:text-white flex items-center gap-1"><Rss className="w-3.5 h-3.5" /> RSS Article Feed</a></li>
              <li><a href="/robots.txt" target="_blank" rel="noreferrer" className="hover:text-white flex items-center gap-1"><ExternalLink className="w-3.5 h-3.5" /> Robots.txt</a></li>
            </ul>
          </div>
        </div>

        {/* Affiliate Disclosure Box */}
        <div className="mt-8 pt-8 border-t border-slate-900 bg-slate-900/40 p-4 rounded-xl text-xs text-slate-500 max-w-7xl">
          <p className="font-semibold text-slate-400 mb-1">Affiliate Disclosure Statement:</p>
          <p>{settings.affiliateDisclosure}</p>
        </div>

        {/* Legal copyrights */}
        <div className="mt-8 pt-4 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>&copy; {new Date().getFullYear()} {settings.siteName}. Designed with architectural integrity and GEO principles.</p>
          <p>Powered by Gemini-3.5-Flash & Express Node.js Backend</p>
        </div>
      </div>
    </footer>
  );
};
