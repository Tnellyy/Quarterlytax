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

export const STANDARD_DEDUCTIONS = {
  single: 15000,
  married_jointly: 30000,
  married_separately: 15000,
  head_of_household: 22500,
};

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

export const PAY_FREQUENCIES = {
  weekly: { label: "Weekly", periods: 52 },
  biweekly: { label: "Every 2 weeks", periods: 26 },
  semimonthly: { label: "Twice a month", periods: 24 },
  monthly: { label: "Monthly", periods: 12 },
};

const SS_WAGE_BASE = 176100;

// ─── Core Tax Calculation ───

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

export function calculateTax({ income, deductions, filingStatus, stateCode, w2Income = 0, w2Withholding = 0 }) {
  const netIncome = Math.max(0, income - deductions);
  const se = calculateSelfEmploymentTax(netIncome);
  const qbi = netIncome * 0.20;
  const agi = netIncome + w2Income - se.deduction;
  const standardDeduction = STANDARD_DEDUCTIONS[filingStatus] || 15000;
  const taxableIncome = Math.max(0, agi - standardDeduction - qbi);
  const federalIncomeTax = calculateFederalTax(taxableIncome, filingStatus);
  const stateRate = STATES[stateCode]?.rate || 0;
  const stateTaxableIncome = Math.max(0, agi - standardDeduction);
  const stateTax = stateTaxableIncome * stateRate;
  const totalFederalTax = federalIncomeTax + se.tax;
  const totalAnnualTax = totalFederalTax + stateTax;
  const afterWithholding = Math.max(0, totalAnnualTax - w2Withholding);

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
    afterWithholding,
    quarterlyPayment: Math.round(afterWithholding / 4),
    monthlySetAside: Math.round(afterWithholding / 12),
    effectiveRate: netIncome + w2Income > 0 ? totalAnnualTax / (netIncome + w2Income) : 0,
    marginalRate: getMarginalRate(taxableIncome, filingStatus),
    quarterlyFederal: Math.round(totalFederalTax / 4),
    quarterlyState: Math.round(stateTax / 4),
    quarterlySE: Math.round(se.tax / 4),
  };
}

// ─── Withholding Offset ───

export function getPaychecksRemaining(payFrequency) {
  const now = new Date();
  const endOfYear = new Date(now.getFullYear(), 11, 31);
  const daysLeft = Math.max(0, Math.ceil((endOfYear - now) / (1000 * 60 * 60 * 24)));
  const freq = PAY_FREQUENCIES[payFrequency];
  if (!freq) return 0;
  const daysBetweenChecks = 365 / freq.periods;
  return Math.max(0, Math.floor(daysLeft / daysBetweenChecks));
}

export function calculateWithholdingOffset({
  totalTaxLiability,
  currentWithholding,
  payFrequency,
  paychecksRemaining,
  w2AnnualIncome,
}) {
  const shortfall = Math.max(0, totalTaxLiability - currentWithholding);

  // No shortfall — withholding already covers liability
  if (shortfall <= 0) {
    return {
      shortfall: 0,
      perPaycheckIncrease: 0,
      offsetType: "no_shortfall",
      reducedQuarterlyPayment: 0,
      grossPerPaycheck: 0,
    };
  }

  const freq = PAY_FREQUENCIES[payFrequency];
  const annualPeriods = freq ? freq.periods : 26;
  const grossPerPaycheck = annualPeriods > 0 ? w2AnnualIncome / annualPeriods : 0;

  // No paychecks remaining — can't offset through withholding
  // UI handles the messaging, but return valid data
  if (paychecksRemaining <= 0) {
    return {
      shortfall,
      perPaycheckIncrease: 0,
      offsetType: "no_paychecks",
      reducedQuarterlyPayment: Math.round(shortfall / 4),
      grossPerPaycheck,
    };
  }

  const fullIncrease = shortfall / paychecksRemaining;
  const maxReasonableIncrease = grossPerPaycheck * 0.50;

  // Full offset — per-paycheck increase is within 50% of gross
  if (fullIncrease <= maxReasonableIncrease && grossPerPaycheck > 0) {
    return {
      shortfall,
      perPaycheckIncrease: Math.round(fullIncrease),
      offsetType: "full_offset",
      reducedQuarterlyPayment: 0,
      grossPerPaycheck,
    };
  }

  // Check for partial offset — cap increase at 30% of gross
  const reasonableIncrease = grossPerPaycheck * 0.30;
  const totalAbsorbed = reasonableIncrease * paychecksRemaining;

  if (totalAbsorbed > shortfall * 0.25 && grossPerPaycheck > 0) {
    // Partial offset covers more than 25% of shortfall — worth recommending
    const remainingShortfall = Math.max(0, shortfall - totalAbsorbed);
    return {
      shortfall,
      perPaycheckIncrease: Math.round(reasonableIncrease),
      offsetType: "partial_offset",
      reducedQuarterlyPayment: Math.round(remainingShortfall / 4),
      grossPerPaycheck,
    };
  }

  // Quarterly payments needed — withholding can't meaningfully help
  return {
    shortfall,
    perPaycheckIncrease: 0,
    offsetType: "quarterly_needed",
    reducedQuarterlyPayment: Math.round(shortfall / 4),
    grossPerPaycheck,
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
