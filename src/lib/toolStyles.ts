/**
 * Utility helper to provide distinctive branded masked gradient text classes
 * and badges for Toolsbd.com software utilities.
 */

export function getToolTitleClass(name: string = ""): string {
  const lower = name.toLowerCase();
  if (lower.includes("tiktok")) {
    return "text-gradient-tiktok";
  }
  if (lower.includes("instagram")) {
    return "text-gradient-instagram";
  }
  if (lower.includes("fast otp") || lower.includes("fb") || lower.includes("auto resender")) {
    return "text-gradient-fb";
  }
  return "text-white";
}

export function getToolBadgeStyle(name: string = ""): {
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  dotColor: string;
  brandTag: string;
} {
  const lower = name.toLowerCase();
  if (lower.includes("tiktok")) {
    return {
      badgeBg: "bg-cyan-950/80",
      badgeText: "text-cyan-300",
      badgeBorder: "border-cyan-400/50",
      dotColor: "bg-[#00f2fe]",
      brandTag: "TIKTOK AUTOMATION",
    };
  }
  if (lower.includes("instagram")) {
    return {
      badgeBg: "bg-fuchsia-950/80",
      badgeText: "text-pink-300",
      badgeBorder: "border-pink-500/50",
      dotColor: "bg-[#fd1d1d]",
      brandTag: "INSTAGRAM AUTOMATION",
    };
  }
  return {
    badgeBg: "bg-yellow-400/15",
    badgeText: "text-yellow-300",
    badgeBorder: "border-yellow-400/40",
    dotColor: "bg-yellow-400",
    brandTag: "FLAGSHIP UTILITY",
  };
}
