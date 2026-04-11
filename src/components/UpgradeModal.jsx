export default function UpgradeModal({ open, onClose }) {
  if (!open) return null;

  const benefits = [
    {
      title: "Automatic reminders before every IRS deadline",
      detail: "You'll never forget a payment date again",
    },
    {
      title: "Track all four quarters in one place",
      detail: "See your full year at a glance",
    },
    {
      title: "Avoid underpayment penalties",
      detail: "The IRS charges ~8% annually on missed payments",
    },
  ];

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,.4)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 100, padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff", borderRadius: 16, padding: "36px 32px",
          maxWidth: 420, width: "100%", position: "relative",
        }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          style={{
            position: "absolute", top: 16, right: 16,
            background: "none", border: "none", fontSize: 18,
            color: "#9ca3af", cursor: "pointer",
          }}
        >
          ✕
        </button>

        {/* Headline */}
        <div style={{ fontSize: 22, fontWeight: 800, color: "#111827", letterSpacing: "-.02em", marginBottom: 6 }}>
          Never miss a quarterly payment
        </div>
        <div style={{ fontSize: 14, color: "#6b7280", marginBottom: 24, lineHeight: 1.6 }}>
          Join thousands of freelancers who stopped guessing.
        </div>

        {/* Benefits */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 28 }}>
          {benefits.map((b, i) => (
            <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <div style={{
                width: 20, height: 20, borderRadius: 6, background: "#ecfdf5",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0, marginTop: 1,
              }}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2.5 6l2.5 2.5 5-5" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>{b.title}</div>
                <div style={{ fontSize: 12, color: "#6b7280", marginTop: 1 }}>{b.detail}</div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <button
          style={{
            width: "100%", padding: "14px", background: "#0e7490", color: "#fff",
            borderRadius: 10, fontWeight: 800, fontSize: 15, border: "none",
            cursor: "pointer", fontFamily: "inherit", marginBottom: 10,
          }}
        >
          Start tracking — $4/month
        </button>

        {/* Dismiss */}
        <button
          onClick={onClose}
          style={{
            width: "100%", padding: "10px", background: "none", border: "none",
            fontSize: 13, color: "#9ca3af", cursor: "pointer", fontFamily: "inherit",
          }}
        >
          Continue without saving
        </button>
      </div>
    </div>
  );
}
