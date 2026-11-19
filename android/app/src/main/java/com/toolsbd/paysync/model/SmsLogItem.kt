package com.toolsbd.paysync.model

data class SmsLogItem(
    val id: String,
    val trxId: String,
    val amount: Double,
    val sender: String,
    val provider: String, // bKash or Rocket
    val timestamp: String,
    val rawMessage: String,
    var status: String = "PENDING", // PENDING, CONFIRMED, FAILED
    var statusMessage: String = "Processing..."
)
