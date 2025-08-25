import React, { useEffect } from 'react';
import { NavLink, Routes, Route, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard.jsx';
import News from './pages/News.jsx';
import DCA from './pages/DCA.jsx';
import FearGreed from './pages/FearGreed.jsx';
import Memes from './pages/Memes.jsx';

const Tab = ({to, label}) => (
  <NavLink to={to} className={({isActive}) => 'tab' + (isActive ? ' active' : '')}>{label}</NavLink>
);

function TitleSync(){
  const { pathname } = useLocation();
  useEffect(()=>{
    const map = { '/':'Dashboard', '/news':'News', '/dca':'DCA & Analysis', '/fear-greed':'Fear & Greed', '/memes':'Memes' };
    document.title = `BTC is Freedom — ${map[pathname] || 'Dashboard'}`;
  }, [pathname]);
  return null;
}

// Simple error boundary so the app never whitescreens
class ErrorBoundary extends React.Component {
  constructor(props){ super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error){ return { error }; }
  render(){
    if (this.state.error) {
      return (
        <div className="card">
          <h2>Runtime error</h2>
          <pre style={{whiteSpace:'pre-wrap'}}>{String(this.state.error)}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <TitleSync/>
      <header>
        <div className="container" style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
          <div className="brand">
            <img src="https://cryptologos.cc/logos/bitcoin-btc-logo.png?v=035" alt="BTC"/>
            <h1 style={{fontSize:18, margin:0}}>BTC is Freedom — Bitcoin Dashboard</h1>
          </div>
          <button className="btn" onClick={()=>window.location.reload()}>Refresh</button>
        </div>
        <div className="container" style={{paddingTop:0, paddingBottom:16}}>
          <nav>
            <Tab to="/" label="Dashboard"/>
            <Tab to="/news" label="News"/>
            <Tab to="/dca" label="DCA & Analysis"/>
            <Tab to="/fear-greed" label="Fear & Greed"/>
            <Tab to="/memes" label="Memes"/>
          </nav>
        </div>
      </header>

      <main className="container" style={{paddingTop:16}}>
        <div className="muted" style={{margin:'8px 0', fontSize:12}}>
          Healthcheck: App shell loaded.
        </div>
        <Routes>
          <Route path="/" element={<Dashboard/>}/>
          <Route path="/news" element={<News/>}/>
          <Route path="/dca" element={<DCA/>}/>
          <Route path="/fear-greed" element={<FearGreed/>}/>
          <Route path="/memes" element={<Memes/>}/>
          <Route path="*" element={<div className="card"><h2>Not Found</h2></div>}/>
        </Routes>
      </main>
    </ErrorBoundary>
  );
}
