import { useState } from "react";

export default function AuthModal({ open, onClose, auth }) {
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleClose = () => {
    setError("");
    setEmail("");
    setPassword("");
    setLoading(false);
    onClose();
  };

  const handleSubmit = async () => {
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
    } else {
      handleClose();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !loading) handleSubmit();
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
        {/* Close */}
        <button onClick={handleClose} style={{
          position: "absolute", top: 14, right: 14,
          background: "none", border: "none", fontSize: 18, color: "#8f96a3", cursor: "pointer",
        }}>✕</button>

        {/* Header */}
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

        {/* Email */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#8b8f9a", marginBottom: 4 }}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="you@email.com"
            autoComplete="email"
            style={inputStyle}
            onFocus={(e) => e.target.style.borderColor = "#0e7490"}
            onBlur={(e) => e.target.style.borderColor = "#2a2e3a"}
          />
        </div>

        {/* Password */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#8b8f9a", marginBottom: 4 }}>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="At least 6 characters"
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            style={inputStyle}
            onFocus={(e) => e.target.style.borderColor = "#0e7490"}
            onBlur={(e) => e.target.style.borderColor = "#2a2e3a"}
          />
        </div>

        {/* Error */}
        {error && (
          <div style={{
            fontSize: 13, color: "#f87171", background: "#2d0a0a", border: "1px solid #450a0a",
            borderRadius: 8, padding: "10px 12px", marginBottom: 16, lineHeight: 1.4,
          }}>
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width: "100%", padding: "13px", fontSize: 15, fontWeight: 800,
            color: "#0f1117", background: loading ? "#0e7490aa" : "#0ea5c9",
            border: "none", borderRadius: 10, cursor: loading ? "default" : "pointer",
            fontFamily: "inherit", marginBottom: 14, transition: "background .15s",
          }}
        >
          {loading
            ? "…"
            : mode === "signup" ? "Create account" : "Sign in"}
        </button>

        {/* Mode toggle */}
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
      </div>
    </div>
  );
}
