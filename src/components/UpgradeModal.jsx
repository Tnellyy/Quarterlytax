import { useState } from "react";

export default function UpgradeModal({ open, onClose }) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (!open) return null;

  const handleClose = () => { setSubmitted(false); setEmail(""); onClose(); };

  return (
    <div onClick={handleClose} style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,.7)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 100, padding: 20,
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: "#181b23", border: "1px solid #2a2e3a",
        borderRadius: 16, padding: "32px 28px",
        maxWidth: 400, width: "100%", position: "relative",
      }}>
        <button onClick={handleClose} style={{
          position: "absolute", top: 14, right: 14,
          background: "none", border: "none", fontSize: 18, color: "#8a919d", cursor: "pointer",
        }}>✕</button>

        {submitted ? (
          <div style={{ textAlign: "center", padding: "12px 0" }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: "#0a2e23", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M4 10l4 4 8-8" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#e8eaed", marginBottom: 6 }}>You're on the list</div>
            <div style={{ fontSize: 13, color: "#8b8f9a", marginBottom: 20, lineHeight: 1.6 }}>
              We'll email <strong style={{ color: "#e8eaed" }}>{email}</strong> when payment tracking goes live.
            </div>
            <button onClick={handleClose} style={{
              width: "100%", padding: "12px", background: "#202535", color: "#e8eaed",
              borderRadius: 10, fontWeight: 700, fontSize: 14, border: "1px solid #2a2e3a",
              cursor: "pointer", fontFamily: "inherit",
            }}>Close</button>
          </div>
        ) : (
          <>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#e8eaed", letterSpacing: "-.02em", marginBottom: 5 }}>
              Payment tracking is coming
            </div>
            <div style={{ fontSize: 13, color: "#8b8f9a", marginBottom: 20, lineHeight: 1.6 }}>
              Saved quarters, deadline reminders, and quarter-by-quarter tracking — all for $4/month. Get notified when it launches.
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

            <div style={{
              display: "flex", gap: 8, marginBottom: 10,
              border: "1.5px solid #2a2e3a", borderRadius: 10,
              background: "#202535", padding: "3px 3px 3px 14px",
              alignItems: "center",
            }}>
              <input
                type="email" value={email} placeholder="you@email.com"
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  flex: 1, border: "none", outline: "none", background: "transparent",
                  color: "#e8eaed", fontSize: 14, fontFamily: "inherit", padding: "8px 0",
                }}
              />
              <button
                onClick={() => { if (email.includes("@")) setSubmitted(true); }}
                disabled={!email.includes("@")}
                style={{
                  padding: "10px 18px", background: email.includes("@") ? "#0ea5c9" : "#2a2e3a",
                  color: email.includes("@") ? "#0f1117" : "#6b7280",
                  borderRadius: 8, fontWeight: 800, fontSize: 13, border: "none",
                  cursor: email.includes("@") ? "pointer" : "default", fontFamily: "inherit",
                  transition: "all .15s", flexShrink: 0,
                }}
              >Join waitlist</button>
            </div>

            <div style={{ fontSize: 11, color: "#8a919d", textAlign: "center", marginBottom: 10 }}>
              We'll only email you when tracking launches.
            </div>
            <button onClick={handleClose} style={{
              width: "100%", padding: "8px", background: "none", border: "none",
              fontSize: 13, color: "#8a919d", cursor: "pointer", fontFamily: "inherit",
            }}>Not now</button>
          </>
        )}
      </div>
    </div>
  );
}
