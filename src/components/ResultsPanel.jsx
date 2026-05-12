import {
  DEADLINES, formatUSD, formatPct,
  getNextDeadline, daysUntilDeadline, getUrgencyColor,
} from "../engine/tax";

const C = {
  bg: "#0B0F14",
  panel: "#151A22",
  panel2: "#1B2230",
  panelHover: "#222B3A",
  border: "#2A3442",
  borderSubtle: "#1E2530",
  textMain: "#F4F7FA",
  textMuted: "#A7B0BD",
  textDim: "#6E7886",
  teal: "#14B8D6",
  tealBg: "#0A2F39",
  green: "#22C55E",
  greenBg: "#0F2E1F",
  yellow: "#F5C542",
  yellowBg: "#2F2814",
  red: "#EF4444",
  redBg: "#2E1313",
};

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
  paid:      { label: "Paid",      color: C.green,  bg: C.greenBg,  icon: "✓" },
  overdue:   { label: "Overdue",   color: C.red,    bg: C.redBg,    icon: "!" },
  due_today: { label: "Due today", color: C.red,    bg: C.redBg,    icon: "!" },
  due_soon:  { label: "Due soon",  color: C.yellow, bg: C.yellowBg, icon: "●" },
  current:   { label: "Next up",   color: C.teal,   bg: C.tealBg,   icon: "→" },
  missed:    { label: "Missed",    color: C.textMuted, bg: C.panel2, icon: "—" },
  upcoming:  { label: "Upcoming",  color: C.textMuted, bg: C.panel2, icon: "—" },
};

function getTaxHealth(statuses, paidCount) {
  if (paidCount === 0 && !statuses.includes("overdue") && !statuses.includes("due_today") && !statuses.includes("missed"))
    return { label: "Awaiting first payment", color: C.textMuted, bg: C.panel2 };
  if (statuses.includes("overdue") || statuses.includes("due_today") || statuses.includes("missed"))
    return { label: "Action needed", color: C.yellow, bg: C.yellowBg };
  if (statuses.includes("due_soon"))
    return { label: "Payment approaching", color: C.yellow, bg: C.yellowBg };
  return { label: "On track", color: C.green, bg: C.greenBg };
}

export default function ResultsPanel({
  result, paidQuarters, onTogglePaid, onTrack,
  withholding, hasW2, w2Withholding, paychecksRemaining,
  isAuthenticated, isPaid,
}) {
  const nd = getNextDeadline();
  const days = daysUntilDeadline(nd);
  const uc = getUrgencyColor(days);
  const $ = formatUSD;
  const P = formatPct;
  const statuses = getQuarterStatuses(paidQuarters);
  const paidCount = paidQuarters.length;
  const health = getTaxHealth(statuses, paidCount);
  const allPaid = paidCount === 4;
  const nextUnpaidIdx = statuses.findIndex(s => s !== "paid");
  const nextQuarterLabel = nextUnpaidIdx >= 0 ? DEADLINES[nextUnpaidIdx].quarter : null;
  const totalPaid = paidCount * result.quarterlyPayment;
  const remaining = Math.max(0, result.totalAnnualTax - totalPaid);

  const cardBase = {
    background: C.panel, border: `1px solid ${C.border}`,
    borderRadius: 14, overflow: "hidden",
  };

  return (
    <div className="qt-results-grid">
      <style>{`
        @media (max-width: 1279px) {
          .qt-main-pad { padding: 22px 22px 14px !important; }
          .qt-metrics > div, .qt-breakdown > div { padding: 13px 18px !important; }
          .qt-main-action { padding: 14px 22px !important; gap: 10px !important; }
        }
        @media (max-width: 540px) {
          .qt-main-pad { padding: 20px 18px 12px !important; }
          .qt-metrics { grid-template-columns: 1fr !important; }
          .qt-metrics > div { border-right: none !important; border-bottom: 1px solid ${C.borderSubtle}; }
          .qt-metrics > div:last-child { border-bottom: none; }
          .qt-breakdown > div { padding: 12px 14px !important; }
          .qt-main-action { flex-wrap: wrap !important; padding: 14px 18px !important; }
          .qt-main-action > a { width: 100%; justify-content: center; }
          .qt-quarter-row { padding: 11px 16px !important; }
          .qt-tracker-header { padding: 14px 16px 12px !important; }
        }
      `}</style>

      {/* ═══════════════════ MAIN OBLIGATION ═══════════════════ */}
      <div style={cardBase}>
        {/* Health strip */}
        <div style={{
          padding: "10px 22px", display: "flex", alignItems: "center", gap: 10,
          background: health.bg, borderBottom: `1px solid ${C.borderSubtle}`, flexWrap: "wrap",
        }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: health.color, flexShrink: 0 }} />
          <span style={{ fontSize: 13, fontWeight: 700, color: health.color }}>{health.label}</span>
          <span style={{ fontSize: 12, color: C.textMuted, marginLeft: "auto" }}>
            {paidCount} of 4 quarters logged
          </span>
        </div>

        {/* Hero */}
        <div className="qt-main-pad" style={{ padding: "26px 26px 16px" }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: C.textDim, textTransform: "uppercase", letterSpacing: ".12em", marginBottom: 8 }}>
            {nextQuarterLabel ? `${nextQuarterLabel} quarterly payment` : "Quarterly payment"}
          </div>
          <div className="qt-hero-number" style={{
            fontWeight: 900, letterSpacing: "-.04em", lineHeight: 1,
            color: C.textMain, fontVariantNumeric: "tabular-nums", marginBottom: 12,
          }}>
            {$(result.quarterlyPayment)}
          </div>

          {/* Deadline row */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <div style={{ width: 9, height: 9, borderRadius: "50%", background: uc, boxShadow: days <= 14 ? `0 0 8px ${uc}` : "none", flexShrink: 0 }} />
            <span style={{ fontSize: 14, fontWeight: 700, color: C.textMain }}>Due {nd.due}</span>
            <span style={{
              fontSize: 12, fontWeight: 700,
              color: days <= 14 ? C.red : C.textMuted,
              background: days <= 14 ? C.redBg : "transparent",
              padding: days <= 14 ? "2px 9px" : 0,
              borderRadius: 5,
            }}>
              {days === 0 ? "Today" : days < 0 ? `${Math.abs(days)} days overdue` : days === 1 ? "Tomorrow" : `${days} days`}
            </span>
          </div>
        </div>

        {/* 2-col metrics */}
        <div className="qt-metrics" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderTop: `1px solid ${C.borderSubtle}` }}>
          <div style={{ padding: "15px 22px", borderRight: `1px solid ${C.borderSubtle}` }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: C.textDim, textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 5 }}>
              Monthly set-aside
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: C.textMain, fontVariantNumeric: "tabular-nums", letterSpacing: "-.02em" }}>
              {$(result.monthlySetAside)}<span style={{ fontSize: 12, fontWeight: 600, color: C.textMuted }}>/mo</span>
            </div>
            <div style={{ fontSize: 11, color: C.green, fontWeight: 600, marginTop: 2 }}>Reserve monthly to stay on track</div>
          </div>
          <div style={{ padding: "15px 22px" }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: C.textDim, textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 5 }}>
              Effective rate
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: C.textMain, letterSpacing: "-.02em" }}>{P(result.effectiveRate)}</div>
            {result.effectiveRate > 0 && (
              <div style={{ fontSize: 11, color: C.textMuted, fontWeight: 500, marginTop: 2 }}>
                Marginal bracket: {P(result.marginalRate)}
              </div>
            )}
          </div>
        </div>

        {/* 3-col breakdown */}
        <div className="qt-breakdown" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", borderTop: `1px solid ${C.borderSubtle}` }}>
          {[
            { label: "Federal", value: result.quarterlyFederal },
            { label: "State", value: result.quarterlyState },
            { label: "SE Tax", value: result.quarterlySE },
          ].map((item, i) => (
            <div key={i} style={{
              padding: "13px 18px",
              borderRight: i < 2 ? `1px solid ${C.borderSubtle}` : "none",
              textAlign: "center",
            }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: C.textDim, textTransform: "uppercase", letterSpacing: ".1em" }}>
                {item.label}
              </div>
              <div style={{ fontSize: 17, fontWeight: 800, color: C.textMain, marginTop: 3, fontVariantNumeric: "tabular-nums" }}>
                {$(item.value)}
              </div>
            </div>
          ))}
        </div>

        {/* Withholding check */}
        {hasW2 && (
          <div style={{ padding: "14px 22px", borderTop: `1px solid ${C.borderSubtle}`, background: C.panel2 }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: C.textDim, textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 7 }}>
              Withholding check
            </div>
            {w2Withholding <= 0 && (
              <div style={{ fontSize: 13, color: C.textMuted, lineHeight: 1.6 }}>Enter your federal withholding to see your options.</div>
            )}
            {w2Withholding > 0 && paychecksRemaining === 0 && (
              <div style={{ fontSize: 13, color: C.textMuted, lineHeight: 1.6 }}>No paychecks remain this year, so withholding changes won't affect this year's taxes.</div>
            )}
            {withholding && w2Withholding > 0 && paychecksRemaining > 0 && (
              <div style={{ fontSize: 13, color: C.textMain, lineHeight: 1.6 }}>
                {withholding.offsetType === "no_shortfall" && (
                  <>Your current withholding covers your projected tax liability. No quarterly payments or adjustments needed.</>
                )}
                {withholding.offsetType === "full_offset" && (
                  <>You can cover this through withholding. Increase your per-paycheck withholding by approximately <strong style={{ color: C.teal }}>{$(withholding.perPaycheckIncrease)}</strong> and skip quarterly estimated payments.
                    <div style={{ fontSize: 12, color: C.textMuted, marginTop: 5 }}>Submit an updated W-4 to your employer — not the IRS.</div>
                  </>
                )}
                {withholding.offsetType === "partial_offset" && (
                  <>Increase withholding by about <strong style={{ color: C.teal }}>{$(withholding.perPaycheckIncrease)} per paycheck</strong> to reduce quarterly payments from <strong>{$(result.quarterlyPayment)}</strong> to <strong>{$(withholding.reducedQuarterlyPayment)}</strong>.
                    {paychecksRemaining <= 3
                      ? <div style={{ fontSize: 12, color: C.textMuted, marginTop: 5 }}>With {paychecksRemaining} paycheck{paychecksRemaining !== 1 ? "s" : ""} remaining, impact is limited.</div>
                      : <div style={{ fontSize: 12, color: C.textMuted, marginTop: 5 }}>Submit an updated W-4 to your employer to adjust.</div>}
                  </>
                )}
                {withholding.offsetType === "quarterly_needed" && (
                  <>Your remaining paychecks can't absorb the full shortfall at a reasonable level. Continue making quarterly payments of <strong style={{ color: C.teal }}>{$(result.quarterlyPayment)}</strong>.</>
                )}
              </div>
            )}
          </div>
        )}

        {/* Action row */}
        <div className="qt-main-action" style={{
          padding: "16px 22px", borderTop: `1px solid ${C.borderSubtle}`,
          display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap",
        }}>
          <button
            onClick={() => { if (allPaid || nextUnpaidIdx < 0) return; onTogglePaid(nextUnpaidIdx); }}
            disabled={allPaid}
            style={{
              flex: "1 1 200px", padding: "13px 16px",
              background: allPaid ? C.panel2 : C.teal,
              color: allPaid ? C.textMuted : C.bg,
              borderRadius: 10, fontWeight: 800, fontSize: 14, fontFamily: "inherit",
              border: "none", cursor: allPaid ? "default" : "pointer",
              letterSpacing: "-.01em",
            }}
          >
            {allPaid ? "All quarters logged" : `Log ${nextQuarterLabel} payment`}
          </button>
          <a href="https://directpay.irs.gov" target="_blank" rel="noopener noreferrer" style={{
            padding: "12px 18px", background: "transparent",
            border: `1px solid ${C.border}`, borderRadius: 10,
            fontWeight: 700, fontSize: 13, color: C.textMuted,
            textDecoration: "none", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6,
            whiteSpace: "nowrap",
          }}>
            Pay on IRS.gov <span style={{ fontSize: 11 }}>↗</span>
          </a>
        </div>
      </div>

      {/* ═══════════════════ YEAR TRACKER ═══════════════════ */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={cardBase}>
          {/* Year header */}
          <div className="qt-tracker-header" style={{ padding: "15px 18px 13px", borderBottom: `1px solid ${C.borderSubtle}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: C.textMain, letterSpacing: "-.01em" }}>
                {new Date().getFullYear()} Tax Year
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.textMuted }}>
                {paidCount}/4 logged
              </div>
            </div>
            <div style={{ fontSize: 11, color: C.textDim, marginTop: 2 }}>Year Tracker</div>
            <div style={{ marginTop: 11, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 800, color: C.textDim, textTransform: "uppercase", letterSpacing: ".1em" }}>Projected</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: C.textMain, fontVariantNumeric: "tabular-nums", marginTop: 2 }}>
                  {$(result.totalAnnualTax)}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 10, fontWeight: 800, color: C.textDim, textTransform: "uppercase", letterSpacing: ".1em" }}>Remaining</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: remaining > 0 ? C.textMain : C.green, fontVariantNumeric: "tabular-nums", marginTop: 2 }}>
                  {$(remaining)}
                </div>
              </div>
            </div>
          </div>

          {/* Quarter rows */}
          <div>
            {DEADLINES.map((q, i) => {
              const st = statuses[i];
              const cfg = STATUS_STYLE[st];
              const isActive = st === "current" || st === "due_soon" || st === "due_today" || st === "overdue";
              const isPaid_ = st === "paid";
              return (
                <div key={i} className="qt-quarter-row" style={{
                  padding: "11px 18px",
                  borderBottom: i < 3 ? `1px solid ${C.borderSubtle}` : "none",
                  background: isActive ? "rgba(20, 184, 214, 0.04)" : "transparent",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 800, color: isActive ? C.teal : C.textMain, letterSpacing: "-.01em" }}>{q.quarter}</span>
                      <span style={{ fontSize: 11, color: C.textMuted }}>{q.due}</span>
                    </div>
                    <span style={{
                      fontSize: 10, fontWeight: 800, color: cfg.color, background: cfg.bg,
                      padding: "3px 8px", borderRadius: 5, letterSpacing: ".04em",
                      whiteSpace: "nowrap",
                    }}>
                      {cfg.icon} {cfg.label}
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{
                      fontSize: 15, fontWeight: 700, fontVariantNumeric: "tabular-nums",
                      color: isPaid_ ? C.textDim : C.textMain,
                      textDecoration: isPaid_ ? "line-through" : "none",
                    }}>
                      {$(result.quarterlyPayment)}
                    </span>
                    <button onClick={() => onTogglePaid(i)} style={{
                      fontSize: 11, fontWeight: 700, padding: "5px 11px", borderRadius: 6, cursor: "pointer",
                      fontFamily: "inherit", transition: "all .12s",
                      background: isPaid_ ? C.greenBg : C.panel2,
                      border: isPaid_ ? `1px solid ${C.greenBg}` : `1px solid ${C.border}`,
                      color: isPaid_ ? C.green : C.textMuted,
                    }}>
                      {isPaid_ ? "Paid ✓" : "Log"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* CTA — 3 states */}
          {isPaid && (
            <div style={{ padding: "13px 18px", borderTop: `1px solid ${C.borderSubtle}`, background: C.greenBg }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8l3.5 3.5 6.5-6.5" stroke={C.green} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span style={{ fontSize: 13, fontWeight: 700, color: C.green }}>Tracking active</span>
              </div>
              <div style={{ fontSize: 11, color: C.textMuted, marginTop: 3, paddingLeft: 23 }}>
                Saved payment history is enabled for this account.
              </div>
            </div>
          )}
          {isAuthenticated && !isPaid && (
            <button onClick={onTrack} style={{
              width: "100%", padding: "13px 18px", borderTop: `1px solid ${C.borderSubtle}`,
              background: C.tealBg, border: "none", cursor: "pointer", fontFamily: "inherit",
              display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10,
            }}>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: C.teal, textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 3 }}>Unlock tracking</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.textMain }}>Save your payment history</div>
              </div>
              <span style={{ fontSize: 12, fontWeight: 800, color: C.bg, background: C.teal, padding: "7px 11px", borderRadius: 7, whiteSpace: "nowrap" }}>$4/mo</span>
            </button>
          )}
          {!isAuthenticated && (
            <button onClick={onTrack} style={{
              width: "100%", padding: "13px 18px", borderTop: `1px solid ${C.borderSubtle}`,
              background: C.tealBg, border: "none", cursor: "pointer", fontFamily: "inherit",
              display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10,
            }}>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: C.teal, textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 3 }}>Next step</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.textMain }}>Keep your payment history</div>
              </div>
              <span style={{ fontSize: 12, fontWeight: 800, color: C.bg, background: C.teal, padding: "7px 11px", borderRadius: 7, whiteSpace: "nowrap" }}>$4/mo</span>
            </button>
          )}
        </div>

        {/* Warning card */}
        <div style={{
          background: C.yellowBg, border: `1px solid ${C.yellowBg}`,
          borderRadius: 12, padding: "10px 14px",
          display: "flex", alignItems: "flex-start", gap: 10,
        }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
            <path d="M8 1.5L1 14.5h14L8 1.5z" fill={C.yellow} />
            <text x="8" y="13" textAnchor="middle" fill={C.bg} fontSize="9" fontWeight="800">!</text>
          </svg>
          <span style={{ fontSize: 12, fontWeight: 500, color: C.yellow, lineHeight: 1.4 }}>
            Underpayment may result in IRS penalties and interest charges.
          </span>
        </div>

        {/* Disclaimer */}
        <div style={{ fontSize: 11, color: C.textMuted, lineHeight: 1.55, padding: "0 4px" }}>
          <strong style={{ color: C.textMain, fontWeight: 700 }}>Not tax advice.</strong> Simplified 2025 federal brackets and flat state rates. Does not account for AMT, Medicare surtax, state-specific deductions, credits, or local taxes.
        </div>
      </div>
    </div>
  );
}
