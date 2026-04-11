import { useState, useEffect, useMemo, useRef } from "react";

// ─── 2025 Federal Tax Brackets ───
const BRACKETS = {
  single: [
    { min: 0, max: 11925, rate: 0.10 },
    { min: 11925, max: 48475, rate: 0.12 },
    { min: 48475, max: 103350, rate: 0.22 },
    { min: 103350, max: 197300, rate: 0.24 },
    { min: 197300, max: 250525, rate: 0.32 },
    { min: 250525, max: 626350, rate: 0.35 },
    { min: 626350, max: Infinity, rate: 0.37 },
  ],
  married_jointly: [
    { min: 0, max: 23850, rate: 0.10 },
    { min: 23850, max: 96950, rate: 0.12 },
    { min: 96950, max: 206700, rate: 0.22 },
    { min: 206700, max: 394600, rate: 0.24 },
    { min: 394600, max: 501050, rate: 0.32 },
    { min: 501050, max: 752800, rate: 0.35 },
    { min: 752800, max: Infinity, rate: 0.37 },
  ],
  married_separately: [
    { min: 0, max: 11925, rate: 0.10 },
    { min: 11925, max: 48475, rate: 0.12 },
    { min: 48475, max: 103350, rate: 0.22 },
    { min: 103350, max: 197300, rate: 0.24 },
    { min: 197300, max: 250525, rate: 0.32 },
    { min: 250525, max: 376400, rate: 0.35 },
    { min: 376400, max: Infinity, rate: 0.37 },
  ],
  head_of_household: [
    { min: 0, max: 17000, rate: 0.10 },
    { min: 17000, max: 64850, rate: 0.12 },
    { min: 64850, max: 103350, rate: 0.22 },
    { min: 103350, max: 197300, rate: 0.24 },
    { min: 197300, max: 250500, rate: 0.32 },
    { min: 250500, max: 626350, rate: 0.35 },
    { min: 626350, max: Infinity, rate: 0.37 },
  ],
};

const STD_DEDUCTIONS = { single: 15000, married_jointly: 30000, married_separately: 15000, head_of_household: 22500 };
const SS_WAGE_BASE = 176100;

const STATES = {
  AL:{n:"Alabama",r:.05},AK:{n:"Alaska",r:0},AZ:{n:"Arizona",r:.025},AR:{n:"Arkansas",r:.039},
  CA:{n:"California",r:.0725},CO:{n:"Colorado",r:.044},CT:{n:"Connecticut",r:.05},DE:{n:"Delaware",r:.055},
  FL:{n:"Florida",r:0},GA:{n:"Georgia",r:.0549},HI:{n:"Hawaii",r:.065},ID:{n:"Idaho",r:.058},
  IL:{n:"Illinois",r:.0495},IN:{n:"Indiana",r:.0305},IA:{n:"Iowa",r:.038},KS:{n:"Kansas",r:.046},
  KY:{n:"Kentucky",r:.04},LA:{n:"Louisiana",r:.0425},ME:{n:"Maine",r:.055},MD:{n:"Maryland",r:.05},
  MA:{n:"Massachusetts",r:.05},MI:{n:"Michigan",r:.0425},MN:{n:"Minnesota",r:.0585},MS:{n:"Mississippi",r:.047},
  MO:{n:"Missouri",r:.048},MT:{n:"Montana",r:.059},NE:{n:"Nebraska",r:.0396},NV:{n:"Nevada",r:0},
  NH:{n:"New Hampshire",r:0},NJ:{n:"New Jersey",r:.055},NM:{n:"New Mexico",r:.049},NY:{n:"New York",r:.0685},
  NC:{n:"North Carolina",r:.045},ND:{n:"North Dakota",r:.0195},OH:{n:"Ohio",r:.035},OK:{n:"Oklahoma",r:.0475},
  OR:{n:"Oregon",r:.0875},PA:{n:"Pennsylvania",r:.0307},RI:{n:"Rhode Island",r:.0475},SC:{n:"South Carolina",r:.064},
  SD:{n:"South Dakota",r:0},TN:{n:"Tennessee",r:0},TX:{n:"Texas",r:0},UT:{n:"Utah",r:.0465},
  VT:{n:"Vermont",r:.055},VA:{n:"Virginia",r:.0575},WA:{n:"Washington",r:0},WV:{n:"West Virginia",r:.052},
  WI:{n:"Wisconsin",r:.053},WY:{n:"Wyoming",r:0},DC:{n:"Washington, D.C.",r:.065},
};

const DEADLINES = [
  { q: "Q1", period: "Jan – Mar", due: "Apr 15, 2025", dueDate: new Date(2025, 3, 15) },
  { q: "Q2", period: "Apr – May", due: "Jun 16, 2025", dueDate: new Date(2025, 5, 16) },
  { q: "Q3", period: "Jun – Aug", due: "Sep 15, 2025", dueDate: new Date(2025, 8, 15) },
  { q: "Q4", period: "Sep – Dec", due: "Jan 15, 2026", dueDate: new Date(2025, 0, 15) },
];

function calcFedTax(income, status) {
  let tax = 0;
  for (const b of BRACKETS[status]) {
    if (income <= b.min) break;
    tax += (Math.min(income, b.max) - b.min) * b.rate;
  }
  return tax;
}

function getMarginalBracket(income, status) {
  const brackets = BRACKETS[status];
  for (let i = brackets.length - 1; i >= 0; i--) {
    if (income > brackets[i].min) return brackets[i].rate;
  }
  return brackets[0].rate;
}

function calcSE(net) {
  const base = net * 0.9235;
  if (base <= 0) return { total: 0, deductible: 0 };
  const ss = Math.min(base, SS_WAGE_BASE) * 0.124;
  const med = base * 0.029 + Math.max(0, base - 200000) * 0.009;
  const total = ss + med;
  return { total, deductible: total / 2, ss, med };
}

const fmt = (n) => {
  if (n === 0) return "$0";
  return "$" + Math.round(n).toLocaleString("en-US");
};

const pct = (n) => (n * 100).toFixed(1) + "%";

// ─── Deadline urgency ───
function getNextDeadline() {
  const now = new Date();
  for (const d of DEADLINES) {
    if (d.dueDate > now) return d;
  }
  return DEADLINES[0];
}

function daysUntil(date) {
  const now = new Date();
  const diff = date - now;
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

// ─── Deduction prompts ───
function getDeductionInsights(totalIncome, totalDeductions, stateCode, netIncome) {
  const hints = [];
  const dedRatio = totalIncome > 0 ? totalDeductions / totalIncome : 0;

  if (totalIncome > 0 && dedRatio < 0.10) {
    hints.push({
      text: "Most freelancers deduct 15–25% of gross income. Common write-offs: home office, software, internet, health insurance premiums, and professional development.",
      type: "warning",
    });
  }
  if (totalIncome > 50000 && totalDeductions < 2000) {
    const savings = Math.round(5000 * 0.22);
    hints.push({
      text: `At your income, a $5,000 deduction saves roughly $${savings.toLocaleString()} in federal tax alone. Are you tracking mileage, equipment, or contractor payments?`,
      type: "tip",
    });
  }
  if (netIncome > 60000) {
    hints.push({
      text: "A Solo 401(k) lets you contribute up to $23,500 (plus 25% of net SE income) — reducing both federal and state taxable income.",
      type: "tip",
    });
  }
  if (["CA", "NY", "NJ", "OR", "MN"].includes(stateCode) && netIncome > 40000) {
    hints.push({
      text: `${STATES[stateCode].n} has a ${pct(STATES[stateCode].r)} state rate. Maximizing deductions here has an outsized impact — every $1,000 deducted saves you $${Math.round(1000 * (0.22 + STATES[stateCode].r))}.`,
      type: "tip",
    });
  }
  return hints;
}

// ─── Styles (CSS-in-JS) ───
const font = `"DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
const mono = `"JetBrains Mono", "SF Mono", "Fira Code", monospace`;

const C = {
  bg: "#fafaf9",
  surface: "#ffffff",
  border: "#e7e5e4",
  borderLight: "#f5f5f4",
  text: "#1c1917",
  textMid: "#57534e",
  textDim: "#a8a29e",
  green: "#15803d",
  greenBg: "#dcfce7",
  greenBorder: "#bbf7d0",
  amber: "#b45309",
  amberBg: "#fef3c7",
  amberBorder: "#fde68a",
  red: "#dc2626",
  redBg: "#fef2f2",
  redBorder: "#fecaca",
  accent: "#15803d",
};

// ─── Components ───

function Input({ label, value, onChange, help, prefix = "$" }) {
  const [focused, setFocused] = useState(false);
  const [raw, setRaw] = useState(value === 0 ? "" : String(value));

  useEffect(() => {
    if (!focused) setRaw(value === 0 ? "" : value.toLocaleString("en-US"));
  }, [value, focused]);

  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.textMid, marginBottom: 5, fontFamily: font, letterSpacing: "0.02em" }}>
        {label}
      </label>
      <div style={{
        display: "flex", alignItems: "center",
        border: `1.5px solid ${focused ? C.accent : C.border}`,
        borderRadius: 7, background: C.surface, transition: "border-color 0.15s",
      }}>
        {prefix && <span style={{ padding: "9px 0 9px 11px", color: C.textDim, fontSize: 14, fontWeight: 500, userSelect: "none", fontFamily: mono }}>{prefix}</span>}
        <input
          type="text" inputMode="numeric" value={raw} placeholder="0"
          onFocus={() => { setFocused(true); setRaw(value === 0 ? "" : String(value)); }}
          onBlur={() => { setFocused(false); onChange(parseInt(raw.replace(/\D/g, ""), 10) || 0); }}
          onChange={(e) => setRaw(e.target.value.replace(/[^0-9]/g, ""))}
          style={{
            flex: 1, border: "none", outline: "none", padding: "9px 11px 9px 4px",
            fontSize: 14, fontWeight: 600, color: C.text, background: "transparent",
            fontFamily: mono,
          }}
        />
      </div>
      {help && <div style={{ fontSize: 11, color: C.textDim, marginTop: 3, lineHeight: 1.4, fontFamily: font }}>{help}</div>}
    </div>
  );
}

function Select({ label, value, onChange, options }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.textMid, marginBottom: 5, fontFamily: font, letterSpacing: "0.02em" }}>{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{
          width: "100%", padding: "9px 11px",
          border: `1.5px solid ${focused ? C.accent : C.border}`,
          borderRadius: 7, fontSize: 14, fontWeight: 600, color: C.text,
          background: C.surface, outline: "none", cursor: "pointer", fontFamily: font,
          appearance: "none",
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 10 10'%3E%3Cpath d='M2 4l3 3 3-3' fill='none' stroke='%23a8a29e' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E")`,
          backgroundRepeat: "no-repeat", backgroundPosition: "right 11px center",
          transition: "border-color 0.15s",
        }}
      >
        {options.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
      </select>
    </div>
  );
}

function Card({ children, style = {} }) {
  return <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: 20, ...style }}>{children}</div>;
}

function Badge({ children, color = "green" }) {
  const colors = {
    green: { bg: C.greenBg, border: C.greenBorder, text: C.green },
    amber: { bg: C.amberBg, border: C.amberBorder, text: C.amber },
    red: { bg: C.redBg, border: C.redBorder, text: C.red },
  };
  const c = colors[color];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      fontSize: 12, fontWeight: 700, fontFamily: font,
      padding: "4px 10px", borderRadius: 100,
      background: c.bg, border: `1px solid ${c.border}`, color: c.text,
    }}>{children}</span>
  );
}

// ─── Main ───
export default function QuarterlyTaxCalculator() {
  const [status, setStatus] = useState("single");
  const [state, setState] = useState("CA");
  const [incomes, setIncomes] = useState([0, 0, 0, 0]);
  const [deductions, setDeductions] = useState([0, 0, 0, 0]);
  const [w2Income, setW2Income] = useState(0);
  const [w2Withheld, setW2Withheld] = useState(0);
  const [lastYearTax, setLastYearTax] = useState(0);
  const [activeQ, setActiveQ] = useState(0);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [whatIfDelta, setWhatIfDelta] = useState(0);
  const [paid, setPaid] = useState(() => {
    try { return JSON.parse(localStorage.getItem("qt_paid") || "[]") || []; } catch { return []; }
  });

  useEffect(() => {
    try { localStorage.setItem("qt_paid", JSON.stringify(paid)); } catch {}
  }, [paid]);

  const setIncome = (qi, val) => { const n = [...incomes]; n[qi] = val; setIncomes(n); };
  const setDeduction = (qi, val) => { const n = [...deductions]; n[qi] = val; setDeductions(n); };
  const applyAll = () => {
    setIncomes([incomes[activeQ], incomes[activeQ], incomes[activeQ], incomes[activeQ]]);
    setDeductions([deductions[activeQ], deductions[activeQ], deductions[activeQ], deductions[activeQ]]);
  };
  const togglePaid = (i) => {
    setPaid((p) => p.includes(i) ? p.filter((x) => x !== i) : [...p, i]);
  };

  // ─── Tax calc ───
  const totalIncome = incomes.reduce((a, b) => a + b, 0) + whatIfDelta;
  const totalDed = deductions.reduce((a, b) => a + b, 0);
  const netSE = Math.max(0, totalIncome - totalDed);
  const se = calcSE(netSE);
  const qbi = netSE * 0.20;
  const totalGrossWithW2 = netSE + w2Income;
  const agiBase = totalGrossWithW2 - se.deductible;
  const stdDed = STD_DEDUCTIONS[status];
  const taxableIncome = Math.max(0, agiBase - stdDed - qbi);
  const fedIncomeTax = calcFedTax(taxableIncome, status);
  const totalFedTax = fedIncomeTax + se.total;
  const stateRate = STATES[state]?.r || 0;
  const stateTaxable = Math.max(0, agiBase - stdDed);
  const stateTax = stateTaxable * stateRate;
  const totalAnnualTax = totalFedTax + stateTax;
  const afterWithholding = Math.max(0, totalAnnualTax - w2Withheld);
  const marginalRate = getMarginalBracket(taxableIncome, status);
  const effectiveRate = netSE > 0 ? totalAnnualTax / (netSE + w2Income) : 0;
  const hasInput = totalIncome > 0 || w2Income > 0;

  // Per-quarter
  const qPayments = incomes.map((inc) => {
    if (totalIncome === 0) return { fed: 0, st: 0, total: 0, monthly: 0 };
    const prop = (inc + (whatIfDelta > 0 ? whatIfDelta / 4 : 0)) / Math.max(1, totalIncome);
    const fed = Math.round(totalFedTax * prop);
    const st = Math.round(stateTax * prop);
    const adjFed = Math.round(Math.max(0, fed - w2Withheld / 4));
    const total = adjFed + st;
    return { fed: adjFed, st, total, monthly: Math.round(total / 3) };
  });

  // Safe harbor
  const totalEstimatedPayments = qPayments.reduce((a, q) => a + q.total, 0);
  const safeHarborThreshold = (agiBase > 150000) ? lastYearTax * 1.1 : lastYearTax;
  const isSafeHarbor = lastYearTax > 0 && totalEstimatedPayments >= safeHarborThreshold;
  const safeHarborGap = lastYearTax > 0 ? Math.max(0, safeHarborThreshold - totalEstimatedPayments) : 0;

  // Paid tracker
  const totalPaid = paid.reduce((a, i) => a + qPayments[i]?.total || 0, 0);
  const remaining = Math.max(0, totalEstimatedPayments - totalPaid);

  // Deadline
  const nextD = getNextDeadline();
  const daysLeft = daysUntil(nextD.dueDate);
  const urgencyColor = daysLeft > 30 ? C.green : daysLeft > 14 ? C.amber : C.red;

  // Deduction insights
  const insights = getDeductionInsights(totalIncome, totalDed, state, netSE);

  // ─── Export ───
  const handleExport = () => {
    const lines = [
      "QUARTERLY TAX ESTIMATE — " + new Date().getFullYear(),
      "═".repeat(44),
      `Filing status: ${status.replace(/_/g, " ")}`,
      `State: ${STATES[state]?.n}`,
      `Gross 1099 income: ${fmt(totalIncome)}`,
      `Business deductions: ${fmt(totalDed)}`,
      `Net SE income: ${fmt(netSE)}`,
      w2Income > 0 ? `W-2 income: ${fmt(w2Income)}` : null,
      w2Withheld > 0 ? `W-2 taxes withheld: ${fmt(w2Withheld)}` : null,
      "",
      `Total annual tax: ${fmt(totalAnnualTax)}`,
      w2Withheld > 0 ? `Less withholding: -${fmt(w2Withheld)}` : null,
      w2Withheld > 0 ? `Estimated payments due: ${fmt(afterWithholding)}` : null,
      `Effective rate: ${pct(effectiveRate)}`,
      `Marginal bracket: ${pct(marginalRate)}`,
      "",
      "─".repeat(44),
      ...qPayments.map((q, i) =>
        `${DEADLINES[i].q} (due ${DEADLINES[i].due}): ${fmt(q.total)}  (${fmt(q.monthly)}/mo)`
      ),
      "─".repeat(44),
      "",
      "⚠ Estimate only. Not tax advice. Consult a CPA.",
    ].filter(Boolean).join("\n");

    const blob = new Blob([lines], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `quarterlytax-estimate-${new Date().getFullYear()}.txt`;
    a.click();
  };

  const stateOpts = Object.entries(STATES).sort((a, b) => a[1].n.localeCompare(b[1].n)).map(([c, s]) => ({ v: c, l: s.n }));
  const statusOpts = [
    { v: "single", l: "Single" },
    { v: "married_jointly", l: "Married filing jointly" },
    { v: "married_separately", l: "Married filing separately" },
    { v: "head_of_household", l: "Head of household" },
  ];

  return (
    <div style={{ fontFamily: font, background: C.bg, minHeight: "100vh", color: C.text }}>
      {/* Google Font */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800&family=JetBrains+Mono:wght@400;500;600;700&display=swap');`}</style>

      {/* Disclaimer banner */}
      <div style={{
        background: C.amberBg, borderBottom: `1px solid ${C.amberBorder}`,
        padding: "9px 20px", fontSize: 12, color: C.amber, lineHeight: 1.5,
        textAlign: "center", fontWeight: 600, fontFamily: font,
      }}>
        ⚠ Estimates only — not tax advice. Uses simplified 2025 rates. Consult a tax professional before making payments.
      </div>

      {/* Header */}
      <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: "14px 20px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontSize: 17, fontWeight: 800, letterSpacing: "-0.04em" }}>
            <span style={{ color: C.accent }}>Q</span>uarterlyTax
          </div>
          <div style={{ fontSize: 12, color: C.textDim, fontWeight: 500 }}>
            Quarterly tax estimates for freelancers
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "28px 16px 80px" }}>

        {/* Deadline urgency bar */}
        {hasInput && (
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10,
            padding: "12px 18px", marginBottom: 20,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 8, height: 8, borderRadius: "50%", background: urgencyColor,
                boxShadow: daysLeft <= 14 ? `0 0 8px ${urgencyColor}` : "none",
              }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>
                {nextD.q} payment due in {daysLeft} days
              </span>
              <span style={{ fontSize: 12, color: C.textDim }}>
                {nextD.due}
              </span>
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, fontFamily: mono, color: urgencyColor }}>
              {fmt(qPayments[DEADLINES.indexOf(nextD)]?.total || 0)}
            </div>
          </div>
        )}

        <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
          {/* ─── LEFT: Inputs ─── */}
          <div style={{ flex: "1 1 360px", minWidth: 310 }}>

            <Card>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.textDim, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>Your details</div>
              <Select label="Filing status" value={status} onChange={setStatus} options={statusOpts} />
              <Select label="State" value={state} onChange={setState} options={stateOpts} />
            </Card>

            <Card style={{ marginTop: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.textDim, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>Quarterly income</div>

              {/* Quarter tabs */}
              <div style={{ display: "flex", marginBottom: 16, borderRadius: 7, overflow: "hidden", border: `1px solid ${C.border}` }}>
                {["Q1", "Q2", "Q3", "Q4"].map((q, i) => (
                  <button key={q} onClick={() => setActiveQ(i)} style={{
                    flex: 1, padding: "9px 0", border: "none", fontFamily: font,
                    background: activeQ === i ? C.accent : C.surface,
                    color: activeQ === i ? "#fff" : C.textDim,
                    fontWeight: 700, fontSize: 12, cursor: "pointer",
                    borderRight: i < 3 ? `1px solid ${C.border}` : "none",
                    transition: "all 0.12s",
                  }}>{q}</button>
                ))}
              </div>

              <div style={{ fontSize: 11, color: C.textDim, marginBottom: 10 }}>
                {DEADLINES[activeQ].period} · Due {DEADLINES[activeQ].due}
              </div>

              <Input label="1099 / FREELANCE INCOME" value={incomes[activeQ]}
                onChange={(v) => setIncome(activeQ, v)}
                help="Gross income before expenses this quarter"
              />
              <Input label="BUSINESS DEDUCTIONS" value={deductions[activeQ]}
                onChange={(v) => setDeduction(activeQ, v)}
                help="Home office, software, supplies, travel, health insurance, etc."
              />

              <button onClick={applyAll} style={{
                width: "100%", padding: "9px", background: C.bg,
                border: `1px solid ${C.border}`, borderRadius: 7,
                fontSize: 12, fontWeight: 600, color: C.textMid,
                cursor: "pointer", fontFamily: font, marginTop: 2,
              }}>
                Apply to all quarters
              </button>
            </Card>

            {/* Advanced inputs */}
            <Card style={{ marginTop: 12 }}>
              <button onClick={() => setShowAdvanced(!showAdvanced)} style={{
                width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center",
                background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: font,
              }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: C.textDim, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  Advanced
                </span>
                <span style={{ fontSize: 14, color: C.textDim, transform: showAdvanced ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }}>▾</span>
              </button>

              {showAdvanced && (
                <div style={{ marginTop: 16 }}>
                  <Input label="W-2 INCOME (ANNUAL)" value={w2Income} onChange={setW2Income}
                    help="If you also have a day job — helps offset your quarterly payments" />
                  <Input label="W-2 TAXES ALREADY WITHHELD" value={w2Withheld} onChange={setW2Withheld}
                    help="From your pay stubs — reduces what you owe quarterly" />
                  <Input label="LAST YEAR'S TOTAL TAX (1040 LINE 24)" value={lastYearTax} onChange={setLastYearTax}
                    help="For safe harbor calculation — if you pay 100% of last year's tax, you avoid penalties" />
                </div>
              )}
            </Card>
          </div>

          {/* ─── RIGHT: Results ─── */}
          <div style={{ flex: "1 1 360px", minWidth: 310 }}>

            {/* Hero amount */}
            <Card style={{ textAlign: "center", padding: "28px 20px" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.textDim, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
                Estimated quarterly payments · {new Date().getFullYear()}
              </div>
              <div style={{
                fontSize: 52, fontWeight: 800, letterSpacing: "-0.05em",
                color: hasInput ? C.text : C.border, lineHeight: 1,
                fontFamily: mono, fontVariantNumeric: "tabular-nums",
              }}>
                {hasInput ? fmt(afterWithholding) : "$—"}
              </div>
              {hasInput && (
                <>
                  <div style={{ fontSize: 13, color: C.textMid, marginTop: 10, lineHeight: 1.6 }}>
                    <span style={{ fontWeight: 700, color: C.text }}>{pct(effectiveRate)}</span> effective rate
                    <span style={{ margin: "0 6px", color: C.border }}>·</span>
                    <span style={{ fontWeight: 700, color: C.text }}>{pct(marginalRate)}</span> marginal bracket
                  </div>
                  <div style={{ fontSize: 12, color: C.textDim, marginTop: 4 }}>
                    You're in the {pct(marginalRate)} bracket, but you actually pay {pct(effectiveRate)} overall.
                    {effectiveRate < marginalRate * 0.8 && " You don't need to set aside " + pct(marginalRate) + " of every check."}
                  </div>
                </>
              )}
            </Card>

            {/* Safe harbor badge */}
            {lastYearTax > 0 && hasInput && (
              <div style={{ marginTop: 12, textAlign: "center" }}>
                {isSafeHarbor ? (
                  <Badge color="green">✓ Safe harbor — you're penalty-protected</Badge>
                ) : (
                  <Badge color="red">⚠ {fmt(safeHarborGap)} short of safe harbor — increase payments to avoid penalties</Badge>
                )}
              </div>
            )}

            {/* Quarter cards */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 14 }}>
              {qPayments.map((q, i) => (
                <Card key={i} style={{
                  padding: 14,
                  border: activeQ === i ? `1.5px solid ${C.accent}` : `1px solid ${C.border}`,
                  opacity: paid.includes(i) ? 0.55 : 1,
                  position: "relative",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 800, color: C.text }}>{DEADLINES[i].q}</span>
                    <button onClick={() => togglePaid(i)} title={paid.includes(i) ? "Mark unpaid" : "Mark paid"} style={{
                      width: 18, height: 18, borderRadius: 4,
                      border: `1.5px solid ${paid.includes(i) ? C.accent : C.border}`,
                      background: paid.includes(i) ? C.greenBg : "transparent",
                      cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 10, color: C.accent, fontWeight: 800,
                    }}>
                      {paid.includes(i) && "✓"}
                    </button>
                  </div>
                  <div style={{
                    fontSize: 24, fontWeight: 800, letterSpacing: "-0.03em",
                    color: hasInput && q.total > 0 ? C.text : C.border,
                    fontFamily: mono, fontVariantNumeric: "tabular-nums",
                  }}>
                    {hasInput && q.total > 0 ? fmt(q.total) : "$—"}
                  </div>
                  {hasInput && q.total > 0 && (
                    <>
                      <div style={{ fontSize: 11, color: C.textDim, marginTop: 2 }}>
                        {fmt(q.monthly)}/mo · Due {DEADLINES[i].due.split(",")[0]}
                      </div>
                    </>
                  )}
                  {paid.includes(i) && (
                    <div style={{
                      position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      borderRadius: 9,
                    }}>
                      <span style={{ fontSize: 11, fontWeight: 800, color: C.green, background: C.greenBg, padding: "2px 8px", borderRadius: 4 }}>PAID</span>
                    </div>
                  )}
                </Card>
              ))}
            </div>

            {/* Payment tracker */}
            {hasInput && paid.length > 0 && (
              <div style={{
                marginTop: 10, padding: "10px 14px", background: C.greenBg,
                border: `1px solid ${C.greenBorder}`, borderRadius: 8,
                fontSize: 12, fontWeight: 600, color: C.green, textAlign: "center",
              }}>
                Paid {fmt(totalPaid)} of {fmt(totalEstimatedPayments)} · {fmt(remaining)} remaining across {4 - paid.length} quarter{4 - paid.length !== 1 ? "s" : ""}
              </div>
            )}

            {/* What-if slider */}
            {hasInput && (
              <Card style={{ marginTop: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.textDim, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
                  What-if: Adjust total income
                </div>
                <input type="range"
                  min={-Math.round(totalIncome * 0.5)} max={Math.round(totalIncome * 0.5)} step={500}
                  value={whatIfDelta} onChange={(e) => setWhatIfDelta(Number(e.target.value))}
                  style={{ width: "100%", accentColor: C.accent }}
                />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginTop: 4 }}>
                  <span style={{ color: C.textDim }}>−{fmt(Math.round(totalIncome * 0.5))}</span>
                  <span style={{
                    fontWeight: 700, fontFamily: mono,
                    color: whatIfDelta === 0 ? C.textDim : whatIfDelta > 0 ? C.red : C.green,
                  }}>
                    {whatIfDelta === 0 ? "Baseline" : (whatIfDelta > 0 ? "+" : "") + fmt(whatIfDelta)}
                  </span>
                  <span style={{ color: C.textDim }}>+{fmt(Math.round(totalIncome * 0.5))}</span>
                </div>
              </Card>
            )}

            {/* Actions */}
            {hasInput && afterWithholding > 0 && (
              <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                <a href="https://directpay.irs.gov" target="_blank" rel="noopener noreferrer" style={{
                  flex: 1, textAlign: "center", padding: "12px",
                  background: C.accent, color: "#fff", borderRadius: 8,
                  fontWeight: 700, fontSize: 13, textDecoration: "none",
                  fontFamily: font, letterSpacing: "-0.01em",
                }}>
                  Pay on IRS Direct Pay →
                </a>
                <button onClick={handleExport} style={{
                  padding: "12px 16px", background: C.surface,
                  border: `1.5px solid ${C.border}`, borderRadius: 8,
                  fontWeight: 700, fontSize: 13, cursor: "pointer",
                  fontFamily: font, color: C.textMid,
                }}>
                  Export
                </button>
              </div>
            )}

            {/* Deduction insights */}
            {hasInput && insights.length > 0 && (
              <Card style={{ marginTop: 12, padding: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.accent, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
                  Tax-saving opportunities
                </div>
                {insights.map((h, i) => (
                  <div key={i} style={{
                    padding: "10px 12px", marginBottom: i < insights.length - 1 ? 8 : 0,
                    background: h.type === "warning" ? C.amberBg : C.greenBg,
                    border: `1px solid ${h.type === "warning" ? C.amberBorder : C.greenBorder}`,
                    borderRadius: 7, fontSize: 12, lineHeight: 1.55,
                    color: h.type === "warning" ? C.amber : C.green,
                    fontWeight: 500,
                  }}>
                    {h.text}
                  </div>
                ))}
              </Card>
            )}

            {/* Full breakdown */}
            {hasInput && afterWithholding > 0 && (
              <Card style={{ marginTop: 12, padding: 0, overflow: "hidden" }}>
                <button onClick={() => setShowBreakdown(!showBreakdown)} style={{
                  width: "100%", padding: "14px 18px", background: "none",
                  border: "none", display: "flex", justifyContent: "space-between",
                  alignItems: "center", cursor: "pointer", fontFamily: font,
                }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: C.text }}>Full tax breakdown</span>
                  <span style={{ color: C.textDim, fontSize: 14, transform: showBreakdown ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }}>▾</span>
                </button>
                {showBreakdown && (
                  <div style={{ padding: "0 18px 14px" }}>
                    {[
                      { l: "Gross 1099 income", v: fmt(totalIncome) },
                      { l: "Business deductions", v: `−${fmt(totalDed)}`, dim: true },
                      { l: "Net self-employment income", v: fmt(netSE), bold: true },
                      w2Income > 0 && { l: "W-2 income", v: fmt(w2Income) },
                      { l: `SE tax (15.3%)`, v: fmt(se.total) },
                      { l: "½ SE tax deduction", v: `−${fmt(se.deductible)}`, dim: true },
                      { l: "Adjusted gross income", v: fmt(agiBase) },
                      { l: "Standard deduction", v: `−${fmt(stdDed)}`, dim: true },
                      { l: "QBI deduction (20%)", v: `−${fmt(Math.round(qbi))}`, dim: true },
                      { l: "Taxable income", v: fmt(taxableIncome), bold: true },
                      { l: "Federal income tax", v: fmt(fedIncomeTax) },
                      { l: `${STATES[state]?.n} (${pct(stateRate)})`, v: fmt(stateTax) },
                      { l: "Total annual tax", v: fmt(totalAnnualTax), bold: true },
                      w2Withheld > 0 && { l: "Less W-2 withholding", v: `−${fmt(w2Withheld)}`, dim: true },
                      { l: "Estimated payments due", v: fmt(afterWithholding), bold: true, green: true },
                    ].filter(Boolean).map((row, i) => (
                      <div key={i} style={{
                        display: "flex", justifyContent: "space-between",
                        padding: "6px 0",
                        borderTop: i > 0 ? `1px solid ${C.borderLight}` : "none",
                        fontSize: 12,
                      }}>
                        <span style={{ color: row.bold ? C.text : C.textMid, fontWeight: row.bold ? 700 : 400 }}>{row.l}</span>
                        <span style={{
                          fontWeight: row.bold ? 800 : 600,
                          fontFamily: mono, fontVariantNumeric: "tabular-nums",
                          color: row.green ? C.accent : row.dim ? C.textDim : C.text,
                        }}>{row.v}</span>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            )}

            {/* Disclaimer */}
            {hasInput && (
              <div style={{
                marginTop: 14, padding: "12px 14px",
                background: C.amberBg, border: `1px solid ${C.amberBorder}`,
                borderRadius: 8, fontSize: 11, color: C.amber, lineHeight: 1.6, fontWeight: 500,
              }}>
                <strong>Not tax advice.</strong> This tool uses simplified flat state rates and 2025 federal brackets. It does not account for AMT, additional Medicare surtax thresholds, state-specific deductions, credits, or local taxes. Your actual liability may differ. File with a CPA or use IRS Form 1040-ES for official calculations.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
