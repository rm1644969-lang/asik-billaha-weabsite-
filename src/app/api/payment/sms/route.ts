import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { webDb, licenseDb } from "@/lib/firebase";
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  setDoc, 
  updateDoc, 
  serverTimestamp, 
  increment 
} from "firebase/firestore";

const DEVICE_PROVISION_SECRET = process.env.SMS_DEVICE_SECRET || "sec_live_9f83ca42d992e10650b2ed6cb6bb79";

function generateToolLicenseKey(): string {
  const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  const seg = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `AT-${seg()}-${seg()}-${seg()}-${seg()}`;
}

function formatSqlDateTime(d: Date): string {
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function parseSmsText(text: string): { trxId?: string; amount?: number; provider?: string } {
  let trxId: string | undefined;
  let amount: number | undefined;
  let provider = "Unknown";

  if (/bKash/i.test(text)) provider = "bKash";
  else if (/Rocket|DBBL/i.test(text)) provider = "Rocket";

  // Match TrxID or TxnId (e.g. TrxID BK992A81KC or TxnId: 82736192)
  const trxMatch = text.match(/(?:TrxID|TxnID|TxnId|TrxId|transaction\s*id)[\s:]*([A-Za-z0-9]+)/i);
  if (trxMatch) {
    trxId = trxMatch[1].trim().toUpperCase();
  }

  // Match Amount (e.g. Tk 240.00, Tk. 240, Amount: Tk 480)
  const amountMatch = text.match(/(?:Tk|Tk\.|BDT|Amount:?\s*Tk\.?)\s*([0-9,]+(?:\.[0-9]{1,2})?)/i);
  if (amountMatch) {
    amount = parseFloat(amountMatch[1].replace(/,/g, ""));
  }

  return { trxId, amount, provider };
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-sms-signature");
    const headerSecret = req.headers.get("x-device-secret") || req.nextUrl.searchParams.get("secret");

    // Optional Security verification (allows MacroDroid and SMS forwarders using either secret or HMAC)
    if (signature) {
      const expectedSig = crypto
        .createHmac("sha256", DEVICE_PROVISION_SECRET)
        .update(rawBody)
        .digest("hex");

      if (signature !== expectedSig) {
        return NextResponse.json(
          { success: false, error: "Invalid HMAC signature. Unauthorized device." },
          { status: 403 }
        );
      }
    } else if (headerSecret && headerSecret !== DEVICE_PROVISION_SECRET) {
      return NextResponse.json(
        { success: false, error: "Invalid device secret. Unauthorized device." },
        { status: 403 }
      );
    }

    let payload: any = {};
    try {
      payload = JSON.parse(rawBody);
    } catch {
      payload = { rawMessage: rawBody };
    }

    // Handle Gateway Heartbeat / Diagnostic Ping
    if (payload.action === "ping" || payload.action === "heartbeat") {
      try {
        const deviceId = payload.deviceId || req.headers.get("x-device-id") || "toolsbd-android-primary";
        const devRef = doc(webDb, "sms_devices", deviceId);
        await setDoc(devRef, {
          deviceId,
          name: "Toolsbd PaySync Companion Phone",
          model: payload.model || "Android Gateway Phone",
          batteryLevel: payload.batteryLevel ?? 100,
          status: "ONLINE",
          lastHeartbeat: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
          lastPingTimestamp: serverTimestamp()
        }, { merge: true });
      } catch (err) {
        console.warn("Failed to update sms_device heartbeat doc:", err);
      }

      return NextResponse.json({
        success: true,
        message: "Toolsbd SMS Gateway online and connected.",
        timestamp: new Date().toISOString()
      });
    }

    const messageText = payload.rawMessage || payload.message || payload.body || payload.text || payload.content || "";
    let trxId = (payload.trxId || payload.trx_id || "").trim().toUpperCase();
    let amount = payload.amount ? Number(payload.amount) : undefined;
    let sender = payload.sender || payload.from || "bKash";

    // Auto-parse if raw text was received from Android SMS app
    if ((!trxId || !amount) && messageText) {
      const parsed = parseSmsText(messageText);
      if (parsed.trxId) trxId = parsed.trxId;
      if (parsed.amount) amount = parsed.amount;
      if (parsed.provider) sender = parsed.provider;
    }

    if (!trxId) {
      return NextResponse.json(
        { success: false, error: "Could not find or parse Transaction ID (TrxID) from SMS payload." },
        { status: 400 }
      );
    }

    let matchedTarget: string | null = null;
    let generatedLicenseKey: string | null = null;

    // 1. CHECK AND AUTO-APPROVE ORDERS (Direct Tool Purchases)
    try {
      const ordersRef = collection(webDb, "orders");
      const orderQ = query(ordersRef, where("trxId", "==", trxId));
      const orderSnap = await getDocs(orderQ);

      if (!orderSnap.empty) {
        for (const orderDoc of orderSnap.docs) {
          const ord = orderDoc.data();
          if (ord.status === "PENDING") {
            generatedLicenseKey = generateToolLicenseKey();
            const expires = new Date();
            expires.setDate(expires.getDate() + (ord.planDuration || 7));

            // Update order in Primary Web Firebase (asik-billaha-weabsite)
            await updateDoc(doc(webDb, "orders", orderDoc.id), {
              status: "PAID",
              licenseKey: generatedLicenseKey,
              paidAt: serverTimestamp(),
              notes: "Auto-verified by Companion Android Phone SMS Gateway.",
              matchedSmsAt: serverTimestamp()
            });

            // Write active license to Secondary License Firebase (fb-resend-otp)
            await setDoc(
              doc(licenseDb, "licenses", generatedLicenseKey),
              {
                license_key: generatedLicenseKey,
                bound_hwid: "",
                status: "active",
                client_name: ord.userEmail || "Customer",
                created_at: formatSqlDateTime(new Date()),
                expires_at: formatSqlDateTime(expires),
                total_checks: 0,
                durationDays: ord.planDuration || 7,
                orderId: orderDoc.id,
                userEmail: ord.userEmail,
                updatedAt: serverTimestamp()
              },
              { merge: true }
            );

            matchedTarget = `Order #${ord.orderNumber || orderDoc.id}`;
            break;
          }
        }
      }
    } catch (orderErr: any) {
      console.warn("Order auto-approval notice:", orderErr?.message);
    }

    // 2. CHECK AND AUTO-APPROVE WALLET DEPOSITS (Add Money)
    try {
      const depRef = collection(webDb, "wallet_deposits");
      const depQ = query(depRef, where("trxId", "==", trxId));
      const depSnap = await getDocs(depQ);

      if (!depSnap.empty) {
        for (const depDoc of depSnap.docs) {
          const dep = depDoc.data();
          if (dep.status === "PENDING") {
            // Approve deposit
            await updateDoc(doc(webDb, "wallet_deposits", depDoc.id), {
              status: "APPROVED",
              approvedAt: serverTimestamp(),
              notes: "Auto-approved by Companion Phone SMS Gateway."
            });

            // Credit user wallet in Primary Web Firebase (Syncs across all devices)
            const targetUserKey = (dep.userEmail || dep.userId || "").toLowerCase().trim();
            if (targetUserKey) {
              await setDoc(doc(webDb, "users", targetUserKey), {
                walletBalanceUSD: increment(dep.amountUSD || 2),
                walletBalanceBDT: increment(dep.amountBDT || 240),
                updatedAt: serverTimestamp()
              }, { merge: true });
            }
            if (dep.userId && dep.userId !== targetUserKey) {
              try {
                await setDoc(doc(webDb, "users", dep.userId), {
                  walletBalanceUSD: increment(dep.amountUSD || 2),
                  walletBalanceBDT: increment(dep.amountBDT || 240),
                  updatedAt: serverTimestamp()
                }, { merge: true });
              } catch (_) {}
            }

            matchedTarget = `Wallet Deposit #${depDoc.id} ($${dep.amountUSD})`;
            break;
          }
        }
      }
    } catch (depErr: any) {
      console.warn("Deposit auto-approval notice:", depErr?.message);
    }

    // 3. LOG INCOMING SMS INTO sms_records
    try {
      await setDoc(doc(webDb, "sms_records", `sms-${Date.now()}`), {
        trxId,
        amount: amount || 0,
        sender,
        rawMessage: messageText || rawBody,
        status: matchedTarget ? "MATCHED" : "UNMATCHED",
        matchedTarget: matchedTarget || null,
        receivedAt: serverTimestamp()
      });
    } catch {}

    return NextResponse.json({
      success: true,
      message: matchedTarget 
        ? `SMS received & automatically verified! Matched with ${matchedTarget}.` 
        : `SMS received and recorded for TrxID: ${trxId}. Awaiting matching order/deposit.`,
      data: {
        trxId,
        amount: amount || 0,
        sender,
        matched: !!matchedTarget,
        licenseKey: generatedLicenseKey,
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
