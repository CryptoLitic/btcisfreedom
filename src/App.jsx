import React from "react";
import { Routes, Route, NavLink } from "react-router-dom";
import Dashboard from "./pages/Dashboard.jsx";

const Tab = ({ to, children }) => (
  <NavLink to={to} className={({ isActive }) => "tab" + (isActive ? " active" : "")} end>
    {children}
  </NavLink>
);

export default function App() {
  return (
    <>
      <header>
        <div className="container">
          <div className="topbar">
            <div className="brand">
              <img className="brand-logo" src="/assets/watermark.png" alt="BTC is Freedom" />
              <h1>BTC is Freedom</h1>
              <span className="badge">Dashboard</span>
            </div>
          </div>
          <div className="tabs">
            <nav>
              <Tab to="/">Dashboard</Tab>
              <Tab to="/news">News</Tab>
              <Tab to="/dca">DCA & Analysis</Tab>
              <Tab to="/sentiment">Fear &amp; Greed</Tab>
            </nav>
          </div>
        </div>
      </header>

      <main className="container content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/news" element={<div className="card"><h2>News</h2><p>Latest Bitcoin news will appear here.</p></div>} />
          <Route path="/dca" element={<div className="card"><h2>DCA & Analysis</h2><p>Tools and charts will load here.</p></div>} />
          <Route path="/sentiment" element={<div className="card"><h2>Fear &amp; Greed</h2><p>Sentiment tiles here.</p></div>} />
          <Route path="*" element={<div className="card"><h2>Not Found</h2></div>} />
        </Routes>
      </main>
    </>
  );
}
