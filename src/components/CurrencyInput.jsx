import { useState, useEffect } from "react";

export default function CurrencyInput({ label, value, onChange, subtitle }) {
  const [focused, setFocused] = useState(false);
  const [raw, setRaw] = useState(value === 0 ? "" : String(value));

  useEffect(() => {
    if (!focused) setRaw(value === 0 ? "" : value.toLocaleString("en-US"));
  }, [value, focused]);

  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#8b8f9a", marginBottom: 4 }}>
        {label}
      </label>
      <div style={{
        display: "flex", alignItems: "center",
        border: focused ? "1.5px solid #0e7490" : "1.5px solid #2a2e3a",
        borderRadius: 10, background: focused ? "#2b3142" : "#202535",
        padding: "0 12px", transition: "all .15s",
      }}>
        <span style={{ color: "#8f96a3", fontSize: 15, fontWeight: 500 }}>$</span>
        <input type="text" inputMode="numeric" value={raw} placeholder="0"
          onFocus={() => { setFocused(true); setRaw(value === 0 ? "" : String(value)); }}
          onBlur={() => { setFocused(false); onChange(parseInt(raw.replace(/\D/g, ""), 10) || 0); }}
          onChange={(e) => setRaw(e.target.value.replace(/[^0-9]/g, ""))}
          style={{
            width: "100%", padding: "10px 8px", border: "none", outline: "none",
            fontSize: 15, fontWeight: 600, color: "#e8eaed", background: "transparent",
            fontFamily: "inherit", fontVariantNumeric: "tabular-nums",
          }}
        />
      </div>
      {subtitle && (
        <div style={{ fontSize: 11, color: "#8f96a3", marginTop: 3, lineHeight: 1.4 }}>{subtitle}</div>
      )}
    </div>
  );
}
