import CurrencyInput from "./CurrencyInput";
import { getSortedStates, FILING_LABELS } from "../engine/tax";

const selectStyle = {
  width: "100%",
  padding: "12px 14px",
  fontSize: 14,
  fontWeight: 600,
  color: "#111827",
  background: "#f9fafb",
  border: "1.5px solid #e5e7eb",
  borderRadius: 10,
  outline: "none",
  fontFamily: "inherit",
  cursor: "pointer",
  appearance: "none",
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M1 1l4 4 4-4' fill='none' stroke='%239ca3af' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E")`,
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 14px center",
};

const sectionLabel = {
  fontSize: 12,
  fontWeight: 700,
  color: "#9ca3af",
  textTransform: "uppercase",
  letterSpacing: ".08em",
  marginBottom: 16,
};

export default function TaxInputs({
  income, setIncome,
  state, setState,
  status, setStatus,
  deductions, setDeductions,
  showDeductions, setShowDeductions,
}) {
  const states = getSortedStates();

  return (
    <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 24, background: "#fff" }}>
      {/* Your details */}
      <div style={sectionLabel}>Your details</div>

      <div style={{ marginBottom: 16 }}>
        <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 5 }}>
          Filing status
        </label>
        <select value={status} onChange={(e) => setStatus(e.target.value)} style={selectStyle}>
          {Object.entries(FILING_LABELS).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 5 }}>
          State
        </label>
        <select value={state} onChange={(e) => setState(e.target.value)} style={selectStyle}>
          {states.map(([code, s]) => (
            <option key={code} value={code}>{s.name}</option>
          ))}
        </select>
      </div>

      <div style={{ height: 1, background: "#f3f4f6", margin: "8px 0 24px" }} />
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
          display: "flex",
          width: "100%",
          justifyContent: "space-between",
          alignItems: "center",
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "10px 0",
          fontFamily: "inherit",
          borderTop: "1px solid #f3f4f6",
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 600, color: "#6b7280" }}>Business deductions</span>
        <span
          style={{
            fontSize: 12,
            color: "#9ca3af",
            transform: showDeductions ? "rotate(90deg)" : "none",
            transition: "transform .15s",
          }}
        >
          ›
        </span>
      </button>
      {showDeductions && (
        <CurrencyInput
          label="Annual deductions"
          value={deductions}
          onChange={setDeductions}
          subtitle="Home office, software, supplies, travel, health insurance"
        />
      )}
    </div>
  );
}
