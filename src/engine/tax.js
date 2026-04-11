// ─── 2025 Federal Tax Brackets ───
export const BRACKETS = {
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

// ─── Standard Deductions ───
export const STANDARD_DEDUCTIONS = {
  single: 15000,
  married_jointly: 30000,
  married_separately: 15000,
  head_of_household: 22500,
};

// ─── State Tax Rates (simplified flat) ───
export const STATES = {
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

// ─── IRS Deadlines ───
export const DEADLINES = [
  { quarter: "Q1", due: "Apr 15", date: new Date(2025, 3, 15) },
  { quarter: "Q2", due: "Jun 16", date: new Date(2025, 5, 16) },
  { quarter: "Q3", due: "Sep 15", date: new Date(2025, 8, 15) },
  { quarter: "Q4", due: "Jan 15", date: new Date(2026, 0, 15) },
];

export const FILING_LABELS = {
  single: "Single",
  married_jointly: "Married filing jointly",
  married_separately: "Married filing separately",
  head_of_household: "Head of household",
};

const SS_WAGE_BASE = 176100;

// ─── Pure Calculation Functions ───

export function calculateFederalTax(taxableIncome, status) {
  const brackets = BRACKETS[status];
  if (!brackets) return 0;
  let tax = 0;
  for (const b of brackets) {
    if (taxableIncome <= b.min) break;
    tax += (Math.min(taxableIncome, b.max) - b.min) * b.rate;
  }
  return tax;
}

export function calculateSelfEmploymentTax(netIncome) {
  const taxableBase = netIncome * 0.9235;
  if (taxableBase <= 0) return { tax: 0, deduction: 0 };
  const ss = Math.min(taxableBase, SS_WAGE_BASE) * 0.124;
  const medicare = taxableBase * 0.029;
  const additionalMedicare = Math.max(0, taxableBase - 200000) * 0.009;
  const total = ss + medicare + additionalMedicare;
  return { tax: total, deduction: total / 2 };
}

export function getMarginalRate(taxableIncome, status) {
  const brackets = BRACKETS[status];
  if (!brackets) return 0;
  for (let i = brackets.length - 1; i >= 0; i--) {
    if (taxableIncome > brackets[i].min) return brackets[i].rate;
  }
  return brackets[0].rate;
}

export function getNextDeadline() {
  const now = new Date();
  for (const d of DEADLINES) {
    if (d.date > now) return d;
  }
  return DEADLINES[0];
}

export function daysUntilDeadline(deadline) {
  return Math.max(0, Math.ceil((deadline.date - new Date()) / (1000 * 60 * 60 * 24)));
}

export function getUrgencyColor(days) {
  if (days > 30) return "#10b981";
  if (days > 14) return "#f59e0b";
  return "#ef4444";
}

// ─── Main Entry Point ───

export function calculateTax({ income, deductions, filingStatus, stateCode }) {
  const netIncome = Math.max(0, income - deductions);
  const se = calculateSelfEmploymentTax(netIncome);
  const qbi = netIncome * 0.20;
  const agi = netIncome - se.deduction;
  const standardDeduction = STANDARD_DEDUCTIONS[filingStatus] || 15000;
  const taxableIncome = Math.max(0, agi - standardDeduction - qbi);
  const federalIncomeTax = calculateFederalTax(taxableIncome, filingStatus);
  const stateRate = STATES[stateCode]?.rate || 0;
  const stateTaxableIncome = Math.max(0, agi - standardDeduction);
  const stateTax = stateTaxableIncome * stateRate;
  const totalFederalTax = federalIncomeTax + se.tax;
  const totalAnnualTax = totalFederalTax + stateTax;

  return {
    grossIncome: income,
    netIncome,
    selfEmploymentTax: se.tax,
    selfEmploymentDeduction: se.deduction,
    agi,
    qualifiedBusinessDeduction: qbi,
    standardDeduction,
    taxableIncome,
    federalIncomeTax,
    stateTax,
    totalAnnualTax,
    quarterlyPayment: Math.round(totalAnnualTax / 4),
    monthlySetAside: Math.round(totalAnnualTax / 12),
    effectiveRate: netIncome > 0 ? totalAnnualTax / netIncome : 0,
    marginalRate: getMarginalRate(taxableIncome, filingStatus),
    quarterlyFederal: Math.round(totalFederalTax / 4),
    quarterlyState: Math.round(stateTax / 4),
    quarterlySE: Math.round(se.tax / 4),
  };
}

// ─── Formatting ───

export function formatUSD(n) {
  return "$" + Math.round(n).toLocaleString("en-US");
}

export function formatPct(n) {
  return (n * 100).toFixed(1) + "%";
}

export function getSortedStates() {
  return Object.entries(STATES).sort((a, b) => a[1].name.localeCompare(b[1].name));
}
