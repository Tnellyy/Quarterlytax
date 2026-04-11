import {
  DEADLINES,
  STATES,
  formatUSD,
  formatPct,
  getNextDeadline,
  daysUntilDeadline,
  getUrgencyColor,
} from "../engine/tax";

export default function ResultsPanel({ result, onTrack }) {
  const nd = getNextDeadline();
  const days = daysUntilDeadline(nd);
  const uc = getUrgencyColor(days);
  const $ = formatUSD;
  const P = formatPct;

  return (
    <div>
      {/* ─── Results card ─── */}
      <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, background: "#fff", overflow: "hidden" }}>

        {/* Quarterly payment */}
        <div style={{ padding: "28px 28px 20px" }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 6 }}>
            Quarterly payment
          </div>
          <div style={{ fontSize: 48, fontWeight: 800, letterSpacing: "-.04em", lineHeight: 1, color: "#111827", fontVariantNumeric: "tabular-nums" }}>
            {$(result.quarterlyPayment)}
          </div>
        </div>

        {/* Deadline */}
        <div style={{ padding: "0 28px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              width: 8, height: 8, borderRadius: "50%", background: uc,
              boxShadow: days <= 14 ? `0 0 8px ${uc}` : "none",
            }} />
            <span style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>Due {nd.due}</span>
            <span style={{ fontSize: 13, color: days <= 14 ? "#ef4444" : "#6b7280", fontWeight: days <= 14 ? 700 : 400 }}>
              {days === 0 ? "Today" : days === 1 ? "Tomorrow" : `${days} days`}
            </span>
          </div>
        </div>

        {/* Metrics: monthly + effective rate */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderTop: "1px solid #f3f4f6" }}>
          <div style={{ padding: "18px 28px", borderRight: "1px solid #f3f4f6" }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 4 }}>
              Monthly set-aside
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#111827", fontVariantNumeric: "tabular-nums" }}>
              {$(result.monthlySetAside)}
            </div>
          </div>
          <div style={{ padding: "18px 28px" }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 4 }}>
              Effective rate
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#111827" }}>
              {P(result.effectiveRate)}
            </div>
          </div>
        </div>

        {/* Rate insight */}
        {result.effectiveRate > 0 && result.effectiveRate < result.marginalRate * 0.8 && (
          <div style={{ padding: "12px 28px", borderTop: "1px solid #f3f4f6", background: "#f0fdfa" }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#0d9488" }}>
              You're in the {P(result.marginalRate)} bracket but only pay {P(result.effectiveRate)} overall — don't over-save
            </span>
          </div>
        )}

        {/* All quarters */}
        <div style={{ borderTop: "1px solid #f3f4f6", padding: "16px 28px" }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 10 }}>
            All quarters
          </div>
          {DEADLINES.map((q, i) => {
            const isNext = q === nd;
            return (
              <div key={i} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "8px 0", borderBottom: i < 3 ? "1px solid #f9fafb" : "none",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: isNext ? "#0e7490" : "#6b7280", width: 24 }}>{q.quarter}</span>
                  <span style={{ fontSize: 12, color: "#9ca3af" }}>Due {q.due}</span>
                </div>
                <span style={{ fontSize: 15, fontWeight: 700, fontVariantNumeric: "tabular-nums", color: isNext ? "#0e7490" : "#111827" }}>
                  {$(result.quarterlyPayment)}
                </span>
              </div>
            );
          })}
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "baseline",
            marginTop: 8, paddingTop: 10, borderTop: "1px solid #e5e7eb",
          }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#6b7280" }}>Total {new Date().getFullYear()}</span>
            <span style={{ fontSize: 18, fontWeight: 800, fontVariantNumeric: "tabular-nums" }}>{$(result.totalAnnualTax)}</span>
          </div>
        </div>

        {/* Conversion trigger */}
        <div style={{ borderTop: "1px solid #f3f4f6", padding: "18px 28px", background: "#f9fafb" }}>
          <button
            onClick={onTrack}
            style={{
              width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
              background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", padding: 0,
            }}
          >
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#111827", textAlign: "left" }}>Track this automatically</div>
              <div style={{ fontSize: 12, color: "#6b7280", textAlign: "left" }}>Get reminders before every deadline</div>
            </div>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#0e7490", flexShrink: 0 }}>$4/month →</span>
          </button>
        </div>

        {/* IRS warning */}
        <div style={{
          borderTop: "1px solid #fde68a", padding: "12px 28px", background: "#fffbeb",
          display: "flex", alignItems: "center", gap: 8,
          borderRadius: "0 0 12px 12px",
        }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 1L1 13h12L7 1z" fill="#f59e0b" />
            <text x="7" y="11" textAnchor="middle" fill="#fff" fontSize="8" fontWeight="800">!</text>
          </svg>
          <span style={{ fontSize: 12, fontWeight: 600, color: "#92400e" }}>
            Missing this deadline may result in IRS underpayment penalties
          </span>
        </div>
      </div>

      {/* ─── Tax breakdown strip ─── */}
      <div style={{ marginTop: 12, border: "1px solid #e5e7eb", borderRadius: 12, background: "#fff", overflow: "hidden" }}>
        <div style={{ padding: "14px 20px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr" }}>
          {[
            { label: "Federal", value: $(result.quarterlyFederal) },
            { label: "State", value: $(result.quarterlyState) },
            { label: "SE Tax", value: $(result.quarterlySE) },
          ].map((item, i) => (
            <div key={i} style={{
              textAlign: "center", padding: "4px 0",
              borderRight: i < 2 ? "1px solid #f3f4f6" : "none",
            }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: ".05em" }}>
                {item.label}
              </div>
              <div style={{ fontSize: 15, fontWeight: 800, color: "#111827", marginTop: 2, fontVariantNumeric: "tabular-nums" }}>
                {item.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Pay button ─── */}
      <a
        href="https://directpay.irs.gov"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: "block", textAlign: "center", marginTop: 12, padding: "14px",
          background: "#111827", color: "#fff", borderRadius: 10,
          fontWeight: 700, fontSize: 14, textDecoration: "none", fontFamily: "inherit",
        }}
      >
        Pay {$(result.quarterlyPayment)} on IRS Direct Pay →
      </a>

      {/* ─── Disclaimer ─── */}
      <div style={{ marginTop: 16, fontSize: 11, color: "#9ca3af", lineHeight: 1.6 }}>
        <strong style={{ color: "#6b7280" }}>Not tax advice.</strong> Simplified 2025 federal brackets and flat state rates. Does not account for AMT, Medicare surtax, state-specific deductions, credits, or local taxes. Consult a CPA.
      </div>
    </div>
  );
}
