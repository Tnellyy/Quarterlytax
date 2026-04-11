import { useState, useEffect } from "react";

export default function CurrencyInput({ label, value, onChange, subtitle }) {
  const [focused, setFocused] = useState(false);
  const [raw, setRaw] = useState(value === 0 ? "" : String(value));

  useEffect(() => {
    if (!focused) setRaw(value === 0 ? "" : value.toLocaleString("en-US"));
  }, [value, focused]);

  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 5 }}>
        {label}
      </label>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          border: focused ? "1.5px solid #0e7490" : "1.5px solid #e5e7eb",
          borderRadius: 10,
          background: focused ? "#fff" : "#f9fafb",
          padding: "0 14px",
          transition: "all .15s",
        }}
      >
        <span style={{ color: "#9ca3af", fontSize: 15, fontWeight: 500 }}>$</span>
        <input
          type="text"
          inputMode="numeric"
          value={raw}
          placeholder="0"
          onFocus={() => {
            setFocused(true);
            setRaw(value === 0 ? "" : String(value));
          }}
          onBlur={() => {
            setFocused(false);
            onChange(parseInt(raw.replace(/\D/g, ""), 10) || 0);
          }}
          onChange={(e) => setRaw(e.target.value.replace(/[^0-9]/g, ""))}
          style={{
            width: "100%",
            padding: "12px 8px",
            border: "none",
            outline: "none",
            fontSize: 15,
            fontWeight: 600,
            color: "#111827",
            background: "transparent",
            fontFamily: "inherit",
            fontVariantNumeric: "tabular-nums",
          }}
        />
      </div>
      {subtitle && (
        <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 4, lineHeight: 1.4 }}>{subtitle}</div>
      )}
    </div>
  );
}
