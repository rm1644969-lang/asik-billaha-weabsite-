package com.toolsbd.paysync

import android.Manifest
import android.annotation.SuppressLint
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.content.pm.PackageManager
import android.net.Uri
import android.os.BatteryManager
import android.os.Build
import android.os.Bundle
import android.os.PowerManager
import android.provider.Settings
import android.view.View
import android.widget.Button
import android.widget.EditText
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.appcompat.widget.SwitchCompat
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.google.gson.Gson
import com.toolsbd.paysync.adapter.SmsLogAdapter
import com.toolsbd.paysync.receiver.SmsReceiver
import com.toolsbd.paysync.security.KeystoreHelper
import com.toolsbd.paysync.service.SmsForegroundService
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import java.util.concurrent.TimeUnit

class MainActivity : AppCompatActivity() {

    private val PERMISSION_REQUEST_CODE = 2026

    private lateinit var textServiceStatus: TextView
    private lateinit var switchService: SwitchCompat
    private lateinit var layoutPermissionWarning: LinearLayout
    private lateinit var btnGrantPermission: Button
    private lateinit var layoutBatteryWarning: LinearLayout
    private lateinit var btnIgnoreBattery: Button
    private lateinit var editEndpoint: EditText
    private lateinit var editSecret: EditText
    private lateinit var btnSaveConfig: Button
    private lateinit var btnTestPing: Button
    private lateinit var btnClearLogs: TextView
    private lateinit var textEmptyLogs: TextView
    private lateinit var recyclerLogs: RecyclerView

    private lateinit var logAdapter: SmsLogAdapter

    private val paymentUpdateReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context?, intent: Intent?) {
            loadRecentLogs()
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        initViews()
        setupListeners()
        setupRecyclerView()
        checkPermissionsAndStatus()

        // Auto-start foreground service if enabled
        if (KeystoreHelper.isServiceActive(this)) {
            SmsForegroundService.start(this)
            updateServiceStatusUi(true)
        } else {
            updateServiceStatusUi(false)
        }
    }

    override fun onResume() {
        super.onResume()
        loadRecentLogs()
        checkPermissionsAndStatus()
        val filter = IntentFilter(SmsReceiver.ACTION_NEW_PAYMENT)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            registerReceiver(paymentUpdateReceiver, filter, Context.RECEIVER_NOT_EXPORTED)
        } else {
            registerReceiver(paymentUpdateReceiver, filter)
        }
    }

    override fun onPause() {
        super.onPause()
        try {
            unregisterReceiver(paymentUpdateReceiver)
        } catch (e: Exception) {
            // Ignored
        }
    }

    private fun initViews() {
        textServiceStatus = findViewById(R.id.textServiceStatus)
        switchService = findViewById(R.id.switchService)
        layoutPermissionWarning = findViewById(R.id.layoutPermissionWarning)
        btnGrantPermission = findViewById(R.id.btnGrantPermission)
        layoutBatteryWarning = findViewById(R.id.layoutBatteryWarning)
        btnIgnoreBattery = findViewById(R.id.btnIgnoreBattery)
        editEndpoint = findViewById(R.id.editEndpoint)
        editSecret = findViewById(R.id.editSecret)
        btnSaveConfig = findViewById(R.id.btnSaveConfig)
        btnTestPing = findViewById(R.id.btnTestPing)
        btnClearLogs = findViewById(R.id.btnClearLogs)
        textEmptyLogs = findViewById(R.id.textEmptyLogs)
        recyclerLogs = findViewById(R.id.recyclerLogs)

        editEndpoint.setText(KeystoreHelper.getServerEndpoint(this))
        editSecret.setText(KeystoreHelper.getDeviceSecret(this))
        switchService.isChecked = KeystoreHelper.isServiceActive(this)
    }

    private fun setupRecyclerView() {
        logAdapter = SmsLogAdapter(mutableListOf())
        recyclerLogs.layoutManager = LinearLayoutManager(this)
        recyclerLogs.adapter = logAdapter
        loadRecentLogs()
    }

    private fun loadRecentLogs() {
        val logs = KeystoreHelper.getCachedLogs(this)
        if (logs.isEmpty()) {
            textEmptyLogs.visibility = View.VISIBLE
            recyclerLogs.visibility = View.GONE
        } else {
            textEmptyLogs.visibility = View.GONE
            recyclerLogs.visibility = View.VISIBLE
            logAdapter.updateData(logs)
        }
    }

    private fun setupListeners() {
        switchService.setOnCheckedChangeListener { _, isChecked ->
            if (isChecked) {
                SmsForegroundService.start(this)
                updateServiceStatusUi(true)
                Toast.makeText(this, "Toolsbd SMS Gateway Started", Toast.LENGTH_SHORT).show()
            } else {
                SmsForegroundService.stop(this)
                updateServiceStatusUi(false)
                Toast.makeText(this, "Toolsbd SMS Gateway Paused", Toast.LENGTH_SHORT).show()
            }
        }

        btnGrantPermission.setOnClickListener {
            requestSmsPermissions()
        }

        btnIgnoreBattery.setOnClickListener {
            requestBatteryOptimizationExemption()
        }

        btnSaveConfig.setOnClickListener {
            val endpoint = editEndpoint.text.toString().trim()
            val secret = editSecret.text.toString().trim()
            if (endpoint.isNotEmpty()) KeystoreHelper.saveServerEndpoint(this, endpoint)
            if (secret.isNotEmpty()) KeystoreHelper.saveDeviceSecret(this, secret)
            Toast.makeText(this, "Configuration saved securely", Toast.LENGTH_SHORT).show()
        }

        btnTestPing.setOnClickListener {
            sendTestPing()
        }

        btnClearLogs.setOnClickListener {
            getSharedPreferences("toolsbd_paysync_prefs", Context.MODE_PRIVATE)
                .edit().remove("cached_sms_logs").apply()
            loadRecentLogs()
            Toast.makeText(this, "Payment log cleared", Toast.LENGTH_SHORT).show()
        }
    }

    private fun updateServiceStatusUi(active: Boolean) {
        if (active) {
            textServiceStatus.text = "● LISTENING 24/7"
            textServiceStatus.setTextColor(getColor(android.R.color.white))
            textServiceStatus.setBackgroundColor(0xFF064E3B.toInt())
        } else {
            textServiceStatus.text = "⏸ PAUSED"
            textServiceStatus.setTextColor(getColor(android.R.color.white))
            textServiceStatus.setBackgroundColor(0xFF7F1D1D.toInt())
        }
    }

    private fun checkPermissionsAndStatus() {
        val receiveSms = ContextCompat.checkSelfPermission(this, Manifest.permission.RECEIVE_SMS)
        val readSms = ContextCompat.checkSelfPermission(this, Manifest.permission.READ_SMS)

        val hasSmsPermission = receiveSms == PackageManager.PERMISSION_GRANTED && readSms == PackageManager.PERMISSION_GRANTED
        layoutPermissionWarning.visibility = if (hasSmsPermission) View.GONE else View.VISIBLE

        // Check Battery Optimization
        val powerManager = getSystemService(Context.POWER_SERVICE) as PowerManager
        val isIgnoringBattery = powerManager.isIgnoringBatteryOptimizations(packageName)
        layoutBatteryWarning.visibility = if (isIgnoringBattery) View.GONE else View.VISIBLE
    }

    private fun requestSmsPermissions() {
        val permissions = mutableListOf(
            Manifest.permission.RECEIVE_SMS,
            Manifest.permission.READ_SMS
        )
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            permissions.add(Manifest.permission.POST_NOTIFICATIONS)
        }
        ActivityCompat.requestPermissions(this, permissions.toTypedArray(), PERMISSION_REQUEST_CODE)
    }

    @SuppressLint("BatteryLife")
    private fun requestBatteryOptimizationExemption() {
        try {
            val intent = Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS).apply {
                data = Uri.parse("package:$packageName")
            }
            startActivity(intent)
        } catch (e: Exception) {
            val intent = Intent(Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS)
            startActivity(intent)
        }
    }

    override fun onRequestPermissionsResult(requestCode: Int, permissions: Array<out String>, grantResults: IntArray) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        if (requestCode == PERMISSION_REQUEST_CODE) {
            checkPermissionsAndStatus()
            if (grantResults.isNotEmpty() && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                Toast.makeText(this, "Permissions granted! Gateway is active.", Toast.LENGTH_LONG).show()
            } else {
                Toast.makeText(this, "SMS Permission is mandatory for auto-sync.", Toast.LENGTH_LONG).show()
            }
        }
    }

    private fun sendTestPing() {
        btnTestPing.isEnabled = false
        btnTestPing.text = "Pinging..."

        val endpoint = KeystoreHelper.getServerEndpoint(this)
        val secret = KeystoreHelper.getDeviceSecret(this)
        val deviceId = KeystoreHelper.getDeviceId(this)

        val bm = getSystemService(Context.BATTERY_SERVICE) as BatteryManager
        val batteryPct = bm.getIntProperty(BatteryManager.BATTERY_PROPERTY_CAPACITY)

        CoroutineScope(Dispatchers.IO).launch {
            try {
                val payload = mapOf(
                    "action" to "ping",
                    "deviceId" to deviceId,
                    "model" to "${Build.MANUFACTURER} ${Build.MODEL}",
                    "batteryLevel" to batteryPct,
                    "timestamp" to System.currentTimeMillis()
                )
                val jsonBody = Gson().toJson(payload)
                val signature = KeystoreHelper.generateHmacSha256(jsonBody, secret)

                val client = OkHttpClient.Builder()
                    .connectTimeout(10, TimeUnit.SECONDS)
                    .readTimeout(10, TimeUnit.SECONDS)
                    .build()

                val request = Request.Builder()
                    .url(endpoint)
                    .addHeader("x-sms-signature", signature)
                    .addHeader("x-device-secret", secret)
                    .addHeader("x-device-id", deviceId)
                    .post(jsonBody.toRequestBody("application/json".toMediaType()))
                    .build()

                val response = client.newCall(request).execute()
                val code = response.code
                val isOk = response.isSuccessful

                withContext(Dispatchers.Main) {
                    btnTestPing.isEnabled = true
                    btnTestPing.text = "Test Ping Server"
                    if (isOk) {
                        Toast.makeText(this@MainActivity, "✓ Connected to Toolsbd Server! (HTTP $code)", Toast.LENGTH_LONG).show()
                    } else {
                        Toast.makeText(this@MainActivity, "Server responded with HTTP $code", Toast.LENGTH_LONG).show()
                    }
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    btnTestPing.isEnabled = true
                    btnTestPing.text = "Test Ping Server"
                    Toast.makeText(this@MainActivity, "Connection failed: ${e.localizedMessage}", Toast.LENGTH_LONG).show()
                }
            }
        }
    }
}
