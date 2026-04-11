import { useState, useEffect, useRef } from "react";

// 2025 Federal Tax Brackets
const FEDERAL_BRACKETS = {
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

const STANDARD_DEDUCTIONS = {
  single: 15000,
  married_jointly: 30000,
  married_separately: 15000,
  head_of_household: 22500,
};

// Flat or simplified state tax rates (2025 estimates)
const STATE_TAXES = {
  AL: { name: "Alabama", rate: 0.05 },
  AK: { name: "Alaska", rate: 0 },
  AZ: { name: "Arizona", rate: 0.025 },
  AR: { name: "Arkansas", rate: 0.039 },
  CA: { name: "California", rate: 0.0725 },
  CO: { name: "Colorado", rate: 0.044 },
  CT: { name: "Connecticut", rate: 0.05 },
  DE: { name: "Delaware", rate: 0.055 },
  FL: { name: "Florida", rate: 0 },
  GA: { name: "Georgia", rate: 0.0549 },
  HI: { name: "Hawaii", rate: 0.065 },
  ID: { name: "Idaho", rate: 0.058 },
  IL: { name: "Illinois", rate: 0.0495 },
  IN: { name: "Indiana", rate: 0.0305 },
  IA: { name: "Iowa", rate: 0.038 },
  KS: { name: "Kansas", rate: 0.046 },
  KY: { name: "Kentucky", rate: 0.04 },
  LA: { name: "Louisiana", rate: 0.0425 },
  ME: { name: "Maine", rate: 0.055 },
  MD: { name: "Maryland", rate: 0.05 },
  MA: { name: "Massachusetts", rate: 0.05 },
  MI: { name: "Michigan", rate: 0.0425 },
  MN: { name: "Minnesota", rate: 0.0585 },
  MS: { name: "Mississippi", rate: 0.047 },
  MO: { name: "Missouri", rate: 0.048 },
  MT: { name: "Montana", rate: 0.059 },
  NE: { name: "Nebraska", rate: 0.0396 },
  NV: { name: "Nevada", rate: 0 },
  NH: { name: "New Hampshire", rate: 0 },
  NJ: { name: "New Jersey", rate: 0.055 },
  NM: { name: "New Mexico", rate: 0.049 },
  NY: { name: "New York", rate: 0.0685 },
  NC: { name: "North Carolina", rate: 0.045 },
  ND: { name: "North Dakota", rate: 0.0195 },
  OH: { name: "Ohio", rate: 0.035 },
  OK: { name: "Oklahoma", rate: 0.0475 },
  OR: { name: "Oregon", rate: 0.0875 },
  PA: { name: "Pennsylvania", rate: 0.0307 },
  RI: { name: "Rhode Island", rate: 0.0475 },
  SC: { name: "South Carolina", rate: 0.064 },
  SD: { name: "South Dakota", rate: 0 },
  TN: { name: "Tennessee", rate: 0 },
  TX: { name: "Texas", rate: 0 },
  UT: { name: "Utah", rate: 0.0465 },
  VT: { name: "Vermont", rate: 0.055 },
  VA: { name: "Virginia", rate: 0.0575 },
  WA: { name: "Washington", rate: 0 },
  WV: { name: "West Virginia", rate: 0.052 },
  WI: { name: "Wisconsin", rate: 0.053 },
  WY: { name: "Wyoming", rate: 0 },
  DC: { name: "Washington, D.C.", rate: 0.065 },
};

const SE_TAX_RATE = 0.153;
const SS_WAGE_BASE_2025 = 176100;
const QBI_DEDUCTION_RATE = 0.20;

const DEADLINES = [
  { q: "Q1", period: "Jan 1 – Mar 31", due: "Apr 15, 2025" },
  { q: "Q2", period: "Apr 1 – May 31", due: "Jun 16, 2025" },
  { q: "Q3", period: "Jun 1 – Aug 31", due: "Sep 15, 2025" },
  { q: "Q4", period: "Sep 1 – Dec 31", due: "Jan 15, 2026" },
];

function calcFederalTax(taxableIncome, status) {
  const brackets = FEDERAL_BRACKETS[status];
  let tax = 0;
  for (const b of brackets) {
    if (taxableIncome <= b.min) break;
    const taxable = Math.min(taxableIncome, b.max) - b.min;
    tax += taxable * b.rate;
  }
  return tax;
}

function calcSETax(netSEIncome) {
  const taxableBase = netSEIncome * 0.9235;
  if (taxableBase <= 0) return { total: 0, deductible: 0, ss: 0, medicare: 0 };
  const ssIncome = Math.min(taxableBase, SS_WAGE_BASE_2025);
  const ss = ssIncome * 0.124;
  const medicare = taxableBase * 0.029;
  const additionalMedicare = Math.max(0, taxableBase - 200000) * 0.009;
  const total = ss + medicare + additionalMedicare;
  return { total, deductible: total / 2, ss, medicare: medicare + additionalMedicare };
}

function formatUSD(n) {
  if (n === 0) return "$0";
  return "$" + Math.round(n).toLocaleString("en-US");
}

function InputField({ label, value, onChange, tooltip, prefix = "$" }) {
  const [focused, setFocused] = useState(false);
  const [displayVal, setDisplayVal] = useState(value === 0 ? "" : value.toLocaleString("en-US"));

  useEffect(() => {
    if (!focused) {
      setDisplayVal(value === 0 ? "" : value.toLocaleString("en-US"));
    }
  }, [value, focused]);

  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{
        display: "block",
        fontSize: 13,
        fontWeight: 500,
        color: "#4b5563",
        marginBottom: 6,
        letterSpacing: "-0.01em",
      }}>
        {label}
        {tooltip && (
          <span title={tooltip} style={{
            display: "inline-block",
            width: 15,
            height: 15,
            borderRadius: "50%",
            background: "#e5e7eb",
            color: "#6b7280",
            fontSize: 10,
            textAlign: "center",
            lineHeight: "15px",
            marginLeft: 6,
            cursor: "help",
            fontWeight: 700,
          }}>?</span>
        )}
      </label>
      <div style={{
        display: "flex",
        alignItems: "center",
        border: focused ? "1.5px solid #16a34a" : "1.5px solid #d1d5db",
        borderRadius: 8,
        background: "#fff",
        transition: "border-color 0.15s",
        overflow: "hidden",
      }}>
        {prefix && (
          <span style={{
            padding: "10px 0 10px 12px",
            color: "#9ca3af",
            fontSize: 15,
            fontWeight: 500,
            userSelect: "none",
          }}>{prefix}</span>
        )}
        <input
          type="text"
          inputMode="numeric"
          value={displayVal}
          onFocus={() => {
            setFocused(true);
            setDisplayVal(value === 0 ? "" : String(value));
          }}
          onBlur={() => {
            setFocused(false);
            const parsed = parseInt(displayVal.replace(/[^0-9]/g, ""), 10) || 0;
            onChange(parsed);
          }}
          onChange={(e) => {
            const raw = e.target.value.replace(/[^0-9]/g, "");
            setDisplayVal(raw);
          }}
          style={{
            flex: 1,
            border: "none",
            outline: "none",
            padding: "10px 12px 10px 4px",
            fontSize: 15,
            fontWeight: 500,
            color: "#111827",
            background: "transparent",
            fontFamily: "inherit",
          }}
          placeholder="0"
        />
      </div>
    </div>
  );
}

function SelectField({ label, value, onChange, options }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{
        display: "block",
        fontSize: 13,
        fontWeight: 500,
        color: "#4b5563",
        marginBottom: 6,
        letterSpacing: "-0.01em",
      }}>{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: "100%",
          padding: "10px 12px",
          border: focused ? "1.5px solid #16a34a" : "1.5px solid #d1d5db",
          borderRadius: 8,
          fontSize: 15,
          fontWeight: 500,
          color: "#111827",
          background: "#fff",
          outline: "none",
          cursor: "pointer",
          fontFamily: "inherit",
          appearance: "none",
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath d='M3 5l3 3 3-3' fill='none' stroke='%236b7280' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E")`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 12px center",
          transition: "border-color 0.15s",
        }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

export default function QuarterlyTaxCalculator() {
  const [status, setStatus] = useState("single");
  const [state, setState] = useState("CA");
  const [q1Income, setQ1Income] = useState(0);
  const [q2Income, setQ2Income] = useState(0);
  const [q3Income, setQ3Income] = useState(0);
  const [q4Income, setQ4Income] = useState(0);
  const [q1Deductions, setQ1Deductions] = useState(0);
  const [q2Deductions, setQ2Deductions] = useState(0);
  const [q3Deductions, setQ3Deductions] = useState(0);
  const [q4Deductions, setQ4Deductions] = useState(0);
  const [activeQuarter, setActiveQuarter] = useState(0);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const resultsRef = useRef(null);

  const quarters = [
    { income: q1Income, deductions: q1Deductions },
    { income: q2Income, deductions: q2Deductions },
    { income: q3Income, deductions: q3Deductions },
    { income: q4Income, deductions: q4Deductions },
  ];

  const setIncome = [setQ1Income, setQ2Income, setQ3Income, setQ4Income];
  const setDeductions = [setQ1Deductions, setQ2Deductions, setQ3Deductions, setQ4Deductions];

  // Annualize for tax calc
  const totalIncome = quarters.reduce((s, q) => s + q.income, 0);
  const totalDeductions = quarters.reduce((s, q) => s + q.deductions, 0);
  const netSEIncome = Math.max(0, totalIncome - totalDeductions);

  // SE Tax
  const se = calcSETax(netSEIncome);

  // QBI Deduction (simplified — 20% of qualified business income)
  const qbi = netSEIncome * QBI_DEDUCTION_RATE;

  // AGI
  const agi = netSEIncome - se.deductible;

  // Taxable income
  const standardDed = STANDARD_DEDUCTIONS[status];
  const taxableIncome = Math.max(0, agi - standardDed - qbi);

  // Federal income tax
  const federalIncomeTax = calcFederalTax(taxableIncome, status);

  // Total federal tax (income + SE)
  const totalFederalTax = federalIncomeTax + se.total;

  // State tax (simplified flat rate on net SE income minus standard deduction)
  const stateRate = STATE_TAXES[state]?.rate || 0;
  const stateTaxableIncome = Math.max(0, agi - standardDed);
  const stateTax = stateTaxableIncome * stateRate;

  // Total annual tax
  const totalAnnualTax = totalFederalTax + stateTax;

  // Per-quarter (proportional to income)
  const quarterlyPayments = quarters.map((q) => {
    if (totalIncome === 0) return { federal: 0, state: 0, total: 0 };
    const proportion = q.income / totalIncome;
    const fed = totalFederalTax * proportion;
    const st = stateTax * proportion;
    return { federal: Math.round(fed), state: Math.round(st), total: Math.round(fed + st) };
  });

  const hasInput = totalIncome > 0;

  const effectiveRate = netSEIncome > 0 ? ((totalAnnualTax / netSEIncome) * 100).toFixed(1) : "0.0";

  const stateOptions = Object.entries(STATE_TAXES)
    .sort((a, b) => a[1].name.localeCompare(b[1].name))
    .map(([code, s]) => ({ value: code, label: s.name }));

  const filingOptions = [
    { value: "single", label: "Single" },
    { value: "married_jointly", label: "Married filing jointly" },
    { value: "married_separately", label: "Married filing separately" },
    { value: "head_of_household", label: "Head of household" },
  ];

  return (
    <div style={{
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      background: "#fafafa",
      minHeight: "100vh",
      color: "#111827",
    }}>
      {/* Disclaimer banner */}
      <div style={{
        background: "#fef3c7",
        borderBottom: "1px solid #f59e0b",
        padding: "10px 20px",
        fontSize: 13,
        color: "#92400e",
        lineHeight: 1.5,
        textAlign: "center",
        fontWeight: 500,
      }}>
        ⚠ This calculator provides estimates only and is not tax advice. Tax laws change frequently. Consult a qualified tax professional before making tax payments. Calculations use simplified 2025 rates.
      </div>

      {/* Header */}
      <div style={{
        background: "#fff",
        borderBottom: "1px solid #e5e7eb",
        padding: "20px 24px",
      }}>
        <div style={{ maxWidth: 960, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#111827", letterSpacing: "-0.03em" }}>
              <span style={{ color: "#16a34a" }}>Q</span>uarterlyTax
            </div>
          </div>
          <div style={{ fontSize: 13, color: "#6b7280" }}>
            Free quarterly tax calculator for freelancers
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "32px 20px 64px" }}>
        {/* Title */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{
            fontSize: 28,
            fontWeight: 800,
            letterSpacing: "-0.04em",
            margin: "0 0 8px",
            color: "#111827",
            lineHeight: 1.15,
          }}>
            How much should you set aside?
          </h1>
          <p style={{ fontSize: 15, color: "#6b7280", margin: 0, lineHeight: 1.5 }}>
            Enter your quarterly freelance income and deductions. We'll calculate your estimated federal + state tax for each IRS deadline.
          </p>
        </div>

        <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
          {/* Left: Inputs */}
          <div style={{ flex: "1 1 380px", minWidth: 320 }}>
            {/* Filing details */}
            <div style={{
              background: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: 12,
              padding: "20px 20px 4px",
              marginBottom: 16,
            }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#111827", marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Your details
              </div>
              <SelectField label="Filing status" value={status} onChange={setStatus} options={filingOptions} />
              <SelectField label="State" value={state} onChange={setState} options={stateOptions} />
            </div>

            {/* Quarter tabs */}
            <div style={{
              background: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: 12,
              padding: 20,
            }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#111827", marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Quarterly income & deductions
              </div>

              <div style={{ display: "flex", gap: 0, marginBottom: 20, borderRadius: 8, overflow: "hidden", border: "1px solid #e5e7eb" }}>
                {["Q1", "Q2", "Q3", "Q4"].map((q, i) => (
                  <button
                    key={q}
                    onClick={() => setActiveQuarter(i)}
                    style={{
                      flex: 1,
                      padding: "10px 0",
                      border: "none",
                      background: activeQuarter === i ? "#16a34a" : "#fff",
                      color: activeQuarter === i ? "#fff" : "#6b7280",
                      fontWeight: 600,
                      fontSize: 13,
                      cursor: "pointer",
                      borderRight: i < 3 ? "1px solid #e5e7eb" : "none",
                      fontFamily: "inherit",
                      transition: "all 0.15s",
                    }}
                  >
                    {q}
                  </button>
                ))}
              </div>

              <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 12 }}>
                {DEADLINES[activeQuarter].period} · Due {DEADLINES[activeQuarter].due}
              </div>

              <InputField
                label="1099 / freelance income"
                value={quarters[activeQuarter].income}
                onChange={setIncome[activeQuarter]}
                tooltip="Gross income from freelance, contract, or self-employment work this quarter before expenses."
              />
              <InputField
                label="Business deductions"
                value={quarters[activeQuarter].deductions}
                onChange={setDeductions[activeQuarter]}
                tooltip="Business expenses: home office, software, supplies, travel, health insurance premiums, etc."
              />

              <div style={{
                display: "flex",
                gap: 8,
                marginTop: 4,
              }}>
                <button
                  onClick={() => {
                    const inc = quarters[activeQuarter].income;
                    const ded = quarters[activeQuarter].deductions;
                    setIncome.forEach((fn) => fn(inc));
                    setDeductions.forEach((fn) => fn(ded));
                  }}
                  style={{
                    flex: 1,
                    padding: "10px",
                    background: "#f3f4f6",
                    border: "1px solid #e5e7eb",
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 500,
                    color: "#374151",
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  Apply to all quarters
                </button>
              </div>
            </div>
          </div>

          {/* Right: Results */}
          <div ref={resultsRef} style={{ flex: "1 1 380px", minWidth: 320 }}>
            {/* Hero number */}
            <div style={{
              background: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: 12,
              padding: 24,
              marginBottom: 16,
              textAlign: "center",
            }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
                Total estimated tax · {new Date().getFullYear()}
              </div>
              <div style={{
                fontSize: 48,
                fontWeight: 800,
                letterSpacing: "-0.04em",
                color: hasInput ? "#111827" : "#d1d5db",
                lineHeight: 1.1,
                fontVariantNumeric: "tabular-nums",
              }}>
                {hasInput ? formatUSD(totalAnnualTax) : "$—"}
              </div>
              {hasInput && (
                <div style={{ fontSize: 14, color: "#6b7280", marginTop: 8 }}>
                  {effectiveRate}% effective rate on {formatUSD(netSEIncome)} net income
                </div>
              )}
            </div>

            {/* Quarter cards */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
              {quarterlyPayments.map((qp, i) => (
                <div key={i} style={{
                  background: "#fff",
                  border: activeQuarter === i ? "1.5px solid #16a34a" : "1px solid #e5e7eb",
                  borderRadius: 10,
                  padding: 16,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>{DEADLINES[i].q}</span>
                    <span style={{ fontSize: 11, color: "#9ca3af", fontWeight: 500 }}>Due {DEADLINES[i].due.split(",")[0].split(" ").slice(0, 2).join(" ")}</span>
                  </div>
                  <div style={{
                    fontSize: 26,
                    fontWeight: 800,
                    letterSpacing: "-0.03em",
                    color: hasInput && qp.total > 0 ? "#111827" : "#d1d5db",
                    fontVariantNumeric: "tabular-nums",
                  }}>
                    {hasInput && qp.total > 0 ? formatUSD(qp.total) : "$—"}
                  </div>
                  {hasInput && qp.total > 0 && (
                    <div style={{ fontSize: 11, color: "#6b7280", marginTop: 4 }}>
                      {formatUSD(qp.federal)} fed · {formatUSD(qp.state)} state
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* IRS Direct Pay link */}
            {hasInput && totalAnnualTax > 0 && (
              <a
                href="https://directpay.irs.gov"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "block",
                  textAlign: "center",
                  padding: "14px",
                  background: "#16a34a",
                  color: "#fff",
                  borderRadius: 10,
                  fontWeight: 600,
                  fontSize: 14,
                  textDecoration: "none",
                  marginBottom: 16,
                  letterSpacing: "-0.01em",
                }}
              >
                Pay on IRS Direct Pay →
              </a>
            )}

            {/* Breakdown toggle */}
            {hasInput && totalAnnualTax > 0 && (
              <div style={{
                background: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: 12,
                overflow: "hidden",
              }}>
                <button
                  onClick={() => setShowBreakdown(!showBreakdown)}
                  style={{
                    width: "100%",
                    padding: "14px 20px",
                    background: "none",
                    border: "none",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>Full tax breakdown</span>
                  <span style={{ color: "#9ca3af", fontSize: 18, transform: showBreakdown ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>▾</span>
                </button>
                {showBreakdown && (
                  <div style={{ padding: "0 20px 16px" }}>
                    {[
                      { label: "Gross 1099 income", value: formatUSD(totalIncome) },
                      { label: "Business deductions", value: `−${formatUSD(totalDeductions)}`, dim: true },
                      { label: "Net self-employment income", value: formatUSD(netSEIncome), bold: true },
                      { label: "SE tax (15.3%)", value: formatUSD(se.total), sub: `${formatUSD(se.ss)} SS + ${formatUSD(se.medicare)} Medicare` },
                      { label: "½ SE tax deduction", value: `−${formatUSD(se.deductible)}`, dim: true },
                      { label: "Adjusted gross income", value: formatUSD(agi) },
                      { label: "Standard deduction", value: `−${formatUSD(standardDed)}`, dim: true },
                      { label: "QBI deduction (20%)", value: `−${formatUSD(Math.round(qbi))}`, dim: true },
                      { label: "Taxable income", value: formatUSD(taxableIncome), bold: true },
                      { label: "Federal income tax", value: formatUSD(federalIncomeTax) },
                      { label: `${STATE_TAXES[state]?.name || state} tax (${(stateRate * 100).toFixed(1)}%)`, value: formatUSD(stateTax) },
                      { label: "Total annual tax", value: formatUSD(totalAnnualTax), bold: true, green: true },
                    ].map((row, i) => (
                      <div key={i} style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "7px 0",
                        borderTop: i > 0 ? "1px solid #f3f4f6" : "none",
                        fontSize: 13,
                      }}>
                        <span style={{ color: row.bold ? "#111827" : "#6b7280", fontWeight: row.bold ? 600 : 400 }}>
                          {row.label}
                        </span>
                        <div style={{ textAlign: "right" }}>
                          <span style={{
                            fontWeight: row.bold ? 700 : 500,
                            color: row.green ? "#16a34a" : row.dim ? "#9ca3af" : "#111827",
                            fontVariantNumeric: "tabular-nums",
                          }}>
                            {row.value}
                          </span>
                          {row.sub && <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>{row.sub}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Second disclaimer in results area */}
            {hasInput && (
              <div style={{
                marginTop: 16,
                padding: "12px 16px",
                background: "#fefce8",
                border: "1px solid #fde68a",
                borderRadius: 8,
                fontSize: 12,
                color: "#854d0e",
                lineHeight: 1.6,
              }}>
                <strong>Not tax advice.</strong> This tool uses simplified flat state rates and 2025 federal brackets. It does not account for AMT, additional Medicare surtax on high earners, state-specific deductions, credits, or local taxes. Your actual liability may differ. File with a CPA or use IRS Form 1040-ES for official calculations.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
