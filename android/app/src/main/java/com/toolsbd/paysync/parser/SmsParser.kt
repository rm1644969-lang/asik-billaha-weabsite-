package com.toolsbd.paysync.parser

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

    // bKash pattern: "received Tk 480.00 from 01967922602... TrxID BK992A81KC"
    private val BKASH_MAIN_PATTERN = Pattern.compile(
        "(?:received|payment\\s+received|cash\\s+in)\\s+(?:tk|tk\\.)?\\s*([0-9,.]+)\\s+from\\s+([0-9+]+).*?trxid[\\s:]*([a-z0-9]+)",
        Pattern.CASE_INSENSITIVE or Pattern.DOTALL
    )

    // bKash generic regex
    private val BKASH_TRX_PATTERN = Pattern.compile("trxid[\\s:]*([a-z0-9]+)", Pattern.CASE_INSENSITIVE)
    private val AMOUNT_PATTERN = Pattern.compile("(?:tk|tk\\.|bdt|amount:?\\s*tk\\.?)[\\s:]*([0-9,]+(?:\\.[0-9]{1,2})?)", Pattern.CASE_INSENSITIVE)
    private val PHONE_PATTERN = Pattern.compile("(?:from|sender:?)[\\s:]*([0-9+]{11,14})", Pattern.CASE_INSENSITIVE)

    // Rocket (DBBL) pattern: "Tk 480.00 received from 01731328169... TxnId: 82736192"
    private val ROCKET_MAIN_PATTERN = Pattern.compile(
        "(?:tk|tk\\.)?\\s*([0-9,.]+)\\s*(?:received|transferred)\\s*from\\s*([0-9+]+).*?(?:txnid|trxid)[\\s:]*([a-z0-9]+)",
        Pattern.CASE_INSENSITIVE or Pattern.DOTALL
    )

    // Nagad pattern: "Amount: Tk 650.00. Sender: 01822998877. TxnID: NG784B10XQ"
    private val NAGAD_MAIN_PATTERN = Pattern.compile(
        "amount:[\\s:]*tk\\.?[\\s:]*([0-9,.]+).*?sender:[\\s:]*([0-9+]+).*?txnid:[\\s:]*([a-z0-9]+)",
        Pattern.CASE_INSENSITIVE or Pattern.DOTALL
    )

    fun parse(senderAddress: String, body: String): ParsedPayment? {
        val currentTimestamp = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'", Locale.US).format(Date())
        val cleanBody = body.trim()

        // 1. Identify Provider
        var provider = "Unknown"
        val isBkash = senderAddress.contains("bKash", ignoreCase = true) || 
                      senderAddress.contains("16247") || 
                      cleanBody.contains("bKash", ignoreCase = true)

        val isRocket = senderAddress.contains("Rocket", ignoreCase = true) || 
                       senderAddress.contains("DBBL", ignoreCase = true) || 
                       senderAddress.contains("16216") || 
                       cleanBody.contains("Rocket", ignoreCase = true)

        val isNagad = senderAddress.contains("Nagad", ignoreCase = true) || 
                      senderAddress.contains("16167") || 
                      cleanBody.contains("Nagad", ignoreCase = true)

        if (isBkash) {
            provider = "bKash"
            // Try strict regex
            val matcher = BKASH_MAIN_PATTERN.matcher(cleanBody)
            if (matcher.find()) {
                val amountStr = matcher.group(1)?.replace(",", "") ?: "0"
                val senderPhone = matcher.group(2) ?: "UNKNOWN"
                val trxId = matcher.group(3) ?: ""
                return ParsedPayment(
                    trxId = trxId.uppercase(Locale.US),
                    amount = amountStr.toDoubleOrNull() ?: 0.0,
                    sender = senderPhone,
                    provider = provider,
                    rawMessage = cleanBody,
                    timestamp = currentTimestamp
                )
            }
        } else if (isRocket) {
            provider = "Rocket"
            val matcher = ROCKET_MAIN_PATTERN.matcher(cleanBody)
            if (matcher.find()) {
                val amountStr = matcher.group(1)?.replace(",", "") ?: "0"
                val senderPhone = matcher.group(2) ?: "UNKNOWN"
                val trxId = matcher.group(3) ?: ""
                return ParsedPayment(
                    trxId = trxId.uppercase(Locale.US),
                    amount = amountStr.toDoubleOrNull() ?: 0.0,
                    sender = senderPhone,
                    provider = provider,
                    rawMessage = cleanBody,
                    timestamp = currentTimestamp
                )
            }
        } else if (isNagad) {
            provider = "Nagad"
            val matcher = NAGAD_MAIN_PATTERN.matcher(cleanBody)
            if (matcher.find()) {
                val amountStr = matcher.group(1)?.replace(",", "") ?: "0"
                val senderPhone = matcher.group(2) ?: "UNKNOWN"
                val trxId = matcher.group(3) ?: ""
                return ParsedPayment(
                    trxId = trxId.uppercase(Locale.US),
                    amount = amountStr.toDoubleOrNull() ?: 0.0,
                    sender = senderPhone,
                    provider = provider,
                    rawMessage = cleanBody,
                    timestamp = currentTimestamp
                )
            }
        }

        // 2. Fallback Generic Parser (if sender header is custom or standard regex missed slightly)
        val trxMatcher = BKASH_TRX_PATTERN.matcher(cleanBody)
        val amountMatcher = AMOUNT_PATTERN.matcher(cleanBody)

        if (trxMatcher.find() && amountMatcher.find()) {
            val trxId = trxMatcher.group(1) ?: ""
            val amountStr = amountMatcher.group(1)?.replace(",", "") ?: "0"

            var phone = "UNKNOWN"
            val phoneMatcher = PHONE_PATTERN.matcher(cleanBody)
            if (phoneMatcher.find()) {
                phone = phoneMatcher.group(1) ?: "UNKNOWN"
            }

            if (provider == "Unknown") {
                if (cleanBody.contains("bKash", ignoreCase = true)) provider = "bKash"
                else if (cleanBody.contains("Rocket", ignoreCase = true) || cleanBody.contains("DBBL", ignoreCase = true)) provider = "Rocket"
            }

            if (trxId.length >= 6) {
                return ParsedPayment(
                    trxId = trxId.uppercase(Locale.US),
                    amount = amountStr.toDoubleOrNull() ?: 0.0,
                    sender = phone,
                    provider = if (provider == "Unknown") "bKash" else provider,
                    rawMessage = cleanBody,
                    timestamp = currentTimestamp
                )
            }
        }

        return null
    }
}
