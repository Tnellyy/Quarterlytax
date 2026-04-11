import {
  DEADLINES, formatUSD, formatPct,
  getNextDeadline, daysUntilDeadline, getUrgencyColor,
} from "../engine/tax";

// ─── FIX #1: CORRECT QUARTER STATUS LOGIC ───
// Rule: find the first unpaid quarter. That's the "active" one.
// Only the active quarter gets urgency. Past unpaid = "missed" (muted). Future = "upcoming" (neutral).
function getQuarterStatuses(paidQuarters) {
  const now = new Date();
  const statuses = [];
  let foundActive = false;

  for (let i = 0; i < DEADLINES.length; i++) {
    const d = DEADLINES[i];
    const days = Math.ceil((d.date - now) / 864e5);

    if (paidQuarters.includes(i)) {
      statuses.push("paid");
      continue;
    }

    if (!foundActive) {
      // This is the first unpaid quarter — it's the active obligation
      foundActive = true;
      if (days < 0) statuses.push("overdue");
      else if (days === 0) statuses.push("due_today");
      else if (days <= 14) statuses.push("due_soon");
      else statuses.push("current");
    } else {
      // Not the active quarter
      if (days < 0) statuses.push("missed"); // past but not the active one
      else statuses.push("upcoming");
    }
  }

  return statuses;
}

// ─── FIX #2: COLOR SEVERITY SYSTEM ───
const STATUS_STYLE = {
  paid:      { label: "Paid",       color: "#059669", bg: "#ecfdf5", border: "#a7f3d0", icon: "✓" },
  overdue:   { label: "Overdue",    color: "#dc2626", bg: "#fef2f2", border: "#fecaca", icon: "!" },
  due_today: { label: "Due today",  color: "#dc2626", bg: "#fef2f2", border: "#fecaca", icon: "!" },
  due_soon:  { label: "Due soon",   color: "#b45309", bg: "#fffbeb", border: "#fde68a", icon: "●" },
  current:   { label: "Current",    color: "#0e7490", bg: "#ecfeff", border: "#a5f3fc", icon: "→" },
  missed:    { label: "Missed",     color: "#9ca3af", bg: "#f3f4f6", border: "#e5e7eb", icon: "–" },
  upcoming:  { label: "Upcoming",   color: "#9ca3af", bg: "#f9fafb", border: "#e5e7eb", icon: "–" },
};

// ─── TAX HEALTH (derived from statuses, not raw dates) ───
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

  return (
    <div>
      <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, background: "#fff", overflow: "hidden" }}>

        {/* ─── TAX HEALTH STATUS ─── */}
        <div style={{
          padding: "12px 28px", display: "flex", alignItems: "center", gap: 10,
          background: health.bg, borderBottom: `1px solid ${health.border}`,
        }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: health.color, flexShrink: 0 }} />
          <span style={{ fontSize: 13, fontWeight: 700, color: health.color }}>{health.label}</span>
          {/* FIX #3: HUMAN PROGRESS LABEL */}
          <span style={{ fontSize: 12, color: "#6b7280", marginLeft: "auto" }}>
            {paidCount} of 4 payments logged
          </span>
        </div>

        {/* ─── HERO NUMBER ─── */}
        <div style={{ padding: "28px 28px 20px" }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 6 }}>
            Quarterly payment
          </div>
          <div style={{ fontSize: 48, fontWeight: 800, letterSpacing: "-.04em", lineHeight: 1, color: "#111827", fontVariantNumeric: "tabular-nums" }}>
            {$(result.quarterlyPayment)}
          </div>
        </div>

        {/* ─── DEADLINE ─── */}
        <div style={{ padding: "0 28px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: uc, boxShadow: days <= 14 ? `0 0 8px ${uc}` : "none" }} />
            <span style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>Due {nd.due}</span>
            <span style={{ fontSize: 13, color: days <= 14 ? "#ef4444" : "#6b7280", fontWeight: days <= 14 ? 700 : 400 }}>
              {days === 0 ? "Today" : days === 1 ? "Tomorrow" : `${days} days`}
            </span>
          </div>
        </div>

        {/* ─── FIX #4: MONTHLY TARGET + EFFECTIVE RATE ─── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderTop: "1px solid #f3f4f6" }}>
          <div style={{ padding: "18px 28px", borderRight: "1px solid #f3f4f6" }}>
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
          <div style={{ padding: "18px 28px" }}>
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

        {/* ─── FIX #1 + #2: CORRECTED QUARTERLY OBLIGATIONS ─── */}
        <div style={{ borderTop: "1px solid #f3f4f6", padding: "16px 28px" }}>
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
                padding: "10px 0", borderBottom: i < 3 ? "1px solid #f9fafb" : "none",
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
                    color: st === "paid" ? "#9ca3af" : st === "missed" ? "#9ca3af" : isActive ? "#0e7490" : "#111827",
                    textDecoration: st === "paid" ? "line-through" : "none",
                  }}>
                    {$(result.quarterlyPayment)}
                  </span>
                  <button onClick={() => onTogglePaid(i)} style={{
                    fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 6, cursor: "pointer",
                    fontFamily: "inherit", transition: "all .12s",
                    background: st === "paid" ? "#ecfdf5" : "#f9fafb",
                    border: st === "paid" ? `1px solid #a7f3d0` : "1px solid #e5e7eb",
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

        {/* ─── FIX #5: REFINED CTA ─── */}
        <div style={{ borderTop: "1px solid #f3f4f6", padding: "18px 28px", background: "#f9fafb" }}>
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

        {/* ─── FIX #6: SAFE PENALTY LANGUAGE ─── */}
        <div style={{
          borderTop: "1px solid #fde68a", padding: "12px 28px", background: "#fffbeb",
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

      {/* ─── BREAKDOWN STRIP ─── */}
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
              <div style={{ fontSize: 10, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: ".05em" }}>{item.label}</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: "#111827", marginTop: 2, fontVariantNumeric: "tabular-nums" }}>{item.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── PRIMARY ACTION: LOG PAYMENT (stays in ecosystem) ─── */}
      <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
        <button onClick={() => {
          const nextUnpaid = statuses.findIndex(s => s !== "paid");
          if (nextUnpaid >= 0) onTogglePaid(nextUnpaid);
        }} style={{
          flex: 1, textAlign: "center", padding: "14px",
          background: "#111827", color: "#fff", borderRadius: 10,
          fontWeight: 700, fontSize: 14, fontFamily: "inherit",
          border: "none", cursor: "pointer",
        }}>
          Log {DEADLINES[statuses.findIndex(s => s !== "paid") ?? 0]?.quarter || "Q1"} payment
        </button>
        <a href="https://directpay.irs.gov" target="_blank" rel="noopener noreferrer" style={{
          padding: "14px 20px", background: "#fff", border: "1.5px solid #e5e7eb", borderRadius: 10,
          fontWeight: 600, fontSize: 13, color: "#6b7280", textDecoration: "none", fontFamily: "inherit",
          display: "flex", alignItems: "center",
        }}>
          IRS.gov ↗
        </a>
      </div>

      {/* ─── DISCLAIMER ─── */}
      <div style={{ marginTop: 16, fontSize: 11, color: "#9ca3af", lineHeight: 1.6 }}>
        <strong style={{ color: "#6b7280" }}>Not tax advice.</strong> Simplified 2025 federal brackets and flat state rates. Does not account for AMT, Medicare surtax, state-specific deductions, credits, or local taxes.
      </div>
    </div>
  );
}
