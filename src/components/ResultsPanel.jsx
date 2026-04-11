import {
  DEADLINES, formatUSD, formatPct,
  getNextDeadline, daysUntilDeadline, getUrgencyColor,
} from "../engine/tax";

function getQuarterStatuses(paidQuarters) {
  const now = new Date();
  const statuses = [];
  let foundActive = false;
  for (let i = 0; i < DEADLINES.length; i++) {
    const d = DEADLINES[i];
    const days = Math.ceil((d.date - now) / 864e5);
    if (paidQuarters.includes(i)) { statuses.push("paid"); continue; }
    if (!foundActive) {
      foundActive = true;
      if (days < 0) statuses.push("overdue");
      else if (days === 0) statuses.push("due_today");
      else if (days <= 14) statuses.push("due_soon");
      else statuses.push("current");
    } else {
      statuses.push(days < 0 ? "missed" : "upcoming");
    }
  }
  return statuses;
}

const STATUS_STYLE = {
  paid:      { label: "Paid",      color: "#059669", bg: "#ecfdf5", border: "#a7f3d0", icon: "✓" },
  overdue:   { label: "Overdue",   color: "#dc2626", bg: "#fef2f2", border: "#fecaca", icon: "!" },
  due_today: { label: "Due today", color: "#dc2626", bg: "#fef2f2", border: "#fecaca", icon: "!" },
  due_soon:  { label: "Due soon",  color: "#b45309", bg: "#fffbeb", border: "#fde68a", icon: "●" },
  current:   { label: "Current",   color: "#0e7490", bg: "#ecfeff", border: "#a5f3fc", icon: "→" },
  missed:    { label: "Missed",    color: "#9ca3af", bg: "#f3f4f6", border: "#e5e7eb", icon: "–" },
  upcoming:  { label: "Upcoming",  color: "#9ca3af", bg: "#f9fafb", border: "#e5e7eb", icon: "–" },
};

function getTaxHealth(statuses) {
  if (statuses.includes("overdue") || statuses.includes("due_today") || statuses.includes("missed"))
    return { label: "Action needed", color: "#b45309", bg: "#fffbeb", border: "#fde68a" };
  if (statuses.includes("due_soon"))
    return { label: "Payment approaching", color: "#b45309", bg: "#fffbeb", border: "#fde68a" };
  return { label: "On track", color: "#059669", bg: "#ecfdf5", border: "#a7f3d0" };
}

export default function ResultsPanel({ result, paidQuarters, onTogglePaid, onTrack }) {
  const nd = getNextDeadline();
  const days = daysUntilDeadline(nd);
  const uc = getUrgencyColor(days);
  const $ = formatUSD;
  const P = formatPct;
  const statuses = getQuarterStatuses(paidQuarters);
  const health = getTaxHealth(statuses);
  const paidCount = paidQuarters.length;

  // internal padding for all card sections
  const px = 24;

  return (
    <div>
      {/* ═══ MAIN RESULTS CARD ═══ */}
      <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, background: "#fff", overflow: "hidden" }}>

        {/* Tax health */}
        <div style={{
          padding: `10px ${px}px`, display: "flex", alignItems: "center", gap: 10,
          background: health.bg, borderBottom: `1px solid ${health.border}`,
        }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: health.color, flexShrink: 0 }} />
          <span style={{ fontSize: 13, fontWeight: 700, color: health.color }}>{health.label}</span>
          <span style={{ fontSize: 12, color: "#6b7280", marginLeft: "auto" }}>{paidCount} of 4 payments logged</span>
        </div>

        {/* Hero number */}
        <div style={{ padding: `24px ${px}px 18px` }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 6 }}>
            Quarterly payment
          </div>
          <div style={{ fontSize: 48, fontWeight: 800, letterSpacing: "-.04em", lineHeight: 1, color: "#111827", fontVariantNumeric: "tabular-nums" }}>
            {$(result.quarterlyPayment)}
          </div>
        </div>

        {/* Deadline */}
        <div style={{ padding: `0 ${px}px 18px` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: uc, boxShadow: days <= 14 ? `0 0 8px ${uc}` : "none" }} />
            <span style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>Due {nd.due}</span>
            <span style={{ fontSize: 13, color: days <= 14 ? "#ef4444" : "#6b7280", fontWeight: days <= 14 ? 700 : 400 }}>
              {days === 0 ? "Today" : days === 1 ? "Tomorrow" : `${days} days`}
            </span>
          </div>
        </div>

        {/* Monthly target + effective rate */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderTop: "1px solid #f3f4f6" }}>
          <div style={{ padding: `16px ${px}px`, borderRight: "1px solid #f3f4f6" }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 4 }}>
              Your monthly target
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#111827", fontVariantNumeric: "tabular-nums" }}>
              {$(result.monthlySetAside)}<span style={{ fontSize: 13, fontWeight: 600, color: "#6b7280" }}>/mo</span>
            </div>
            <div style={{ fontSize: 12, color: "#059669", fontWeight: 600, marginTop: 2 }}>
              Set aside this amount to stay on track
            </div>
          </div>
          <div style={{ padding: `16px ${px}px` }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 4 }}>
              Effective rate
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#111827" }}>{P(result.effectiveRate)}</div>
            {result.effectiveRate > 0 && result.effectiveRate < result.marginalRate * 0.8 && (
              <div style={{ fontSize: 12, color: "#6b7280", fontWeight: 500, marginTop: 2 }}>
                Below your {P(result.marginalRate)} marginal bracket
              </div>
            )}
          </div>
        </div>

        {/* Quarterly obligations */}
        <div style={{ borderTop: "1px solid #f3f4f6", padding: `14px ${px}px` }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 10 }}>
            Quarterly obligations
          </div>
          {DEADLINES.map((q, i) => {
            const st = statuses[i];
            const cfg = STATUS_STYLE[st];
            const isActive = st === "current" || st === "due_soon" || st === "due_today" || st === "overdue";
            return (
              <div key={i} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "9px 0", borderBottom: i < 3 ? "1px solid #f9fafb" : "none",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: isActive ? "#0e7490" : "#6b7280", width: 24 }}>{q.quarter}</span>
                  <span style={{ fontSize: 12, color: "#9ca3af" }}>Due {q.due}</span>
                  <span style={{
                    fontSize: 11, fontWeight: 700, color: cfg.color, background: cfg.bg,
                    padding: "2px 8px", borderRadius: 4, border: `1px solid ${cfg.border}`,
                  }}>
                    {cfg.icon} {cfg.label}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{
                    fontSize: 15, fontWeight: 700, fontVariantNumeric: "tabular-nums",
                    color: st === "paid" || st === "missed" ? "#9ca3af" : isActive ? "#0e7490" : "#111827",
                    textDecoration: st === "paid" ? "line-through" : "none",
                  }}>
                    {$(result.quarterlyPayment)}
                  </span>
                  <button onClick={() => onTogglePaid(i)} style={{
                    fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 6, cursor: "pointer",
                    fontFamily: "inherit", transition: "all .12s",
                    background: st === "paid" ? "#ecfdf5" : "#f9fafb",
                    border: st === "paid" ? "1px solid #a7f3d0" : "1px solid #e5e7eb",
                    color: st === "paid" ? "#059669" : "#6b7280",
                  }}>
                    {st === "paid" ? "Paid ✓" : "Log payment"}
                  </button>
                </div>
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

        {/* CTA */}
        <div style={{ borderTop: "1px solid #f3f4f6", padding: `16px ${px}px`, background: "#f9fafb" }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 8 }}>
            Recommended
          </div>
          <button onClick={onTrack} style={{
            width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
            background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", padding: 0,
          }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#111827", textAlign: "left" }}>Keep your payment history</div>
              <div style={{ fontSize: 12, color: "#6b7280", textAlign: "left" }}>Saved quarters, deadline reminders, year-over-year tracking</div>
            </div>
            <span style={{
              fontSize: 13, fontWeight: 800, color: "#fff", background: "#0e7490",
              padding: "8px 16px", borderRadius: 8, flexShrink: 0,
            }}>$4/mo →</span>
          </button>
        </div>

        {/* Warning */}
        <div style={{
          borderTop: "1px solid #fde68a", padding: `10px ${px}px`, background: "#fffbeb",
          display: "flex", alignItems: "center", gap: 8, borderRadius: "0 0 12px 12px",
        }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 1L1 13h12L7 1z" fill="#f59e0b" />
            <text x="7" y="11" textAnchor="middle" fill="#fff" fontSize="8" fontWeight="800">!</text>
          </svg>
          <span style={{ fontSize: 12, fontWeight: 600, color: "#92400e" }}>
            Underpayment may result in IRS penalties and interest charges
          </span>
        </div>
      </div>

      {/* ═══ BREAKDOWN STRIP — 8px gap ═══ */}
      <div style={{ marginTop: 8, border: "1px solid #e5e7eb", borderRadius: 12, background: "#fff", overflow: "hidden" }}>
        <div style={{ padding: `12px ${px - 4}px`, display: "grid", gridTemplateColumns: "1fr 1fr 1fr" }}>
          {[
            { label: "Federal", value: $(result.quarterlyFederal) },
            { label: "State", value: $(result.quarterlyState) },
            { label: "SE Tax", value: $(result.quarterlySE) },
          ].map((item, i) => (
            <div key={i} style={{
              textAlign: "center", padding: "4px 0",
              borderRight: i < 2 ? "1px solid #f3f4f6" : "none",
            }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: ".05em" }}>{item.label}</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: "#111827", marginTop: 2, fontVariantNumeric: "tabular-nums" }}>{item.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ═══ ACTION ROW — 8px gap ═══ */}
      <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
        <button onClick={() => {
          const nextUnpaid = statuses.findIndex(s => s !== "paid");
          if (nextUnpaid >= 0) onTogglePaid(nextUnpaid);
        }} style={{
          flex: 1, textAlign: "center", padding: "13px",
          background: "#111827", color: "#fff", borderRadius: 10,
          fontWeight: 700, fontSize: 14, fontFamily: "inherit",
          border: "none", cursor: "pointer",
        }}>
          Log {DEADLINES[statuses.findIndex(s => s !== "paid") ?? 0]?.quarter || "Q1"} payment
        </button>
        <a href="https://directpay.irs.gov" target="_blank" rel="noopener noreferrer" style={{
          padding: "13px 20px", background: "#fff", border: "1.5px solid #e5e7eb", borderRadius: 10,
          fontWeight: 600, fontSize: 13, color: "#6b7280", textDecoration: "none", fontFamily: "inherit",
          display: "flex", alignItems: "center",
        }}>
          IRS.gov ↗
        </a>
      </div>

      {/* DISCLAIMER */}
      <div style={{ marginTop: 14, fontSize: 11, color: "#9ca3af", lineHeight: 1.6 }}>
        <strong style={{ color: "#6b7280" }}>Not tax advice.</strong> Simplified 2025 federal brackets and flat state rates. Does not account for AMT, Medicare surtax, state-specific deductions, credits, or local taxes.
      </div>
    </div>
  );
}
