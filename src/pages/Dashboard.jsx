import React, { useEffect, useState } from 'react';
import Sparkline from '../components/Sparkline.jsx';

function fmt(n) { return typeof n === 'number' && Number.isFinite(n) ? n.toLocaleString() : '—'; }
function blocksToNextHalving(height){
  const h = typeof height === 'number' ? height : 0;
  const NEXT = Math.ceil(h / 210000) * 210000;
  return Math.max(0, NEXT - h);
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [prices, setPrices] = useState([]);

  useEffect(()=>{
    (async ()=>{
      try{
        const r = await fetch('/api/dashboard');
        const d = await r.json();
        setData(d);
      }catch{ setData(null); }
      finally{ setLoading(false); }
    })();
  },[]);

  useEffect(()=>{
    (async ()=>{
      try{
        const rr = await fetch('https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=30&interval=daily');
        const jj = await rr.json();
        const arr = Array.isArray(jj?.prices) ? jj.prices.map(p=>Math.round(p[1])) : [];
        setPrices(arr);
      }catch{ setPrices([]); }
    })();
  },[]);

  if (loading) return <div className="card"><h2>Loading…</h2><p className="muted">Fetching BTC price, fees, mempool, blocks…</p></div>;
  if (!data)     return <div className="card"><h2>Error</h2><p className="muted">Could not load dashboard data.</p></div>;

  const price  = Number(data.price_usd || 0);
  const supply = Number(data.supply_btc || 0);
  const mc = price && supply ? `$${(price * supply).toLocaleString()}` : '—';
  const satsPerUsd = price ? Math.floor(100_000_000 / price).toLocaleString() : '—';
  const usdPerSat  = price ? (price / 100_000_000).toFixed(6) : '—';
  const blocksRemaining = typeof data.blocks_to_halving === 'number'
    ? data.blocks_to_halving
    : blocksToNextHalving(data.block_height || 0);
  const change24 = Number(data.change_24h || 0);

  const tilesPrimary = [
    { k: 'BTC Price',    v: price ? `$${price.toLocaleString()}` : '—' },
    { k: '24h Change',   v: `${change24.toFixed(2)}%`, trend: change24 >= 0 ? 'up' : 'down' },
    { k: 'Market Cap',   v: mc },
    { k: 'Dominance',    v: typeof data.dominance_btc === 'number' ? `${data.dominance_btc.toFixed(1)}%` : '—' },
    { k: 'Sats per $1',  v: satsPerUsd },
    { k: 'USD per sat',  v: usdPerSat },
  ];

  const tilesNetwork = [
    { k: 'Block Height',            v: fmt(data.block_height) },
    { k: 'Next Halving Height',     v: fmt(data.next_halving_height) },
    { k: 'Blocks to Halving',       v: fmt(blocksRemaining) },
    { k: 'Halving ETA',             v: data.halving_eta || '—' },
    { k: 'Hashrate',                v: typeof data.hashrate_eh === 'number' ? `${data.hashrate_eh.toFixed(2)} EH/s` : '—' },
    { k: 'Difficulty Progress',     v: typeof data.diff_progress === 'number' ? `${data.diff_progress}%` : '—' },
    { k: 'Blocks Since Diff Adj',   v: fmt(data.diff_blocks_since) },
    { k: 'Blocks to Next Diff Adj', v: fmt(data.diff_blocks_remaining) },
  ];

  const tilesSupply = [
    { k: 'BTC Supply',        v: (supply ? supply.toLocaleString() : '—') + (supply ? ' BTC' : '') },
    { k: '% of Supply Mined', v: typeof data.pct_mined === 'number' ? `${data.pct_mined}%` : '—' },
    { k: 'Block Subsidy',     v: typeof data.block_subsidy_btc === 'number' ? `${data.block_subsidy_btc.toFixed(3)} BTC` : '—' },
    { k: 'Issuance / day',    v: typeof data.issuance_day_btc === 'number' ? `${data.issuance_day_btc.toLocaleString()} BTC` : '—' },
    { k: 'Issuance / year',   v: typeof data.issuance_year_btc === 'number' ? `${data.issuance_year_btc.toLocaleString()} BTC` : '—' },
  ];

  const tilesMempool = [
    { k: 'Mempool TXs',   v: fmt(data.mempool_count) },
    { k: 'Backlog Size',  v: typeof data.mempool_vmb === 'number' ? `${data.mempool_vmb.toFixed(1)} vMB` : '—' },
    { k: 'Fast Fee',      v: typeof data.fee_fast === 'number' ? `${data.fee_fast} sat/vB` : '—' },
    { k: 'Economy Fee',   v: typeof data.fee_economy === 'number' ? `${data.fee_economy} sat/vB` : '—' },
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
        <div style={{ marginTop: 14 }}>
          <Sparkline points={prices} />
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
