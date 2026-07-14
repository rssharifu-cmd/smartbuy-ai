/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Link } from "../components/Navigation.tsx";
import { FileText, Shield, Key, Eye } from "lucide-react";

export const Privacy: React.FC = () => {
  return (
    <div className="bg-slate-900 text-slate-100 min-h-screen py-16 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto bg-slate-950 border border-slate-850 p-6 sm:p-10 rounded-3xl shadow-xl">
        
        <div className="border-b border-slate-900 pb-6 mb-8 flex items-center gap-3">
          <div className="bg-indigo-600/10 p-2.5 rounded-xl border border-indigo-500/10 text-indigo-400">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Privacy Policy</h1>
            <p className="text-xs text-slate-500 font-mono mt-0.5">Last updated: July 14, 2026</p>
          </div>
        </div>

        <div className="space-y-6 text-sm text-slate-300 leading-relaxed font-sans">
          
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Eye className="w-4 h-4 text-indigo-400" />
              <span>1. Information We Collect</span>
            </h2>
            <p>
              AffiMind operates as an informational review platform. We collect minimal personal parameters. This includes information you explicitly supply (such as name and email on our newsletter registration and support contact forms) and automated diagnostic metrics (such as cookies, browser user-agents, IP addresses, and page-clicks tracked for analytics and security).
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-indigo-400" />
              <span>2. Cookies & Affiliate Tracking</span>
            </h2>
            <p>
              To support our affiliate research, we supply outgoing hyperlinks to merchants (e.g., Amazon.com). When you click these hyperlinks, our merchant partners utilize standard cookies and tracking parameters to credit commissions. These cookies do not track any personal identifiers outside of that transaction and generally expire after 24 hours.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Key className="w-4 h-4 text-indigo-400" />
              <span>3. Data Protection Practices</span>
            </h2>
            <p>
              Your security is paramount. We store contact registrations and portal parameters in heavily secured databases. We enforce TLS encryption over all API transfers and never distribute, sell, or rent user emails to third-party advertisers.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">4. User Rights</h2>
            <p>
              You have the full right to inquire about, request a download of, or request the complete deletion of any personal email data we retain. Contact our privacy team at <a href="mailto:support@affimind.com" className="text-indigo-400 hover:underline">support@affimind.com</a> and we will finalize your request immediately.
            </p>
          </section>

          <div className="pt-6 border-t border-slate-900 text-center">
            <Link to="/" className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold underline">
              Return to AffiMind Homepage
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
};
