import { useState, useEffect } from "react";

export default function AuthModal({ open, onClose, auth }) {
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);

  // Determine which view to show
  const showCheckout = auth.isAuthenticated && !auth.isPaid && auth.subscriptionStatus !== "loading";
  const showAuth = !auth.isAuthenticated;

  // Reset form state when modal opens
  useEffect(() => {
    if (open) {
      setError("");
      setLoading(false);
      setCheckoutLoading(false);
      setPortalLoading(false);
    }
  }, [open]);

  if (!open) return null;

  const handleClose = () => {
    setError("");
    setEmail("");
    setPassword("");
    setLoading(false);
    setCheckoutLoading(false);
    setPortalLoading(false);
    onClose();
  };

  const handleAuth = async () => {
    setError("");
    if (!email || !password) { setError("Email and password are required."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }

    setLoading(true);
    const { error: authError } = mode === "signup"
      ? await auth.signUp(email, password)
      : await auth.signIn(email, password);
    setLoading(false);

    if (authError) {
      setError(authError.message);
    }
  };

  const handleCheckout = async () => {
    setError("");
    setCheckoutLoading(true);

    try {
      const token = auth.session?.access_token;
      if (!token) {
        setError("Session expired. Please sign in again.");
        setCheckoutLoading(false);
        return;
      }

      const res = await fetch("/api/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok || !data.url) {
        setError(data.error || "Failed to start checkout. Please try again.");
        setCheckoutLoading(false);
        return;
      }

      window.location.href = data.url;
    } catch (err) {
      setError("Something went wrong. Please try again.");
      setCheckoutLoading(false);
    }
  };

  const handlePortal = async () => {
    setError("");
    setPortalLoading(true);

    try {
      const token = auth.session?.access_token;
      if (!token) {
        setError("Session expired. Please sign in again.");
        setPortalLoading(false);
        return;
      }

      const res = await fetch("/api/create-portal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok || !data.url) {
        setError(data.error || "Failed to open billing portal. Please try again.");
        setPortalLoading(false);
        return;
      }

      window.location.href = data.url;
    } catch (err) {
      setError("Something went wrong. Please try again.");
      setPortalLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !loading) handleAuth();
  };

  const inputStyle = {
    width: "100%", padding: "12px 14px", fontSize: 14, fontWeight: 500,
    color: "#e8eaed", background: "#202535", border: "1.5px solid #2a2e3a",
    borderRadius: 10, outline: "none", fontFamily: "inherit",
    transition: "border-color .15s",
  };

  return (
    <div onClick={handleClose} style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,.7)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 100, padding: 20,
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: "#181b23", border: "1px solid #2a2e3a",
        borderRadius: 16, padding: "32px 28px",
        maxWidth: 380, width: "100%", position: "relative",
      }}>
        <button onClick={handleClose} style={{
          position: "absolute", top: 14, right: 14,
          background: "none", border: "none", fontSize: 18, color: "#8f96a3", cursor: "pointer",
        }}>✕</button>

        {/* ── CHECKOUT PROMPT (authenticated, not paid) ── */}
        {showCheckout && (
          <>
            <div style={{ marginBottom: 22 }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: "#e8eaed", letterSpacing: "-.02em", marginBottom: 5 }}>
                Start tracking with QuarterlyTax Pro
              </div>
              <div style={{ fontSize: 13, color: "#8b8f9a", lineHeight: 1.5 }}>
                Save your payment history across sessions, get deadline reminders, and track every quarter — $4/month.
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 22 }}>
              {[
                { t: "Saved quarterly history", s: "Your inputs and results persist across sessions" },
                { t: "Deadline reminders", s: "Email alerts before each IRS due date" },
                { t: "Quarter-by-quarter tracking", s: "See how your tax obligation changes over time" },
              ].map((b, i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <div style={{
                    width: 18, height: 18, borderRadius: 5, background: "#0a2e23",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0, marginTop: 1,
                  }}>
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                      <path d="M2.5 6l2.5 2.5 5-5" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#e8eaed" }}>{b.t}</div>
                    <div style={{ fontSize: 11, color: "#8b8f9a", marginTop: 1 }}>{b.s}</div>
                  </div>
                </div>
              ))}
            </div>

            {error && (
              <div style={{
                fontSize: 13, color: "#f87171", background: "#2d0a0a", border: "1px solid #450a0a",
                borderRadius: 8, padding: "10px 12px", marginBottom: 14, lineHeight: 1.4,
              }}>{error}</div>
            )}

            <button
              onClick={handleCheckout}
              disabled={checkoutLoading}
              style={{
                width: "100%", padding: "13px", fontSize: 15, fontWeight: 800,
                color: "#0f1117", background: checkoutLoading ? "#0e7490aa" : "#0ea5c9",
                border: "none", borderRadius: 10, cursor: checkoutLoading ? "default" : "pointer",
                fontFamily: "inherit", marginBottom: 10, transition: "background .15s",
              }}
            >
              {checkoutLoading ? "Redirecting to checkout…" : "Start tracking — $4/month"}
            </button>

            <div style={{ fontSize: 11, color: "#8f96a3", textAlign: "center", marginBottom: 10 }}>
              Cancel anytime. No commitment.
            </div>

            <button onClick={handleClose} style={{
              width: "100%", padding: "8px", background: "none", border: "none",
              fontSize: 13, color: "#8f96a3", cursor: "pointer", fontFamily: "inherit",
            }}>Not now</button>
          </>
        )}

        {/* ── AUTH FORM (not authenticated) ── */}
        {showAuth && (
          <>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: "#e8eaed", letterSpacing: "-.02em", marginBottom: 4 }}>
                {mode === "signup" ? "Create your account" : "Sign in to QuarterlyTax"}
              </div>
              <div style={{ fontSize: 13, color: "#8b8f9a", lineHeight: 1.5 }}>
                {mode === "signup"
                  ? "Save your payment history and get deadline reminders."
                  : "Welcome back. Your saved data is ready."}
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#8b8f9a", marginBottom: 4 }}>Email</label>
              <input
                type="email" value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="you@email.com"
                autoComplete="email"
                style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = "#0e7490"}
                onBlur={(e) => e.target.style.borderColor = "#2a2e3a"}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#8b8f9a", marginBottom: 4 }}>Password</label>
              <input
                type="password" value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="At least 6 characters"
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = "#0e7490"}
                onBlur={(e) => e.target.style.borderColor = "#2a2e3a"}
              />
            </div>

            {error && (
              <div style={{
                fontSize: 13, color: "#f87171", background: "#2d0a0a", border: "1px solid #450a0a",
                borderRadius: 8, padding: "10px 12px", marginBottom: 16, lineHeight: 1.4,
              }}>{error}</div>
            )}

            <button
              onClick={handleAuth}
              disabled={loading}
              style={{
                width: "100%", padding: "13px", fontSize: 15, fontWeight: 800,
                color: "#0f1117", background: loading ? "#0e7490aa" : "#0ea5c9",
                border: "none", borderRadius: 10, cursor: loading ? "default" : "pointer",
                fontFamily: "inherit", marginBottom: 14, transition: "background .15s",
              }}
            >
              {loading ? "…" : mode === "signup" ? "Create account" : "Sign in"}
            </button>

            <div style={{ textAlign: "center", fontSize: 13, color: "#8b8f9a" }}>
              {mode === "signup" ? (
                <>Already have an account?{" "}
                  <button onClick={() => { setMode("signin"); setError(""); }} style={{
                    background: "none", border: "none", color: "#0ea5c9", fontWeight: 600,
                    cursor: "pointer", fontFamily: "inherit", fontSize: 13,
                  }}>Sign in</button>
                </>
              ) : (
                <>Don't have an account?{" "}
                  <button onClick={() => { setMode("signup"); setError(""); }} style={{
                    background: "none", border: "none", color: "#0ea5c9", fontWeight: 600,
                    cursor: "pointer", fontFamily: "inherit", fontSize: 13,
                  }}>Create one</button>
                </>
              )}
            </div>
          </>
        )}

        {/* ── ALREADY PAID ── */}
        {auth.isAuthenticated && auth.isPaid && (
          <div style={{ textAlign: "center", padding: "12px 0" }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: "#0a2e23", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M4 10l4 4 8-8" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#e8eaed", marginBottom: 6 }}>You're all set</div>
            <div style={{ fontSize: 13, color: "#8b8f9a", marginBottom: 20, lineHeight: 1.6 }}>
              Your QuarterlyTax Pro subscription is active.
            </div>

            {error && (
              <div style={{
                fontSize: 13, color: "#f87171", background: "#2d0a0a", border: "1px solid #450a0a",
                borderRadius: 8, padding: "10px 12px", marginBottom: 14, lineHeight: 1.4, textAlign: "left",
              }}>{error}</div>
            )}

            <button onClick={handleClose} style={{
              width: "100%", padding: "12px", background: "#202535", color: "#e8eaed",
              borderRadius: 10, fontWeight: 700, fontSize: 14, border: "1px solid #2a2e3a",
              cursor: "pointer", fontFamily: "inherit", marginBottom: 10,
            }}>Close</button>

            <button
              onClick={handlePortal}
              disabled={portalLoading}
              style={{
                width: "100%", padding: "10px", background: "none", border: "none",
                fontSize: 13, color: "#8f96a3", cursor: portalLoading ? "default" : "pointer",
                fontFamily: "inherit",
              }}
            >
              {portalLoading ? "Opening billing portal…" : "Manage billing"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
