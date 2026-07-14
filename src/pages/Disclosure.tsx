/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Link } from "../components/Navigation.tsx";
import { ShieldAlert, Info, AlertTriangle } from "lucide-react";

export const Disclosure: React.FC = () => {
  return (
    <div className="bg-slate-900 text-slate-100 min-h-screen py-16 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto bg-slate-950 border border-slate-850 p-6 sm:p-10 rounded-3xl shadow-xl">
        
        <div className="border-b border-slate-900 pb-6 mb-8 flex items-center gap-3">
          <div className="bg-indigo-600/10 p-2.5 rounded-xl border border-indigo-500/10 text-indigo-400">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Affiliate Disclosure</h1>
            <p className="text-xs text-slate-500 font-mono mt-0.5">Compliance with FTC & Advertising Guidelines</p>
          </div>
        </div>

        <div className="space-y-6 text-sm text-slate-300 leading-relaxed font-sans">
          
          <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex items-start gap-3">
            <Info className="w-5 h-5 text-indigo-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-slate-300 leading-normal">
              In complete compliance with the Federal Trade Commission (FTC) guidelines, we provide this comprehensive disclosure outlining how we earn income through this website.
            </p>
          </div>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">How We Earn Income</h2>
            <p>
              SmartBuy AI is a participant in several affiliate advertising networks, including the <strong>Amazon Services LLC Associates Program</strong>. 
              <br /><br />
              This means that several outgoing buttons and hyperlinks point directly to commercial storefronts (like Amazon.com). When a user clicks these links and makes a qualified purchase within a set period of time, we receive a small, percentage-based referral fee or commission.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>No Impact on Your Cost</span>
            </h2>
            <p>
              These commissions are paid entirely by the merchant platforms. <strong>Clicking these links never increases the retail cost of the product to you.</strong> In fact, we continuously monitor price tags to ensure you get redirected to the lowest active discount prices available.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">Guaranteed Editorial Independence</h2>
            <p>
              Our automated synthesis and human reviewer evaluations are 100% independent. We list clear "Cons" and category limitations for every product we catalog, even if they result in fewer sales. Our ultimate goal is user loyalty and absolute transparency; we never accept paid sponsorships to artificially elevate a bad product's rating.
            </p>
          </section>

          <div className="pt-6 border-t border-slate-900 text-center">
            <Link to="/" className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold underline">
              Return to SmartBuy AI Homepage
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
};
