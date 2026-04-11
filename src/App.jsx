import { useState, useMemo } from "react";
import { calculateTax, formatUSD, getNextDeadline, daysUntilDeadline } from "./engine/tax";
import TaxInputs from "./components/TaxInputs";
import ResultsPanel from "./components/ResultsPanel";
import UpgradeModal from "./components/UpgradeModal";

export default function App() {
  const [income, setIncome] = useState(85000);
  const [state, setState] = useState("CA");
  const [status, setStatus] = useState("single");
  const [deductions, setDeductions] = useState(0);
  const [showDeductions, setShowDeductions] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [paidQuarters, setPaidQuarters] = useState([]);

  const result = useMemo(
    () => calculateTax({ income, deductions, filingStatus: status, stateCode: state }),
    [income, deductions, status, state]
  );

  const nd = getNextDeadline();
  const hasIncome = income > 0;

  const togglePaid = (i) => {
    setPaidQuarters((p) => p.includes(i) ? p.filter((x) => x !== i) : [...p, i]);
  };

  return (
    <div style={{
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: "#111827", background: "#fff", minHeight: "100vh",
      display: "flex", flexDirection: "column",
    }}>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        ::selection { background: #0e7490; color: #fff; }
        input::placeholder { color: #d1d5db; }
        @media (max-width: 860px) {
          .qt-hero { flex-direction: column-reverse !important; gap: 20px !important; }
          .qt-left, .qt-right { width: 100% !important; min-width: 0 !important; }
        }
      `}</style>

      {/* NAV */}
      <nav style={{ borderBottom: "1px solid #f3f4f6", padding: "0 30px" }}>
        <div style={{ maxWidth: 1360, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 52 }}>
          <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: "-.02em" }}>QuarterlyTax</span>
          <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
            <span style={{ fontSize: 13, color: "#9ca3af", cursor: "pointer" }}>How it works</span>
            <button onClick={() => setShowModal(true)} style={{ fontSize: 13, fontWeight: 600, color: "#0e7490", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>Sign in</button>
          </div>
        </div>
      </nav>

      {/* DISCLAIMER */}
      <div style={{ borderBottom: "1px solid #fef3c7", background: "#fffbeb", padding: "6px 30px", fontSize: 11, color: "#92400e", textAlign: "center", fontWeight: 500 }}>
        Estimates based on simplified 2025 federal rates — not tax advice. Consult a professional before making payments.
      </div>

      {/* MAIN — wider shell, tighter top padding */}
      <div style={{ flex: 1, maxWidth: 1360, margin: "0 auto", width: "100%", padding: "22px 30px" }}>

        {/* TWO-COLUMN: 340px left control panel + dominant right surface */}
        <div className="qt-hero" style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>

          {/* LEFT: compact control panel, content-height, no header */}
          <div className="qt-left" style={{ width: 340, flexShrink: 0 }}>
            <TaxInputs
              income={income} setIncome={setIncome}
              state={state} setState={setState}
              status={status} setStatus={setStatus}
              deductions={deductions} setDeductions={setDeductions}
              showDeductions={showDeductions} setShowDeductions={setShowDeductions}
            />
          </div>

          {/* RIGHT: product surface with header zone */}
          <div className="qt-right" style={{ flex: 1, minWidth: 0 }}>

            {/* RIGHT-COLUMN HEADER ZONE — headline lives here, not above both columns */}
            <div style={{ marginBottom: 14 }}>
              <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-.03em", color: "#111827", lineHeight: 1.2, marginBottom: 4 }}>
                {hasIncome
                  ? <>Your {nd.quarter} tax obligation is <span style={{ color: "#0e7490" }}>{formatUSD(result.quarterlyPayment)}</span></>
                  : "Enter your income to see your tax obligation"
                }
              </h1>
              {hasIncome
                ? <p style={{ fontSize: 13, color: "#b45309", fontWeight: 600 }}>Due {nd.due} — the IRS assesses penalties on late or insufficient quarterly payments.</p>
                : <p style={{ fontSize: 13, color: "#6b7280" }}>Federal + state + self-employment tax, calculated in real time.</p>
              }
            </div>

            {/* RESULTS PANEL */}
            <ResultsPanel
              result={result}
              paidQuarters={paidQuarters}
              onTogglePaid={togglePaid}
              onTrack={() => setShowModal(true)}
            />
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div style={{ borderTop: "1px solid #f3f4f6", padding: "14px 30px", textAlign: "center", fontSize: 11, color: "#9ca3af" }}>
        Not tax advice. Simplified 2025 rates. © {new Date().getFullYear()} QuarterlyTax
      </div>

      <UpgradeModal open={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
}
