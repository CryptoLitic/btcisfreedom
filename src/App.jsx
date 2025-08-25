import React from "react";
import ReactDOM from "react-dom/client";

const Box = () => (
  <div style={{
    margin:"40px",
    padding:"20px",
    border:"2px solid #0f0",
    borderRadius:"12px",
    background:"#111",
    color:"#0f0",
    fontFamily:"monospace"
  }}>
    <h1>BTC is Freedom — Smoke Test</h1>
    <p>If you can read this, React is running and the bundle is loading.</p>
  </div>
);

ReactDOM.createRoot(document.getElementById("root")).render(<Box />);
