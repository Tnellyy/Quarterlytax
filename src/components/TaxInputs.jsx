import { useState, useEffect } from "react";
import CurrencyInput from "./CurrencyInput";
import { getSortedStates, FILING_LABELS, PAY_FREQUENCIES } from "../engine/tax";

const selectStyle = {
  width: "100%",
  padding: "12px 14px",
  fontSize: 14,
  fontWeight: 600,
  color: "#e8eaed",
  background: "#1e2230",
  border: "1.5px solid #2a2e3a",
  borderRadius: 10,
  outline: "none",
  fontFamily: "inherit",
  cursor: "pointer",
  appearance: "none",
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M1 1l4 4 4-4' fill='none' stroke='%238b8f9a' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E")`,
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 14px center",
};

const sectionLabel = {
  fontSize: 12,
  fontWeight: 700,
  color: "#6b7280",
  textTransform: "uppercase",
  letterSpacing: ".08em",
  marginBottom: 16,
};

const inputLabel = {
  display: "block",
  fontSize: 13,
  fontWeight: 600,
  color: "#8b8f9a",
  marginBottom: 5,
};

export default function TaxInputs({
  income, setIncome,
  state, setState,
  status, setStatus,
  deductions, setDeductions,
  showDeductions, setShowDeductions,
  hasW2, setHasW2,
  w2Income, setW2Income,
  w2Withholding, setW2Withholding,
  payFrequency, onPayFrequencyChange,
  paychecksRemaining, onPaychecksChange,
  paychecksManuallyEdited,
  showSafeHarbor, setShowSafeHarbor,
  lastYearTax, setLastYearTax,
}) {
  const states = getSortedStates();

  // Local state for paychecks input
  const [pcFocused, setPcFocused] = useState(false);
  const [pcRaw, setPcRaw] = useState(String(paychecksRemaining));
  useEffect(() => {
    if (!pcFocused) setPcRaw(String(paychecksRemaining));
  }, [paychecksRemaining, pcFocused]);

  return (
    <div style={{ border: "1px solid #2a2e3a", borderRadius: 12, padding: 24, background: "#181b23" }}>

      {/* ─── Your details ─── */}
      <div style={sectionLabel}>Your details</div>

      <div style={{ marginBottom: 16 }}>
        <label style={inputLabel}>Filing status</label>
        <select value={status} onChange={(e) => setStatus(e.target.value)} style={selectStyle}>
          {Object.entries(FILING_LABELS).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={inputLabel}>State</label>
        <select value={state} onChange={(e) => setState(e.target.value)} style={selectStyle}>
          {states.map(([code, s]) => (
            <option key={code} value={code}>{s.name}</option>
          ))}
        </select>
      </div>

      <div style={{ height: 1, background: "#222530", margin: "8px 0 24px" }} />

      {/* ─── Quarterly income ─── */}
      <div style={sectionLabel}>Income</div>

      <CurrencyInput
        label="Annual freelance income"
        value={income}
        onChange={setIncome}
        subtitle="Gross 1099 income before expenses"
      />

      {/* Deductions accordion */}
      <button
        onClick={() => setShowDeductions(!showDeductions)}
        style={{
          display: "flex", width: "100%", justifyContent: "space-between", alignItems: "center",
          background: "none", border: "none", cursor: "pointer", padding: "10px 0",
          fontFamily: "inherit", borderTop: "1px solid #222530",
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 600, color: "#8b8f9a" }}>Business deductions</span>
        <span style={{ fontSize: 12, color: "#6b7280", transform: showDeductions ? "rotate(90deg)" : "none", transition: "transform .15s" }}>›</span>
      </button>
      {showDeductions && (
        <CurrencyInput
          label="Annual deductions"
          value={deductions}
          onChange={setDeductions}
          subtitle="Home office, software, supplies, travel, health insurance"
        />
      )}

      <div style={{ height: 1, background: "#222530", margin: "16px 0 20px" }} />

      {/* ─── W-2 toggle ─── */}
      <div style={{ marginBottom: 16 }}>
        <label style={inputLabel}>Do you also have W-2 income?</label>
        <div style={{ display: "flex", background: "#1e2230", borderRadius: 10, padding: 3 }}>
          {[
            { key: false, label: "No" },
            { key: true, label: "Yes" },
          ].map((opt) => (
            <button
              key={String(opt.key)}
              onClick={() => setHasW2(opt.key)}
              style={{
                flex: 1, padding: "9px 0", border: "none", borderRadius: 8,
                background: hasW2 === opt.key ? "#242836" : "transparent",
                boxShadow: hasW2 === opt.key ? "0 1px 3px rgba(0,0,0,.3)" : "none",
                color: hasW2 === opt.key ? "#e8eaed" : "#6b7280",
                fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit",
                transition: "all .12s",
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* ─── W-2 inputs (conditional) ─── */}
      {hasW2 && (
        <div style={{ marginBottom: 8 }}>
          <CurrencyInput
            label="W-2 annual income"
            value={w2Income}
            onChange={setW2Income}
          />
          <CurrencyInput
            label="Federal withholding so far this year"
            value={w2Withholding}
            onChange={setW2Withholding}
          />

          <div style={{ marginBottom: 16 }}>
            <label style={inputLabel}>Pay frequency</label>
            <select
              value={payFrequency}
              onChange={(e) => onPayFrequencyChange(e.target.value)}
              style={selectStyle}
            >
              {Object.entries(PAY_FREQUENCIES).map(([key, freq]) => (
                <option key={key} value={key}>{freq.label}</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={inputLabel}>Paychecks remaining this year</label>
            <input
              type="text"
              inputMode="numeric"
              value={pcRaw}
              onFocus={() => setPcFocused(true)}
              onBlur={() => {
                setPcFocused(false);
                const val = parseInt(pcRaw, 10);
                if (!isNaN(val) && val >= 0) onPaychecksChange(val);
              }}
              onChange={(e) => setPcRaw(e.target.value.replace(/[^0-9]/g, ""))}
              style={{
                width: "100%", padding: "12px 14px", fontSize: 14, fontWeight: 600,
                color: "#e8eaed", background: pcFocused ? "#242836" : "#1e2230",
                border: pcFocused ? "1.5px solid #0e7490" : "1.5px solid #2a2e3a",
                borderRadius: 10, outline: "none", fontFamily: "inherit",
                fontVariantNumeric: "tabular-nums", transition: "all .15s",
              }}
            />
            {!paychecksManuallyEdited && (
              <div style={{ fontSize: 11, color: "#6b7280", marginTop: 4 }}>Estimated from pay frequency</div>
            )}
          </div>
        </div>
      )}

      <div style={{ height: 1, background: "#222530", margin: "8px 0 16px" }} />

      {/* ─── Safe harbor accordion ─── */}
      <button
        onClick={() => setShowSafeHarbor(!showSafeHarbor)}
        style={{
          width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center",
          background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", padding: 0,
        }}
      >
        <span style={{ fontSize: 12, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: ".08em" }}>Safe harbor</span>
        <span style={{ color: "#6b7280", fontSize: 16, transition: "transform .2s", transform: showSafeHarbor ? "rotate(90deg)" : "none" }}>›</span>
      </button>
      {showSafeHarbor && (
        <div style={{ marginTop: 16 }}>
          <CurrencyInput
            label="Last year's total tax (1040 Line 24)"
            value={lastYearTax}
            onChange={setLastYearTax}
            subtitle="Pay ≥100% of this to avoid underpayment penalties"
          />
        </div>
      )}
    </div>
  );
}
