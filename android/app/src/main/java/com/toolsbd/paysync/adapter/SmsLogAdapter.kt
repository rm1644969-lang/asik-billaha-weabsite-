package com.toolsbd.paysync.adapter

import android.graphics.Color
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.toolsbd.paysync.R
import com.toolsbd.paysync.model.SmsLogItem

class SmsLogAdapter(
    private var items: List<SmsLogItem>
) : RecyclerView.Adapter<SmsLogAdapter.ViewHolder>() {

    class ViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val textProvider: TextView = view.findViewById(R.id.itemProvider)
        val textTrxId: TextView = view.findViewById(R.id.itemTrxId)
        val textAmount: TextView = view.findViewById(R.id.itemAmount)
        val textSender: TextView = view.findViewById(R.id.itemSender)
        val textStatus: TextView = view.findViewById(R.id.itemStatus)
        val textTimestamp: TextView = view.findViewById(R.id.itemTimestamp)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_sms_log, parent, false)
        return ViewHolder(view)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        val item = items[position]

        holder.textProvider.text = item.provider.uppercase()
        if (item.provider.equals("bKash", ignoreCase = true)) {
            holder.textProvider.setBackgroundColor(Color.parseColor("#E2136E"))
        } else if (item.provider.equals("Rocket", ignoreCase = true)) {
            holder.textProvider.setBackgroundColor(Color.parseColor("#8C3494"))
        } else {
            holder.textProvider.setBackgroundColor(Color.parseColor("#374151"))
        }

        holder.textTrxId.text = item.trxId
        holder.textAmount.text = "৳ ${String.format("%.2f", item.amount)}"
        holder.textSender.text = "From: ${item.sender}"
        holder.textTimestamp.text = item.timestamp

        when (item.status) {
            "CONFIRMED" -> {
                holder.textStatus.text = "✓ ${item.statusMessage}"
                holder.textStatus.setTextColor(Color.parseColor("#10B981"))
            }
            "SYNCING" -> {
                holder.textStatus.text = "⏳ ${item.statusMessage}"
                holder.textStatus.setTextColor(Color.parseColor("#FACC15"))
            }
            "RETRYING" -> {
                holder.textStatus.text = "🔄 ${item.statusMessage}"
                holder.textStatus.setTextColor(Color.parseColor("#FB923C"))
            }
            else -> {
                holder.textStatus.text = "✗ ${item.statusMessage}"
                holder.textStatus.setTextColor(Color.parseColor("#EF4444"))
            }
        }
    }

    override fun getItemCount(): Int = items.size

    fun updateData(newItems: List<SmsLogItem>) {
        this.items = newItems
        notifyDataSetChanged()
    }
}
