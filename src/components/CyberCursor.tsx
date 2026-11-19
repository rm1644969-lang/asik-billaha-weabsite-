"use client";

import React, { useEffect, useState, useRef } from "react";

export default function CyberCursor() {
  const [mounted, setMounted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  // Position tracking with smooth lerp
  const mousePos = useRef({ x: -100, y: -100 });
  const ringPos = useRef({ x: -100, y: -100 });
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    // Only enable on desktop pointer devices
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    if (isTouch) return;

    setMounted(true);

    const onMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      if (!isVisible) setIsVisible(true);

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`;
      }
    };

    const onMouseDown = () => setIsClicked(true);
    const onMouseUp = () => setIsClicked(false);
    const onMouseLeave = () => setIsVisible(false);
    const onMouseEnter = () => setIsVisible(true);

    // Check if hovering clickable elements
    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const isClickable = target.closest(
        "a, button, input, select, textarea, [role='button'], .cursor-pointer, .interactive-card"
      );
      setIsHovered(!!isClickable);
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);
    document.addEventListener("mouseleave", onMouseLeave);
    document.addEventListener("mouseenter", onMouseEnter);
    document.addEventListener("mouseover", onMouseOver, { passive: true });

    // Smooth lerp loop for the outer ring
    const render = () => {
      ringPos.current.x += (mousePos.current.x - ringPos.current.x) * 0.18;
      ringPos.current.y += (mousePos.current.y - ringPos.current.y) * 0.18;

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringPos.current.x}px, ${ringPos.current.y}px, 0) translate(-50%, -50%)`;
      }

      rafId.current = requestAnimationFrame(render);
    };

    rafId.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("mouseenter", onMouseEnter);
      document.removeEventListener("mouseover", onMouseOver);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [isVisible]);

  if (!mounted || !isVisible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden select-none">
      {/* 1. Outer Smooth Trailing Cyber Ring */}
      <div
        ref={ringRef}
        className={`fixed top-0 left-0 rounded-full transition-all duration-200 ease-out flex items-center justify-center will-change-transform ${
          isHovered
            ? "w-11 h-11 border-2 border-yellow-400 bg-yellow-400/10 shadow-[0_0_15px_rgba(250,204,21,0.5)] scale-110"
            : isClicked
            ? "w-6 h-6 border-2 border-red-500 bg-red-500/20 scale-90"
            : "w-8 h-8 border border-cyan-400/80 bg-cyan-400/5 shadow-[0_0_10px_rgba(0,242,254,0.35)]"
        }`}
      >
        {/* Subtle Cyber Reticle Crosshair Ticks */}
        <span className={`absolute -top-1 w-1 h-1 rounded-full ${isHovered ? "bg-yellow-400" : "bg-cyan-400"}`} />
        <span className={`absolute -bottom-1 w-1 h-1 rounded-full ${isHovered ? "bg-yellow-400" : "bg-cyan-400"}`} />
        <span className={`absolute -left-1 w-1 h-1 rounded-full ${isHovered ? "bg-yellow-400" : "bg-cyan-400"}`} />
        <span className={`absolute -right-1 w-1 h-1 rounded-full ${isHovered ? "bg-yellow-400" : "bg-cyan-400"}`} />
      </div>

      {/* 2. Inner Instantaneous Laser Center Dot */}
      <div
        ref={dotRef}
        className={`fixed top-0 left-0 rounded-full will-change-transform transition-colors duration-150 ${
          isHovered
            ? "w-2.5 h-2.5 bg-yellow-400 shadow-[0_0_10px_#facc15]"
            : isClicked
            ? "w-3 h-3 bg-red-500 shadow-[0_0_12px_#ef4444]"
            : "w-1.5 h-1.5 bg-cyan-300 shadow-[0_0_8px_#00f2fe]"
        }`}
      />
    </div>
  );
}
