"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { registerPwaServiceWorker } from "@/lib/notifications";

export default function PwaRegister() {
  const pathname = usePathname();

  useEffect(() => {
    registerPwaServiceWorker();

    // Dynamically set manifest link based on route
    const isAdmin = pathname.startsWith("/admin");
    const targetManifest = isAdmin ? "/manifest-admin.json" : "/manifest.json";
    const targetThemeColor = isAdmin ? "#EF4444" : "#FACC15";

    let link = document.querySelector('link[rel="manifest"]') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.rel = "manifest";
      document.head.appendChild(link);
    }
    if (link.href !== window.location.origin + targetManifest) {
      link.href = targetManifest;
    }

    let metaTheme = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement | null;
    if (!metaTheme) {
      metaTheme = document.createElement("meta");
      metaTheme.name = "theme-color";
      document.head.appendChild(metaTheme);
    }
    metaTheme.content = targetThemeColor;

    // Listen for beforeinstallprompt and dispatch custom event
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      (window as any).deferredPrompt = e;
      window.dispatchEvent(new CustomEvent("pwa-installable", { detail: e }));
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, [pathname]);

  return null;
}
