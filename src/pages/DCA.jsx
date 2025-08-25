import React, { useEffect, useMemo, useState } from 'react'
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line, Area } from 'recharts'

const fmtUSD = (n) => (n ?? 0).toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 2 })
const fmtPct = (n) => `${n > 0 ? '+' : ''}${n.toFixed(2)}%`
const daysBetween = (a, b) => Math.ceil((b - a) / (1000 * 60 * 60 * 24))
const toISODate = (ts) => new Date(ts).toISOString().slice(0, 10)

function buildBuySchedule(startDate, endDate, cadence) {
  const dates = []
  const d = new Date(startDate)
  const limit = new Date(endDate)
  while (d <= limit) {
    dates.push(new Date(d))
    if (cadence === 'weekly') d.setDate(d.getDate() + 7)
    else if (cadence === 'biweekly') d.setDate(d.getDate() + 14)
    else d.setMonth(d.getMonth() + 1)
  }
  return dates.map((d) => toISODate(d))
}
function mapDailyPrices(raw) {
  const out = {}; (raw || []).forEach(([ts, price]) => { out[toISODate(ts)] = price }); return out
}
function computeDCA(priceMap, schedule, amountPerBuy) {
  const timeline = []; let cumBtc = 0; let cumInvested = 0
  schedule.forEach((day)=>{ const price = priceMap?.[day]; if(!price) return; const btcBought = amountPerBuy/price; cumBtc+=btcBought; cumInvested+=amountPerBuy; timeline.push({date:day, invested:cumInvested, btc:cumBtc, value:cumBtc*price, price}) })
  const latest = timeline[timeline.length-1]
  const summary = latest ? { totalInvested: latest.invested, totalBTC: latest.btc, currentValue: latest.value, pnl: latest.value-latest.invested, pnlPct: latest.invested? ((latest.value-latest.invested)/latest.invested)*100:0 } : { totalInvested:0,totalBTC:0,currentValue:0,pnl:0,pnlPct:0 }
  return { timeline, summary }
}

export default function DCA() {
  const [startDate, setStartDate] = useState(() => { const d = new Date(); d.setMonth(d.getMonth()-12); return toISODate(d) })
  const [endDate, setEndDate] = useState(() => toISODate(new Date()))
  const [cadence, setCadence] = useState('weekly')
  const [amount, setAmount] = useState(100)
  const [priceSeries, setPriceSeries] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    async function load(){
      setLoading(true)
      try{
        const days = Math.min(Math.max(daysBetween(new Date(startDate), new Date(endDate)) + 5, 1), 3650)
        const url = `https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=${days}&interval=daily`
        const r = await fetch(url)
        if(!r.ok) throw new Error('fetch fail')
        const j = await r.json()
        setPriceSeries(mapDailyPrices(j.prices))
      }catch(e){
        const mock={}; const base=new Date(startDate); let price=30000;
        for(let i=0;i<=daysBetween(new Date(startDate), new Date(endDate));i++){ const d=new Date(base); d.setDate(d.getDate()+i); price=Math.max(10000, price*(1+(Math.sin(i/20)*0.01+0.0005))); mock[toISODate(d)]=price }
        setPriceSeries(mock)
      }finally{ setLoading(false) }
    }
    load()
  }, [startDate, endDate])

  const schedule = useMemo(()=>buildBuySchedule(startDate, endDate, cadence), [startDate, endDate, cadence])
  const dca = useMemo(()=> (priceSeries? computeDCA(priceSeries, schedule, Number(amount)) : {timeline:[], summary:{}}), [priceSeries, schedule, amount])

  return (
    <div className="row">
      <section className="card">
        <h2>DCA Planner</h2>
        <div className="grid-2">
          <div><label className="label">Start</label><input className="input" type="date" value={startDate} onChange={e=>setStartDate(e.target.value)}/></div>
          <div><label className="label">End</label><input className="input" type="date" value={endDate} onChange={e=>setEndDate(e.target.value)}/></div>
          <div><label className="label">Cadence</label><select className="select" value={cadence} onChange={e=>setCadence(e.target.value)}><option value="weekly">Weekly</option><option value="biweekly">Bi-Weekly</option><option value="monthly">Monthly</option></select></div>
          <div><label className="label">Amount (USD)</label><input className="input" type="number" min="1" value={amount} onChange={e=>setAmount(Number(e.target.value||0))}/></div>
        </div>
        <p className="muted" style={{fontSize:12}}>Data: CoinGecko daily BTC/USD. Falls back to demo data if blocked.</p>
      </section>

      <section className="card">
        <h2>Results</h2>
        {loading ? <p className="muted">Loading prices…</p> : dca.timeline.length ? (
          <div className="summary">
            <div className="stat"><div className="caption">Invested</div><div className="value">{fmtUSD(dca.summary.totalInvested)}</div></div>
            <div className="stat"><div className="caption">BTC Accumulated</div><div className="value">{dca.summary.totalBTC.toFixed(6)} BTC</div></div>
            <div className="stat"><div className="caption">Current Value</div><div className="value">{fmtUSD(dca.summary.currentValue)}</div></div>
            <div className="stat"><div className="caption">P&L</div><div className="value" style={{color: dca.summary.pnl>=0? 'var(--green)':'var(--red)'}}>{fmtUSD(dca.summary.pnl)} ({fmtPct(dca.summary.pnlPct)})</div></div>
          </div>
        ) : <p className="muted">Adjust inputs or try different dates.</p>}
        <div style={{height:320, marginTop:12}}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dca.timeline} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="#1f2b46" strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fill: '#99a7c2', fontSize: 12 }} interval="preserveStartEnd" />
              <YAxis yAxisId="left" tick={{ fill: '#99a7c2', fontSize: 12 }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fill: '#99a7c2', fontSize: 12 }} />
              <Tooltip contentStyle={{ background: '#0b1020', border: '1px solid #22304d', borderRadius: 12, color: '#e6eefc' }} />
              <Legend wrapperStyle={{ color: '#99a7c2' }} />
              <Area yAxisId="left" type="monotone" dataKey="value" stroke="#5aa9ff" fill="#5aa9ff22" name="Portfolio Value" />
              <Line yAxisId="right" type="monotone" dataKey="price" stroke="#ffc861" dot={false} name="BTC Price" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  )
}
