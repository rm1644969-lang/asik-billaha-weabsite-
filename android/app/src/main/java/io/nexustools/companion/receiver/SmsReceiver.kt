package io.nexustools.companion.receiver

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.provider.Telephony
import androidx.work.BackoffPolicy
import androidx.work.Data
import androidx.work.OneTimeWorkRequestBuilder
import androidx.work.WorkManager
import io.nexustools.companion.parser.SmsParser
import io.nexustools.companion.worker.PaymentSyncWorker
import java.util.concurrent.TimeUnit

class SmsReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == Telephony.Sms.Intents.SMS_RECEIVED_ACTION) {
            val messages = Telephony.Sms.Intents.getMessagesFromIntent(intent)
            for (sms in messages) {
                val sender = sms.displayOriginatingAddress ?: ""
                val body = sms.displayMessageBody ?: ""

                // Only parse authorized merchant financial senders
                val parsed = SmsParser.parse(sender, body)
                if (parsed != null) {
                    // Schedule reliable background upload via WorkManager
                    val workData = Data.Builder()
                        .putString("trxId", parsed.trxId)
                        .putDouble("amount", parsed.amount)
                        .putString("sender", parsed.sender)
                        .putString("provider", parsed.provider)
                        .putString("rawMessage", parsed.rawMessage)
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
