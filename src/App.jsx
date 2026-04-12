import { useState, useMemo } from "react";
import {
  calculateTax, calculateWithholdingOffset, getPaychecksRemaining,
  formatUSD, getNextDeadline, daysUntilDeadline,
} from "./engine/tax";
import TaxInputs from "./components/TaxInputs";
import ResultsPanel from "./components/ResultsPanel";
import UpgradeModal from "./components/UpgradeModal";

export default function App() {
  const [income, setIncome] = useState(85000);
  const [state, setState] = useState("CA");
  const [status, setStatus] = useState("single");
  const [deductions, setDeductions] = useState(0);
  const [showDeductions, setShowDeductions] = useState(false);
  const [showSafeHarbor, setShowSafeHarbor] = useState(false);
  const [lastYearTax, setLastYearTax] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [paidQuarters, setPaidQuarters] = useState([]);

  const [hasW2, setHasW2] = useState(false);
  const [w2Income, setW2Income] = useState(0);
  const [w2Withholding, setW2Withholding] = useState(0);
  const [payFrequency, setPayFrequency] = useState("biweekly");
  const [paychecksRemaining, setPaychecksRemaining] = useState(() => getPaychecksRemaining("biweekly"));
  const [paychecksManuallyEdited, setPaychecksManuallyEdited] = useState(false);

  const result = useMemo(
    () => calculateTax({
      income,
      deductions,
      filingStatus: status,
      stateCode: state,
      w2Income: hasW2 ? w2Income : 0,
      w2Withholding: hasW2 ? w2Withholding : 0,
    }),
    [income, deductions, status, state, hasW2, w2Income, w2Withholding]
  );

  const withholding = useMemo(() => {
    if (!hasW2 || w2Withholding <= 0) return null;
    return calculateWithholdingOffset({
      totalTaxLiability: result.totalAnnualTax,
      currentWithholding: w2Withholding,
      payFrequency,
      paychecksRemaining,
      w2AnnualIncome: w2Income,
    });
  }, [hasW2, result.totalAnnualTax, w2Withholding, payFrequency, paychecksRemaining, w2Income]);

  const nd = getNextDeadline();
  const hasIncome = income > 0 || (hasW2 && w2Income > 0);

  const togglePaid = (i) => {
    setPaidQuarters((p) => p.includes(i) ? p.filter((x) => x !== i) : [...p, i]);
  };

  const handlePayFrequencyChange = (freq) => {
    setPayFrequency(freq);
    setPaychecksRemaining(getPaychecksRemaining(freq));
    setPaychecksManuallyEdited(false);
  };

  const handlePaychecksChange = (val) => {
    setPaychecksRemaining(val);
    setPaychecksManuallyEdited(true);
  };

  return (
    <div style={{
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: "#e8eaed",
      background: "#0f1117",
      minHeight: "100vh",
      display: "flex", flexDirection: "column",
    }}>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        ::selection { background: #0e7490; color: #fff; }
        input::placeholder { color: #4b5060; }
        @media (max-width: 860px) {
          .qt-hero { flex-direction: column-reverse !important; gap: 20px !important; }
          .qt-left, .qt-right { width: 100% !important; min-width: 0 !important; }
        }
      `}</style>

      <nav style={{ borderBottom: "1px solid #2a2e3a", padding: "0 30px" }}>
        <div style={{ maxWidth: 1360, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 52 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="8" stroke="#e8eaed" strokeWidth="3.5" fill="none" strokeDasharray="37.7 12.57" strokeDashoffset="-18.84"/>
              <g transform="translate(1.2,1.2)"><circle cx="12" cy="12" r="8" stroke="#e8eaed" strokeWidth="3.5" fill="none" strokeDasharray="10.5 39.77" strokeDashoffset="-7.28"/></g>
            </svg>
            <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: "-.02em", color: "#e8eaed" }}>QuarterlyTax</span>
          </div>
          <button onClick={() => setShowModal(true)} style={{ fontSize: 13, fontWeight: 600, color: "#0ea5c9", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>Sign in</button>
        </div>
      </nav>

      <div style={{ borderBottom: "1px solid #2a2506", background: "#1a1708", padding: "6px 30px", fontSize: 11, color: "#a68a4b", textAlign: "center", fontWeight: 500 }}>
        Estimates based on simplified 2025 federal rates — not tax advice. Consult a professional before making payments.
      </div>

      <div style={{ flex: 1, maxWidth: 1360, margin: "0 auto", width: "100%", padding: "22px 30px" }}>
        <div className="qt-hero" style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>

          <div className="qt-left" style={{ width: 340, flexShrink: 0 }}>
            <TaxInputs
              income={income} setIncome={setIncome}
              state={state} setState={setState}
              status={status} setStatus={setStatus}
              deductions={deductions} setDeductions={setDeductions}
              showDeductions={showDeductions} setShowDeductions={setShowDeductions}
              hasW2={hasW2} setHasW2={setHasW2}
              w2Income={w2Income} setW2Income={setW2Income}
              w2Withholding={w2Withholding} setW2Withholding={setW2Withholding}
              payFrequency={payFrequency} onPayFrequencyChange={handlePayFrequencyChange}
              paychecksRemaining={paychecksRemaining} onPaychecksChange={handlePaychecksChange}
              paychecksManuallyEdited={paychecksManuallyEdited}
              showSafeHarbor={showSafeHarbor} setShowSafeHarbor={setShowSafeHarbor}
              lastYearTax={lastYearTax} setLastYearTax={setLastYearTax}
            />
          </div>

          <div className="qt-right" style={{ flex: 1, minWidth: 0 }}>
            <div style={{ marginBottom: 14 }}>
              <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-.03em", color: "#e8eaed", lineHeight: 1.2, marginBottom: 4 }}>
                {hasIncome
                  ? <>Your {nd.quarter} tax obligation is <span style={{ color: "#0e7490" }}>{formatUSD(result.quarterlyPayment)}</span></>
                  : "Enter your income to see your tax obligation"
                }
              </h1>
              {hasIncome
                ? <p style={{ fontSize: 13, color: "#e0b84d", fontWeight: 600 }}>Due {nd.due} — late or insufficient payments may incur IRS penalties.</p>
                : <p style={{ fontSize: 13, color: "#8b8f9a" }}>Federal + state + self-employment tax, calculated in real time.</p>
              }
            </div>

            <ResultsPanel
              result={result}
              paidQuarters={paidQuarters}
              onTogglePaid={togglePaid}
              onTrack={() => setShowModal(true)}
              withholding={withholding}
              hasW2={hasW2}
              w2Withholding={w2Withholding}
              paychecksRemaining={paychecksRemaining}
            />
          </div>
        </div>
      </div>

      <div style={{ borderTop: "1px solid #2a2e3a", padding: "14px 30px", textAlign: "center", fontSize: 11, color: "#7a8394" }}>
        Not tax advice. Simplified 2025 rates. © {new Date().getFullYear()} QuarterlyTax
      </div>

      <UpgradeModal open={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
}
