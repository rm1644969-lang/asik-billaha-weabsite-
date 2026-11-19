"use client";

import React, { useState } from "react";
import { useNexusStore } from "@/lib/store";
import { Send, Mail, MessageSquare, ShieldCheck, CheckCircle2 } from "lucide-react";
import Card3D from "@/components/Card3D";
import CyberCanvas3D from "@/components/CyberCanvas3D";

export default function ContactPage() {
  const { settings } = useNexusStore();
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: "", email: "", subject: "", message: "" });
    }, 4000);
  };

  return (
    <div className="relative py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-12 overflow-hidden">
      
      {/* 3D Ambient Cyber Canvas */}
      <CyberCanvas3D className="absolute -top-10 left-0 right-0 h-[480px] pointer-events-none opacity-40 z-0" />

      <div className="relative z-10 space-y-12">
        <div className="text-center space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-yellow-400">
            সরাসরি যোগাযোগ
          </span>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-gradient-shimmer">
            যোগাযোগ ও সাপোর্ট সেন্টার
          </h1>
          <p className="text-slate-400 text-sm max-w-lg mx-auto">
            টুল ইনস্টলেশন, লাইসেন্স অ্যাক্টিভেশন, অথবা বিকাশ/রকেট পেমেন্ট সংক্রান্ত যেকোনো সহায়তার জন্য সরাসরি যোগাযোগ করুন।
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Contact info channels */}
          <div className="lg:col-span-5 space-y-4">
            <Card3D maxTilt={6} depth={1.03} glare={true} className="h-full">
              <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6 border border-white/10 h-full">
                <h3 className="text-lg font-bold text-white">সরাসরি যোগাযোগের মাধ্যম</h3>
                
                <a
                  href={settings.telegramGroupUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-4 p-4 rounded-2xl bg-surface-card border border-white/5 hover:border-yellow-400/40 transition-all group"
                >
                  <div className="p-3 rounded-xl bg-yellow-950/60 border border-yellow-500/30 text-yellow-400 group-hover:scale-110 transition-transform">
                    <Send className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">টেলিগ্রাম কমিউনিটি</h4>
                    <p className="text-xs text-slate-400 mt-0.5">তাৎক্ষণিক আপডেট ও গ্রুপ ডিসকাশন</p>
                    <span className="text-[11px] text-yellow-400 font-semibold mt-1 inline-block">গ্রুপে জয়েন করুন &rarr;</span>
                  </div>
                </a>

                <a
                  href={`https://t.me/${settings.telegramSupportUsername.replace("@", "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-4 p-4 rounded-2xl bg-surface-card border border-white/5 hover:border-red-500/40 transition-all group"
                >
                  <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/30 text-red-400 group-hover:scale-110 transition-transform">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">সরাসরি অ্যাডমিন সাপোর্ট</h4>
                    <p className="text-xs text-slate-400 mt-0.5">{settings.telegramSupportUsername}</p>
                    <span className="text-[11px] text-red-400 font-semibold mt-1 inline-block">মেসেজ দিন &rarr;</span>
                  </div>
                </a>

                <div className="flex items-start gap-4 p-4 rounded-2xl bg-surface-card border border-white/5">
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-white">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">অফিসিয়াল ইমেইল</h4>
                    <p className="text-xs text-slate-400 mt-0.5">{settings.contactEmail}</p>
                    <span className="text-[11px] text-slate-500 mt-1 inline-block">সরাসরি রিপ্লাই</span>
                  </div>
                </div>
              </div>
            </Card3D>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-7">
            <Card3D maxTilt={6} depth={1.03} glare={true} className="h-full">
              <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6 border border-white/10 h-full">
                <h3 className="text-lg font-bold text-white">মেসেজ পাঠান</h3>

                {submitted && (
                  <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>আপনার বার্তা আমাদের কাছে সফলভাবে পাঠানো হয়েছে। দ্রুত রিপ্লাই দেওয়া হবে!</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="font-bold text-slate-300 block mb-1">আপনার নাম</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full p-3 rounded-xl glass-input text-white"
                        placeholder="যেমন: Asik Billah"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-300 block mb-1">আপনার ইমেইল</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full p-3 rounded-xl glass-input text-white"
                        placeholder="যেমন: user@gmail.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-300 block mb-1">বিষয় (Subject)</label>
                    <input
                      type="text"
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full p-3 rounded-xl glass-input text-white"
                      placeholder="যেমন: পেমেন্ট TrxID ভেরিফিকেশন বা HWID সমস্যা"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-300 block mb-1">বিস্তারিত বার্তা</label>
                    <textarea
                      rows={4}
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full p-3 rounded-xl glass-input text-white"
                      placeholder="আপনার বিষয় বিস্তারিত লিখুন..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400 text-black font-black text-xs shadow-neon-yellow hover:opacity-95 transition-all"
                  >
                    বার্তা পাঠান
                  </button>
                </form>
              </div>
            </Card3D>
          </div>

        </div>
      </div>
    </div>
  );
}
