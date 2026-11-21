"use client";

import React from "react";

interface Card3DProps {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
  glare?: boolean;
  depth?: number;
}

function Card3DComponent({
  children,
  className = "",
}: Card3DProps) {
  return (
    <div className={`relative transition-all duration-200 ${className}`}>
      {children}
    </div>
  );
}

const Card3D = React.memo(Card3DComponent);
export default Card3D;
