import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { licenseDb, FIREBASE_LICENSE_PROJECT_ID, IS_DUAL_FIREBASE_ACTIVE } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

const SIGNING_SECRET = process.env.LICENSE_SIGNING_SECRET || "toolsbd_hwid_secret_2026";
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 Minutes In-Memory Server Cache
const OFFLINE_TOKEN_VALIDITY_HOURS = 12; // 12 Hours offline token for desktop tools

/**
 * In-Memory Server Cache:
 * Stores verification results in Node/Serverless RAM to avoid burning Firestore reads.
 * 
 * If 10,000 desktop tools query this endpoint, 99% of requests are answered in 0.2ms
 * with ZERO reads to Firestore!
 */
interface CacheEntry {
  data: any;
  cachedAt: number;
  expiresAt: number;
}

// Global cache map persisted across warm serverless invocations
const verificationCache = new Map<string, CacheEntry>();

// Rate limiter map: tracks request count per IP/HWID (max 60 requests per minute)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

// Telemetry counters
let totalVerifications = 0;
let cacheHits = 0;
let firestoreReads = 0;

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + 60000 });
    return true;
  }
  if (entry.count >= 60) {
    return false; // Rate limit exceeded (more than 60 checks/min from single entity)
  }
  entry.count++;
  return true;
}

function cleanExpiredCache() {
  const now = Date.now();
  if (verificationCache.size > 2000) {
    verificationCache.forEach((v, k) => {
      if (now > v.expiresAt) {
        verificationCache.delete(k);
      }
    });
  }
}

/**
 * Creates a cryptographically signed offline token that desktop tools can verify locally for 12 hours
 */
function createSignedOfflineToken(licenseKey: string, hwid: string, validityHours = 12) {
  const expiresAt = new Date(Date.now() + validityHours * 3600 * 1000).toISOString();
  const payload = `${licenseKey}::${hwid}::${expiresAt}`;
  const signature = crypto.createHmac("sha256", SIGNING_SECRET).update(payload).digest("hex");
  return {
    token: Buffer.from(JSON.stringify({ payload, signature })).toString("base64"),
    signature,
    validUntil: expiresAt,
    validityHours,
  };
}

export async function GET() {
  // Health & Quota Telemetry status
  return NextResponse.json({
    status: "online",
    service: "Toolsbd.com License Guard API v4.2",
    dualFirebase: {
      active: IS_DUAL_FIREBASE_ACTIVE,
      projectId: FIREBASE_LICENSE_PROJECT_ID,
    },
    quotaProtection: {
      strategy: "Dual-Firebase + 15m RAM Cache + 12h Cryptographic Offline Tokens",
      totalVerifications,
      cacheHits,
      firestoreReads,
      estimatedQuotaSaved: cacheHits,
      cachedEntriesCount: verificationCache.size,
      offlineTokenValidityHours: OFFLINE_TOKEN_VALIDITY_HOURS,
    },
    serverTime: new Date().toISOString(),
  });
}

export async function POST(req: NextRequest) {
  totalVerifications++;
  cleanExpiredCache();

  try {
    const body = await req.json();
    const { key, hwid, toolId } = body;

    const cleanKey = typeof key === "string" ? key.trim() : "";
    const cleanHwid = typeof hwid === "string" ? hwid.trim() : "";

    if (!cleanKey && !cleanHwid) {
      return NextResponse.json(
        { success: false, error: "Please provide license key or machine HWID." },
        { status: 400 }
      );
    }

    // Rate Limiting Check
    const rateLimitKey = cleanHwid || cleanKey || req.ip || "unknown-client";
    if (!checkRateLimit(rateLimitKey)) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Rate limit exceeded (Max 60 requests/min). Use the 12-hour offline token." 
        },
        { status: 429 }
      );
    }

    // ------------------------------------------------------------------------
    // TIER 1: HIGH-SPEED IN-MEMORY CACHE LOOKUP (0 FIRESTORE READS)
    // ------------------------------------------------------------------------
    const cacheKey = `${cleanKey}::${cleanHwid}::${toolId || "all"}`;
    const cached = verificationCache.get(cacheKey);

    if (cached && Date.now() < cached.expiresAt) {
      cacheHits++;
      return NextResponse.json({
        ...cached.data,
        source: "server-in-memory-cache",
        quotaSaved: true,
        cacheTtlSecondsRemaining: Math.round((cached.expiresAt - Date.now()) / 1000),
      });
    }

    // ------------------------------------------------------------------------
    // TIER 2: QUERY DEDICATED LICENSE FIREBASE (`licenseDb`)
    // ------------------------------------------------------------------------
    let licData: any = null;
    let licDocRef: any = null;

    try {
      firestoreReads++;

      // 1. Lookup by License Key
      if (cleanKey) {
        const ref = doc(licenseDb, "licenses", cleanKey);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          licData = snap.data();
          licDocRef = ref;
        }
      }

      // 2. Lookup by HWID if key was not found or not provided
      if (!licData && cleanHwid) {
        firestoreReads++;
        const hwidSnap = await getDoc(doc(licenseDb, "hwid_keys", cleanHwid));
        if (hwidSnap.exists()) {
          licData = hwidSnap.data();
        }
      }

      if (licData) {
        // Status Check
        if (licData.status !== "ACTIVE") {
          return NextResponse.json(
            { 
              success: false, 
              error: `License is ${String(licData.status).toLowerCase()}. Please visit Toolsbd.com to reactivate.` 
            },
            { status: 403 }
          );
        }

        // Tool ID Check
        if (toolId && licData.toolId && licData.toolId !== toolId) {
          return NextResponse.json(
            { success: false, error: "License key is assigned to a different software tool." },
            { status: 403 }
          );
        }

        // Expiry Date Check
        if (licData.expiresAt && new Date(licData.expiresAt).getTime() < Date.now()) {
          return NextResponse.json(
            { success: false, error: "License subscription has expired. Please renew on Toolsbd.com." },
            { status: 403 }
          );
        }

        // HWID Lock Verification or Initial HWID Binding
        if (cleanHwid) {
          if (!licData.hwid && licDocRef) {
            // First time activation on a machine: Lock HWID
            await updateDoc(licDocRef, { hwid: cleanHwid });
            licData.hwid = cleanHwid;
          } else if (licData.hwid && licData.hwid !== cleanHwid) {
            return NextResponse.json(
              {
                success: false,
                error: "HWID mismatch. Reset your HWID in your Toolsbd.com user dashboard to switch PCs."
              },
              { status: 401 }
            );
          }
        }

        // Generate 12-Hour Signed Offline Token
        const offlineToken = createSignedOfflineToken(licData.key, licData.hwid || cleanHwid, OFFLINE_TOKEN_VALIDITY_HOURS);

        const responsePayload = {
          success: true,
          source: `license-firebase:${FIREBASE_LICENSE_PROJECT_ID}`,
          message: "License & HWID validated successfully.",
          data: {
            key: licData.key,
            hwid: licData.hwid || cleanHwid,
            toolId: licData.toolId || "tool-otp-utility",
            status: "ACTIVE",
            expiresAt: licData.expiresAt,
            offlineToken: offlineToken.token,
            validUntil: offlineToken.validUntil,
            refreshIntervalSeconds: OFFLINE_TOKEN_VALIDITY_HOURS * 3600,
            recommendedCacheHours: OFFLINE_TOKEN_VALIDITY_HOURS,
            serverTime: new Date().toISOString(),
          }
        };

        // Store in Server In-Memory Cache (TTL 15 minutes)
        verificationCache.set(cacheKey, {
          data: responsePayload,
          cachedAt: Date.now(),
          expiresAt: Date.now() + CACHE_TTL_MS,
        });

        return NextResponse.json(responsePayload);
      }
    } catch (fbErr: any) {
      console.warn("Dedicated License Firestore query warning:", fbErr?.message);
    }

    // ------------------------------------------------------------------------
    // TIER 3: LOCAL FALLBACK DEMO KEYS (for offline/developer testing)
    // ------------------------------------------------------------------------
    const DEMO_KEYS: Record<string, { days: number; toolId: string; hwid?: string }> = {
      "TBD-OTP-7D-9A2F-84BC-4E11": { days: 7, toolId: "tool-otp-utility", hwid: "BFEBFBFF000906EA-F48E-381A-B19F" },
      "TBD-OTP-15D-77F1-309A-1102": { days: 15, toolId: "tool-otp-utility" },
      "TBD-OTP-30D-88AF-901B-CC44": { days: 30, toolId: "tool-otp-utility" },
      "NEX-OTP-7D-9A2F-84BC-4E11": { days: 7, toolId: "tool-otp-utility" }
    };

    if (cleanKey && DEMO_KEYS[cleanKey]) {
      const demo = DEMO_KEYS[cleanKey];
      if (demo.hwid && cleanHwid && demo.hwid !== cleanHwid) {
        return NextResponse.json(
          { success: false, error: "HWID mismatch. Reset HWID in your dashboard." },
          { status: 401 }
        );
      }

      const offlineToken = createSignedOfflineToken(cleanKey, cleanHwid || "DEMO-HWID", OFFLINE_TOKEN_VALIDITY_HOURS);
      const demoResponse = {
        success: true,
        source: "local-demo-verified",
        message: "Demo license key validated successfully.",
        data: {
          key: cleanKey,
          hwid: cleanHwid || demo.hwid || "DEMO-HWID",
          toolId: demo.toolId,
          status: "ACTIVE",
          expiresAt: new Date(Date.now() + demo.days * 86400000).toISOString(),
          offlineToken: offlineToken.token,
          validUntil: offlineToken.validUntil,
          refreshIntervalSeconds: OFFLINE_TOKEN_VALIDITY_HOURS * 3600,
          serverTime: new Date().toISOString(),
        }
      };

      verificationCache.set(cacheKey, {
        data: demoResponse,
        cachedAt: Date.now(),
        expiresAt: Date.now() + CACHE_TTL_MS,
      });

      return NextResponse.json(demoResponse);
    }

    return NextResponse.json(
      { 
        success: false, 
        error: "License key or HWID not found in Toolsbd.com registry. Please check your dashboard." 
      },
      { status: 404 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error during verification." },
      { status: 500 }
    );
  }
}
