package io.nexustools.companion.security

import android.content.Context
import android.content.SharedPreferences
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKeys
import java.nio.charset.StandardCharsets
import javax.crypto.Mac
import javax.crypto.spec.SecretKeySpec

object KeystoreHelper {

    private const val PREFS_FILE = "nexus_secure_prefs"
    private const val KEY_SECRET = "device_secret"

    private fun getEncryptedPrefs(context: Context): SharedPreferences {
        val masterKeyAlias = MasterKeys.getOrCreate(MasterKeys.AES256_GCM_SPEC)
        return EncryptedSharedPreferences.create(
            PREFS_FILE,
            masterKeyAlias,
            context,
            EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
            EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
        )
    }

    fun saveDeviceSecret(context: Context, secret: String) {
        val prefs = getEncryptedPrefs(context)
        prefs.edit().putString(KEY_SECRET, secret).apply()
    }

    fun getDeviceSecret(context: Context): String {
        val prefs = getEncryptedPrefs(context)
        return prefs.getString(KEY_SECRET, "sec_live_9f83ca42d9") ?: "sec_live_9f83ca42d9"
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
