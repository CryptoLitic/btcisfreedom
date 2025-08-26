import React, { useEffect, useState } from 'react';

function blocksToNextHalving(height){
  const NEXT = Math.ceil((height||0) / 210000) * 210000;
  return Math.max(0, NEXT - (height||0));
}

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

  const price = Number(data.price_usd || 0);
  const supply = Number(data.supply_btc || 0);
  const mc = price && supply ? `$${(price * supply).toLocaleString()}` : '—';
  const satsPerUsd = price ? Math.floor(100_000_000 / price).toLocaleString() : '—';
  const usdPerSat = price ? (price / 100_000_000).toFixed(6) : '—';
  const blocksRemaining = data.blocks_to_halving ?? blocksToNextHalving(data.block_height || 0);
  const change24 = Number(data.change_24h || 0);

  const tilesPrimary = [
    { k: 'BTC Price', v: price ? `$${price.toLocaleString()}` : '—' },
    { k: '24h Change', v: `${change24.toFixed(2)}%`, trend: change24 >= 0 ? 'up' : 'down' },
    { k: 'Market Cap', v: mc },
    { k: 'Dominance', v: data.dominance_btc ? data.dominance_btc.toFixed(1) + '%' : '—' },
    { k: 'Sats per $1', v: satsPerUsd },
    { k: 'USD per sat', v: usdPerSat },
  ];

  const tilesNetwork = [
    { k: 'Block Height', v: data.block_height?.toLocaleString?.() },
    { k: 'Next Halving Height', v: (data.next_halving_height ?? '—').toLocaleString?.?.() || data.next_halving_height || '—' },
    { k: 'Blocks to Halving', v: blocksRemaining?.toLocaleString?.() ?? '—' },
    { k: 'Halving ETA', v: data.halving_eta || '—' },
    { k: 'Hashrate', v: data.hashrate_eh ? data.hashrate_eh.toFixed(2) + ' EH/s' : '—' },
    { k: 'Difficulty Progress', v: (data.diff_progress ?? 0) + '%' },
    { k: 'Blocks Since Diff Adj', v: (data.diff_blocks_since ?? '—').toLocaleString?.?.() || data.diff_blocks_since || '—' },
    { k: 'Blocks to Next Diff Adj', v: (data.diff_blocks_remaining ?? '—').toLocaleString?.?.() || data.diff_blocks_remaining || '—' },
  ];

  const tilesSupply = [
    { k: 'BTC Supply', v: (data.supply_btc ?? 0).toLocaleString() + ' BTC' },
    { k: '% of Supply Mined', v: (data.pct_mined ?? 0) + '%' },
    { k: 'Block Subsidy', v: (data.block_subsidy_btc ?? 0).toFixed(3) + ' BTC' },
    { k: 'Issuance / day', v: (data.issuance_day_btc ?? 0).toLocaleString() + ' BTC' },
    { k: 'Issuance / year', v: (data.issuance_year_btc ?? 0).toLocaleString() + ' BTC' },
  ];

  const tilesMempool = [
    { k: 'Mempool TXs', v: data.mempool_count?.toLocaleString?.() || '—' },
    { k: 'Backlog Size', v: (data.mempool_vmb ?? 0).toFixed(1) + ' vMB' },
    { k: 'Fast Fee', v: (data.fee_fast ?? '—') + ' sat/vB' },
    { k: 'Economy Fee', v: (data.fee_economy ?? '—') + ' sat/vB' },
  ];

  return (
    <div>
      <div className="card">
        <h2>Market Overview</h2>
        <div className="tiles">
          {tilesPrimary.map((t,i)=>(
            <div className="tile" key={i}>
              <div className="k">{t.k}</div>
              <div className={"v" + (t.trend ? ` trend ${t.trend}` : '')}>{t.v}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h2>Network</h2>
        <div className="tiles">
          {tilesNetwork.map((t,i)=>(
            <div className="tile" key={i}>
              <div className="k">{t.k}</div>
              <div className="v">{t.v}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h2>Supply & Issuance</h2>
        <div className="tiles">
          {tilesSupply.map((t,i)=>(
            <div className="tile" key={i}>
              <div className="k">{t.k}</div>
              <div className="v">{t.v}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h2>Mempool & Fees</h2>
        <div className="tiles">
          {tilesMempool.map((t,i)=>(
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
    </div>
  );
}
