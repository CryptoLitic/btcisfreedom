import React, { useEffect, useState } from 'react'

export default function FearGreed() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    async function load(){
      try{
        const r = await fetch('/api/fng')
        const d = await r.json()
        setData(d)
      }catch(e){
        setData(null)
      }finally{ setLoading(false) }
    }
    load()
  }, [])

  if(loading) return <div className="card"><h2>Loading…</h2></div>
  if(!data) return <div className="card"><h2>Error</h2><p className="muted">Could not load fear & greed.</p></div>

  const tiles = [
    { k:'Alternative.me (Crypto F&G)', v: data.alt_fng ?? '—' },
    { k:'Funding-based Score', v: data.funding_score ?? '—' },
    { k:'30d Volatility Score', v: data.vol_score ?? '—' },
    { k:'Site AI Sentiment', v: data.ai_sentiment ?? '—' },
    { k:'Median', v: data.median ?? '—' },
    { k:'Status', v: data.label ?? '—' },
  ]

  return (
    <div className="row">
      <section className="card">
        <h2>Fear & Greed — Composite</h2>
        <div className="tiles">
          {tiles.map((t,i)=>(
            <div className="tile" key={i}>
              <div className="k">{t.k}</div>
              <div className="v">{t.v}</div>
            </div>
          ))}
        </div>
        <p className="muted" style={{marginTop:8}}>Composite median of public indices and derived metrics (funding rate, 30d volatility) plus our site’s AI sentiment.</p>
      </section>
    </div>
  )
}
