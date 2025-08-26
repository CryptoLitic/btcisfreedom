import React, { useEffect, useState } from 'react';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    (async ()=>{
      try{
        const r = await fetch('/api/dashboard');
        const d = await r.json();
        setData(d);
      }catch{
        setData(null);
      }finally{
        setLoading(false);
      }
    })();
  },[]);

  if (loading) return <div className="card"><h2>Loading…</h2><p className="muted">Fetching BTC price, fees, mempool, blocks…</p></div>;
  if (!data)     return <div className="card"><h2>Error</h2><p className="muted">Could not load dashboard data.</p></div>;

  const tiles = [
    { k: 'BTC Price',           v: data.price_usd ? `$${data.price_usd.toLocaleString()}` : '—' },
    { k: '24h Change',          v: (data.change_24h ?? 0).toFixed(2) + '%' },
    { k: '24h Volume',          v: data.volume_24h_usd ? `$${Math.round(data.volume_24h_usd).toLocaleString()}` : '—' },
    { k: 'Dominance',           v: data.dominance_btc ? data.dominance_btc.toFixed(1) + '%' : '—' },
    { k: 'Block Height',        v: data.block_height?.toLocaleString?.() },
    { k: 'Next Halving ETA',    v: data.halving_eta || '—' },
    { k: 'Mempool TXs',         v: data.mempool_count?.toLocaleString?.() || '—' },
    { k: 'Mempool Backlog',     v: (data.mempool_vmb ?? 0).toFixed(1) + ' vMB' },
    { k: 'Fast Fee',            v: (data.fee_fast ?? '—') + ' sat/vB' },
    { k: 'Economy Fee',         v: (data.fee_economy ?? '—') + ' sat/vB' },
    { k: 'Hashrate',            v: data.hashrate_eh ? data.hashrate_eh.toFixed(2) + ' EH/s' : '—' },
    { k: 'Difficulty Progress', v: (data.diff_progress ?? 0) + '%' },
    { k: 'BTC Supply',          v: (data.supply_btc ?? 0).toLocaleString() + ' BTC' },
  ];

  return (
    <div className="card">
      <h2>Network & Market Tiles</h2>
      <div className="tiles">
        {tiles.map((t,i)=>(
          <div className="tile" key={i}>
            <div className="k">{t.k}</div>
            <div className="v">{t.v}</div>
          </div>
        ))}
      </div>
      <p className="muted" style={{marginTop:8, fontSize:12}}>
        Data via public endpoints (CoinGecko, mempool.space, blockchain.info). Values show safe defaults if sources are blocked.
      </p>
    </div>
  );
}
