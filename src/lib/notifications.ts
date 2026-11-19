/**
 * Toolsbd PWA & Audio / Push Notification Helper
 * Works on Desktop and Mobile browsers without external dependencies.
 */

// Synthesize pleasant chime sounds using the Web Audio API
export function playChimeSound(type: "success" | "alert" | "coin" = "success") {
  if (typeof window === "undefined") return;
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    if (type === "coin" || type === "success") {
      // Pleasant high two-tone chime (e.g. 587.33Hz D5 -> 880Hz A5)
      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(587.33, now);
      osc1.frequency.exponentialRampToValueAtTime(880, now + 0.15);
      gain1.gain.setValueAtTime(0.25, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.45);

      // Harmonious second chime
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = "triangle";
      osc2.frequency.setValueAtTime(880, now + 0.15);
      osc2.frequency.exponentialRampToValueAtTime(1174.66, now + 0.35);
      gain2.gain.setValueAtTime(0.2, now + 0.15);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.15);
      osc2.stop(now + 0.65);
    } else {
      // Alert chime for new order / deposit (three quick tones)
      const now = ctx.currentTime;
      [440, 554.37, 659.25].forEach((freq, idx) => {
        const t = now + idx * 0.1;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.3, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.25);
      });
    }
  } catch (err) {
    // Audio context may be restricted before user interaction
    console.debug("Audio chime error:", err);
  }
}

// Request and trigger Web Browser Push Notification
export async function showBrowserNotification(title: string, options?: NotificationOptions) {
  if (typeof window === "undefined" || !("Notification" in window)) return;

  try {
    let permission = Notification.permission;
    if (permission === "default") {
      permission = await Notification.requestPermission();
    }

    if (permission === "granted") {
      // If service worker is registered, show via SW for native notification tray support
      if ("serviceWorker" in navigator) {
        try {
          const reg = await navigator.serviceWorker.ready;
          if (reg && reg.showNotification) {
            reg.showNotification(title, {
              icon: "/icon-192.png",
              badge: "/icon-192.png",
              vibrate: [200, 100, 200],
              ...options,
            } as any);
            return;
          }
        } catch {
          // fallback to new Notification
        }
      }

      new Notification(title, {
        icon: "/icon-192.png",
        ...options,
      });
    }
  } catch (e) {
    console.debug("Notification display notice:", e);
  }
}

// Register service worker on initial load
export function registerPwaServiceWorker() {
  if (typeof window !== "undefined" && "serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          console.debug("Toolsbd PWA ServiceWorker registered with scope:", reg.scope);
        })
        .catch((err) => {
          console.debug("Toolsbd PWA ServiceWorker registration notice:", err);
        });
    });
  }
}
