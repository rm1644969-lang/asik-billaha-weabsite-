import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, doc, setDoc, updateDoc, getDocs, collection, serverTimestamp } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { License, Order } from "./types";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBSRWUOkhV3rt-GmXM7Nm3Tkghn8Qbg1yA",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "fb-resend-otp.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "fb-resend-otp",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "fb-resend-otp.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "588215403017",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:588215403017:web:59f0686513e4a0d871aed8",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

export const FIREBASE_PROJECT_ID = firebaseConfig.projectId;

/**
 * Syncs a generated License + HWID directly to Firebase Firestore (`licenses` collection)
 * Also writes a lookup document under `hwid_keys/{hwid}` when HWID is present so desktop tools can query directly by HWID!
 */
export async function syncLicenseToFirestore(license: License): Promise<{ synced: boolean; error?: string }> {
  try {
    // 1. Write license document by key ID
    await setDoc(
      doc(db, "licenses", license.key),
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

    // 2. If HWID is bound, also index by HWID in `hwid_keys` collection for instant desktop tool verification
    if (license.hwid && license.hwid.trim().length > 0) {
      const cleanHwid = license.hwid.trim();
      await setDoc(
        doc(db, "hwid_keys", cleanHwid),
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
    console.warn("Firebase Firestore license sync note:", err?.message);
    return { synced: false, error: err?.message || "Firestore permission check required" };
  }
}

/**
 * Syncs an Order to Firebase Firestore (`orders` collection)
 */
export async function syncOrderToFirestore(order: Order): Promise<{ synced: boolean; error?: string }> {
  try {
    await setDoc(
      doc(db, "orders", order.id),
      {
        ...order,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
    return { synced: true };
  } catch (err: any) {
    console.warn("Firebase Firestore order sync note:", err?.message);
    return { synced: false, error: err?.message };
  }
}

/**
 * Syncs a Wallet Deposit (Add Money) request to Firebase Firestore (`wallet_deposits` collection)
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
      doc(db, "wallet_deposits", deposit.id),
      {
        ...deposit,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
    return { synced: true };
  } catch (err: any) {
    console.warn("Firebase Firestore deposit sync note:", err?.message);
    return { synced: false, error: err?.message };
  }
}

/**
 * Updates user wallet balance in Firebase Firestore (`users` collection)
 */
export async function syncWalletBalanceToFirestore(
  userId: string,
  userEmail: string,
  balanceUSD: number,
  balanceBDT: number
): Promise<{ synced: boolean; error?: string }> {
  try {
    await setDoc(
      doc(db, "users", userId),
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
