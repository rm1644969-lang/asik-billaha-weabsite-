package com.toolsbd.paysync.receiver

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.provider.Telephony
import androidx.work.BackoffPolicy
import androidx.work.Data
import androidx.work.OneTimeWorkRequestBuilder
import androidx.work.WorkManager
import com.toolsbd.paysync.model.SmsLogItem
import com.toolsbd.paysync.parser.SmsParser
import com.toolsbd.paysync.security.KeystoreHelper
import com.toolsbd.paysync.worker.PaymentSyncWorker
import java.util.UUID
import java.util.concurrent.TimeUnit

class SmsReceiver : BroadcastReceiver() {

    companion object {
        const val ACTION_NEW_PAYMENT = "com.toolsbd.paysync.ACTION_NEW_PAYMENT"
    }

    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == Telephony.Sms.Intents.SMS_RECEIVED_ACTION) {
            val messages = Telephony.Sms.Intents.getMessagesFromIntent(intent)
            if (messages.isNullOrEmpty()) return

            val endpoint = KeystoreHelper.getServerEndpoint(context)
            val deviceId = KeystoreHelper.getDeviceId(context)

            for (sms in messages) {
                val sender = sms.displayOriginatingAddress ?: ""
                val body = sms.displayMessageBody ?: ""

                val parsed = SmsParser.parse(sender, body)
                if (parsed != null) {
                    val logItem = SmsLogItem(
                        id = UUID.randomUUID().toString(),
                        trxId = parsed.trxId,
                        amount = parsed.amount,
                        sender = parsed.sender,
                        provider = parsed.provider,
                        timestamp = parsed.timestamp,
                        rawMessage = parsed.rawMessage,
                        status = "SYNCING",
                        statusMessage = "Sending to Toolsbd..."
                    )
                    KeystoreHelper.addLogItem(context, logItem)

                    // Notify UI if open
                    val updateIntent = Intent(ACTION_NEW_PAYMENT).apply {
                        putExtra("trxId", parsed.trxId)
                        putExtra("amount", parsed.amount)
                        putExtra("provider", parsed.provider)
                        setPackage(context.packageName)
                    }
                    context.sendBroadcast(updateIntent)

                    // Enqueue reliable background delivery
                    val workData = Data.Builder()
                        .putString("trxId", parsed.trxId)
                        .putDouble("amount", parsed.amount)
                        .putString("sender", parsed.sender)
                        .putString("provider", parsed.provider)
                        .putString("rawMessage", parsed.rawMessage)
                        .putString("endpointUrl", endpoint)
                        .putString("deviceId", deviceId)
                        .build()

                    val syncRequest = OneTimeWorkRequestBuilder<PaymentSyncWorker>()
                        .setInputData(workData)
                        .setBackoffCriteria(
                            BackoffPolicy.EXPONENTIAL,
                            10,
                            TimeUnit.SECONDS
                        )
                        .build()

                    WorkManager.getInstance(context).enqueue(syncRequest)
                }
            }
        }
    }
}
