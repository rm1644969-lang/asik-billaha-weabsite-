package com.toolsbd.paysync.security

import android.content.Context
import android.content.SharedPreferences
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import com.toolsbd.paysync.model.SmsLogItem
import java.nio.charset.StandardCharsets
import javax.crypto.Mac
import javax.crypto.spec.SecretKeySpec

object KeystoreHelper {

    private const val PREFS_FILE = "toolsbd_paysync_prefs"
    private const val KEY_ENDPOINT = "server_endpoint"
    private const val KEY_SECRET = "device_secret"
    private const val KEY_DEVICE_ID = "device_id"
    private const val KEY_SERVICE_ACTIVE = "service_active"
    private const val KEY_SMS_LOGS = "cached_sms_logs"

    const val DEFAULT_ENDPOINT = "https://asik-billaha-weabsite.vercel.app/api/payment/sms"
    const val DEFAULT_SECRET = "sec_live_9f83ca42d992e10650b2ed6cb6bb79"
    const val DEFAULT_DEVICE_ID = "toolsbd-merchant-phone"

    private fun getPrefs(context: Context): SharedPreferences {
        return context.getSharedPreferences(PREFS_FILE, Context.MODE_PRIVATE)
    }

    fun getServerEndpoint(context: Context): String {
        return getPrefs(context).getString(KEY_ENDPOINT, DEFAULT_ENDPOINT) ?: DEFAULT_ENDPOINT
    }

    fun saveServerEndpoint(context: Context, url: String) {
        getPrefs(context).edit().putString(KEY_ENDPOINT, url.trim()).apply()
    }

    fun getDeviceSecret(context: Context): String {
        return getPrefs(context).getString(KEY_SECRET, DEFAULT_SECRET) ?: DEFAULT_SECRET
    }

    fun saveDeviceSecret(context: Context, secret: String) {
        getPrefs(context).edit().putString(KEY_SECRET, secret.trim()).apply()
    }

    fun getDeviceId(context: Context): String {
        return getPrefs(context).getString(KEY_DEVICE_ID, DEFAULT_DEVICE_ID) ?: DEFAULT_DEVICE_ID
    }

    fun saveDeviceId(context: Context, id: String) {
        getPrefs(context).edit().putString(KEY_DEVICE_ID, id.trim()).apply()
    }

    fun isServiceActive(context: Context): Boolean {
        return getPrefs(context).getBoolean(KEY_SERVICE_ACTIVE, true)
    }

    fun setServiceActive(context: Context, active: Boolean) {
        getPrefs(context).edit().putBoolean(KEY_SERVICE_ACTIVE, active).apply()
    }

    fun getCachedLogs(context: Context): MutableList<SmsLogItem> {
        val json = getPrefs(context).getString(KEY_SMS_LOGS, null) ?: return mutableListOf()
        return try {
            val type = object : TypeToken<MutableList<SmsLogItem>>() {}.type
            Gson().fromJson(json, type) ?: mutableListOf()
        } catch (e: Exception) {
            mutableListOf()
        }
    }

    fun addLogItem(context: Context, item: SmsLogItem) {
        val list = getCachedLogs(context)
        // Keep at most 50 items
        list.add(0, item)
        if (list.size > 50) {
            list.removeAt(list.size - 1)
        }
        val json = Gson().toJson(list)
        getPrefs(context).edit().putString(KEY_SMS_LOGS, json).apply()
    }

    fun updateLogStatus(context: Context, trxId: String, status: String, message: String) {
        val list = getCachedLogs(context)
        var modified = false
        for (item in list) {
            if (item.trxId.equals(trxId, ignoreCase = true)) {
                item.status = status
                item.statusMessage = message
                modified = true
                break
            }
        }
        if (modified) {
            val json = Gson().toJson(list)
            getPrefs(context).edit().putString(KEY_SMS_LOGS, json).apply()
        }
    }

    fun generateHmacSha256(data: String, secret: String): String {
        val algorithm = "HmacSHA256"
        val secretKeySpec = SecretKeySpec(secret.toByteArray(StandardCharsets.UTF_8), algorithm)
        val mac = Mac.getInstance(algorithm)
        mac.init(secretKeySpec)
        val hmacBytes = mac.doFinal(data.toByteArray(StandardCharsets.UTF_8))
        return hmacBytes.joinToString("") { "%02x".format(it) }
    }
}
