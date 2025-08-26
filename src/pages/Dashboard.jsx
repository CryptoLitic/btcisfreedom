import React, { useEffect, useMemo, useState } from 'react';
import LineChart from '../components/LineChart.jsx';
import TradingViewWidget from '../components/TradingViewWidget.jsx';
import ProgressBar from '../components/ProgressBar.jsx';

function fmt(n){ return typeof n === 'number' && Number.isFinite(n) ? n.toLocaleString() : '—'; }

function sma(arr, n){
  const out = []; let sum=0;
  for(let i=0;i<arr.length;i++){
    sum += arr[i].value;
    if(i>=n) sum -= arr[i-n].value;
    if(i>=n-1) out.push({ time: arr[i].time, value: sum/n });
  }
  return out;
}
function piCycle(price){
  const ma111 = sma(price, 111);
  const ma350 = sma(price, 350).map(p=>({ time:p.time, value:p.value*2 }));
  return { ma111, ma350x2: ma350 };
}
function goldenRatioBands(price){
  const ma350 = sma(price, 350);
  const fibs = [1.6, 2, 3, 5];
  return fibs.map((f)=> ma350.map(p=>({ time:p.time, value: p.value * f })));
}
function blocksToNextHalving(height){
  const NEXT = Math.ceil((height||0) / 210000) * 210000;
  return Math.max(0, NEXT - (height||0));
}

export default function Dashboard(){
  const [priceData, setPriceData] = useState([]);
  const [spot, setSpot] = useState({ price: 0, change24: 0, dominance: 0 });
  const [network, setNetwork] = useState({ height: 0, mempoolCount: 0, vmb: 0, diffProgress: 50 });
  const [active, setActive] = useState('btc_price');
  const [loading, setLoading] = useState(true);

  // Price history + spot + dominance
  useEffect(()=> {
    (async ()=>{
      try{
        const [hist, spotResp, global] = await Promise.all([
          fetch('https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=1825&interval=daily').then(r=>r.json()),
          fetch('https://api.coingecko.com/api/v3/coins/bitcoin?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false').then(r=>r.json()),
          fetch('https://api.coingecko.com/api/v3/global').then(r=>r.json())
        ]);
        const arr = Array.isArray(hist?.prices) ? hist.prices.map(p => ({ time: Math.floor(p[0]/1000), value: p[1] })) : [];
        setPriceData(arr);
        setSpot({
          price: spotResp?.market_data?.current_price?.usd ?? 0,
          change24: spotResp?.market_data?.price_change_percentage_24h ?? 0,
          dominance: global?.data?.market_cap_percentage?.btc ?? 0
        });
      }catch(e){}
    })();
  },[]);

  // Network & mempool
  useEffect(()=>{
    (async ()=>{
      try{
        const [heightTxt, mempool, diff] = await Promise.all([
          fetch('https://mempool.space/api/blocks/tip/height').then(r=>r.text()),
          fetch('https://mempool.space/api/mempool').then(r=>r.json()),
          fetch('https://mempool.space/api/v1/difficulty-adjustment').then(r=>r.json())
        ]);
        const height = parseInt(heightTxt,10) || 0;
        const vmb = typeof mempool?.vsize === 'number' ? Math.round(mempool.vsize/1e6*10)/10
              : (mempool?.vsizeSum ? Math.round(mempool.vsizeSum/1e6*10)/10 : 0);
        setNetwork({
          height,
          mempoolCount: mempool?.count ?? 0,
          vmb,
          diffProgress: diff?.progressPercent ? Math.round(diff.progressPercent*100)/100 : 50
        });
      }catch(e){}
      setLoading(false);
    })();
  },[]);

  const overlays = useMemo(()=>{
    if(!priceData.length) return {};
    const ma50  = sma(priceData, 50);
    const ma200 = sma(priceData, 200);
    const mayer = priceData.slice(199).map((p,i)=>({ time:p.time, value: p.value / ma200[i].value }));
    const pc = piCycle(priceData);
    const grm = goldenRatioBands(priceData);
    return { ma50, ma200, mayer, ma111: pc.ma111, ma350x2: pc.ma350x2, grm };
  }, [priceData]);

  const LEFT_MENU = [
    {id:'btc_price', label:'BTC Price (MA50/200)'},
    {id:'mayer',    label:'Mayer Multiple'},
    {id:'pi',       label:'Pi Cycle (111D & 350D×2)'},
    {id:'grm',      label:'Golden Ratio Multiplier'},
    {id:'pro',      label:'Pro Chart (TradingView)'},
    {id:'dom',      label:'BTC Dominance'}
  ];

  const blocksRemaining = blocksToNextHalving(network.height);
  const mempoolFill = Math.max(0, Math.min(100, Math.round((network.vmb / 300) * 100)));

  const mainChart = (() => {
    if (active === 'btc_price') {
      return <LineChart series={priceData} overlays={[{data:overlays.ma50},{data:overlays.ma200}]} />;
    } else if (active === 'mayer') {
      return <LineChart series={overlays.mayer || []} overlays={[]} colors={{price:'#93c5fd'}} />;
    } else if (active === 'pi') {
      return <LineChart series={priceData} overlays={[{data:overlays.ma111},{data:overlays.ma350x2}]} />;
    } else if (active === 'grm') {
      const ovs = (overlays.grm || []).map(d => ({ data: d }));
      return <LineChart series={priceData} overlays={ovs} />;
    } else if (active === 'pro') {
      return <TradingViewWidget />;
    } else if (active === 'dom') {
      return (
        <div className="card">
          <h3>BTC Dominance</h3>
          <div className="v">{typeof spot.dominance==='number' ? spot.dominance.toFixed(1) + '%' : '—'}</div>
        </div>
      );
    }
    return null;
  })();

  if (loading) return <div className="card"><h2>Loading…</h2></div>;

  return (
    <div className="layout">
      <aside className="sidebar">
        <h3>Analytics</h3>
        <div className="menu">
          {LEFT_MENU.map(x => (
            <button key={x.id} onClick={()=>setActive(x.id)} className={active===x.id?'active':''}>
              {x.label}
            </button>
          ))}
        </div>
      </aside>

      <section>
        <div className="card hero">
          <div>
            <div className="label">BTC is Freedom</div>
            <div className="price">${spot.price ? spot.price.toLocaleString() : '—'}</div>
            <div className="sub">
              24h {Number(spot.change24||0).toFixed(2)}% • Height {fmt(network.height)} • Blocks→Halving {fmt(blocksRemaining)}
            </div>
          </div>
          <div className="tiles" style={{minWidth:280}}>
            <div className="tile"><div className="k">Mempool TXs</div><div className="v">{fmt(network.mempoolCount)}</div></div>
            <div className="tile"><div className="k">Mempool vMB</div><div className="v">{fmt(network.vmb)}</div></div>
            <div className="tile"><div className="k">Diff. Progress</div><div className="v">{fmt(network.diffProgress)}%</div></div>
          </div>
        </div>

        <div className="card">
          <h2>Charts</h2>
          {mainChart}
        </div>

        <div className="card">
          <h2>Difficulty & Mempool</h2>
          <div className="label">Difficulty epoch progress</div>
          <ProgressBar value={network.diffProgress || 50} />
          <div className="label" style={{marginTop:12}}>Mempool fill (scaled)</div>
          <ProgressBar value={mempoolFill} />
        </div>
      </section>
    </div>
  );
}
