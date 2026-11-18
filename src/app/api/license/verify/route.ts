import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

const SIGNING_SECRET = process.env.LICENSE_SIGNING_SECRET || "toolsbd_hwid_secret_2026";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { key, hwid, toolId } = body;

    if (!hwid && !key) {
      return NextResponse.json(
        { success: false, error: "Please provide at least key or hwid." },
        { status: 400 }
      );
    }

    // 1. Live Firebase Firestore Check (`fb-resend-otp`)
    try {
      let licData: any = null;
      let licDocRef = null;

      // Lookup by Key first if provided
      if (key) {
        const ref = doc(db, "licenses", key.trim());
        const snap = await getDoc(ref);
        if (snap.exists()) {
          licData = snap.data();
          licDocRef = ref;
        }
      }

      // Or lookup directly by HWID in `hwid_keys` collection
      if (!licData && hwid) {
        const hwidSnap = await getDoc(doc(db, "hwid_keys", hwid.trim()));
        if (hwidSnap.exists()) {
          licData = hwidSnap.data();
        }
      }

      if (licData) {
        if (licData.status !== "ACTIVE") {
          return NextResponse.json(
            { success: false, error: `License is ${String(licData.status).toLowerCase()}. Access denied.` },
            { status: 403 }
          );
        }

        if (toolId && licData.toolId && licData.toolId !== toolId) {
          return NextResponse.json(
            { success: false, error: "License key is not assigned to this tool." },
            { status: 403 }
          );
        }

        if (licData.expiresAt && new Date(licData.expiresAt).getTime() < Date.now()) {
          return NextResponse.json(
            { success: false, error: "License has expired. Please renew on Toolsbd.com." },
            { status: 403 }
          );
        }

        // Check HWID match / bind on first activation
        if (hwid) {
          if (!licData.hwid && licDocRef) {
            await updateDoc(licDocRef, { hwid: hwid.trim() });
            licData.hwid = hwid.trim();
          } else if (licData.hwid && licData.hwid !== hwid.trim()) {
            return NextResponse.json(
              {
                success: false,
                error: "HWID mismatch. Reset your HWID on Toolsbd.com dashboard to switch PCs."
              },
              { status: 401 }
            );
          }
        }

        const token = crypto
          .createHmac("sha256", SIGNING_SECRET)
          .update(`${licData.key}:${hwid || licData.hwid}:${Date.now()}`)
          .digest("hex");

        return NextResponse.json({
          success: true,
          source: "firebase:fb-resend-otp",
          message: "License validated successfully via Firebase.",
          data: {
            key: licData.key,
            hwid: licData.hwid,
            toolId: licData.toolId,
            status: "ACTIVE",
            expiresAt: licData.expiresAt,
            token,
            serverTime: new Date().toISOString()
          }
        });
      }
    } catch (fbErr: any) {
      console.warn("Firestore check skipped/fallback:", fbErr?.message);
    }

    // 2. Fallback demo key check for local testing
    if (key === "TBD-OTP-7D-9A2F-84BC-4E11" || key === "NEX-OTP-7D-9A2F-84BC-4E11") {
      if (hwid && hwid !== "BFEBFBFF000906EA-F48E-381A-B19F") {
        return NextResponse.json(
          { success: false, error: "HWID mismatch. Reset HWID in your dashboard." },
          { status: 401 }
        );
      }
      const token = crypto
        .createHmac("sha256", SIGNING_SECRET)
        .update(`${key}:${hwid}:${Date.now()}`)
        .digest("hex");

      return NextResponse.json({
        success: true,
        source: "local-fallback",
        message: "Demo license validated successfully.",
        data: {
          key,
          hwid,
          toolId: toolId || "tool-otp-utility",
          status: "ACTIVE",
          expiresAt: new Date(Date.now() + 7 * 86400000).toISOString(),
          token,
          serverTime: new Date().toISOString()
        }
      });
    }

    return NextResponse.json(
      { success: false, error: "License key or HWID not found in Toolsbd.com Firebase registry." },
      { status: 404 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error during license verification." },
      { status: 500 }
    );
  }
}
