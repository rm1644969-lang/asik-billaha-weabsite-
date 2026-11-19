"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { MessageSquare, Sparkles, X, ChevronUp, Bot, ExternalLink } from "lucide-react";

export default function CuteRobotCompanion() {
  const [mounted, setMounted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isWiggling, setIsWiggling] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [eyeOffset, setEyeOffset] = useState({ x: 0, y: 0 });
  const [headTilt, setHeadTilt] = useState({ rx: 0, ry: 0 });
  const [isBlinking, setIsBlinking] = useState(false);
  const [messageIndex, setMessageIndex] = useState(0);
  const [showMessage, setShowMessage] = useState(true);

  const robotRef = useRef<HTMLDivElement>(null);

  const messages = [
    { text: "Welcome to Toolsbd.com! 👋", tag: "ASSISTANT" },
    { text: "FAST OTP Pro — 7 Days only $2! 🔥", tag: "OFFER" },
    { text: "bKash (01967922602) & Rocket auto ⚡", tag: "PAYMENT" },
    { text: "Single PC HWID Locked & Secure 🔒", tag: "SECURITY" },
    { text: "24/7 Active Official Telegram 💬", tag: "SUPPORT" },
  ];

  useEffect(() => {
    setMounted(true);

    // 1. Mouse Tracking for Eye Gaze & Head Tilt
    const handleMouseMove = (e: MouseEvent) => {
      if (!robotRef.current) return;
      const rect = robotRef.current.getBoundingClientRect();
      const robotCenterX = rect.left + rect.width / 2;
      const robotCenterY = rect.top + rect.height / 2;

      const dx = e.clientX - robotCenterX;
      const dy = e.clientY - robotCenterY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Max eye pupils movement offset (-7px to +7px)
      const maxEyeOffset = 7;
      const factor = Math.min(1, distance / 500);
      const angle = Math.atan2(dy, dx);

      setEyeOffset({
        x: Math.cos(angle) * maxEyeOffset * factor,
        y: Math.sin(angle) * maxEyeOffset * factor,
      });

      // Subtle 3D head tilt (-10deg to +10deg)
      setHeadTilt({
        ry: Math.max(-14, Math.min(14, (dx / window.innerWidth) * 28)),
        rx: Math.max(-10, Math.min(10, -(dy / window.innerHeight) * 20)),
      });
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    // 2. Periodic Blinking
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 200);
    }, 4500);

    // 3. Cycle Messages
    const messageInterval = setInterval(() => {
      setShowMessage(false);
      setTimeout(() => {
        setMessageIndex((prev) => (prev + 1) % messages.length);
        setShowMessage(true);
      }, 500);
    }, 8000);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      clearInterval(blinkInterval);
      clearInterval(messageInterval);
    };
  }, [messages.length]);

  const handleRobotClick = () => {
    setIsWiggling(true);
    setTimeout(() => setIsWiggling(false), 700);
    setShowMessage(false);
    setTimeout(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
      setShowMessage(true);
    }, 200);
  };

  if (!mounted) return null;

  // Minimized state
  if (isMinimized) {
    return (
      <button
        type="button"
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-6 right-6 z-50 p-3 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-black shadow-neon-yellow flex items-center gap-2 hover:scale-110 transition-all font-bold text-xs group"
        title="Show Cute Robot Assistant"
      >
        <Bot className="w-5 h-5 animate-bounce" />
        <span className="hidden group-hover:inline">AI Bot 👋</span>
      </button>
    );
  }

  return (
    <aside aria-label="Toolsbd AI Robot Assistant" className="fixed bottom-6 right-6 z-50 flex flex-col items-end select-none pointer-events-auto">
      {/* 1. Speech Bubble */}
      <div
        className={`mb-3 max-w-[220px] transition-all duration-300 origin-bottom-right ${
          showMessage || isHovered
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-90 translate-y-2 pointer-events-none"
        }`}
      >
        <div className="relative rounded-2xl p-3 bg-[#0d0f14]/95 backdrop-blur-xl border border-cyan-400/50 shadow-[0_8px_30px_rgba(0,242,254,0.25)] text-left space-y-1">
          <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-1">
            <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-cyan-300 bg-cyan-950/80 px-1.5 py-0.5 rounded border border-cyan-500/40">
              <Sparkles className="w-2.5 h-2.5 text-yellow-400" />
              <span>{messages[messageIndex].tag}</span>
            </span>
            <button
              type="button"
              onClick={() => setIsMinimized(true)}
              className="text-slate-400 hover:text-white p-0.5"
              title="Minimize Assistant"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="text-xs font-semibold text-white leading-snug">
            {messages[messageIndex].text}
          </p>

          <div className="pt-1 flex items-center justify-between text-[10px]">
            <Link
              href="/tools"
              className="text-yellow-400 font-bold hover:underline inline-flex items-center gap-0.5"
            >
              <span>Explore Tools</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </Link>
            <span className="text-slate-500 font-mono">Toolsbd AI</span>
          </div>

          {/* Chat Bubble Tail Pointer */}
          <div className="absolute -bottom-2 right-8 w-3 h-3 bg-[#0d0f14] border-r border-b border-cyan-400/50 transform rotate-45" />
        </div>
      </div>

      {/* 2. Cute 3D Cyber Robot Character (Matching User's Uploaded Reference) */}
      <div
        ref={robotRef}
        onClick={handleRobotClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative cursor-pointer group flex flex-col items-center will-change-transform"
        style={{
          perspective: 600,
        }}
      >
        {/* Floating Animation Wrapper */}
        <div
          className={`flex flex-col items-center transition-transform duration-300 ${
            isWiggling ? "animate-wiggle" : "animate-float-gentle"
          }`}
          style={{
            transform: `rotateY(${headTilt.ry}deg) rotateX(${headTilt.rx}deg) scale(${isHovered ? 1.08 : 1})`,
            transformStyle: "preserve-3d",
          }}
        >
          {/* A. ROBOT HEAD */}
          <div className="relative w-24 h-20 rounded-[28px] bg-gradient-to-b from-white via-slate-100 to-slate-300 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.6),inset_0_2px_4px_rgba(255,255,255,0.9),inset_0_-3px_6px_rgba(148,163,184,0.5)] border border-white/60 p-2 flex items-center justify-center">
            
            {/* Top Head Highlight */}
            <div className="absolute top-1 left-4 right-4 h-2.5 bg-gradient-to-b from-white to-transparent rounded-full opacity-90 pointer-events-none" />

            {/* Left Ear Muff Cylinder with Glowing Cyan LED */}
            <div className="absolute -left-2.5 top-6 w-3 h-7 rounded-full bg-slate-200 border border-white shadow-sm flex items-center justify-center">
              <span className="w-1.5 h-3 rounded-full bg-cyan-400 shadow-[0_0_8px_#00f2fe] animate-pulse" />
            </div>

            {/* Right Ear Muff Cylinder with Glowing Cyan LED */}
            <div className="absolute -right-2.5 top-6 w-3 h-7 rounded-full bg-slate-200 border border-white shadow-sm flex items-center justify-center">
              <span className="w-1.5 h-3 rounded-full bg-cyan-400 shadow-[0_0_8px_#00f2fe] animate-pulse" />
            </div>

            {/* Front Glossy Visor Screen */}
            <div className="relative w-[76px] h-[52px] rounded-[20px] bg-gradient-to-b from-[#06101e] via-[#091528] to-[#040810] border-2 border-slate-700/80 shadow-[inset_0_2px_8px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col items-center justify-center p-1">
              
              {/* Visor Diagonal Glass Reflection */}
              <div className="absolute -top-3 -left-3 w-16 h-8 bg-white/15 rounded-full transform -rotate-25 pointer-events-none" />

              {/* Digital Cyan Eyes Container */}
              <div className="flex items-center justify-center gap-3.5 mb-1 z-10">
                {/* Left Eye */}
                <div
                  className="transition-transform duration-100 ease-out"
                  style={{
                    transform: `translate3d(${eyeOffset.x}px, ${eyeOffset.y}px, 0)`,
                  }}
                >
                  {isBlinking ? (
                    <div className="w-4 h-0.5 bg-cyan-400 rounded-full shadow-[0_0_8px_#00f2fe]" />
                  ) : isHovered ? (
                    // Happy Eye Arch (^ ^)
                    <div className="w-4 h-3 border-t-3 border-cyan-300 rounded-t-full shadow-[0_0_10px_#00f2fe]" />
                  ) : (
                    // Normal Rounded Cyber Eye
                    <div className="w-3.5 h-4 bg-gradient-to-b from-cyan-200 to-cyan-400 rounded-[8px] shadow-[0_0_12px_#00f2fe] flex items-center justify-center">
                      <div className="w-1 h-1 bg-white rounded-full self-start mt-0.5 ml-0.5" />
                    </div>
                  )}
                </div>

                {/* Right Eye */}
                <div
                  className="transition-transform duration-100 ease-out"
                  style={{
                    transform: `translate3d(${eyeOffset.x}px, ${eyeOffset.y}px, 0)`,
                  }}
                >
                  {isBlinking ? (
                    <div className="w-4 h-0.5 bg-cyan-400 rounded-full shadow-[0_0_8px_#00f2fe]" />
                  ) : isHovered ? (
                    // Happy Eye Arch (^ ^)
                    <div className="w-4 h-3 border-t-3 border-cyan-300 rounded-t-full shadow-[0_0_10px_#00f2fe]" />
                  ) : (
                    // Normal Rounded Cyber Eye
                    <div className="w-3.5 h-4 bg-gradient-to-b from-cyan-200 to-cyan-400 rounded-[8px] shadow-[0_0_12px_#00f2fe] flex items-center justify-center">
                      <div className="w-1 h-1 bg-white rounded-full self-start mt-0.5 ml-0.5" />
                    </div>
                  )}
                </div>
              </div>

              {/* Digital Cyan Mouth */}
              <div className="z-10 transition-all duration-200">
                {isHovered ? (
                  // Open Happy Smile Mouth (D)
                  <div className="w-3.5 h-2 bg-cyan-300 rounded-b-full shadow-[0_0_8px_#00f2fe]" />
                ) : (
                  // Cute subtle smile arc
                  <div className="w-3 h-1 border-b-2 border-cyan-400/90 rounded-b-full shadow-[0_0_6px_#00f2fe]" />
                )}
              </div>

            </div>
          </div>

          {/* B. ROBOT BODY & FLOATING ARMS */}
          <div className="relative -mt-1.5 flex items-center justify-center">
            {/* Left Floating Arm */}
            <div
              className={`w-3 h-8 rounded-full bg-gradient-to-b from-white to-slate-300 border border-white/60 shadow-sm mr-1 transition-transform ${
                isHovered ? "transform -rotate-30 -translate-y-1" : "transform -rotate-12"
              }`}
            />

            {/* Torso / Body */}
            <div className="w-14 h-12 rounded-[20px] bg-gradient-to-b from-white via-slate-100 to-slate-300 border border-white/60 shadow-[0_8px_16px_rgba(0,0,0,0.4)] flex flex-col items-center pt-2">
              {/* Chest LED status light */}
              <div className="w-2.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#00f2fe] animate-pulse" />
              {/* Seam line */}
              <div className="w-8 h-[1px] bg-slate-400/40 mt-3" />
            </div>

            {/* Right Floating Arm */}
            <div
              className={`w-3 h-8 rounded-full bg-gradient-to-b from-white to-slate-300 border border-white/60 shadow-sm ml-1 transition-transform ${
                isHovered ? "transform rotate-45 -translate-y-2 animate-wave" : "transform rotate-12"
              }`}
            />
          </div>

        </div>

        {/* C. 3D Levitation Shadow */}
        <div
          className={`w-14 h-2.5 bg-black/50 rounded-full blur-[3px] mt-1 transition-all duration-300 ${
            isHovered ? "scale-90 opacity-40" : "scale-100 opacity-60"
          }`}
        />
      </div>
    </aside>
  );
}
