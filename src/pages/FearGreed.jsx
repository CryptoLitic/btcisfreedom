import React, { useEffect, useState } from 'react';

export default function FearGreed(){
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    (async ()=>{
      try{
        const r = await fetch('/api/fng');
        const d = await r.json();
        setData(d);
      }catch{}
      setLoading(false);
    })();
  },[]);

  if (loading) return <div className="card"><h2>Loading…</h2></div>;
  if (!data)     return <div className="card"><h2>Error</h2></div>;

  return (
    <div className="card">
      <h2>Fear & Greed</h2>
      <div className="tiles">
        <div className="tile"><div className="k">Alternative.me</div><div className="v">{data.alt_fng}</div></div>
        <div className="tile"><div className="k">Funding Score</div><div className="v">{data.funding_score}</div></div>
        <div className="tile"><div className="k">30d Volatility Score</div><div className="v">{data.vol_score}</div></div>
        <div className="tile"><div className="k">AI Site Sentiment</div><div className="v">{data.ai_sentiment}</div></div>
        <div className="tile"><div className="k">Median</div><div className="v">{data.median}</div></div>
        <div className="tile"><div className="k">Label</div><div className="v">{data.label}</div></div>
      </div>
    </div>
  );
}
