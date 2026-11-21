"use client";

import React from "react";
import { useNexusStore } from "@/lib/store";
import PricingCard from "@/components/PricingCard";
import Card3D from "@/components/Card3D";
import CyberCanvas3D from "@/components/CyberCanvas3D";
import { Sparkles, ShieldCheck, Zap, HelpCircle } from "lucide-react";

export default function PricingPage() {
  const { plans } = useNexusStore();
  const activePlans = plans.filter(p => p.enabled);

  return (
    <div className="relative py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-14 overflow-hidden">
      
      {/* 3D Ambient Cyber Canvas */}
      <CyberCanvas3D className="absolute -top-10 left-0 right-0 h-[480px] pointer-events-none opacity-50 z-0" />

      <div className="relative z-10 space-y-14">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-600/20 border border-red-500 text-yellow-400 text-xs font-black uppercase tracking-widest shadow-neon-red">
          <Sparkles className="w-3.5 h-3.5" />
          <span>সীমিত সময়ের স্পেশাল অফার</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white">
          টুলস স্পেশাল অফার প্যাকেজ
        </h1>
        <p className="text-slate-300 text-base sm:text-lg font-medium leading-relaxed">
          ৭ দিন — <span className="text-yellow-400 font-bold">$২ (৳২৪০)</span> &nbsp;|&nbsp; ১৫ দিন — <span className="text-yellow-400 font-bold">$৪ (৳৪৮০)</span> &nbsp;|&nbsp; ৩০ দিন — <span className="text-yellow-400 font-bold">$৮ (৳৯৬০)</span>
        </p>
        <p className="text-slate-400 text-sm">
          বিকাশ (<span className="text-yellow-400 font-mono font-bold">01967922602</span>) ও রকেট (<span className="text-red-400 font-mono font-bold">01731328169</span>)-এ স্বয়ংক্রিয় তাৎক্ষণিক লাইসেন্স ডেলিভারি।
        </p>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {activePlans.map((plan) => (
          <PricingCard key={plan.id} plan={plan} />
        ))}
      </div>

      {/* Features Included with Every Plan */}
      <div className="rounded-3xl p-8 bg-[#0e0e0e] border border-white/10 space-y-6 text-center">
        <h3 className="text-xl font-black text-gradient-shimmer">
          প্রতিটি লাইসেন্সের সাথে যা যা পাচ্ছেন
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 text-xs">
          <Card3D maxTilt={10} depth={1.04} glare={true} className="h-full">
            <div className="space-y-2 p-4 rounded-xl bg-black border border-white/10 h-full">
              <Zap className="w-5 h-5 text-yellow-400" />
              <h4 className="font-bold text-white text-sm">তাৎক্ষণিক ডেলিভারি</h4>
              <p className="text-slate-400">বিকাশ বা রকেট TrxID সাবমিট করার সাথে সাথেই লাইসেন্স প্রদান করা হয়।</p>
            </div>
          </Card3D>
          <Card3D maxTilt={10} depth={1.04} glare={true} className="h-full">
            <div className="space-y-2 p-4 rounded-xl bg-black border border-white/10 h-full">
              <ShieldCheck className="w-5 h-5 text-red-500" />
              <h4 className="font-bold text-white text-sm">HWID মেশিন লক</h4>
              <p className="text-slate-400">আপনার পিসির সাথে লাইসেন্স সুরক্ষিত থাকে, কেউ চুরি করতে পারবে না।</p>
            </div>
          </Card3D>
          <Card3D maxTilt={10} depth={1.04} glare={true} className="h-full">
            <div className="space-y-2 p-4 rounded-xl bg-black border border-white/10 h-full">
              <Sparkles className="w-5 h-5 text-yellow-400" />
              <h4 className="font-bold text-white text-sm">১-ক্লিকে HWID রিসেট</h4>
              <p className="text-slate-400">পিসি পরিবর্তন বা উইন্ডোজ রিইনস্টল করলে এক ক্লিকে নতুন পিসিতে লাইসেন্স নেওয়া যায়।</p>
            </div>
          </Card3D>
          <Card3D maxTilt={10} depth={1.04} glare={true} className="h-full">
            <div className="space-y-2 p-4 rounded-xl bg-black border border-white/10 h-full">
              <HelpCircle className="w-5 h-5 text-white" />
              <h4 className="font-bold text-white text-sm">২৪/৭ টেলিগ্রাম ভিআইপি</h4>
              <p className="text-slate-400">সফটওয়্যার সেটআপ ও যেকোনো সহায়তার জন্য সার্বক্ষণিক লাইভ সাপোর্ট।</p>
            </div>
          </Card3D>
        </div>
      </div>

      </div>
    </div>
  );
}
