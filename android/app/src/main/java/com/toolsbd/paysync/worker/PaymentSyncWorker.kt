package com.toolsbd.paysync.worker

import android.content.Context
import android.content.Intent
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import com.google.gson.Gson
import com.google.gson.JsonObject
import com.toolsbd.paysync.receiver.SmsReceiver
import com.toolsbd.paysync.security.KeystoreHelper
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import java.util.concurrent.TimeUnit

class PaymentSyncWorker(
    private val context: Context,
    workerParams: WorkerParameters
) : CoroutineWorker(context, workerParams) {

    private val client = OkHttpClient.Builder()
        .connectTimeout(15, TimeUnit.SECONDS)
        .readTimeout(15, TimeUnit.SECONDS)
        .build()

    override suspend fun doWork(): Result {
        val trxId = inputData.getString("trxId") ?: return Result.failure()
        val amount = inputData.getDouble("amount", 0.0)
        val sender = inputData.getString("sender") ?: "UNKNOWN"
        val provider = inputData.getString("provider") ?: "bKash"
        val rawMessage = inputData.getString("rawMessage") ?: ""
        val endpointUrl = inputData.getString("endpointUrl") ?: KeystoreHelper.getServerEndpoint(context)
        val deviceId = inputData.getString("deviceId") ?: KeystoreHelper.getDeviceId(context)

        val payload = mapOf(
            "trxId" to trxId,
            "amount" to amount,
            "sender" to sender,
            "provider" to provider,
            "rawMessage" to rawMessage,
            "deviceId" to deviceId
        )

        val jsonBody = Gson().toJson(payload)
        val timestamp = System.currentTimeMillis().toString()
        val secret = KeystoreHelper.getDeviceSecret(context)
        val signature = KeystoreHelper.generateHmacSha256(jsonBody, secret)

        val requestBody = jsonBody.toRequestBody("application/json".toMediaType())
        val request = Request.Builder()
            .url(endpointUrl)
            .addHeader("x-sms-signature", signature)
            .addHeader("x-device-secret", secret)
            .addHeader("x-device-id", deviceId)
            .addHeader("x-timestamp", timestamp)
            .post(requestBody)
            .build()

        return try {
            val response = client.newCall(request).execute()
            val responseBody = response.body?.string() ?: ""

            if (response.isSuccessful) {
                var message = "Auto-Approved on Toolsbd!"
                try {
                    val jsonObj = Gson().fromJson(responseBody, JsonObject::class.java)
                    if (jsonObj.has("matched")) {
                        val matched = jsonObj.get("matched").asString
                        message = "Confirmed ($matched match)"
                    }
                } catch (e: Exception) {
                    // Ignore json parse error
                }

                KeystoreHelper.updateLogStatus(context, trxId, "CONFIRMED", message)
                notifyUiUpdate(trxId, "CONFIRMED", message)
                Result.success()
            } else if (response.code in 400..499) {
                KeystoreHelper.updateLogStatus(context, trxId, "FAILED", "Rejected (HTTP ${response.code})")
                notifyUiUpdate(trxId, "FAILED", "Rejected (HTTP ${response.code})")
                Result.failure()
            } else {
                KeystoreHelper.updateLogStatus(context, trxId, "RETRYING", "Server busy (HTTP ${response.code})")
                notifyUiUpdate(trxId, "RETRYING", "Retrying...")
                Result.retry()
            }
        } catch (e: Exception) {
            KeystoreHelper.updateLogStatus(context, trxId, "RETRYING", "Network error: ${e.localizedMessage}")
            notifyUiUpdate(trxId, "RETRYING", "Network error - will retry")
            Result.retry()
        }
    }

    private fun notifyUiUpdate(trxId: String, status: String, message: String) {
        val updateIntent = Intent(SmsReceiver.ACTION_NEW_PAYMENT).apply {
            putExtra("trxId", trxId)
            putExtra("status", status)
            putExtra("message", message)
            setPackage(context.packageName)
        }
        context.sendBroadcast(updateIntent)
    }
}
