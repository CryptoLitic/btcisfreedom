import React from "react";
import { Routes, Route, NavLink } from "react-router-dom";

// Simple placeholder pages
function Dashboard() {
  return <div className="card"><h2>Dashboard</h2><p>BTC is Freedom!</p></div>;
}
function News() {
  return <div className="card"><h2>News</h2><p>Latest Bitcoin news goes here.</p></div>;
}
function DCA() {
  return <div className="card"><h2>DCA & Analysis</h2><p>DCA tools and charts will load here.</p></div>;
}
function FearGreed() {
  return <div className="card"><h2>Fear & Greed</h2><p>Sentiment data will appear here.</p></div>;
}
function Memes() {
  return <div className="card"><h2>Memes</h2><p>Fun Bitcoin memes!</p></div>;
}

// Navigation tabs
const Tab = ({ to, label }) => (
  <NavLink to={to} className={({ isActive }) => "tab" + (isActive ? " active" : "")}>
    {label}
  </NavLink>
);

export default function App() {
  return (
    <div>
      <header>
        <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div className="brand">
            <img
              src="https://cryptologos.cc/logos/bitcoin-btc-logo.png?v=035"
              alt="BTC"
              style={{ height: 32, marginRight: 8 }}
            />
            <h1 style={{ fontSize: 18, margin: 0 }}>BTC is Freedom</h1>
          </div>
        </div>
        <div className="container" style={{ paddingTop: 0, paddingBottom: 16 }}>
          <nav>
            <Tab to="/" label="Dashboard" />
            <Tab to="/news" label="News" />
            <Tab to="/dca" label="DCA & Analysis" />
            <Tab to="/fear-greed" label="Fear & Greed" />
            <Tab to="/memes" label="Memes" />
          </nav>
        </div>
      </header>

      <main className="container" style={{ paddingTop: 16 }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/news" element={<News />} />
          <Route path="/dca" element={<DCA />} />
          <Route path="/fear-greed" element={<FearGreed />} />
          <Route path="/memes" element={<Memes />} />
        </Routes>
      </main>
    </div>
  );
}
