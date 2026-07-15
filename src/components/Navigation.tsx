/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Sparkles, Search, Headphones, Mouse, Coffee, Menu, X, Shield, Info, LayoutDashboard, Mail, ExternalLink } from "lucide-react";

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
}> = ({ currentPath }) => {
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
    <header id="site-header" className="sticky top-0 z-50 bg-slate-900 border-b border-slate-800 text-slate-100 backdrop-blur-md bg-opacity-95 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-sans font-bold text-xl tracking-tight text-white hover:text-indigo-400 transition-colors">
            <div className="bg-indigo-600 text-white p-1.5 rounded-lg">
              <Sparkles className="w-5 h-5" />
            </div>
            <span>Affi<span className="text-indigo-400">Mind</span></span>
          </Link>

          {/* Search bar Desktop */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-md mx-8 relative">
            <input
              type="text"
              placeholder="Ask AI: 'Best earbuds under $50'..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="w-full pl-10 pr-4 py-1.5 bg-slate-800 border border-slate-700 rounded-full text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
          </form>

          {/* Desktop Navigation links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium">
            <Link to="/" className={`hover:text-indigo-400 transition-colors ${currentPath === "/" ? "text-indigo-400 font-semibold" : "text-slate-300"}`}>Home</Link>
            <Link to="/categories" className={`hover:text-indigo-400 transition-colors ${currentPath === "/categories" ? "text-indigo-400 font-semibold" : "text-slate-300"}`}>Categories</Link>
            <Link to="/about" className={`hover:text-indigo-400 transition-colors ${currentPath === "/about" ? "text-indigo-400 font-semibold" : "text-slate-300"}`}>About</Link>
            <Link to="/contact" className={`hover:text-indigo-400 transition-colors ${currentPath === "/contact" ? "text-indigo-400 font-semibold" : "text-slate-300"}`}>Contact</Link>
          </nav>

          {/* Mobile menu and search toggle buttons */}
          <div className="flex lg:hidden items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-slate-300 hover:text-white p-1 rounded-md focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-900 border-t border-slate-800 px-4 pt-4 pb-6 space-y-4">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <input
              type="text"
              placeholder="Ask AI: 'Best earbuds under $50'..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          </form>

          <nav className="flex flex-col gap-3 font-medium text-slate-300">
            <Link to="/" className="py-2 border-b border-slate-800 hover:text-white">Home</Link>
            <Link to="/categories" className="py-2 border-b border-slate-800 hover:text-white">Categories</Link>
            <Link to="/about" className="py-2 border-b border-slate-800 hover:text-white">About</Link>
            <Link to="/contact" className="py-2 border-b border-slate-800 hover:text-white">Contact</Link>
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
    <footer id="site-footer" className="bg-slate-950 border-t border-slate-900 text-slate-400 py-12 text-sm leading-relaxed">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & description */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 font-sans font-bold text-xl text-white tracking-tight mb-4">
              <div className="bg-indigo-600 text-white p-1 rounded">
                <Sparkles className="w-4 h-4" />
              </div>
              <span>Affi<span className="text-indigo-400">Mind</span></span>
            </Link>
            <p className="max-w-md text-slate-400 text-sm mb-4">
              {settings.siteDescription} Utilizing cutting-edge Generative AI Search optimization and real research to offer absolute unbiased reviews.
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
              <li><Link to="/categories" className="hover:text-white">Categories</Link></li>
              <li><Link to="/about" className="hover:text-white">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-white">Contact Team</Link></li>
            </ul>
          </div>

          {/* SEO & Legal */}
          <div>
            <h4 className="text-white font-semibold text-sm tracking-wider uppercase mb-4">SEO & Legal</h4>
            <ul className="space-y-2 text-slate-400">
              <li><Link to="/disclosure" className="hover:text-white flex items-center gap-1.5"><Shield className="w-3.5 h-3.5" /> Affiliate Disclosure</Link></li>
              <li><Link to="/privacy" className="hover:text-white flex items-center gap-1.5"><Info className="w-3.5 h-3.5" /> Privacy Policy</Link></li>
              <li><a href="/sitemap.xml" target="_blank" rel="noreferrer" className="hover:text-white flex items-center gap-1"><ExternalLink className="w-3.5 h-3.5" /> XML Sitemap</a></li>
              <li><a href="/robots.txt" target="_blank" rel="noreferrer" className="hover:text-white flex items-center gap-1"><ExternalLink className="w-3.5 h-3.5" /> Robots.txt</a></li>
            </ul>
          </div>
        </div>

        {/* Affiliate Disclosure Box */}
        <div className="mt-8 pt-8 border-t border-slate-900 bg-slate-900 bg-opacity-20 p-4 rounded-xl text-xs text-slate-500 max-w-7xl">
          <p className="font-semibold text-slate-400 mb-1">Affiliate Disclosure Statement:</p>
          <p>{settings.affiliateDisclosure}</p>
        </div>

        {/* Legal copyrights */}
        <div className="mt-8 pt-4 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>&copy; {new Date().getFullYear()} {settings.siteName}. Designed for high-performance and absolute transparency.</p>
          <p>Powered by Gemini-3.5-Flash & Express.js</p>
        </div>
      </div>
    </footer>
  );
};
