import React, { useEffect, useState } from 'react';

export default function Memes(){
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    (async ()=>{
      try{
        const r = await fetch('/api/memes');
        const d = await r.json();
        setItems(d.items||[]);
      }catch{}
      setLoading(false);
    })();
  },[]);

  if (loading) return <div className="card"><h2>Loading…</h2></div>;

  return (
    <div className="card">
      <h2>Memes</h2>
      {!items.length && <p className="muted">No memes found. Try again later.</p>}
      <div className="tiles">
        {items.map((m,i)=>(
          <a className="tile" key={i} href={m.url} target="_blank" rel="noreferrer">
            <div className="k">{m.title}</div>
            {m.image && <img src={m.image} alt="" style={{width:'100%', borderRadius:8, marginTop:8}}/>}
          </a>
        ))}
      </div>
    </div>
  );
}
