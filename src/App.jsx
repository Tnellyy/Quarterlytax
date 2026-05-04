import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import {
  calculateTax, calculateWithholdingOffset, getPaychecksRemaining,
  formatUSD, getNextDeadline, daysUntilDeadline,
} from "./engine/tax";
import TaxInputs from "./components/TaxInputs";
import ResultsPanel from "./components/ResultsPanel";
import AuthModal from "./components/AuthModal";
import { useAuth } from "./hooks/useAuth";

export default function App() {
  const auth = useAuth();

  // Core inputs
  const [income, setIncome] = useState(85000);
  const [state, setState] = useState("CA");
  const [status, setStatus] = useState("single");
  const [deductions, setDeductions] = useState(0);
  const [showDeductions, setShowDeductions] = useState(false);
  const [showSafeHarbor, setShowSafeHarbor] = useState(false);
  const [lastYearTax, setLastYearTax] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [paidQuarters, setPaidQuarters] = useState([]);

  // W-2 inputs
  const [hasW2, setHasW2] = useState(false);
  const [w2Income, setW2Income] = useState(0);
  const [w2Withholding, setW2Withholding] = useState(0);
  const [payFrequency, setPayFrequency] = useState("biweekly");
  const [paychecksRemaining, setPaychecksRemaining] = useState(() => getPaychecksRemaining("biweekly"));
  const [paychecksManuallyEdited, setPaychecksManuallyEdited] = useState(false);

  // ─── Persistence guards ───
  const stateLoaded = useRef(false);    // true after load completes (or confirms no saved state)
  const saveTimer = useRef(null);       // debounce timer for auto-save
  const loadAttempted = useRef(false);  // prevent duplicate load calls

  // ─── Checkout success return handling ───
  const [checkoutReturn, setCheckoutReturn] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("checkout") === "success";
  });
  const checkoutHandled = useRef(false);

  useEffect(() => {
    if (!checkoutReturn) return;
    const url = new URL(window.location.href);
    url.searchParams.delete("checkout");
    window.history.replaceState({}, "", url.pathname);
    setShowModal(false);
  }, [checkoutReturn]);

  useEffect(() => {
    if (!checkoutReturn) return;
    if (checkoutHandled.current) return;
    if (auth.authLoading || !auth.user) return;
    checkoutHandled.current = true;
    auth.refreshSubscription(auth.user.id);
    setCheckoutReturn(false);
  }, [checkoutReturn, auth.authLoading, auth.user, auth.refreshSubscription]);

  // ─── Load saved state for paid users ───
  useEffect(() => {
    if (auth.authLoading) return;
    if (!auth.isPaid) {
      stateLoaded.current = false;
      loadAttempted.current = false;
      return;
    }
    if (loadAttempted.current) return;
    if (!auth.session?.access_token) return;

    loadAttempted.current = true;

    (async () => {
      try {
        const res = await fetch("/api/load-state", {
          headers: { Authorization: `Bearer ${auth.session.access_token}` },
        });
        if (res.ok) {
          const { state: saved } = await res.json();
          if (saved) {
            setIncome(saved.income ?? 85000);
            setState(saved.state_code ?? "CA");
            setStatus(saved.filing_status ?? "single");
            setDeductions(saved.deductions ?? 0);
            setHasW2(saved.has_w2 ?? false);
            setW2Income(saved.w2_income ?? 0);
            setW2Withholding(saved.w2_withholding ?? 0);
            setPayFrequency(saved.pay_frequency ?? "biweekly");
            setPaychecksRemaining(saved.paychecks_remaining ?? getPaychecksRemaining("biweekly"));
            setPaidQuarters(saved.paid_quarters ?? []);
            setLastYearTax(saved.last_year_tax ?? 0);
          }
        }
      } catch (err) {
        console.error("Load state failed:", err);
      }
      // Mark loaded whether we got data or not — safe to save now
      stateLoaded.current = true;
    })();
  }, [auth.authLoading, auth.isPaid, auth.session]);

  // ─── Auto-save for paid users (debounced 2s) ───
  const saveState = useCallback(() => {
    if (!auth.isPaid) return;
    if (!stateLoaded.current) return;
    if (!auth.session?.access_token) return;

    if (saveTimer.current) clearTimeout(saveTimer.current);

    saveTimer.current = setTimeout(async () => {
      try {
        await fetch("/api/save-state", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth.session.access_token}`,
          },
          body: JSON.stringify({
            income,
            state_code: state,
            filing_status: status,
            deductions,
            has_w2: hasW2,
            w2_income: w2Income,
            w2_withholding: w2Withholding,
            pay_frequency: payFrequency,
            paychecks_remaining: paychecksRemaining,
            paid_quarters: paidQuarters,
            last_year_tax: lastYearTax,
          }),
        });
      } catch (err) {
        console.error("Save state failed:", err);
      }
    }, 2000);
  }, [auth.isPaid, auth.session, income, state, status, deductions, hasW2, w2Income, w2Withholding, payFrequency, paychecksRemaining, paidQuarters, lastYearTax]);

  // Trigger save when any saveable state changes
  useEffect(() => {
    saveState();
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
  }, [saveState]);

  // ─── Tax calculation ───
  const result = useMemo(
    () => calculateTax({
      income, deductions, filingStatus: status, stateCode: state,
      w2Income: hasW2 ? w2Income : 0, w2Withholding: hasW2 ? w2Withholding : 0,
    }),
    [income, deductions, status, state, hasW2, w2Income, w2Withholding]
  );

  // Withholding offset
  const withholding = useMemo(() => {
    if (!hasW2 || w2Withholding <= 0) return null;
    return calculateWithholdingOffset({
      totalTaxLiability: result.totalAnnualTax, currentWithholding: w2Withholding,
      payFrequency, paychecksRemaining, w2AnnualIncome: w2Income,
    });
  }, [hasW2, result.totalAnnualTax, w2Withholding, payFrequency, paychecksRemaining, w2Income]);

  const nd = getNextDeadline();
  const hasIncome = income > 0 || (hasW2 && w2Income > 0);
  const togglePaid = (i) => setPaidQuarters((p) => p.includes(i) ? p.filter((x) => x !== i) : [...p, i]);
  const handlePayFrequencyChange = (freq) => { setPayFrequency(freq); setPaychecksRemaining(getPaychecksRemaining(freq)); setPaychecksManuallyEdited(false); };
  const handlePaychecksChange = (val) => { setPaychecksRemaining(val); setPaychecksManuallyEdited(true); };

  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', color: "#e8eaed", background: "#0f1117", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        ::selection { background: #0e7490; color: #fff; }
        input::placeholder { color: #4b5060; }
        @media (max-width: 900px) {
          .qt-hero { flex-direction: column-reverse !important; gap: 20px !important; }
          .qt-left, .qt-right { width: 100% !important; min-width: 0 !important; }
        }
      `}</style>

      <nav style={{ borderBottom: "1px solid #2a2e3a", padding: "0 40px" }}>
        <div style={{ maxWidth: 1600, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 52 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
              <path d="M13.1 4.1A8 8 0 0 1 19.9 10.9" stroke="#e8eaed" strokeWidth="4" fill="none"/>
              <path d="M19.9 13.1A8 8 0 0 1 13.1 19.9" stroke="#0ea5c9" strokeWidth="4" fill="none" transform="translate(1.2,1.2)"/>
              <path d="M10.9 19.9A8 8 0 0 1 4.1 13.1" stroke="#e8eaed" strokeWidth="4" fill="none"/>
              <path d="M4.1 10.9A8 8 0 0 1 10.9 4.1" stroke="#e8eaed" strokeWidth="4" fill="none"/>
            </svg>
            <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-.02em", color: "#e8eaed" }}>QuarterlyTax</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {auth.authLoading ? (
              <span style={{ fontSize: 13, color: "#8f96a3" }}>…</span>
            ) : auth.isAuthenticated ? (
              <>
                <span style={{ fontSize: 12, color: "#8f96a3", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {auth.user.email}
                </span>
                {auth.isPaid && (
                  <span style={{ fontSize: 10, fontWeight: 700, color: "#34d399", background: "#0a2e23", padding: "2px 7px", borderRadius: 4 }}>PRO</span>
                )}
                {auth.isPaid && (
                  <button onClick={() => setShowModal(true)} style={{ fontSize: 12, fontWeight: 600, color: "#8f96a3", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>Manage billing</button>
                )}
                <button onClick={auth.signOut} style={{ fontSize: 13, fontWeight: 600, color: "#8f96a3", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>Sign out</button>
              </>
            ) : (
              <button onClick={() => setShowModal(true)} style={{ fontSize: 13, fontWeight: 600, color: "#0ea5c9", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>Sign in</button>
            )}
          </div>
        </div>
      </nav>

      <div style={{ borderBottom: "1px solid #2a2506", background: "#1a1708", padding: "5px 40px", fontSize: 11, color: "#a68a4b", textAlign: "center", fontWeight: 500 }}>
        Estimates based on simplified 2025 federal rates — not tax advice. Consult a professional before making payments.
      </div>

      <div style={{ flex: 1, maxWidth: 1600, margin: "0 auto", width: "100%", padding: "16px 40px" }}>
        <div className="qt-hero" style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
          <div className="qt-left" style={{ width: 380, flexShrink: 0 }}>
            <TaxInputs
              income={income} setIncome={setIncome} state={state} setState={setState}
              status={status} setStatus={setStatus} deductions={deductions} setDeductions={setDeductions}
              showDeductions={showDeductions} setShowDeductions={setShowDeductions}
              hasW2={hasW2} setHasW2={setHasW2} w2Income={w2Income} setW2Income={setW2Income}
              w2Withholding={w2Withholding} setW2Withholding={setW2Withholding}
              payFrequency={payFrequency} onPayFrequencyChange={handlePayFrequencyChange}
              paychecksRemaining={paychecksRemaining} onPaychecksChange={handlePaychecksChange}
              paychecksManuallyEdited={paychecksManuallyEdited}
              showSafeHarbor={showSafeHarbor} setShowSafeHarbor={setShowSafeHarbor}
              lastYearTax={lastYearTax} setLastYearTax={setLastYearTax}
            />
          </div>
          <div className="qt-right" style={{ flex: 1, minWidth: 0 }}>
            <div style={{ marginBottom: 12 }}>
              <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-.03em", color: "#e8eaed", lineHeight: 1.2, marginBottom: 3 }}>
                {hasIncome
                  ? <>Your {nd.quarter} tax obligation is <span style={{ color: "#0e7490" }}>{formatUSD(result.quarterlyPayment)}</span></>
                  : "Enter your income to see your tax obligation"}
              </h1>
              {hasIncome
                ? <p style={{ fontSize: 13, color: "#e0b84d", fontWeight: 600 }}>Due {nd.due} — late or insufficient payments may incur IRS penalties.</p>
                : <p style={{ fontSize: 13, color: "#8b8f9a" }}>Federal + state + self-employment tax, calculated in real time.</p>}
            </div>
            <ResultsPanel result={result} paidQuarters={paidQuarters} onTogglePaid={togglePaid}
              onTrack={() => setShowModal(true)} withholding={withholding} hasW2={hasW2}
              w2Withholding={w2Withholding} paychecksRemaining={paychecksRemaining}
              isAuthenticated={auth.isAuthenticated} isPaid={auth.isPaid} />
          </div>
        </div>
      </div>

      <div style={{ borderTop: "1px solid #2a2e3a", padding: "12px 40px", textAlign: "center", fontSize: 11, color: "#8f96a3" }}>
        Not tax advice. Simplified 2025 rates. © {new Date().getFullYear()} QuarterlyTax
      </div>

      <AuthModal open={showModal} onClose={() => setShowModal(false)} auth={auth} />
    </div>
  );
}
