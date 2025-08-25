import React, { useEffect, useState } from 'react'

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const r = await fetch('/api/dashboard')
        const d = await r.json()
        setData(d)
      } catch (e) {
        setData(null)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <div className="card"><h2>Loading…</h2><p className="muted">Fetching BTC price, block height, fees and difficulty.</p></div>
  if (!data) return <div className="card"><h2>Error</h2><p className="muted">Could not load dashboard data.</p></div>

  return (
    <div className="row">
      <section className="card">
        <h2>Market Snapshot</h2>
        <div className="summary">
          <div className="stat"><div className="caption">BTC Price</div><div className="value">${(data.price_usd||0).toLocaleString()}</div></div>
          <div className="stat"><div className="caption">24h Change</div><div className="value" style={{color: (data.change_24h||0)>=0?'var(--green)':'var(--red)'}}>{(data.change_24h||0).toFixed(2)}%</div></div>
          <div className="stat"><div className="caption">Block Height</div><div className="value">{data.block_height?.toLocaleString?.()}</div></div>
          <div className="stat"><div className="caption">Next Halving ETA</div><div className="value">{data.halving_eta || '—'}</div></div>
        </div>
      </section>

      <section className="card">
        <h2>Network</h2>
        <div className="summary">
          <div className="stat"><div className="caption">Mempool Fee (fast)</div><div className="value">{data.fee_fast} sat/vB</div></div>
          <div className="stat"><div className="caption">Mempool Fee (economy)</div><div className="value">{data.fee_economy} sat/vB</div></div>
          <div className="stat"><div className="caption">Difficulty Epoch</div><div className="value">{data.diff_progress}%</div></div>
          <div className="stat"><div className="caption">Supply (BTC)</div><div className="value">{(data.supply_btc||0).toLocaleString()}</div></div>
        </div>
      </section>
    </div>
  )
}
