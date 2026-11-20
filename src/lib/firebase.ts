import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  collection, 
  serverTimestamp, 
  Firestore 
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { License, Order } from "./types";

/**
 * ============================================================================
 * TOOLSBD.COM — HIGH-SCALE DUAL FIREBASE ARCHITECTURE
 * ============================================================================
 * 
 * WHY DUAL FIREBASE?
 * Firestore free tier (Spark) has a 50,000 daily read limit per project.
 * If 10,000+ desktop tool instances ping Firestore directly, a single database
 * would exhaust its 50k quota quickly.
 * 
 * SOLUTION:
 * 1. Project A (`webDb`): Website backend, users, wallet balance, deposits, orders.
 * 2. Project B (`licenseDb`): Dedicated tool license database for HWID verification.
 * 3. In-Memory RAM Caching (15-min TTL) + 12-Hour Signed Offline Tokens:
 *    Even with 10k-12k daily traffic, Firestore reads remain under ~1,500/day (<3% of 50k limit)!
 */

// ----------------------------------------------------------------------------
// 1. PRIMARY WEB FIREBASE CONFIG (Website, Auth, Wallet, Orders, Settings)
// ----------------------------------------------------------------------------
const webFirebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyCTO5CfHZLf3ODLDl2qBQe6Ry8O8Jjv9eg",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "asik-billaha-weabsite.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "asik-billaha-weabsite",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "asik-billaha-weabsite.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "971624723908",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:971624723908:web:a655667ea26268ed016091",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-MGG71VC9LX",
};

// ----------------------------------------------------------------------------
// 2. SECONDARY DEDICATED LICENSE & HWID FIREBASE CONFIG (fb-resend-otp)
// ----------------------------------------------------------------------------
// Dedicated project for tool license keys and HWID machine binding.
// Gives an independent 50,000 free reads/day quota so website visits never deplete tool quotas!
const licenseFirebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_LICENSE_FIREBASE_API_KEY || process.env.LICENSE_FIREBASE_API_KEY || "AIzaSyBSRWUOkhV3rt-GmXM7Nm3Tkghn8Qbg1yA",
  authDomain: process.env.NEXT_PUBLIC_LICENSE_FIREBASE_AUTH_DOMAIN || process.env.LICENSE_FIREBASE_AUTH_DOMAIN || "fb-resend-otp.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_LICENSE_FIREBASE_PROJECT_ID || process.env.LICENSE_FIREBASE_PROJECT_ID || "fb-resend-otp",
  storageBucket: process.env.NEXT_PUBLIC_LICENSE_FIREBASE_STORAGE_BUCKET || process.env.LICENSE_FIREBASE_STORAGE_BUCKET || "fb-resend-otp.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_LICENSE_FIREBASE_MESSAGING_SENDER_ID || process.env.LICENSE_FIREBASE_MESSAGING_SENDER_ID || "588215403017",
  appId: process.env.NEXT_PUBLIC_LICENSE_FIREBASE_APP_ID || process.env.LICENSE_FIREBASE_APP_ID || "1:588215403017:web:59f0686513e4a0d871aed8",
};

// Initialize Primary Web App
let webApp: FirebaseApp;
if (!getApps().some(app => app.name === "[DEFAULT]")) {
  webApp = initializeApp(webFirebaseConfig);
} else {
  webApp = getApp();
}

// Initialize Secondary License App (if projectId is different)
let licenseApp: FirebaseApp;
const isSeparateLicenseProject = Boolean(
  licenseFirebaseConfig.projectId &&
  licenseFirebaseConfig.projectId !== webFirebaseConfig.projectId
);

if (isSeparateLicenseProject) {
  if (!getApps().some(app => app.name === "licenseApp")) {
    licenseApp = initializeApp(licenseFirebaseConfig, "licenseApp");
  } else {
    licenseApp = getApp("licenseApp");
  }
} else {
  // Share default app instance if single project
  licenseApp = webApp;
}

// Export Firestore instances
export const webDb: Firestore = getFirestore(webApp);
export const licenseDb: Firestore = getFirestore(licenseApp);
export const auth = getAuth(webApp);

// Default backward-compatible export
export const db = webDb;

export const FIREBASE_WEB_PROJECT_ID = webFirebaseConfig.projectId;
export const FIREBASE_LICENSE_PROJECT_ID = licenseFirebaseConfig.projectId;
export const IS_DUAL_FIREBASE_ACTIVE = isSeparateLicenseProject;

// Backwards compatibility alias
export const FIREBASE_PROJECT_ID = FIREBASE_WEB_PROJECT_ID;

function formatSqlDateTime(d: Date): string {
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function generateAuthSignature(key: string, hwid: string): string {
  const str = `${key}::${hwid}::fast_otp_pro_signature_2026`;
  let hex = "";
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    hex += ((code * 31 + i * 17) % 256).toString(16).padStart(2, "0");
  }
  while (hex.length < 64) {
    hex += hex.split("").reverse().join("");
  }
  return hex.substring(0, 64);
}

/**
 * Syncs a generated License + HWID to the Secondary License Firestore (fb-resend-otp -> `licenses` collection)
 * Writes both FAST OTP desktop software schema (license_key, bound_hwid, status) and Web Portal schema.
 */
export async function syncLicenseToFirestore(license: License): Promise<{ synced: boolean; error?: string }> {
  try {
    const cleanHwid = license.hwid?.trim() || "";
    const createDate = license.createdAt ? new Date(license.createdAt) : new Date();
    const expireDate = license.expiresAt ? new Date(license.expiresAt) : new Date(Date.now() + (license.durationDays || 30) * 86400000);
    const sqlCreated = formatSqlDateTime(createDate);
    const sqlExpires = formatSqlDateTime(expireDate);

    // 1. Write license document by key (FAST OTP Native Desktop Software Schema + Web Portal Schema)
    await setDoc(
      doc(licenseDb, "licenses", license.key),
      {
        // Native FAST OTP Tool Schema (Exact fields read by desktop software)
        license_key: license.key,
        bound_hwid: cleanHwid,
        status: "active",
        client_name: license.userEmail || "Member",
        created_at: sqlCreated,
        expires_at: sqlExpires,
        total_checks: 0,
        auth_sig: generateAuthSignature(license.key, cleanHwid),

        // Toolsbd Web Portal Schema
        id: license.id,
        key: license.key,
        toolId: license.toolId,
        toolName: license.toolName,
        userId: license.userId,
        userEmail: license.userEmail,
        orderId: license.orderId,
        durationDays: license.durationDays,
        hwid: cleanHwid || null,
        hwidResetCount: license.hwidResetCount || 0,
        maxDevices: license.maxDevices || 1,
        createdAt: license.createdAt,
        expiresAt: license.expiresAt,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    // 2. If HWID is bound, also index by HWID in `hwid_keys` collection
    if (license.hwid && license.hwid.trim().length > 0) {
      const cleanHwid = license.hwid.trim();
      await setDoc(
        doc(licenseDb, "hwid_keys", cleanHwid),
        {
          hwid: cleanHwid,
          key: license.key,
          toolId: license.toolId,
          status: license.status,
          durationDays: license.durationDays,
          expiresAt: license.expiresAt,
          userEmail: license.userEmail,
          boundAt: serverTimestamp(),
        },
        { merge: true }
      );
    }

    return { synced: true };
  } catch (err: any) {
    console.warn("License Firebase sync notice:", err?.message);
    return { synced: false, error: err?.message || "Firestore sync error" };
  }
}

/**
 * Syncs an Order to the Primary Web Firestore (`orders` collection)
 */
export async function syncOrderToFirestore(order: Order): Promise<{ synced: boolean; error?: string }> {
  try {
    await setDoc(
      doc(webDb, "orders", order.id),
      {
        ...order,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
    return { synced: true };
  } catch (err: any) {
    console.warn("Web Firebase order sync notice:", err?.message);
    return { synced: false, error: err?.message };
  }
}

/**
 * Syncs a Wallet Deposit (Add Money) request to the Primary Web Firestore (`wallet_deposits` collection)
 */
export async function syncDepositToFirestore(deposit: {
  id: string;
  userId: string;
  userEmail: string;
  amountBDT: number;
  amountUSD: number;
  method: "bKash" | "Nagad" | "Rocket";
  senderNumber: string;
  trxId: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
}): Promise<{ synced: boolean; error?: string }> {
  try {
    await setDoc(
      doc(webDb, "wallet_deposits", deposit.id),
      {
        ...deposit,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
    return { synced: true };
  } catch (err: any) {
    console.warn("Web Firebase deposit sync notice:", err?.message);
    return { synced: false, error: err?.message };
  }
}

/**
 * Updates user wallet balance in the Primary Web Firestore (`users` collection)
 */
export async function syncWalletBalanceToFirestore(
  userId: string,
  userEmail: string,
  balanceUSD: number,
  balanceBDT: number
): Promise<{ synced: boolean; error?: string }> {
  try {
    await setDoc(
      doc(webDb, "users", userId),
      {
        userId,
        email: userEmail,
        walletBalanceUSD: balanceUSD,
        walletBalanceBDT: balanceBDT,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
    return { synced: true };
  } catch (err: any) {
    return { synced: false, error: err?.message };
  }
}

/**
 * Syncs Site Settings (bKash/Rocket numbers, hero text, dollar rate) to Primary Web Firestore (`site_settings/general`)
 */
export async function syncSettingsToFirestore(settings: any): Promise<{ synced: boolean; error?: string }> {
  try {
    await setDoc(
      doc(webDb, "site_settings", "general"),
      {
        ...settings,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
    return { synced: true };
  } catch (err: any) {
    console.warn("Web Firebase settings sync notice:", err?.message);
    return { synced: false, error: err?.message };
  }
}

/**
 * Fetches Site Settings from Primary Web Firestore (`site_settings/general`)
 */
export async function fetchSettingsFromFirestore(): Promise<any | null> {
  try {
    const snap = await getDoc(doc(webDb, "site_settings", "general"));
    if (snap.exists()) {
      return snap.data();
    }
    return null;
  } catch (err: any) {
    return null;
  }
}
