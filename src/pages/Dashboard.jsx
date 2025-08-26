import React, { useEffect, useState } from 'react';
import PriceChart from '../components/PriceChart.jsx';
import TradingViewWidget from '../components/TradingViewWidget.jsx';
import ProgressBar from '../components/ProgressBar.jsx';

function fmt(n) { return typeof n === 'number' && Number.isFinite(n) ? n.toLocaleString() : '—'; }
function blocksToNextHalving(height){
  const h = typeof height === 'number' ? height : 0;
  const NEXT = Math.ceil(h / 210000) * 210000;
  return Math.max(0, NEXT - h);
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [series, setSeries] = useState([]);
  const [liveIssuance, setLiveIssuance] = useState(0);

  useEffect(()=>{
    (async ()=>{
      try{
        const r = await fetch('/api/dashboard');
        const d = await r.json();
        setData(d);
        const rate = (d.block_subsidy_btc || 3.125) / 600;
        let x = 0;
        const id = setInterval(()=>{ x += rate; setLiveIssuance(x); }, 1000);
        return ()=>clearInterval(id);
      }catch{ setData(null); }
      finally{ setLoading(false); }
    })();
  },[]);

  useEffect(()=>{
    (async ()=>{
      try{
        const rr = await fetch('https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=60&interval=daily');
        const jj = await rr.json();
        const arr = Array.isArray(jj?.prices) ? jj.prices.map(p=>({ time: Math.floor(p[0]/1000), value: Math.round(p[1]) })) : [];
        setSeries(arr);
      }catch{ setSeries([]); }
    })();
  },[]);

  if (loading) return <div className="card"><h2>Loading…</h2><p className="muted">Fetching BTC price, fees, mempool, blocks…</p></div>;
  if (!data)     return <div className="card"><h2>Error</h2><p className="muted">Could not load dashboard data.</p></div>;

  const price  = Number(data.price_usd || 0);
  const supply = Number(data.supply_btc || 0);
  const satsPerUsd = price ? Math.floor(100_000_000 / price).toLocaleString() : '—';
  const satsPer10  = price ? (Math.floor(100_000_000 / price) * 10).toLocaleString() : '—';
  const satsPer100 = price ? (Math.floor(100_000_000 / price) * 100).toLocaleString() : '—';
  const usdPerSat  = price ? (price / 100_000_000).toFixed(6) : '—';
  const blocksRemaining = typeof data.blocks_to_halving === 'number'
    ? data.blocks_to_halving
    : blocksToNextHalving(data.block_height || 0);
  const change24 = Number(data.change_24h || 0);
  const diffProgress = typeof data.diff_progress === 'number' ? data.diff_progress : 0;
  const mempoolFill = Math.max(0, Math.min(100, Math.round(((data.mempool_vmb || 0) / 300) * 100)));

  return (
    <div>
      <div className="card hero">
        <div>
          <div className="label">BTC is Freedom</div>
          <div className="price">${price ? price.toLocaleString() : '—'}</div>
          <div className="sub">
            1 sat = ${usdPerSat} • {satsPerUsd} sats/$ • 24h {change24.toFixed(2)}%
          </div>
          <div className="pills" style={{marginTop:10}}>
            <div className="pill">Height: {fmt(data.block_height)}</div>
            <div className="pill">Blocks → Halving: {fmt(blocksRemaining)}</div>
            <div className="pill">Halving ETA: {data.halving_eta || '—'}</div>
          </div>
        </div>
        <div style={{flex:1, minWidth:280}}>
          <PriceChart series={series} />
        </div>
      </div>

      <div className="card">
        <h2>Pro Chart</h2>
        <TradingViewWidget symbol="COINBASE:BTCUSD" />
      </div>

      <div className="row">
        <div className="card">
          <h2>Network & Fees</h2>
          <div className="tiles">
            <div className="tile"><div className="k">Mempool TXs</div><div className="v">{fmt(data.mempool_count)}</div></div>
            <div className="tile"><div className="k">Backlog Size</div><div className="v">{typeof data.mempool_vmb === 'number' ? `${data.mempool_vmb.toFixed(1)} vMB` : '—'}</div></div>
            <div className="tile"><div className="k">Fast Fee</div><div className="v">{typeof data.fee_fast === 'number' ? `${data.fee_fast} sat/vB` : '—'}</div></div>
            <div className="tile"><div className="k">Economy Fee</div><div className="v">{typeof data.fee_economy === 'number' ? `${data.fee_economy} sat/vB` : '—'}</div></div>
            <div className="tile"><div className="k">Hashrate</div><div className="v">{typeof data.hashrate_eh === 'number' ? `${data.hashrate_eh.toFixed(2)} EH/s` : '—'}</div></div>
            <div className="tile"><div className="k">Dominance</div><div className="v">{typeof data.dominance_btc === 'number' ? `${data.dominance_btc.toFixed(1)}%` : '—'}</div></div>
          </div>
          <div style={{marginTop:12}}>
            <div className="label">Difficulty epoch progress</div>
            <ProgressBar value={diffProgress} />
          </div>
          <div style={{marginTop:12}}>
            <div className="label">Mempool fill (scaled)</div>
            <ProgressBar value={mempoolFill} />
          </div>
        </div>

        <div className="card">
          <h2>Supply & Issuance</h2>
          <div className="tiles">
            <div className="tile"><div className="k">BTC Supply</div><div className="v">{supply ? supply.toLocaleString() + ' BTC' : '—'}</div></div>
            <div className="tile"><div className="k">% Mined</div><div className="v">{typeof data.pct_mined === 'number' ? `${data.pct_mined}%` : '—'}</div></div>
            <div className="tile"><div className="k">Block Subsidy</div><div className="v">{typeof data.block_subsidy_btc === 'number' ? `${data.block_subsidy_btc.toFixed(3)} BTC` : '—'}</div></div>
            <div className="tile"><div className="k">Issuance / day</div><div className="v">{typeof data.issuance_day_btc === 'number' ? `${data.issuance_day_btc.toLocaleString()} BTC` : '—'}</div></div>
            <div className="tile"><div className="k">Issuance / year</div><div className="v">{typeof data.issuance_year_btc === 'number' ? `${data.issuance_year_btc.toLocaleString()} BTC` : '—'}</div></div>
            <div className="tile"><div className="k">Live Issuance (approx)</div><div className="v">{liveIssuance.toFixed(6)} BTC</div></div>
          </div>
          <div className="tiles" style={{marginTop:8}}>
            <div className="tile"><div className="k">Sats per $10</div><div className="v">{satsPer10}</div></div>
            <div className="tile"><div className="k">Sats per $100</div><div className="v">{satsPer100}</div></div>
          </div>
        </div>
      </div>
    </div>
  );
}
