import React, { useEffect, useState } from 'react';
import Gauge from '../components/Gauge.jsx';

export default function FearGreed(){
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    (async ()=>{
      try{
        const r = await fetch('/api/fng');
        const d = await r.json();
        setData(d);
      }catch{ setData(null); }
      setLoading(false);
    })();
  },[]);

  if (loading) return <div className="card"><h2>Loading…</h2></div>;
  if (!data)     return <div className="card"><h2>Error</h2></div>;

  const items = [
    { k:'Alternative.me', v: data.alt_fng },
    { k:'Funding score',  v: data.funding_score },
    { k:'Volatility score', v: data.vol_score },
    { k:'AI site sentiment', v: data.ai_sentiment },
    { k:'Median', v: data.median, label: data.label }
  ];

  return (
    <div>
      <div className="card">
        <h2>Fear & Greed (composite)</h2>
        <Gauge score={data.median} />
        <div className="tiles" style={{ marginTop: 10 }}>
          {items.map((t,i)=>(
            <div className="tile" key={i}>
              <div className="k">{t.k}</div>
              <div className="v">{t.v}{t.label ? ` — ${t.label}` : ''}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
