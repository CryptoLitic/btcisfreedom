import React from "react";
import { Routes, Route, NavLink } from "react-router-dom";
import Dashboard from "./pages/Dashboard.jsx";
import News from "./pages/News.jsx";
import DCA from "./pages/DCA.jsx";
import FearGreed from "./pages/FearGreed.jsx";

const Tab = ({ to, label }) => (
  <NavLink to={to} className={({ isActive }) => "tab" + (isActive ? " active" : "")}>
    {label}
  </NavLink>
);

export default function App() {
  return (
    <div>
      <header>
        <div className="container topbar">
          <div className="brand">
            <img src="/assets/btcisfreedom-header.jpg" className="brand-logo" alt="BTC is Freedom logo" />
            <h1>BTC is Freedom</h1>
            <span className="badge">self-hosted • privacy-first</span>
          </div>
          <button className="btn subtle" onClick={()=>location.reload()}>Refresh</button>
        </div>
        <div className="container tabs">
          <nav>
            <Tab to="/" label="Dashboard" />
            <Tab to="/news" label="News" />
            <Tab to="/dca" label="DCA & Analysis" />
            <Tab to="/fear-greed" label="Fear & Greed" />
          </nav>
        </div>
      </header>

      <main className="container content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/news" element={<News />} />
          <Route path="/dca" element={<DCA />} />
          <Route path="/fear-greed" element={<FearGreed />} />
          <Route path="*" element={<div className="card"><h2>Not Found</h2></div>} />
        </Routes>
      </main>
    </div>
  );
}
