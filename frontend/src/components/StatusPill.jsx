const toneMap = {
  Pending: "bg-gold/15 text-amber-800 border-gold/30",
  Confirmed: "bg-lavender/30 text-purple-900 border-lavender/50",
  "In Progress": "bg-blush/40 text-rose-900 border-blush",
  Shipped: "bg-mint/50 text-sage border-mint",
  Delivered: "bg-sage/15 text-sage border-sage/25",
  Paid: "bg-sage/15 text-sage border-sage/25",
  Failed: "bg-red-50 text-red-700 border-red-100",
  Cancelled: "bg-red-50 text-red-700 border-red-100",
  Refunded: "bg-ink/5 text-ink/70 border-ink/10",
  Discussing: "bg-lavender/30 text-purple-900 border-lavender/50",
  Accepted: "bg-mint/50 text-sage border-mint",
  Completed: "bg-sage/15 text-sage border-sage/25"
};

const StatusPill = ({ status }) => (
  <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${toneMap[status] || toneMap.Pending}`}>
    {status}
  </span>
);

export default StatusPill;
