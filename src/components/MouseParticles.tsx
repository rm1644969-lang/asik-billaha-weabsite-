"use client";

import React, { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  color: string;
  maxLife: number;
  life: number;
}

const CYBER_COLORS = [
  "#facc15", // Neon Gold
  "#00f2fe", // Electric Cyan
  "#ef4444", // Crimson Red
  "#38bdf8", // Sky Blue
  "#ffffff", // Star White
];

export default function MouseParticles() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    // Only run on non-touch devices
    if (typeof window === "undefined") return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const onResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", onResize, { passive: true });

    const particles: Particle[] = [];
    let isLoopRunning = false;
    let lastSpawnTime = 0;

    const spawnParticles = (x: number, y: number, count = 2) => {
      const now = performance.now();
      if (now - lastSpawnTime < 16) return; // Throttle to max 60 fps
      lastSpawnTime = now;

      for (let i = 0; i < count; i++) {
        if (particles.length > 50) particles.shift(); // Hard cap for optimal performance
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 1.5 + 0.5;
        const color = CYBER_COLORS[Math.floor(Math.random() * CYBER_COLORS.length)];
        const maxLife = Math.random() * 35 + 25; // frames

        particles.push({
          x: x + (Math.random() - 0.5) * 8,
          y: y + (Math.random() - 0.5) * 8,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed + 0.3, // slight downward drift
          radius: Math.random() * 2.2 + 1.2,
          alpha: 1,
          color,
          maxLife,
          life: maxLife,
        });
      }

      if (!isLoopRunning) {
        isLoopRunning = true;
        requestAnimationFrame(updateLoop);
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      spawnParticles(e.clientX, e.clientY, 2);
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });

    const updateLoop = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life--;
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.96;
        p.vy *= 0.96;
        p.alpha = Math.max(0, p.life / p.maxLife);

        if (p.life <= 0 || p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.shadowBlur = 8;
        ctx.shadowColor = p.color;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * (p.life / p.maxLife), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      if (particles.length > 0) {
        requestAnimationFrame(updateLoop);
      } else {
        isLoopRunning = false;
        ctx.clearRect(0, 0, width, height);
      }
    };

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-40 overflow-hidden"
      style={{ opacity: 0.85 }}
    />
  );
}
