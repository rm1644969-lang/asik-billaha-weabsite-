"use client";

import React from "react";
import { useNexusStore } from "@/lib/store";
import { normalizeYouTubeEmbedUrl } from "@/lib/youtube";
import { Sparkles } from "lucide-react";
import Card3D from "@/components/Card3D";
import CyberCanvas3D from "@/components/CyberCanvas3D";

export default function TutorialsPage() {
  const { tutorials } = useNexusStore();

  return (
    <div className="relative py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12 overflow-hidden">
      
      {/* 3D Ambient Cyber Canvas */}
      <CyberCanvas3D className="absolute -top-10 left-0 right-0 h-[480px] pointer-events-none opacity-40 z-0" />

      <div className="relative z-10 space-y-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-yellow-400/15 border border-yellow-400/40 text-yellow-300 text-xs font-black">
          <Sparkles className="w-3.5 h-3.5 text-red-500" />
          <span>ভিডিও গাইড ও হেল্প সেন্টার</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-gradient-shimmer">
          সফটওয়্যার সেটআপ ও টিউটোরিয়াল
        </h1>
        <p className="text-slate-300 text-base leading-relaxed">
          আপনার পছন্দের সফটওয়্যার টুলস সহজে ইনস্টল, কনফিগার এবং লাইসেন্স অ্যাক্টিভ করার জন্য সম্পূর্ণ ভিডিও গাইড দেখুন।
        </p>
      </div>

      {/* Tutorials Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {tutorials.map((tut) => (
          <Card3D key={tut.id} maxTilt={6} depth={1.02} glare={true} className="h-full">
            <div
              className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6 border border-white/10 hover:border-yellow-400/50 transition-all shadow-xl h-full"
            >
              <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/15 bg-black shadow-lg">
                <iframe
                  width="560"
                  height="315"
                  src={normalizeYouTubeEmbedUrl(tut.videoUrl)}
                  title={tut.title}
                  className="w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-yellow-400">{tut.toolName}</span>
                  <span className="text-slate-400">{tut.duration}</span>
                </div>
                <h2 className="text-xl font-black text-white">
                  {tut.title}
                </h2>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {tut.description}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-black border border-white/10 space-y-2 text-xs">
                <h4 className="font-black text-white">ব্যবহারের সহজ ধাপসমূহ:</h4>
                <ul className="space-y-1.5 text-slate-300">
                  {tut.steps.map((st, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-yellow-400/20 text-yellow-400 flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span>{st}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Card3D>
        ))}
      </div>

      </div>
    </div>
  );
}
