/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Mail, MessageSquare, Phone, MapPin, Send, CheckCircle2 } from "lucide-react";

export const Contact: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;
    setSubmitted(true);
    setName("");
    setEmail("");
    setSubject("");
    setMessage("");
  };

  return (
    <div className="bg-slate-900 text-slate-100 min-h-screen py-16 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-3">Get in Touch</h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
            Have questions about our AI search capabilities, product comparisons, or advertising partnerships? Contact us today.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Support Side-column */}
          <div className="space-y-6">
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-850 flex gap-4 items-start">
              <Mail className="w-5 h-5 text-indigo-400 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">General Enquiries</h3>
                <p className="text-xs text-slate-400 mt-1">Our customer experience staff will reply within 24 working hours.</p>
                <a href="mailto:support@smartbuyai.com" className="text-indigo-400 hover:text-indigo-300 font-semibold text-xs mt-2 block underline">support@smartbuyai.com</a>
              </div>
            </div>

            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-850 flex gap-4 items-start">
              <MessageSquare className="w-5 h-5 text-indigo-400 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Editorial Partnerships</h3>
                <p className="text-xs text-slate-400 mt-1">Reach our hardware reviewers to pitch product submissions or sponsorships.</p>
                <a href="mailto:editorial@smartbuyai.com" className="text-indigo-400 hover:text-indigo-300 font-semibold text-xs mt-2 block underline">editorial@smartbuyai.com</a>
              </div>
            </div>

            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-850 flex gap-4 items-start">
              <MapPin className="w-5 h-5 text-indigo-400 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Corporate HQ</h3>
                <p className="text-xs text-slate-400 mt-1">SmartBuy AI Labs<br />100 Silicon Canal Ave<br />San Francisco, CA 94107</p>
              </div>
            </div>
          </div>

          {/* Form container */}
          <div className="md:col-span-2 bg-slate-950 p-6 sm:p-8 rounded-3xl border border-slate-850 shadow-xl">
            {submitted ? (
              <div className="text-center py-10 space-y-4">
                <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto" />
                <h3 className="text-xl font-bold text-white">Message Transmitted Successfully</h3>
                <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto">Thank you for reaching out. An editorial or support specialist will review your inquiry and follow up shortly.</p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 px-4 py-2 rounded-xl text-xs font-semibold"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="text-lg font-bold text-white mb-4">Direct Message Portal</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="Jane Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="jane@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">Subject</label>
                  <input
                    type="text"
                    placeholder="Adverting & Sponsorship"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">Your Message *</label>
                  <textarea
                    rows={5}
                    required
                    placeholder="Provide details about your query..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <span>Submit Secure Message</span>
                  <Send className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
