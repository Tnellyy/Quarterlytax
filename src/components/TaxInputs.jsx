import { useState, useEffect } from "react";
import CurrencyInput from "./CurrencyInput";
import { getSortedStates, FILING_LABELS, PAY_FREQUENCIES } from "../engine/tax";

const C = {
  panel: "#151A22", panel2: "#1B2230", panelHover: "#222B3A",
  border: "#2A3442", borderSubtle: "#1E2530",
  textMain: "#F4F7FA", textMuted: "#A7B0BD", textDim: "#6E7886",
  teal: "#14B8D6", green: "#22C55E",
};

const selectStyle = {
  width: "100%", padding: "10px 11px", fontSize: 13, fontWeight: 600,
  color: C.textMain, background: C.panel2, border: `1.5px solid ${C.border}`,
  borderRadius: 9, outline: "none", fontFamily: "inherit", cursor: "pointer",
  appearance: "none",
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M1 1l4 4 4-4' fill='none' stroke='%23A7B0BD' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E")`,
  backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center",
  paddingRight: 26,
};

const fieldLabel = { display: "block", fontSize: 11, fontWeight: 600, color: C.textMuted, marginBottom: 4 };
const sectionLabel = { fontSize: 10, fontWeight: 800, color: C.textDim, letterSpacing: ".12em", textTransform: "uppercase" };

export default function TaxInputs({
  income, setIncome, state, setState, status, setStatus,
  deductions, setDeductions, showDeductions, setShowDeductions,
  hasW2, setHasW2, w2Income, setW2Income, w2Withholding, setW2Withholding,
  payFrequency, onPayFrequencyChange, paychecksRemaining, onPaychecksChange,
  paychecksManuallyEdited, showSafeHarbor, setShowSafeHarbor, lastYearTax, setLastYearTax,
}) {
  const states = getSortedStates();
  const [pcFocused, setPcFocused] = useState(false);
  const [pcRaw, setPcRaw] = useState(String(paychecksRemaining));
  useEffect(() => { if (!pcFocused) setPcRaw(String(paychecksRemaining)); }, [paychecksRemaining, pcFocused]);

  return (
    <div className="tax-profile-card" style={{
      background: C.panel, border: `1px solid ${C.border}`, borderRadius: 14,
      padding: "16px 16px 18px",
    }}>
      {/* Header */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: C.textMain, letterSpacing: "-.01em" }}>Tax Profile</div>
        <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>Filing details and income</div>
      </div>

      {/* Filing setup */}
      <div style={{ paddingTop: 12, borderTop: `1px solid ${C.borderSubtle}` }}>
        <div style={{ ...sectionLabel, marginBottom: 9 }}>Filing setup</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <div>
            <label style={fieldLabel}>Filing status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} style={selectStyle}>
              {Object.entries(FILING_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div>
            <label style={fieldLabel}>State</label>
            <select value={state} onChange={(e) => setState(e.target.value)} style={selectStyle}>
              {states.map(([code, s]) => <option key={code} value={code}>{s.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Income */}
      <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${C.borderSubtle}` }}>
        <div style={{ ...sectionLabel, marginBottom: 9 }}>Income</div>
        <CurrencyInput label="Annual freelance income" value={income} onChange={setIncome} subtitle="Gross 1099 income before expenses" />

        <button onClick={() => setShowDeductions(!showDeductions)} style={{
          display: "flex", width: "100%", justifyContent: "space-between", alignItems: "center",
          background: "none", border: "none", cursor: "pointer", padding: "4px 0",
          fontFamily: "inherit",
        }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: C.textMuted }}>Business deductions</span>
          <span style={{ fontSize: 13, color: C.textDim, transform: showDeductions ? "rotate(90deg)" : "none", transition: "transform .15s" }}>›</span>
        </button>
        {showDeductions && (
          <div style={{ marginTop: 6 }}>
            <CurrencyInput label="Annual deductions" value={deductions} onChange={setDeductions}
              subtitle="Home office, software, supplies, travel" />
          </div>
        )}
      </div>

      {/* W-2 offset */}
      <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${C.borderSubtle}` }}>
        <div style={{ ...sectionLabel, marginBottom: 9 }}>W-2 offset</div>
        <label style={fieldLabel}>Do you also have W-2 income?</label>
        <div style={{ display: "flex", background: C.panel2, borderRadius: 9, padding: 3, marginBottom: hasW2 ? 12 : 0 }}>
          {[{ key: false, label: "No" }, { key: true, label: "Yes" }].map((opt) => (
            <button key={String(opt.key)} onClick={() => setHasW2(opt.key)} style={{
              flex: 1, padding: "7px 0", border: "none", borderRadius: 7,
              background: hasW2 === opt.key ? C.panelHover : "transparent",
              boxShadow: hasW2 === opt.key ? "0 1px 4px rgba(0,0,0,.4), inset 0 0 0 1px rgba(255,255,255,.04)" : "none",
              color: hasW2 === opt.key ? C.textMain : C.textMuted,
              fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "inherit", transition: "all .12s",
            }}>{opt.label}</button>
          ))}
        </div>

        {hasW2 && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <CurrencyInput label="W-2 income" value={w2Income} onChange={setW2Income} />
              <CurrencyInput label="Federal w/h YTD" value={w2Withholding} onChange={setW2Withholding} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <div style={{ marginBottom: 0 }}>
                <label style={fieldLabel}>Pay frequency</label>
                <select value={payFrequency} onChange={(e) => onPayFrequencyChange(e.target.value)} style={selectStyle}>
                  {Object.entries(PAY_FREQUENCIES).map(([key, freq]) => <option key={key} value={key}>{freq.label}</option>)}
                </select>
              </div>
              <div>
                <label style={fieldLabel}>Paychecks left</label>
                <input type="text" inputMode="numeric" value={pcRaw}
                  onFocus={() => setPcFocused(true)}
                  onBlur={() => { setPcFocused(false); const val = parseInt(pcRaw, 10); if (!isNaN(val) && val >= 0) onPaychecksChange(val); }}
                  onChange={(e) => setPcRaw(e.target.value.replace(/[^0-9]/g, ""))}
                  style={{
                    width: "100%", padding: "10px 11px", fontSize: 13, fontWeight: 600,
                    color: C.textMain, background: pcFocused ? C.panelHover : C.panel2,
                    border: pcFocused ? `1.5px solid ${C.teal}` : `1.5px solid ${C.border}`,
                    borderRadius: 9, outline: "none", fontFamily: "inherit",
                    fontVariantNumeric: "tabular-nums", transition: "all .15s",
                  }}
                />
                {!paychecksManuallyEdited && (
                  <div style={{ fontSize: 10, color: C.textDim, marginTop: 3 }}>Auto-estimated</div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Safe harbor */}
      <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${C.borderSubtle}` }}>
        <button onClick={() => setShowSafeHarbor(!showSafeHarbor)} style={{
          width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center",
          background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", padding: 0,
        }}>
          <span style={sectionLabel}>Safe harbor</span>
          <span style={{ color: C.textDim, fontSize: 14, transition: "transform .2s", transform: showSafeHarbor ? "rotate(90deg)" : "none" }}>›</span>
        </button>
        {showSafeHarbor && (
          <div style={{ marginTop: 10 }}>
            <CurrencyInput label="Last year's total tax (1040 Line 24)" value={lastYearTax}
              onChange={setLastYearTax} subtitle="Pay ≥100% of this to avoid penalties" />
          </div>
        )}
      </div>
    </div>
  );
}
