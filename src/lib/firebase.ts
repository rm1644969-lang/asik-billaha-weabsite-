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
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBSRWUOkhV3rt-GmXM7Nm3Tkghn8Qbg1yA",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "fb-resend-otp.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "fb-resend-otp",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "fb-resend-otp.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "588215403017",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:588215403017:web:59f0686513e4a0d871aed8",
};

// ----------------------------------------------------------------------------
// 2. SECONDARY LICENSE & HWID FIREBASE CONFIG (Desktop Tool Verification)
// ----------------------------------------------------------------------------
// If the user provides a second Firebase config, it connects to Project B.
// If not yet provided, it gracefully reuses Project A or local cache.
const licenseFirebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_LICENSE_FIREBASE_API_KEY || process.env.LICENSE_FIREBASE_API_KEY || webFirebaseConfig.apiKey,
  authDomain: process.env.NEXT_PUBLIC_LICENSE_FIREBASE_AUTH_DOMAIN || process.env.LICENSE_FIREBASE_AUTH_DOMAIN || webFirebaseConfig.authDomain,
  projectId: process.env.NEXT_PUBLIC_LICENSE_FIREBASE_PROJECT_ID || process.env.LICENSE_FIREBASE_PROJECT_ID || webFirebaseConfig.projectId,
  storageBucket: process.env.NEXT_PUBLIC_LICENSE_FIREBASE_STORAGE_BUCKET || process.env.LICENSE_FIREBASE_STORAGE_BUCKET || webFirebaseConfig.storageBucket,
  messagingSenderId: process.env.NEXT_PUBLIC_LICENSE_FIREBASE_MESSAGING_SENDER_ID || process.env.LICENSE_FIREBASE_MESSAGING_SENDER_ID || webFirebaseConfig.messagingSenderId,
  appId: process.env.NEXT_PUBLIC_LICENSE_FIREBASE_APP_ID || process.env.LICENSE_FIREBASE_APP_ID || webFirebaseConfig.appId,
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

/**
 * Syncs a generated License + HWID to the License Firestore (`licenses` collection)
 * Also writes an index document under `hwid_keys/{hwid}` for ultra-fast HWID queries.
 */
export async function syncLicenseToFirestore(license: License): Promise<{ synced: boolean; error?: string }> {
  try {
    // 1. Write license document by key
    await setDoc(
      doc(licenseDb, "licenses", license.key),
      {
        id: license.id,
        key: license.key,
        toolId: license.toolId,
        toolName: license.toolName,
        userId: license.userId,
        userEmail: license.userEmail,
        orderId: license.orderId,
        durationDays: license.durationDays,
        status: license.status,
        hwid: license.hwid || null,
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
  method: "bKash" | "Rocket";
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
