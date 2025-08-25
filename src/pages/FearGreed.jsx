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

  return (
    <div className="row">
      <section className="card">
        <h2>Fear & Greed Indices</h2>
        <div className="summary">
          <div className="stat"><div className="caption">Alternative.me</div><div className="value">{data.alt_fng} / 100</div></div>
          <div className="stat"><div className="caption">AI Sentiment (site)</div><div className="value">{data.ai_sentiment} / 100</div></div>
          <div className="stat"><div className="caption">Median</div><div className="value">{data.median} / 100</div></div>
          <div className="stat"><div className="caption">Status</div><div className="value">{data.label}</div></div>
        </div>
        <p className="muted" style={{marginTop:8}}>Median combines public index and our site’s AI-derived score.</p>
      </section>
    </div>
  )
}
