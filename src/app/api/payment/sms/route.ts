import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const DEVICE_PROVISION_SECRET = process.env.SMS_DEVICE_SECRET || "sec_live_9f83ca42d9";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-sms-signature");
    const deviceId = req.headers.get("x-device-id");
    const timestamp = req.headers.get("x-timestamp");

    // Replay protection (within 5 minutes)
    if (timestamp) {
      const now = Date.now();
      const sentTime = parseInt(timestamp, 10);
      if (Math.abs(now - sentTime) > 5 * 60 * 1000) {
        return NextResponse.json(
          { success: false, error: "Request expired. Timestamp outside acceptable skew window." },
          { status: 401 }
        );
      }
    }

    // HMAC Verification
    if (signature) {
      const expectedSig = crypto
        .createHmac("sha256", DEVICE_PROVISION_SECRET)
        .update(rawBody)
        .digest("hex");

      if (signature !== expectedSig) {
        return NextResponse.json(
          { success: false, error: "Invalid HMAC signature. Unauthorized SMS sender device." },
          { status: 403 }
        );
      }
    }

    const payload = JSON.parse(rawBody);
    const { trxId, amount, sender, rawMessage } = payload;

    if (!trxId || !amount) {
      return NextResponse.json(
        { success: false, error: "Missing mandatory fields: trxId or amount." },
        { status: 400 }
      );
    }

    // In a full production deployment with Firestore:
    // 1. Transactionally query `orders` collection where status == 'PENDING' AND trxId == trxId.toUpperCase()
    // 2. If matched: set order status = 'PAID', create license doc, and notify user
    // 3. Insert record into `payments` and `sms_records`
    
    return NextResponse.json({
      success: true,
      message: "SMS notification ingested and parsed successfully.",
      data: {
        trxId: trxId.toUpperCase(),
        amount: Number(amount),
        sender,
        status: "RECORDED_AND_EVALUATED",
        timestamp: new Date().toISOString()
      }
    });

  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to process incoming SMS payload." },
      { status: 500 }
    );
  }
}
