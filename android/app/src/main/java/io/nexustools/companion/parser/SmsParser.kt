package io.nexustools.companion.parser

import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.regex.Pattern

data class ParsedPayment(
    val trxId: String,
    val amount: Double,
    val sender: String,
    val provider: String,
    val rawMessage: String,
    val timestamp: String
)

object SmsParser {

    // Regex for bKash personal incoming notification:
    // e.g. "You have received Tk 350.00 from 01755123456. Fee Tk 0.00. Balance Tk 48,210.50. TrxID BK992A81KC at 12/03/2026 14:23"
    private val BKASH_PATTERN = Pattern.compile(
        "received\\s+Tk\\s+([0-9,.]+)\\s+from\\s+([0-9+]+).*?TrxID\\s+([A-Z0-9]+)",
        Pattern.CASE_INSENSITIVE or Pattern.DOTALL
    )

    // Regex for Nagad personal incoming notification:
    // e.g. "Cash In Received. Amount: Tk 650.00. Sender: 01822998877. TxnID: NG784B10XQ. Balance: Tk 19,450.00."
    private val NAGAD_PATTERN = Pattern.compile(
        "Amount:\\s*Tk\\s*([0-9,.]+).*?Sender:\\s*([0-9+]+).*?TxnID:\\s*([A-Z0-9]+)",
        Pattern.CASE_INSENSITIVE or Pattern.DOTALL
    )

    fun parse(senderAddress: String, body: String): ParsedPayment? {
        val currentTimestamp = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'", Locale.US).format(Date())

        // 1. Check bKash
        if (senderAddress.contains("bKash", ignoreCase = true) || senderAddress.contains("16247") || body.contains("bKash", ignoreCase = true)) {
            val matcher = BKASH_PATTERN.matcher(body)
            if (matcher.find()) {
                val amountStr = matcher.group(1)?.replace(",", "") ?: "0"
                val senderPhone = matcher.group(2) ?: "UNKNOWN"
                val trxId = matcher.group(3) ?: ""
                return ParsedPayment(
                    trxId = trxId.uppercase(Locale.US),
                    amount = amountStr.toDoubleOrNull() ?: 0.0,
                    sender = senderPhone,
                    provider = "bKash",
                    rawMessage = body,
                    timestamp = currentTimestamp
                )
            }
        }

        // 2. Check Nagad
        if (senderAddress.contains("Nagad", ignoreCase = true) || senderAddress.contains("16167") || body.contains("Nagad", ignoreCase = true)) {
            val matcher = NAGAD_PATTERN.matcher(body)
            if (matcher.find()) {
                val amountStr = matcher.group(1)?.replace(",", "") ?: "0"
                val senderPhone = matcher.group(2) ?: "UNKNOWN"
                val trxId = matcher.group(3) ?: ""
                return ParsedPayment(
                    trxId = trxId.uppercase(Locale.US),
                    amount = amountStr.toDoubleOrNull() ?: 0.0,
                    sender = senderPhone,
                    provider = "Nagad",
                    rawMessage = body,
                    timestamp = currentTimestamp
                )
            }
        }

        return null
    }
}
