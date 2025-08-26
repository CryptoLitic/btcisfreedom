import React from "react";

export default function Sparkline({ points = [], width = 800, height = 220, stroke = "#f7931a" }) {
  if (!points.length) return <div className="muted">No data</div>;

  const ys = points.map((p) => p);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const pad = 8;

  const scaleX = (i) => pad + (i * (width - pad * 2)) / (points.length - 1);
  const scaleY = (y) => {
    if (maxY === minY) return height / 2;
    return pad + ((maxY - y) * (height - pad * 2)) / (maxY - minY);
  };

  const d = points
    .map((y, i) => `${i === 0 ? "M" : "L"} ${scaleX(i)},${scaleY(y)}`)
    .join(" ");

  return (
    <div>
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="auto" style={{ display: "block" }}>
        <path
          d={`${d} L ${scaleX(points.length - 1)},${height - pad} L ${scaleX(0)},${height - pad} Z`}
          fill="rgba(247,147,26,0.08)"
          stroke="none"
        />
        <path d={d} fill="none" stroke={stroke} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      </svg>
      <div className="muted" style={{ display: "flex", gap: 12, fontSize: 12 }}>
        <div>Low: ${minY.toLocaleString()}</div>
        <div>High: ${maxY.toLocaleString()}</div>
        <div>Last: ${points[points.length - 1].toLocaleString()}</div>
      </div>
    </div>
  );
}
