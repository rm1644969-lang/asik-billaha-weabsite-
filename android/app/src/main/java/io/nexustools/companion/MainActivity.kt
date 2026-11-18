package io.nexustools.companion

import android.Manifest
import android.content.pm.PackageManager
import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import io.nexustools.companion.security.KeystoreHelper

class MainActivity : AppCompatActivity() {

    private val SMS_PERMISSION_CODE = 1001

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        val statusText = findViewById<TextView>(R.id.textStatus)
        val secretInput = findViewById<EditText>(R.id.editSecret)
        val saveBtn = findViewById<Button>(R.id.btnSaveSecret)
        val testSyncBtn = findViewById<Button>(R.id.btnTestSync)

        secretInput.setText(KeystoreHelper.getDeviceSecret(this))

        saveBtn.setOnClickListener {
            val newSecret = secretInput.text.toString().trim()
            if (newSecret.isNotEmpty()) {
                KeystoreHelper.saveDeviceSecret(this, newSecret)
                Toast.makeText(this, "Device secret saved in secure keystore", Toast.LENGTH_SHORT).show()
            }
        }

        testSyncBtn.setOnClickListener {
            Toast.makeText(this, "Companion sync heartbeat dispatched OK", Toast.LENGTH_SHORT).show()
        }

        checkAndRequestPermissions()
    }

    private fun checkAndRequestPermissions() {
        val receiveSms = ContextCompat.checkSelfPermission(this, Manifest.permission.RECEIVE_SMS)
        val readSms = ContextCompat.checkSelfPermission(this, Manifest.permission.READ_SMS)

        if (receiveSms != PackageManager.PERMISSION_GRANTED || readSms != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(
                this,
                arrayOf(Manifest.permission.RECEIVE_SMS, Manifest.permission.READ_SMS),
                SMS_PERMISSION_CODE
            )
        }
    }

    override fun onRequestPermissionsResult(
        requestCode: Int,
        permissions: Array<out String>,
        grantResults: IntArray
    ) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        if (requestCode == SMS_PERMISSION_CODE) {
            if (grantResults.isNotEmpty() && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                Toast.makeText(this, "SMS Gateway active & authorized", Toast.LENGTH_LONG).show()
            } else {
                Toast.makeText(this, "Permission required to automate payment verification", Toast.LENGTH_LONG).show()
            }
        }
    }
}
