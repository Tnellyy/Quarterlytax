import { useState, useMemo } from "react";
import { calculateTax, formatUSD, getNextDeadline, daysUntilDeadline } from "./engine/tax";
import TaxInputs from "./components/TaxInputs";
import ResultsPanel from "./components/ResultsPanel";
import UpgradeModal from "./components/UpgradeModal";

export default function App() {
  // Pre-filled defaults — user sees a real number on load
  const [income, setIncome] = useState(85000);
  const [state, setState] = useState("CA");
  const [status, setStatus] = useState("single");
  const [deductions, setDeductions] = useState(0);
  const [showDeductions, setShowDeductions] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Memoized tax calculation — only recalcs when inputs change
  const result = useMemo(
    () => calculateTax({ income, deductions, filingStatus: status, stateCode: state }),
    [income, deductions, status, state]
  );

  const nd = getNextDeadline();
  const hasIncome = income > 0;

  return (
    <div
      style={{
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        color: "#111827",
        background: "#fff",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        ::selection { background: #0e7490; color: #fff; }
        input::placeholder { color: #d1d5db; }
        @media (max-width: 860px) {
          .qt-hero { flex-direction: column-reverse !important; gap: 20px !important; }
          .qt-left, .qt-right { width: 100% !important; min-width: 0 !important; }
        }
      `}</style>

      {/* ═══ NAV ═══ */}
      <nav style={{ borderBottom: "1px solid #f3f4f6", padding: "0 24px" }}>
        <div
          style={{
            maxWidth: 1200, margin: "0 auto",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            height: 52,
          }}
        >
          <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: "-.02em", color: "#111827" }}>
            QuarterlyTax
          </span>
          <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
            <span style={{ fontSize: 13, color: "#9ca3af", cursor: "pointer" }}>How it works</span>
            <button
              onClick={() => setShowModal(true)}
              style={{
                fontSize: 13, fontWeight: 600, color: "#0e7490",
                background: "none", border: "none", cursor: "pointer", fontFamily: "inherit",
              }}
            >
              Sign in
            </button>
          </div>
        </div>
      </nav>

      {/* ═══ DISCLAIMER ═══ */}
      <div
        style={{
          borderBottom: "1px solid #fef3c7", background: "#fffbeb",
          padding: "6px 24px", fontSize: 11, color: "#92400e",
          textAlign: "center", fontWeight: 500,
        }}
      >
        Estimates only — not tax advice. Uses simplified 2025 federal rates. Consult a professional before making payments.
      </div>

      {/* ═══ MAIN ═══ */}
      <div style={{ flex: 1, maxWidth: 1200, margin: "0 auto", width: "100%", padding: "32px 24px" }}>

        {/* Dynamic headline */}
        <div style={{ marginBottom: 24 }}>
          <h1
            style={{
              fontSize: 26, fontWeight: 800, letterSpacing: "-.03em",
              color: "#111827", lineHeight: 1.2, marginBottom: 4,
            }}
          >
            {hasIncome ? (
              <>
                You'll likely owe{" "}
                <span style={{ color: "#0e7490" }}>{formatUSD(result.quarterlyPayment)}</span>
                {" "}on {nd.due}
              </>
            ) : (
              "How much do you owe this quarter?"
            )}
          </h1>
          <p style={{ fontSize: 14, color: "#6b7280" }}>
            Avoid IRS penalties. Know exactly what to pay.
          </p>
        </div>

        {/* Two-column layout */}
        <div className="qt-hero" style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>

          {/* Left: Inputs */}
          <div className="qt-left" style={{ width: 400, flexShrink: 0 }}>
            <TaxInputs
              income={income} setIncome={setIncome}
              state={state} setState={setState}
              status={status} setStatus={setStatus}
              deductions={deductions} setDeductions={setDeductions}
              showDeductions={showDeductions} setShowDeductions={setShowDeductions}
            />
          </div>

          {/* Right: Results */}
          <div className="qt-right" style={{ flex: 1, minWidth: 0 }}>
            <ResultsPanel
              result={result}
              onTrack={() => setShowModal(true)}
            />
          </div>
        </div>
      </div>

      {/* ═══ FOOTER ═══ */}
      <div
        style={{
          borderTop: "1px solid #f3f4f6", padding: "14px 24px",
          textAlign: "center", fontSize: 11, color: "#9ca3af",
        }}
      >
        Not tax advice. Simplified 2025 rates. Consult a CPA. © {new Date().getFullYear()} QuarterlyTax
      </div>

      {/* ═══ MODAL ═══ */}
      <UpgradeModal open={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
}
