package io.nexustools.companion.worker

import android.content.Context
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import com.google.gson.Gson
import io.nexustools.companion.security.KeystoreHelper
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
        val rawMessage = inputData.getString("rawMessage") ?: ""
        val endpointUrl = inputData.getString("endpointUrl") ?: "https://nexustools.io/api/payment/sms"
        val deviceId = inputData.getString("deviceId") ?: "samsung-sm-g998b-primary"

        val payload = mapOf(
            "trxId" to trxId,
            "amount" to amount,
            "sender" to sender,
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
            .addHeader("x-device-id", deviceId)
            .addHeader("x-timestamp", timestamp)
            .post(requestBody)
            .build()

        return try {
            val response = client.newCall(request).execute()
            if (response.isSuccessful) {
                Result.success()
            } else {
                // Return retry if server responded with 5xx or network issue
                Result.retry()
            }
        } catch (e: Exception) {
            Result.retry()
        }
    }
}
