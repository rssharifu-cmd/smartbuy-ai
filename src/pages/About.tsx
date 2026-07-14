/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Link } from "../components/Navigation.tsx";
import { Shield, Users, Award, BookOpen, Sparkles, ArrowRight } from "lucide-react";

export const About: React.FC = () => {
  return (
    <div className="bg-slate-900 text-slate-100 min-h-screen py-16 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto">
        
        {/* Header banner */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-1.5 bg-indigo-950 text-indigo-400 px-3 py-1 rounded-full text-xs font-semibold mb-4 border border-indigo-900/40">
            <Sparkles className="w-3.5 h-3.5 fill-indigo-400" />
            Our Core Mission
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">About SmartBuy AI</h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
            Re-inventing product comparisons for the age of Generative Engine Optimization (GEO) and AI-driven consumer research.
          </p>
        </div>

        {/* Content body bento blocks */}
        <div className="space-y-12">
          
          <div className="bg-slate-950 p-6 sm:p-8 rounded-3xl border border-slate-850 relative overflow-hidden grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full blur-3xl opacity-5"></div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">Why we built SmartBuy AI</h2>
              <p className="text-sm text-slate-300 leading-relaxed space-y-4">
                Traditional product search is broken. Standard comparison websites are saturated with intrusive banner ads, paid sponsorships, and circular blogs that pad word counts instead of delivering answers.
                <br /><br />
                We built SmartBuy AI to offer immediate, structured, data-grounded insights. By marrying real expert manual reviews with advanced Gemini AI models, we deliver concise pros, cons, and specifications instantly.
              </p>
            </div>
            <div className="space-y-4">
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex items-start gap-3">
                <Shield className="w-5 h-5 text-indigo-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-white">100% Unbiased Audits</h4>
                  <p className="text-xs text-slate-400 mt-1">We buy and test items ourselves or aggregate massive consumer feedback arrays to isolate authentic performance data.</p>
                </div>
              </div>
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex items-start gap-3">
                <Users className="w-5 h-5 text-indigo-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-white">AI Grounded Verification</h4>
                  <p className="text-xs text-slate-400 mt-1">We utilize server-side Large Language Models strictly to synthesize specifications, never to invent features.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Core Values row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-850 text-center">
              <Award className="w-8 h-8 text-indigo-400 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white mb-2">Technical Rigor</h3>
              <p className="text-xs text-slate-400 leading-relaxed">We focus on hard measurements: driver sizes, sensor tracking DPIs, wattage capacities, and thermal tolerances.</p>
            </div>
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-850 text-center">
              <BookOpen className="w-8 h-8 text-indigo-400 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white mb-2">GEO Optimization</h3>
              <p className="text-xs text-slate-400 leading-relaxed">Our content structures are highly indexed to support smart citations by LLM assistants and search models.</p>
            </div>
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-850 text-center">
              <Shield className="w-8 h-8 text-indigo-400 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white mb-2">Transparent Affiliates</h3>
              <p className="text-xs text-slate-400 leading-relaxed">We explicitly declare our affiliate linkages. Our commission-driven clicks never cost you a penny.</p>
            </div>
          </div>

          {/* Final Call to Action */}
          <div className="bg-gradient-to-r from-slate-950 to-indigo-950/40 border border-slate-850 p-8 rounded-3xl text-center">
            <h3 className="text-lg sm:text-xl font-bold text-white mb-3">Ready to search smarter?</h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto mb-6">Test our system by asking details on compact brewers, budget earbuds, or high-performance gaming sensors.</p>
            <Link to="/categories" className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-6 rounded-xl text-xs sm:text-sm tracking-wide transition-all shadow-md">
              <span>Explore Active Categories</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
};
