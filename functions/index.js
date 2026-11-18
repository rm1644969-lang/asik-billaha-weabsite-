const functions = require("firebase-functions");
const admin = require("firebase-admin");
const crypto = require("crypto");

admin.initializeApp();
const db = admin.firestore();

const DEVICE_PROVISION_SECRET = process.env.SMS_DEVICE_SECRET || "sec_live_9f83ca42d9";

/**
 * 1. Cloud Function: verifyLicense
 * Validates software client license key and binds or checks HWID
 */
exports.verifyLicense = functions.https.onRequest(async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed. Use POST." });
  }

  try {
    const { key, hwid, toolId, version } = req.body;

    if (!key || !hwid || !toolId) {
      return res.status(400).json({
        success: false,
        error: "Missing mandatory fields: key, hwid, and toolId.",
      });
    }

    const keyHash = crypto.createHash("sha256").update(key.trim()).digest("hex");
    const licQuery = await db.collection("licenses").where("keyHash", "==", keyHash).limit(1).get();

    if (licQuery.empty) {
      return res.status(404).json({ success: false, error: "Invalid license key." });
    }

    const licDoc = licQuery.docs[0];
    const licData = licDoc.data();

    if (licData.status !== "ACTIVE") {
      return res.status(403).json({ success: false, error: `License is ${licData.status.toLowerCase()}.` });
    }

    if (licData.toolId !== toolId) {
      return res.status(403).json({ success: false, error: "License is not assigned to this software utility." });
    }

    const now = Date.now();
    const expiresAtMs = new Date(licData.expiresAt).getTime();
    if (expiresAtMs < now) {
      return res.status(403).json({ success: false, error: "Subscription has expired." });
    }

    const hwidHash = crypto.createHash("sha256").update(hwid.trim()).digest("hex");

    // Transactional HWID check & binding
    await db.runTransaction(async (transaction) => {
      const freshDoc = await transaction.get(licDoc.ref);
      const freshData = freshDoc.data();

      if (!freshData.hwidHash) {
        // First activation: bind HWID
        transaction.update(licDoc.ref, {
          hwidHash: hwidHash,
          hwidLockedAt: admin.firestore.FieldValue.serverTimestamp(),
          activationsCount: admin.firestore.FieldValue.increment(1),
          lastActivatedAt: admin.firestore.FieldValue.serverTimestamp(),
          lastIp: req.ip || "127.0.0.1",
        });
      } else if (freshData.hwidHash !== hwidHash) {
        throw new Error("HWID_MISMATCH");
      } else {
        transaction.update(licDoc.ref, {
          activationsCount: admin.firestore.FieldValue.increment(1),
          lastActivatedAt: admin.firestore.FieldValue.serverTimestamp(),
          lastIp: req.ip || "127.0.0.1",
        });
      }
    });

    // Generate short-lived signed token (12 hours)
    const token = crypto
      .createHmac("sha256", DEVICE_PROVISION_SECRET)
      .update(`${key}:${hwid}:${now}`)
      .digest("hex");

    return res.status(200).json({
      success: true,
      message: "License authorized.",
      data: {
        toolId: licData.toolId,
        status: "ACTIVE",
        expiresAt: licData.expiresAt,
        token: token,
      },
    });
  } catch (error) {
    if (error.message === "HWID_MISMATCH") {
      return res.status(401).json({
        success: false,
        error: "HWID mismatch. Reset HWID from your dashboard to transfer to a new machine.",
      });
    }
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 2. Cloud Function: smsPaymentWebhook
 * Receives incoming SMS notifications from Companion Android app
 */
exports.smsPaymentWebhook = functions.https.onRequest(async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed. Use POST." });
  }

  try {
    const rawBody = JSON.stringify(req.body);
    const signature = req.headers["x-sms-signature"];
    const deviceId = req.headers["x-device-id"];

    // HMAC Signature Check
    const expectedSig = crypto
      .createHmac("sha256", DEVICE_PROVISION_SECRET)
      .update(rawBody)
      .digest("hex");

    if (signature && signature !== expectedSig) {
      return res.status(403).json({ success: false, error: "Invalid signature." });
    }

    const { trxId, amount, sender, rawMessage } = req.body;
    if (!trxId || !amount) {
      return res.status(400).json({ success: false, error: "Missing required fields." });
    }

    const cleanTrx = trxId.trim().toUpperCase();

    // Query pending orders with this TrxID
    const orderQuery = await db
      .collection("orders")
      .where("trxId", "==", cleanTrx)
      .where("status", "==", "PENDING")
      .limit(1)
      .get();

    let isMatched = false;
    let generatedKey = "";

    if (!orderQuery.empty) {
      const orderDoc = orderQuery.docs[0];
      const orderData = orderDoc.data();

      // Check amount
      if (Number(orderData.amount) === Number(amount)) {
        isMatched = true;
        generatedKey = `NEX-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
        const keyHash = crypto.createHash("sha256").update(generatedKey).digest("hex");

        const expires = new Date();
        expires.setDate(expires.getDate() + orderData.planDuration);

        const batch = db.batch();

        // 1. Update order
        batch.update(orderDoc.ref, {
          status: "PAID",
          licenseKey: generatedKey,
          paidAt: admin.firestore.FieldValue.serverTimestamp(),
          verifiedBy: "COMPANION_SMS_GATEWAY",
        });

        // 2. Create License
        const licRef = db.collection("licenses").doc();
        batch.set(licRef, {
          key: generatedKey,
          keyHash: keyHash,
          toolId: orderData.toolId,
          toolName: orderData.toolName,
          userId: orderData.userId,
          userEmail: orderData.userEmail,
          orderId: orderDoc.id,
          durationDays: orderData.planDuration,
          status: "ACTIVE",
          hwidResetCount: 0,
          maxDevices: 1,
          activationsCount: 0,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          expiresAt: expires.toISOString(),
        });

        // 3. Create Payment record
        const payRef = db.collection("payments").doc();
        batch.set(payRef, {
          orderId: orderDoc.id,
          userId: orderData.userId,
          trxId: cleanTrx,
          amount: Number(amount),
          sender: sender,
          status: "MATCHED",
          verifiedAt: admin.firestore.FieldValue.serverTimestamp(),
          provider: sender.includes("Nagad") ? "Nagad" : "bKash",
        });

        await batch.commit();
      }
    }

    // Record incoming SMS in audit stream
    await db.collection("sms_records").add({
      deviceId: deviceId || "companion-phone",
      trxId: cleanTrx,
      amount: Number(amount),
      sender: sender || "Merchant",
      rawMessage: rawMessage || "",
      receivedAt: admin.firestore.FieldValue.serverTimestamp(),
      status: isMatched ? "MATCHED" : "UNMATCHED",
    });

    return res.status(200).json({
      success: true,
      matched: isMatched,
      trxId: cleanTrx,
      licenseKey: isMatched ? generatedKey : null,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * 3. Callable Cloud Function: resetCustomerHwid
 * Enforces 1 reset per rolling 30-day window
 */
exports.resetCustomerHwid = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "User must be authenticated.");
  }

  const { licenseId } = data;
  const licRef = db.collection("licenses").doc(licenseId);
  const licDoc = await licRef.get();

  if (!licDoc.exists) {
    throw new functions.https.HttpsError("not-found", "License not found.");
  }

  const licData = licDoc.data();
  if (licData.userId !== context.auth.uid && !context.auth.token.admin) {
    throw new functions.https.HttpsError("permission-denied", "Unauthorized.");
  }

  // Check rolling 30 day limit
  if (licData.lastHwidResetAt) {
    const lastReset = licData.lastHwidResetAt.toDate ? licData.lastHwidResetAt.toDate().getTime() : new Date(licData.lastHwidResetAt).getTime();
    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
    if (Date.now() - lastReset < thirtyDaysMs && !context.auth.token.admin) {
      throw new functions.https.HttpsError("resource-exhausted", "Only 1 HWID reset is permitted every 30 days.");
    }
  }

  await licRef.update({
    hwidHash: admin.firestore.FieldValue.delete(),
    hwidLockedAt: admin.firestore.FieldValue.delete(),
    hwidResetCount: admin.firestore.FieldValue.increment(1),
    lastHwidResetAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return { success: true, message: "HWID unbound successfully." };
});
