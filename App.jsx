<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>QuarterlyTax — Stop guessing. Start knowing.</title>
<meta name="description" content="The quarterly tax calculator freelancers actually need. Federal + state + SE tax estimates, safe harbor tracking, deadline reminders, and a what-if engine. Free forever. Pro for $4/mo.">
<meta name="keywords" content="freelance quarterly tax calculator, 1099 estimated tax calculator, self employment tax calculator, quarterly estimated tax payments, how much to set aside for taxes freelancer">
<meta property="og:title" content="QuarterlyTax — The quarterly tax tool freelancers actually need">
<meta property="og:description" content="Free quarterly tax calculator with safe harbor tracking, deadline alerts, and what-if modeling. Pro tier is $4/mo — not $16, not $129.">
<meta property="og:type" content="website">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800&family=JetBrains+Mono:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
*, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

:root {
  --green: #15803d;
  --green-50: #f0fdf4;
  --green-100: #dcfce7;
  --green-200: #bbf7d0;
  --green-800: #166534;
  --stone-50: #fafaf9;
  --stone-100: #f5f5f4;
  --stone-200: #e7e5e4;
  --stone-300: #d6d3d1;
  --stone-400: #a8a29e;
  --stone-500: #78716c;
  --stone-600: #57534e;
  --stone-700: #44403c;
  --stone-800: #292524;
  --stone-900: #1c1917;
  --amber-600: #d97706;
  --amber-50: #fffbeb;
  --red-500: #ef4444;
}

body {
  font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
  color: var(--stone-900);
  background: #fff;
  -webkit-font-smoothing: antialiased;
  line-height: 1.6;
  overflow-x: hidden;
}

.mono { font-family: 'JetBrains Mono', monospace; }

/* ─── NAV ─── */
.nav {
  position: sticky; top: 0; z-index: 100;
  background: rgba(255,255,255,0.88);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--stone-200);
}
.nav-inner {
  max-width: 1080px; margin: 0 auto;
  display: flex; align-items: center; justify-content: space-between;
  height: 52px; padding: 0 24px;
}
.logo { font-size: 16px; font-weight: 800; letter-spacing: -0.04em; color: var(--stone-900); text-decoration: none; }
.logo span { color: var(--green); }
.nav-links { display: flex; gap: 20px; align-items: center; }
.nav-links a { font-size: 13px; font-weight: 500; color: var(--stone-500); text-decoration: none; transition: color 0.15s; }
.nav-links a:hover { color: var(--stone-900); }
.btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 7px; font-weight: 700; font-size: 13px; text-decoration: none; transition: all 0.15s; cursor: pointer; border: none; font-family: inherit; }
.btn-primary { background: var(--green); color: #fff; }
.btn-primary:hover { background: var(--green-800); transform: translateY(-0.5px); }
.btn-outline { background: #fff; color: var(--stone-700); border: 1.5px solid var(--stone-300); }
.btn-outline:hover { border-color: var(--stone-900); color: var(--stone-900); }

/* ─── HERO ─── */
.hero {
  max-width: 1080px; margin: 0 auto;
  padding: 72px 24px 0;
  display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: center;
}
.hero-content { max-width: 480px; }
.hero-tag {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 12px; font-weight: 700; color: var(--green);
  background: var(--green-50); border: 1px solid var(--green-200);
  padding: 5px 12px; border-radius: 100px; margin-bottom: 20px;
  letter-spacing: 0.02em;
}
.hero-tag .dot { width: 6px; height: 6px; border-radius: 50%; background: var(--green); }
.hero h1 {
  font-size: 44px; font-weight: 800; letter-spacing: -0.045em;
  line-height: 1.05; margin-bottom: 16px;
}
.hero h1 em { font-style: normal; color: var(--green); }
.hero p { font-size: 16px; color: var(--stone-500); line-height: 1.6; margin-bottom: 28px; }
.hero-actions { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
.hero-note { font-size: 12px; color: var(--stone-400); margin-top: 12px; }

/* Hero visual */
.hero-visual {
  background: var(--stone-50);
  border: 1px solid var(--stone-200);
  border-radius: 14px;
  padding: 28px 24px;
  position: relative;
}
.hv-label { font-size: 11px; font-weight: 700; color: var(--stone-400); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 6px; }
.hv-amount { font-size: 48px; font-weight: 800; letter-spacing: -0.05em; line-height: 1; }
.hv-meta { font-size: 13px; color: var(--stone-400); margin-top: 8px; }
.hv-meta b { color: var(--stone-700); font-weight: 700; }
.hv-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-top: 24px; }
.hv-q {
  background: #fff; border: 1px solid var(--stone-200); border-radius: 8px;
  padding: 12px 10px;
}
.hv-q-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
.hv-q-label { font-size: 11px; font-weight: 800; }
.hv-q-check { width: 14px; height: 14px; border-radius: 3px; background: var(--green-100); border: 1px solid var(--green-200); display: flex; align-items: center; justify-content: center; font-size: 8px; color: var(--green); font-weight: 800; }
.hv-q-amount { font-size: 18px; font-weight: 800; letter-spacing: -0.03em; }
.hv-q-sub { font-size: 10px; color: var(--stone-400); margin-top: 1px; }
.hv-badge {
  display: inline-flex; align-items: center; gap: 5px;
  margin-top: 16px; padding: 5px 12px;
  background: var(--green-50); border: 1px solid var(--green-200);
  border-radius: 100px; font-size: 12px; font-weight: 700; color: var(--green);
}

/* ─── STATS BAR ─── */
.stats-bar {
  max-width: 1080px; margin: 56px auto 0; padding: 0 24px;
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px;
  background: var(--stone-200); border-radius: 10px; overflow: hidden;
}
.stat {
  background: #fff; padding: 24px; text-align: center;
}
.stat-num { font-size: 28px; font-weight: 800; letter-spacing: -0.04em; color: var(--stone-900); }
.stat-label { font-size: 13px; color: var(--stone-500); margin-top: 2px; }

/* ─── PROBLEM ─── */
.problem {
  max-width: 1080px; margin: 0 auto;
  padding: 80px 24px;
}
.section-tag { font-size: 11px; font-weight: 700; color: var(--green); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 10px; }
.problem h2 { font-size: 32px; font-weight: 800; letter-spacing: -0.04em; line-height: 1.1; margin-bottom: 36px; max-width: 560px; }
.problem-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
.pain {
  padding: 20px;
  border: 1px solid var(--stone-200);
  border-radius: 10px;
  background: #fff;
  transition: border-color 0.2s;
}
.pain:hover { border-color: var(--stone-300); }
.pain-icon {
  width: 28px; height: 28px; border-radius: 7px;
  display: flex; align-items: center; justify-content: center;
  font-size: 13px; font-weight: 800; margin-bottom: 12px;
}
.pain-icon.red { background: #fef2f2; color: var(--red-500); }
.pain h3 { font-size: 14px; font-weight: 700; margin-bottom: 4px; letter-spacing: -0.02em; }
.pain p { font-size: 13px; color: var(--stone-500); line-height: 1.5; }

/* ─── FEATURES ─── */
.features {
  background: var(--stone-50);
  border-top: 1px solid var(--stone-200);
  border-bottom: 1px solid var(--stone-200);
  padding: 80px 24px;
}
.features-inner { max-width: 1080px; margin: 0 auto; }
.features h2 { font-size: 32px; font-weight: 800; letter-spacing: -0.04em; line-height: 1.1; margin-bottom: 12px; }
.features > .features-inner > p { font-size: 15px; color: var(--stone-500); margin-bottom: 48px; max-width: 500px; }
.feat-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.feat {
  background: #fff; border: 1px solid var(--stone-200);
  border-radius: 10px; padding: 24px;
  transition: border-color 0.2s, transform 0.2s;
}
.feat:hover { border-color: var(--green-200); transform: translateY(-2px); }
.feat-num {
  width: 24px; height: 24px; border-radius: 6px;
  background: var(--green-50); color: var(--green);
  font-size: 12px; font-weight: 800;
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 14px;
}
.feat h3 { font-size: 15px; font-weight: 700; margin-bottom: 6px; letter-spacing: -0.02em; }
.feat p { font-size: 13px; color: var(--stone-500); line-height: 1.5; }

/* ─── PRICING ─── */
.pricing { max-width: 1080px; margin: 0 auto; padding: 80px 24px; }
.pricing h2 { font-size: 32px; font-weight: 800; letter-spacing: -0.04em; margin-bottom: 8px; text-align: center; }
.pricing-sub { font-size: 15px; color: var(--stone-500); text-align: center; margin-bottom: 48px; }
.price-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; max-width: 700px; margin: 0 auto; }
.price-card { border: 1px solid var(--stone-200); border-radius: 12px; padding: 28px; background: #fff; }
.price-card.pro { border: 2px solid var(--green); position: relative; }
.pro-badge {
  position: absolute; top: -10px; left: 50%; transform: translateX(-50%);
  background: var(--green); color: #fff;
  font-size: 10px; font-weight: 800; padding: 3px 12px;
  border-radius: 100px; text-transform: uppercase; letter-spacing: 0.05em;
}
.price-card h3 { font-size: 15px; font-weight: 700; margin-bottom: 4px; }
.price-amt { font-size: 40px; font-weight: 800; letter-spacing: -0.04em; margin: 6px 0 2px; }
.price-amt span { font-size: 14px; font-weight: 500; color: var(--stone-400); }
.price-term { font-size: 12px; color: var(--stone-400); margin-bottom: 20px; }
.price-list { list-style: none; margin-bottom: 24px; }
.price-list li { font-size: 13px; color: var(--stone-600); padding: 5px 0; display: flex; align-items: center; gap: 8px; }
.chk { width: 15px; height: 15px; border-radius: 50%; background: var(--green-50); color: var(--green); font-size: 9px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-weight: 800; }
.price-btn { display: block; width: 100%; text-align: center; padding: 11px; border-radius: 7px; font-weight: 700; font-size: 13px; text-decoration: none; font-family: inherit; cursor: pointer; transition: all 0.15s; }

/* ─── COMPARE ─── */
.compare { max-width: 700px; margin: 48px auto 0; }
.compare-title { font-size: 13px; font-weight: 700; color: var(--stone-400); text-align: center; margin-bottom: 16px; text-transform: uppercase; letter-spacing: 0.06em; }
table { width: 100%; border-collapse: collapse; font-size: 13px; }
th, td { padding: 10px 14px; text-align: left; border-bottom: 1px solid var(--stone-200); }
th { font-size: 11px; font-weight: 700; color: var(--stone-400); text-transform: uppercase; letter-spacing: 0.06em; background: var(--stone-50); }
.us { color: var(--green); font-weight: 800; }

/* ─── CTA ─── */
.final-cta {
  background: var(--stone-900); color: #fff;
  padding: 72px 24px; text-align: center;
  margin-top: 80px;
}
.final-cta h2 { font-size: 32px; font-weight: 800; letter-spacing: -0.04em; margin-bottom: 12px; }
.final-cta p { font-size: 15px; color: var(--stone-400); margin-bottom: 28px; }
.btn-white { background: #fff; color: var(--stone-900); padding: 14px 28px; font-size: 15px; font-weight: 800; border-radius: 8px; text-decoration: none; display: inline-flex; transition: transform 0.15s, box-shadow 0.15s; }
.btn-white:hover { transform: translateY(-1px); box-shadow: 0 4px 20px rgba(0,0,0,0.2); }

/* ─── FOOTER ─── */
footer {
  border-top: 1px solid var(--stone-200);
  padding: 24px; text-align: center;
  font-size: 11px; color: var(--stone-400);
  line-height: 1.7;
}

/* ─── RESPONSIVE ─── */
@media (max-width: 768px) {
  .hero { grid-template-columns: 1fr; padding: 48px 20px 0; gap: 32px; }
  .hero h1 { font-size: 32px; }
  .hero-content { max-width: 100%; }
  .hv-grid { grid-template-columns: repeat(2, 1fr); }
  .hv-amount { font-size: 36px; }
  .stats-bar { grid-template-columns: 1fr; }
  .problem-grid { grid-template-columns: 1fr; }
  .feat-grid { grid-template-columns: 1fr; }
  .price-grid { grid-template-columns: 1fr; }
  .problem, .features, .pricing { padding: 56px 20px; }
  .nav-links a:not(.btn) { display: none; }
  .problem h2, .features h2, .pricing h2 { font-size: 26px; }
}
@media (max-width: 480px) {
  .hero h1 { font-size: 28px; }
  .hv-grid { grid-template-columns: repeat(2, 1fr); }
}
</style>
</head>
<body>

<!-- NAV -->
<nav class="nav">
  <div class="nav-inner">
    <a href="#" class="logo"><span>Q</span>uarterlyTax</a>
    <div class="nav-links">
      <a href="#features">Features</a>
      <a href="#pricing">Pricing</a>
      <a href="#calculator" class="btn btn-primary">Try free →</a>
    </div>
  </div>
</nav>

<!-- HERO -->
<section class="hero">
  <div class="hero-content">
    <div class="hero-tag"><span class="dot"></span> Free calculator — no signup needed</div>
    <h1>You shouldn't need a CPA to know what you owe <em>every quarter.</em></h1>
    <p>Every freelancer has the same problem four times a year: "How much do I owe the IRS?" QuarterlyTax gives you the number — with safe harbor tracking, deadline alerts, and a what-if engine — so you stop guessing and start paying the right amount.</p>
    <div class="hero-actions">
      <a href="#calculator" class="btn btn-primary" style="padding:12px 24px;font-size:14px;">Calculate your quarterly taxes →</a>
      <a href="#pricing" class="btn btn-outline">See pricing</a>
    </div>
    <div class="hero-note">No signup. No email required. Takes 60 seconds.</div>
  </div>

  <div class="hero-visual">
    <div class="hv-label">Estimated payments due · 2025</div>
    <div class="hv-amount mono">$12,460</div>
    <div class="hv-meta"><b>21.8%</b> effective · <b>22%</b> marginal bracket · <b>$57,200</b> net income</div>
    <div class="hv-grid">
      <div class="hv-q">
        <div class="hv-q-head">
          <span class="hv-q-label">Q1</span>
          <div class="hv-q-check">✓</div>
        </div>
        <div class="hv-q-amount mono">$3,115</div>
        <div class="hv-q-sub">$1,038/mo · Due Apr 15</div>
      </div>
      <div class="hv-q">
        <div class="hv-q-head">
          <span class="hv-q-label">Q2</span>
          <div class="hv-q-check">✓</div>
        </div>
        <div class="hv-q-amount mono">$3,115</div>
        <div class="hv-q-sub">$1,038/mo · Due Jun 16</div>
      </div>
      <div class="hv-q">
        <div class="hv-q-head">
          <span class="hv-q-label">Q3</span>
          <div class="hv-q-check" style="background:transparent;border-color:var(--stone-200);"></div>
        </div>
        <div class="hv-q-amount mono">$3,115</div>
        <div class="hv-q-sub">$1,038/mo · Due Sep 15</div>
      </div>
      <div class="hv-q">
        <div class="hv-q-head">
          <span class="hv-q-label">Q4</span>
          <div class="hv-q-check" style="background:transparent;border-color:var(--stone-200);"></div>
        </div>
        <div class="hv-q-amount mono">$3,115</div>
        <div class="hv-q-sub">$1,038/mo · Due Jan 15</div>
      </div>
    </div>
    <div class="hv-badge">✓ Safe harbor — penalty-protected this year</div>
  </div>
</section>

<!-- STATS -->
<div class="stats-bar">
  <div class="stat">
    <div class="stat-num mono">30%</div>
    <div class="stat-label">of freelancers overpay quarterly taxes</div>
  </div>
  <div class="stat">
    <div class="stat-num mono">$850</div>
    <div class="stat-label">average overpayment per year</div>
  </div>
  <div class="stat">
    <div class="stat-num mono">60 sec</div>
    <div class="stat-label">to know what you actually owe</div>
  </div>
</div>

<!-- PROBLEM -->
<section class="problem">
  <div class="section-tag">The problem</div>
  <h2>Quarterly taxes are four panic attacks a year.</h2>
  <div class="problem-grid">
    <div class="pain">
      <div class="pain-icon red">✕</div>
      <h3>Guessing and hoping</h3>
      <p>"I just picked a number last quarter and overpaid by $800. Then underpaid Q3 and got a penalty." You're not alone — most freelancers are guessing.</p>
    </div>
    <div class="pain">
      <div class="pain-icon red">✕</div>
      <h3>One-shot calculators</h3>
      <p>"I used a free calculator but it didn't save anything. Next quarter I started from scratch." Free tools give you a number and vanish.</p>
    </div>
    <div class="pain">
      <div class="pain-icon red">✕</div>
      <h3>Missed deadlines</h3>
      <p>"I forgot the June deadline completely. The IRS charged me a penalty on top of what I already owed." Nobody should pay a penalty for forgetting a date.</p>
    </div>
    <div class="pain">
      <div class="pain-icon red">✕</div>
      <h3>Paying for tools you don't need</h3>
      <p>"Keeper wants $16/month. TurboTax wants $129/year. I don't need expense tracking or tax filing. I just need to know what to set aside."</p>
    </div>
  </div>
</section>

<!-- FEATURES -->
<section class="features" id="features">
  <div class="features-inner">
    <div class="section-tag">What you get</div>
    <h2>Not a tax app. A tax answer.</h2>
    <p>Eight tools that do what your CPA does — minus the $300/hour and the three-week wait.</p>

    <div class="feat-grid">
      <div class="feat">
        <div class="feat-num">1</div>
        <h3>Real bracket math</h3>
        <p>2025 federal brackets, self-employment tax (15.3%), QBI deduction, and simplified state rates for all 50 states + DC. Not a napkin estimate.</p>
      </div>
      <div class="feat">
        <div class="feat-num">2</div>
        <h3>Safe harbor tracking</h3>
        <p>Enter last year's total tax. We tell you if your payments are penalty-protected — or exactly how much more you need. The #1 thing freelancers don't know about.</p>
      </div>
      <div class="feat">
        <div class="feat-num">3</div>
        <h3>Monthly set-aside</h3>
        <p>Every quarter's payment divided by 3. Because freelancers budget monthly, not quarterly. See "$412/month" instead of "$1,236 due June 15."</p>
      </div>
      <div class="feat">
        <div class="feat-num">4</div>
        <h3>Deadline countdown</h3>
        <p>"Q2 payment due in 23 days" — with color-coded urgency. Green when you have time. Red when you don't. Never miss an IRS deadline again.</p>
      </div>
      <div class="feat">
        <div class="feat-num">5</div>
        <h3>What-if engine</h3>
        <p>Drag a slider to see how your tax changes if you earn more or less next quarter. Instant answers to "if I make $10K more, how much more tax?"</p>
      </div>
      <div class="feat">
        <div class="feat-num">6</div>
        <h3>Deduction finder</h3>
        <p>If your deductions are below average, we flag it. "Most freelancers deduct 15-25%. Are you missing home office, software, or health insurance?"</p>
      </div>
      <div class="feat">
        <div class="feat-num">7</div>
        <h3>W-2 offset</h3>
        <p>Side-hustling with a day job? Enter your W-2 withholding. We subtract it from your quarterly payments so you don't double-pay.</p>
      </div>
      <div class="feat">
        <div class="feat-num">8</div>
        <h3>Effective vs marginal</h3>
        <p>"You're in the 22% bracket, but you actually pay 16.3%." One sentence that prevents the most common freelancer mistake: hoarding 30% of every check.</p>
      </div>
      <div class="feat">
        <div class="feat-num">⬇</div>
        <h3>Export &amp; track</h3>
        <p>Download your estimate as a text file. Check off quarters you've already paid. See how much is left at a glance. Send it to your spouse or CPA.</p>
      </div>
    </div>
  </div>
</section>

<!-- PRICING -->
<section class="pricing" id="pricing">
  <div class="section-tag" style="text-align:center;">Pricing</div>
  <h2>One tool. One job. One fair price.</h2>
  <div class="pricing-sub">No expense tracking. No receipt scanning. No tax filing. Just the number you owe.</div>

  <div class="price-grid">
    <div class="price-card">
      <h3>Free</h3>
      <div class="price-amt mono">$0</div>
      <div class="price-term">Free forever. No account needed.</div>
      <ul class="price-list">
        <li><span class="chk">✓</span>Unlimited calculations</li>
        <li><span class="chk">✓</span>Federal + SE + state tax</li>
        <li><span class="chk">✓</span>Safe harbor check</li>
        <li><span class="chk">✓</span>What-if engine</li>
        <li><span class="chk">✓</span>Deduction finder</li>
        <li><span class="chk">✓</span>Export estimate</li>
        <li><span class="chk">✓</span>IRS Direct Pay link</li>
      </ul>
      <a href="#calculator" class="price-btn btn-outline">Use free calculator</a>
    </div>
    <div class="price-card pro">
      <div class="pro-badge">Best value</div>
      <h3>Pro</h3>
      <div class="price-amt mono">$4<span>/mo</span></div>
      <div class="price-term">or $39/year (save 19%)</div>
      <ul class="price-list">
        <li><span class="chk">✓</span>Everything in Free</li>
        <li><span class="chk">✓</span>Saved quarterly history</li>
        <li><span class="chk">✓</span>Year-at-a-glance dashboard</li>
        <li><span class="chk">✓</span>Email reminders before every deadline</li>
        <li><span class="chk">✓</span>Quarter-over-quarter comparison</li>
        <li><span class="chk">✓</span>Priority support</li>
      </ul>
      <a href="#" class="price-btn btn-primary" style="display:block;">Start 14-day free trial</a>
    </div>
  </div>

  <div class="compare">
    <div class="compare-title">Why pay $16–$129 for tools that do too much?</div>
    <table>
      <thead>
        <tr><th>Tool</th><th>Price</th><th>Quarterly est.</th><th>Safe harbor</th><th>Reminders</th></tr>
      </thead>
      <tbody>
        <tr><td class="us">QuarterlyTax</td><td class="us">$4/mo</td><td>✓</td><td>✓</td><td>✓</td></tr>
        <tr><td>Keeper Tax</td><td>$16/mo</td><td>✓ (basic)</td><td>✕</td><td>✕</td></tr>
        <tr><td>TurboTax SE</td><td>$129/yr</td><td>✓</td><td>✕</td><td>✕</td></tr>
        <tr><td>Plutio</td><td>$19/mo</td><td>✓ (basic)</td><td>✕</td><td>✕</td></tr>
        <tr><td>IRS 1040-ES</td><td>Free</td><td>Paper form</td><td>Manual</td><td>✕</td></tr>
      </tbody>
    </table>
  </div>
</section>

<!-- CTA -->
<section class="final-cta" id="calculator">
  <h2>Know what you owe before the IRS tells you.</h2>
  <p>Free calculator. 60 seconds. No signup, no email, no nonsense.</p>
  <a href="#" class="btn-white">Open free calculator →</a>
</section>

<!-- FOOTER -->
<footer>
  <p>QuarterlyTax is not a tax advisor. Estimates use simplified 2025 federal brackets and flat state rates. Not a substitute for professional tax advice. Consult a CPA for your specific situation.</p>
  <p style="margin-top:6px;">© 2025 QuarterlyTax</p>
</footer>

</body>
</html>
