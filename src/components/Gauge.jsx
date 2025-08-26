import React from "react";

export default function Gauge({ score = 50, labels = ['Fear','Neutral','Greed'] }) {
  const clamped = Math.max(0, Math.min(100, score));
  const angle = -90 + (clamped * 180) / 100;

  return (
    <div style={{ display: "grid", placeItems: "center" }}>
      <div style={{ position: "relative", width: 260, height: 130 }}>
        <svg viewBox="0 0 240 120" width="260" height="130">
          <defs>
            <linearGradient id="g1" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#ff5c5c"/>
              <stop offset="50%" stopColor="#f7931a"/>
              <stop offset="100%" stopColor="#17c964"/>
            </linearGradient>
          </defs>
          <path d="M20 120 A100 100 0 0 1 220 120" fill="none" stroke="#1e293b" strokeWidth="18" />
          <path d="M20 120 A100 100 0 0 1 220 120" fill="none" stroke="url(#g1)" strokeWidth="10" />
          <g transform={`translate(120,120) rotate(${angle})`}>
            <line x1="0" y1="0" x2="0" y2="-92" stroke="white" strokeWidth="3" />
            <circle cx="0" cy="0" r="5" fill="white" />
          </g>
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", paddingTop: 20 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: 800 }}>{clamped}</div>
            <div className="muted" style={{ fontSize: 12 }}>
              {clamped < 45 ? labels[0] : clamped > 55 ? labels[2] : labels[1]}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
