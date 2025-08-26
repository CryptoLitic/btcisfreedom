import React, { useEffect, useState } from 'react';

export default function News(){
  const [items, setItems] = useState([]);
  const [top5, setTop5] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    (async ()=>{
      try{
        const r = await fetch('/api/news24h');
        const d = await r.json();
        setItems(d.items||[]);
        setTop5(d.top5||[]);
      }catch{}
      setLoading(false);
    })();
  },[]);

  if (loading) return <div className="card"><h2>Loading…</h2></div>;

  return (
    <div>
      <div className="card">
        <h2>Past 24 hours — 5 key moves</h2>
        {!top5.length && <p className="muted">No summary yet.</p>}
        <ul>
          {top5.map((n,i)=>(
            <li key={i} style={{marginBottom:8}}>
              <a href={n.url} target="_blank" rel="noreferrer">{n.title}</a>
              <div className="muted" style={{fontSize:12}}>{n.explainer}</div>
            </li>
          ))}
        </ul>
      </div>
      <div className="card">
        <h3>All headlines (24h)</h3>
        {!items.length && <p className="muted">No items.</p>}
        <ul>
          {items.map((n,i)=>(
            <li key={i}><a href={n.url} target="_blank" rel="noreferrer">{n.title}</a> <span className="muted">— {n.source}</span></li>
          ))}
        </ul>
      </div>
    </div>
  );
}
