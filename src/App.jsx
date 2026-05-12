import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import {
  calculateTax, calculateWithholdingOffset, getPaychecksRemaining,
  formatUSD, getNextDeadline, daysUntilDeadline,
} from "./engine/tax";
import TaxInputs from "./components/TaxInputs";
import ResultsPanel from "./components/ResultsPanel";
import AuthModal from "./components/AuthModal";
import { useAuth } from "./hooks/useAuth";

const C = {
  bg: "#0B0F14",
  panel: "#151A22",
  panel2: "#1B2230",
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
};

export default function App() {
  const auth = useAuth();

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

  const stateLoaded = useRef(false);
  const saveTimer = useRef(null);
  const loadAttempted = useRef(false);

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
      stateLoaded.current = true;
    })();
  }, [auth.authLoading, auth.isPaid, auth.session]);

  const saveState = useCallback(() => {
    if (!auth.isPaid) return;
    if (!stateLoaded.current) return;
    if (!auth.session?.access_token) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        await fetch("/api/save-state", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${auth.session.access_token}` },
          body: JSON.stringify({
            income, state_code: state, filing_status: status, deductions,
            has_w2: hasW2, w2_income: w2Income, w2_withholding: w2Withholding,
            pay_frequency: payFrequency, paychecks_remaining: paychecksRemaining,
            paid_quarters: paidQuarters, last_year_tax: lastYearTax,
          }),
        });
      } catch (err) { console.error("Save state failed:", err); }
    }, 2000);
  }, [auth.isPaid, auth.session, income, state, status, deductions, hasW2, w2Income, w2Withholding, payFrequency, paychecksRemaining, paidQuarters, lastYearTax]);

  useEffect(() => {
    saveState();
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
  }, [saveState]);

  const cancelLabel = auth.isPaid && auth.cancelAtPeriodEnd && auth.currentPeriodEnd
    ? `Cancels ${new Date(auth.currentPeriodEnd).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
    : null;

  const result = useMemo(
    () => calculateTax({
      income, deductions, filingStatus: status, stateCode: state,
      w2Income: hasW2 ? w2Income : 0, w2Withholding: hasW2 ? w2Withholding : 0,
    }),
    [income, deductions, status, state, hasW2, w2Income, w2Withholding]
  );

  const withholding = useMemo(() => {
    if (!hasW2 || w2Withholding <= 0) return null;
    return calculateWithholdingOffset({
      totalTaxLiability: result.totalAnnualTax, currentWithholding: w2Withholding,
      payFrequency, paychecksRemaining, w2AnnualIncome: w2Income,
    });
  }, [hasW2, result.totalAnnualTax, w2Withholding, payFrequency, paychecksRemaining, w2Income]);

  const togglePaid = (i) => setPaidQuarters((p) => p.includes(i) ? p.filter((x) => x !== i) : [...p, i]);
  const handlePayFrequencyChange = (freq) => { setPayFrequency(freq); setPaychecksRemaining(getPaychecksRemaining(freq)); setPaychecksManuallyEdited(false); };
  const handlePaychecksChange = (val) => { setPaychecksRemaining(val); setPaychecksManuallyEdited(true); };

  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif', color: C.textMain, background: C.bg, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        ::selection { background: ${C.teal}; color: ${C.bg}; }
        input::placeholder { color: #4A5468; }
        html, body, #root { background: ${C.bg}; }

        /* ── Default: Large desktop (≥1280px) ── */
        .qt-shell {
          display: grid;
          grid-template-columns: 340px minmax(0, 1fr);
          gap: 20px;
          max-width: 1700px;
          margin: 0 auto;
          align-items: start;
        }
        .qt-results-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 360px;
          gap: 20px;
          align-items: start;
        }
        .qt-tax-profile { order: 1; }
        .qt-results { order: 2; }
        .tax-profile-card { position: sticky; top: 20px; }
        .qt-shell-wrap { padding: 24px 32px 28px; }
        .qt-header-inner { padding: 0 32px; }
        .qt-hero-number { font-size: 64px; }

        /* ── Standard laptop (1024-1279px) ── */
        @media (max-width: 1279px) {
          .qt-shell { grid-template-columns: 300px minmax(0, 1fr); gap: 16px; }
          .qt-results-grid { grid-template-columns: minmax(0, 1fr) 320px; gap: 16px; }
          .qt-shell-wrap { padding: 18px 24px 24px; }
          .qt-hero-number { font-size: 52px; }
        }

        /* ── Narrow laptop / tablet (768-1023px) ── */
        @media (max-width: 1023px) {
          .qt-shell { grid-template-columns: 280px minmax(0, 1fr); gap: 14px; }
          .qt-results-grid { grid-template-columns: 1fr; gap: 14px; }
          .qt-shell-wrap { padding: 16px 20px 22px; }
          .qt-hero-number { font-size: 48px; }
          .tax-profile-card { position: static !important; }
        }

        /* ── Mobile (≤767px) ── */
        @media (max-width: 767px) {
          .qt-shell { grid-template-columns: 1fr; gap: 14px; }
          .qt-tax-profile { order: 2; }
          .qt-results { order: 1; }
          .qt-shell-wrap { padding: 14px 14px 20px; }
          .qt-header-inner { padding: 0 16px; }
          .qt-hero-number { font-size: 42px; }
          .qt-header-tagline { display: none; }
        }

        /* ── Very narrow (≤420px) ── */
        @media (max-width: 420px) {
          .qt-hero-number { font-size: 38px; }
          .qt-header-email { max-width: 110px !important; }
        }

        /* ── Short height: disable sticky ── */
        @media (max-height: 820px) {
          .tax-profile-card { position: static !important; }
        }
      `}</style>

      {/* Header */}
      <header style={{ borderBottom: `1px solid ${C.border}`, background: C.panel, flexShrink: 0 }}>
        <div className="qt-header-inner" style={{ maxWidth: 1700, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <svg width="40" height="40" viewBox="0 0 30 30" fill="none">
              <path d="M15 4.5A10.5 10.5 0 0 1 25.5 15" stroke={C.textMain} strokeWidth="3.6" strokeLinecap="round" fill="none"/>
              <path d="M15 25.5A10.5 10.5 0 0 1 4.5 15" stroke={C.textMain} strokeWidth="3.6" strokeLinecap="round" fill="none"/>
              <path d="M4.5 15A10.5 10.5 0 0 1 15 4.5" stroke={C.textMain} strokeWidth="3.6" strokeLinecap="round" fill="none"/>
              <g transform="translate(1.6, 1.6)">
                <path d="M25.5 15A10.5 10.5 0 0 1 15 25.5" stroke={C.teal} strokeWidth="3.6" strokeLinecap="round" fill="none"/>
              </g>
            </svg>
            <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
              <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: "-.025em", color: C.textMain }}>QuarterlyTax</div>
              <div className="qt-header-tagline" style={{ fontSize: 11, fontWeight: 600, color: C.textMuted, letterSpacing: ".08em", textTransform: "uppercase", marginTop: 4 }}>Tax Command Center</div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", justifyContent: "flex-end" }}>
            {auth.authLoading ? (
              <span style={{ fontSize: 13, color: C.textMuted }}>…</span>
            ) : auth.isAuthenticated ? (
              <>
                <span className="qt-header-email" style={{ fontSize: 13, color: C.textMuted, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{auth.user.email}</span>
                {auth.isPaid && (
                  <span style={{ fontSize: 10, fontWeight: 800, color: C.green, background: C.greenBg, padding: "3px 9px", borderRadius: 5, letterSpacing: ".08em" }}>PRO</span>
                )}
                {cancelLabel && (
                  <span style={{ fontSize: 10, fontWeight: 700, color: C.yellow, background: C.yellowBg, padding: "3px 9px", borderRadius: 5, whiteSpace: "nowrap" }}>{cancelLabel}</span>
                )}
                {auth.isPaid && (
                  <button onClick={() => setShowModal(true)} style={{ fontSize: 13, fontWeight: 600, color: C.textMuted, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>Manage billing</button>
                )}
                <button onClick={auth.signOut} style={{ fontSize: 13, fontWeight: 600, color: C.textMuted, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>Sign out</button>
              </>
            ) : (
              <button onClick={() => setShowModal(true)} style={{ fontSize: 14, fontWeight: 700, color: C.bg, background: C.teal, padding: "10px 18px", borderRadius: 8, border: "none", cursor: "pointer", fontFamily: "inherit" }}>Sign in</button>
            )}
          </div>
        </div>
      </header>

      <div style={{ borderBottom: `1px solid #2A2410`, background: "#1F1B0D", padding: "7px 24px", fontSize: 12, color: "#C49A3D", textAlign: "center", fontWeight: 500, flexShrink: 0 }}>
        Estimates based on simplified 2025 federal rates — not tax advice. Consult a professional before making payments.
      </div>

      <div className="qt-shell-wrap" style={{ flex: 1 }}>
        <div className="qt-shell">
          <div className="qt-tax-profile">
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
          <div className="qt-results">
            <ResultsPanel
              result={result} paidQuarters={paidQuarters} onTogglePaid={togglePaid}
              onTrack={() => setShowModal(true)} withholding={withholding} hasW2={hasW2}
              w2Withholding={w2Withholding} paychecksRemaining={paychecksRemaining}
              isAuthenticated={auth.isAuthenticated} isPaid={auth.isPaid}
            />
          </div>
        </div>
      </div>

      <footer style={{ borderTop: `1px solid ${C.border}`, background: C.panel, padding: "12px 24px", textAlign: "center", fontSize: 11, color: C.textMuted, flexShrink: 0 }}>
        Not tax advice. Simplified 2025 rates. © {new Date().getFullYear()} QuarterlyTax — Tax Command Center for freelancers, creators, and 1099 workers
      </footer>

      <AuthModal open={showModal} onClose={() => setShowModal(false)} auth={auth} />
    </div>
  );
}
