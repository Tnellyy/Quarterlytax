import { useState, useEffect } from "react";

const C = {
  panel2: "#1B2230", panelHover: "#222B3A", border: "#2A3442",
  textMain: "#F4F7FA", textMuted: "#A7B0BD", textDim: "#6E7886",
  teal: "#14B8D6",
};

export default function CurrencyInput({ label, value, onChange, subtitle }) {
  const [focused, setFocused] = useState(false);
  const [raw, setRaw] = useState(value === 0 ? "" : String(value));

  useEffect(() => {
    if (!focused) setRaw(value === 0 ? "" : value.toLocaleString("en-US"));
  }, [value, focused]);

  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.textMuted, marginBottom: 5 }}>
        {label}
      </label>
      <div style={{
        display: "flex", alignItems: "center",
        border: focused ? `1.5px solid ${C.teal}` : `1.5px solid ${C.border}`,
        borderRadius: 10, background: focused ? C.panelHover : C.panel2,
        padding: "0 12px", transition: "all .15s",
      }}>
        <span style={{ color: C.textDim, fontSize: 15, fontWeight: 600 }}>$</span>
        <input type="text" inputMode="numeric" value={raw} placeholder="0"
          onFocus={() => { setFocused(true); setRaw(value === 0 ? "" : String(value)); }}
          onBlur={() => { setFocused(false); onChange(parseInt(raw.replace(/\D/g, ""), 10) || 0); }}
          onChange={(e) => setRaw(e.target.value.replace(/[^0-9]/g, ""))}
          style={{
            width: "100%", padding: "11px 8px", border: "none", outline: "none",
            fontSize: 15, fontWeight: 600, color: C.textMain, background: "transparent",
            fontFamily: "inherit", fontVariantNumeric: "tabular-nums",
          }}
        />
      </div>
      {subtitle && (
        <div style={{ fontSize: 11, color: C.textDim, marginTop: 4, lineHeight: 1.4 }}>{subtitle}</div>
      )}
    </div>
  );
}
