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
  paid:      { label: "Paid",      color: "#34d399", bg: "#0a2e23", icon: "✓" },
  overdue:   { label: "Overdue",   color: "#f87171", bg: "#2d0a0a", icon: "!" },
  due_today: { label: "Due today", color: "#f87171", bg: "#2d0a0a", icon: "!" },
  due_soon:  { label: "Due soon",  color: "#e0b84d", bg: "#2e2612", icon: "●" },
  current:   { label: "Current",   color: "#0ea5c9", bg: "#122b35", icon: "→" },
  missed:    { label: "Missed",    color: "#828a96", bg: "#202535", icon: "–" },
  upcoming:  { label: "Upcoming",  color: "#828a96", bg: "#202535", icon: "–" },
};

function getTaxHealth(statuses, paidCount) {
  if (paidCount === 0 && !statuses.includes("overdue") && !statuses.includes("due_today") && !statuses.includes("missed"))
    return { label: "No payments logged", color: "#828a96", bg: "#202535", border: "#202535" };
  if (statuses.includes("overdue") || statuses.includes("due_today") || statuses.includes("missed"))
    return { label: "Action needed", color: "#e0b84d", bg: "#2e2612", border: "#2e2612" };
  if (statuses.includes("due_soon"))
    return { label: "Payment approaching", color: "#e0b84d", bg: "#2e2612", border: "#2e2612" };
  return { label: "On track", color: "#34d399", bg: "#0a2e23", border: "#0a2e23" };
}

export default function ResultsPanel({
  result, paidQuarters, onTogglePaid, onTrack,
  withholding, hasW2, w2Withholding, paychecksRemaining,
}) {
  const nd = getNextDeadline();
  const days = daysUntilDeadline(nd);
  const uc = getUrgencyColor(days);
  const $ = formatUSD;
  const P = formatPct;
  const statuses = getQuarterStatuses(paidQuarters);
  const paidCount = paidQuarters.length;
  const health = getTaxHealth(statuses, paidCount);
  const px = 24;
  const allPaid = paidCount === 4;

  return (
    <div>
      <div style={{ border: "1px solid #2a2e3a", borderRadius: 12, background: "#181b23", overflow: "hidden" }}>

        {/* Tax health */}
        <div style={{
          padding: `10px ${px}px`, display: "flex", alignItems: "center", gap: 10,
          background: health.bg, borderBottom: `1px solid ${health.border}`,
        }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: health.color, flexShrink: 0 }} />
          <span style={{ fontSize: 13, fontWeight: 700, color: health.color }}>{health.label}</span>
          <span style={{ fontSize: 12, color: "#828a96", marginLeft: "auto" }}>{paidCount} of 4 payments logged</span>
        </div>

        {/* Hero number */}
        <div style={{ padding: `24px ${px}px 18px` }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#828a96", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 6 }}>
            Quarterly payment
          </div>
          <div style={{ fontSize: 48, fontWeight: 800, letterSpacing: "-.04em", lineHeight: 1, color: "#e8eaed", fontVariantNumeric: "tabular-nums" }}>
            {$(result.quarterlyPayment)}
          </div>
        </div>

        {/* Deadline */}
        <div style={{ padding: `0 ${px}px 18px` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: uc, boxShadow: days <= 14 ? `0 0 8px ${uc}` : "none" }} />
            <span style={{ fontSize: 14, fontWeight: 700, color: "#e8eaed" }}>Due {nd.due}</span>
            <span style={{ fontSize: 13, color: days <= 14 ? "#f87171" : "#8b8f9a", fontWeight: days <= 14 ? 700 : 400 }}>
              {days === 0 ? "Today" : days === 1 ? "Tomorrow" : `${days} days`}
            </span>
          </div>
        </div>

        {/* Monthly target + effective rate */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderTop: "1px solid #222530" }}>
          <div style={{ padding: `16px ${px}px`, borderRight: "1px solid #222530" }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#828a96", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 4 }}>
              Your monthly target
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#e8eaed", fontVariantNumeric: "tabular-nums" }}>
              {$(result.monthlySetAside)}<span style={{ fontSize: 13, fontWeight: 600, color: "#8b8f9a" }}>/mo</span>
            </div>
            <div style={{ fontSize: 12, color: "#34d399", fontWeight: 600, marginTop: 2 }}>
              Set aside monthly to stay on track
            </div>
          </div>
          <div style={{ padding: `16px ${px}px` }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#828a96", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 4 }}>
              Effective rate
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#e8eaed" }}>{P(result.effectiveRate)}</div>
            {result.effectiveRate > 0 && result.effectiveRate < result.marginalRate * 0.8 && (
              <div style={{ fontSize: 12, color: "#8b8f9a", fontWeight: 500, marginTop: 2 }}>
                Below your {P(result.marginalRate)} marginal bracket
              </div>
            )}
          </div>
        </div>

        {/* Quarterly obligations */}
        <div style={{ borderTop: "1px solid #222530", padding: `14px ${px}px` }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#828a96", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 10 }}>
            Quarterly obligations
          </div>
          {DEADLINES.map((q, i) => {
            const st = statuses[i];
            const cfg = STATUS_STYLE[st];
            const isActive = st === "current" || st === "due_soon" || st === "due_today" || st === "overdue";
            return (
              <div key={i} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "9px 0", borderBottom: i < 3 ? "1px solid #222530" : "none",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: isActive ? "#0ea5c9" : "#828a96", width: 24 }}>{q.quarter}</span>
                  <span style={{ fontSize: 12, color: "#828a96" }}>Due {q.due}</span>
                  <span style={{
                    fontSize: 11, fontWeight: 700, color: cfg.color, background: cfg.bg,
                    padding: "2px 8px", borderRadius: 4,
                  }}>
                    {cfg.icon} {cfg.label}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{
                    fontSize: 15, fontWeight: 700, fontVariantNumeric: "tabular-nums",
                    color: st === "paid" || st === "missed" ? "#828a96" : isActive ? "#0e7490" : "#e8eaed",
                    textDecoration: st === "paid" ? "line-through" : "none",
                  }}>
                    {$(result.quarterlyPayment)}
                  </span>
                  <button onClick={() => onTogglePaid(i)} style={{
                    fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 6, cursor: "pointer",
                    fontFamily: "inherit", transition: "all .12s",
                    background: st === "paid" ? "#0a2e23" : "#202535",
                    border: st === "paid" ? "1px solid #0a2e23" : "1px solid #2a2e3a",
                    color: st === "paid" ? "#34d399" : "#959aa5",
                  }}>
                    {st === "paid" ? "Paid ✓" : "Log payment"}
                  </button>
                </div>
              </div>
            );
          })}
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "baseline",
            marginTop: 8, paddingTop: 10, borderTop: "1px solid #2a2e3a",
          }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#828a96" }}>Total {new Date().getFullYear()}</span>
            <span style={{ fontSize: 18, fontWeight: 800, fontVariantNumeric: "tabular-nums", color: "#e8eaed" }}>{$(result.totalAnnualTax)}</span>
          </div>
        </div>

        {/* Withholding check */}
        {hasW2 && (
          <div style={{ borderTop: "1px solid #222530", padding: `14px ${px}px` }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#828a96", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 10 }}>
              Withholding check
            </div>

            {w2Withholding <= 0 && (
              <div style={{ fontSize: 13, color: "#828a96", lineHeight: 1.6 }}>
                Enter your federal withholding to see your options.
              </div>
            )}

            {w2Withholding > 0 && paychecksRemaining === 0 && (
              <div style={{ fontSize: 13, color: "#8b8f9a", lineHeight: 1.6 }}>
                No paychecks remain this year, so withholding changes won't affect this year's taxes.
              </div>
            )}

            {withholding && w2Withholding > 0 && paychecksRemaining > 0 && (
              <div>
                {withholding.offsetType === "no_shortfall" && (
                  <div style={{ fontSize: 13, color: "#e8eaed", lineHeight: 1.6 }}>
                    Your current withholding covers your projected tax liability. No quarterly payments or adjustments needed.
                  </div>
                )}

                {withholding.offsetType === "full_offset" && (
                  <div style={{ fontSize: 13, color: "#e8eaed", lineHeight: 1.6 }}>
                    You can cover this through withholding. Increase your per-paycheck withholding by approximately{" "}
                    <strong>{$(withholding.perPaycheckIncrease)}</strong> and skip quarterly estimated payments.
                    <div style={{ fontSize: 12, color: "#8b8f9a", marginTop: 6 }}>
                      To adjust, submit an updated W-4 to your employer — not the IRS.
                    </div>
                  </div>
                )}

                {withholding.offsetType === "partial_offset" && (
                  <div style={{ fontSize: 13, color: "#e8eaed", lineHeight: 1.6 }}>
                    Increase withholding by about{" "}
                    <strong>{$(withholding.perPaycheckIncrease)} per paycheck</strong> to reduce quarterly payments from{" "}
                    <strong>{$(result.quarterlyPayment)}</strong> to{" "}
                    <strong>{$(withholding.reducedQuarterlyPayment)}</strong>.
                    {paychecksRemaining <= 3 ? (
                      <div style={{ fontSize: 12, color: "#8b8f9a", marginTop: 6 }}>
                        With {paychecksRemaining} paycheck{paychecksRemaining !== 1 ? "s" : ""} remaining, withholding changes have limited impact this year.
                      </div>
                    ) : (
                      <div style={{ fontSize: 12, color: "#8b8f9a", marginTop: 6 }}>
                        To adjust, submit an updated W-4 to your employer — not the IRS.
                      </div>
                    )}
                  </div>
                )}

                {withholding.offsetType === "quarterly_needed" && (
                  <div style={{ fontSize: 13, color: "#e8eaed", lineHeight: 1.6 }}>
                    Your remaining paychecks can't absorb the full shortfall at a reasonable level. Continue making quarterly payments of{" "}
                    <strong>{$(result.quarterlyPayment)}</strong>.
                    {paychecksRemaining <= 3 && paychecksRemaining > 0 && (
                      <div style={{ fontSize: 12, color: "#8b8f9a", marginTop: 6 }}>
                        With {paychecksRemaining} paycheck{paychecksRemaining !== 1 ? "s" : ""} remaining, withholding changes have limited impact this year.
                      </div>
                    )}
                  </div>
                )}

                <div style={{ fontSize: 12, color: "#828a96", marginTop: 8 }}>
                  Estimate based on inputs provided. Actual withholding depends on your W-4 and employer payroll.
                </div>
              </div>
            )}
          </div>
        )}

        {/* CTA */}
        <div style={{ borderTop: "1px solid #2a2e3a", padding: `16px ${px}px`, background: "#122b35" }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#0ea5c9", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 8 }}>
            Next step
          </div>
          <button onClick={onTrack} style={{
            width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
            background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", padding: 0,
          }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#e8eaed", textAlign: "left" }}>Keep your payment history</div>
              <div style={{ fontSize: 12, color: "#8b8f9a", textAlign: "left" }}>Save your quarters. Get deadline reminders. Track every payment.</div>
            </div>
            <span style={{
              fontSize: 14, fontWeight: 800, color: "#0f1117", background: "#0ea5c9",
              padding: "10px 20px", borderRadius: 8, flexShrink: 0,
            }}>$4/mo →</span>
          </button>
        </div>

        {/* Warning */}
        <div style={{
          borderTop: "1px solid #302a12", padding: `8px ${px}px`, background: "#28220f",
          display: "flex", alignItems: "center", gap: 8, borderRadius: "0 0 12px 12px",
        }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 1L1 13h12L7 1z" fill="#e0b84d" />
            <text x="7" y="11" textAnchor="middle" fill="#28220f" fontSize="8" fontWeight="800">!</text>
          </svg>
          <span style={{ fontSize: 12, fontWeight: 500, color: "#e0b84d" }}>
            Underpayment may result in IRS penalties and interest charges
          </span>
        </div>
      </div>

      {/* Breakdown strip */}
      <div style={{ marginTop: 8, border: "1px solid #2a2e3a", borderRadius: 8, background: "#181b23", overflow: "hidden" }}>
        <div style={{ padding: `12px ${px - 4}px`, display: "grid", gridTemplateColumns: "1fr 1fr 1fr" }}>
          {[
            { label: "Federal", value: $(result.quarterlyFederal) },
            { label: "State", value: $(result.quarterlyState) },
            { label: "SE Tax", value: $(result.quarterlySE) },
          ].map((item, i) => (
            <div key={i} style={{
              textAlign: "center", padding: "4px 0",
              borderRight: i < 2 ? "1px solid #222530" : "none",
            }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: "#828a96", textTransform: "uppercase", letterSpacing: ".05em" }}>{item.label}</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: "#e8eaed", marginTop: 2, fontVariantNumeric: "tabular-nums" }}>{item.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Action row */}
      <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
        <button onClick={() => {
          if (allPaid) return;
          const nextUnpaid = statuses.findIndex(s => s !== "paid");
          if (nextUnpaid >= 0) onTogglePaid(nextUnpaid);
        }} style={{
          flex: 1, textAlign: "center", padding: "15px",
          background: allPaid ? "#2a2e3a" : "#e8eaed",
          color: allPaid ? "#828a96" : "#0f1117",
          borderRadius: 10, fontWeight: 700, fontSize: 14, fontFamily: "inherit",
          border: "none", cursor: allPaid ? "default" : "pointer",
        }}>
          {allPaid
            ? "All payments logged"
            : `Log ${DEADLINES[statuses.findIndex(s => s !== "paid")]?.quarter || "Q1"} payment`
          }
        </button>
        <a href="https://directpay.irs.gov" target="_blank" rel="noopener noreferrer" style={{
          padding: "13px 20px", background: "transparent", border: "1px solid #2a2e3a", borderRadius: 10,
          fontWeight: 600, fontSize: 13, color: "#8b8f9a", textDecoration: "none", fontFamily: "inherit",
          display: "flex", alignItems: "center",
        }}>
          IRS.gov ↗
        </a>
      </div>

      {/* Disclaimer */}
      <div style={{ marginTop: 14, fontSize: 11, color: "#828a96", lineHeight: 1.6 }}>
        <strong style={{ color: "#8b8f9a" }}>Not tax advice.</strong> Simplified 2025 federal brackets and flat state rates. Does not account for AMT, Medicare surtax, state-specific deductions, credits, or local taxes.
      </div>
    </div>
  );
}
