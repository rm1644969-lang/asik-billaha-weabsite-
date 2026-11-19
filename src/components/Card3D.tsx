"use client";

import React, { useRef, useState, useCallback } from "react";

interface Card3DProps {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number; // max tilt degrees (e.g. 10)
  glare?: boolean;  // whether to show dynamic 3D glare light
  depth?: number;   // 3D scale
}

export default function Card3D({
  children,
  className = "",
  maxTilt = 8,
  glare = true,
  depth = 1.02,
}: Card3DProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transformStyle, setTransformStyle] = useState<string>("");
  const [glareStyle, setGlareStyle] = useState<{ x: number; y: number; opacity: number }>({
    x: 50,
    y: 50,
    opacity: 0,
  });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -maxTilt;
    const rotateY = ((x - centerX) / centerX) * maxTilt;

    setTransformStyle(
      `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(${depth}, ${depth}, ${depth})`
    );

    if (glare) {
      const glareX = (x / rect.width) * 100;
      const glareY = (y / rect.height) * 100;
      setGlareStyle({ x: glareX, y: glareY, opacity: 0.18 });
    }
  }, [maxTilt, depth, glare]);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTransformStyle("perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)");
    setGlareStyle((prev) => ({ ...prev, opacity: 0 }));
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: transformStyle || "perspective(1000px) rotateX(0deg) rotateY(0deg)",
        transition: isHovered ? "transform 0.1s ease-out" : "transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)",
        transformStyle: "preserve-3d",
      }}
      className={`relative will-change-transform ${className}`}
    >
      {children}

      {/* 3D Glass Light Glare / Sheen Overlay */}
      {glare && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-2xl z-20 transition-opacity duration-300"
          style={{
            opacity: glareStyle.opacity,
            background: `radial-gradient(circle at ${glareStyle.x}% ${glareStyle.y}%, rgba(250, 204, 21, 0.4) 0%, rgba(239, 68, 68, 0.15) 30%, transparent 65%)`,
          }}
        />
      )}
    </div>
  );
}
