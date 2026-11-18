"use client";

import React from "react";
import { useNexusStore } from "@/lib/store";
import { Play, Sparkles, CheckCircle2, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function TutorialsPage() {
  const { tutorials } = useNexusStore();

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Video Guides & Knowledge Base</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-white">
          Software Setup & Tutorials
        </h1>
        <p className="text-slate-400 text-base leading-relaxed">
          Comprehensive step-by-step guides on extracting tools, configuring Windows Defender exclusions, copying HWID fingerprints, and activating license keys.
        </p>
      </div>

      {/* Tutorials Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {tutorials.map((tut) => (
          <div
            key={tut.id}
            className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6 border border-white/10 hover:border-purple-500/40 transition-all shadow-xl"
          >
            <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/10 bg-black/60 shadow-lg">
              <iframe
                src={tut.videoUrl}
                title={tut.title}
                className="w-full h-full"
                allowFullScreen
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-cyan-400">{tut.toolName}</span>
                <span className="text-slate-400">{tut.duration}</span>
              </div>
              <h2 className="text-xl font-bold text-white">
                {tut.title}
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                {tut.description}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#090e2b] border border-white/5 space-y-2 text-xs">
              <h4 className="font-bold text-slate-200">Execution Steps:</h4>
              <ul className="space-y-1.5 text-slate-300">
                {tut.steps.map((st, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span>{st}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
