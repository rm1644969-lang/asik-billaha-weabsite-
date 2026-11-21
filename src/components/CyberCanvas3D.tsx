"use client";

import React from "react";

interface CyberCanvas3DProps {
  className?: string;
  variant?: "particles" | "cyber-rings" | "floating-geometry";
  interactive?: boolean;
}

function CyberCanvas3DComponent({
  className = "",
}: CyberCanvas3DProps) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none overflow-hidden select-none ${className}`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(245,158,11,0.05),transparent_70%)]" />
    </div>
  );
}

const CyberCanvas3D = React.memo(CyberCanvas3DComponent);
export default CyberCanvas3D;
