import React, { useEffect, useState } from 'react'

export default function News() {
  const [items, setItems] = useState([])
  const [top, setTop] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const r = await fetch('/api/news24h')
        const d = await r.json()
        setItems(d.items||[])
        setTop(d.top5||[])
      } catch (e) {
        setItems([]); setTop([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="row">
      <section className="card">
        <h2>Past 24 Hours — 5 Key Moves (Plain English)</h2>
        {loading && <p className="muted">Loading latest headlines…</p>}
        {!loading && top.length ? (
          <ol>
            {top.map((n,i)=>(
              <li key={i} style={{marginBottom:10}}>
                <div><a href={n.url} target="_blank" rel="noreferrer">{n.title}</a> <span className="muted">— {n.source}</span></div>
                <div className="muted" style={{fontSize:13}}>{n.explainer}</div>
              </li>
            ))}
          </ol>
        ) : <p className="muted">No summary available yet.</p>}
      </section>

      <section className="card">
        <h2>All Headlines (24h)</h2>
        {items.length ? items.map((n,i)=>(
          <div className="news-item" key={i}>
            <a href={n.url} target="_blank" rel="noreferrer">{n.title}</a>
            <div className="muted" style={{fontSize:12}}>{n.source} — {n.timeago}</div>
          </div>
        )) : <p className="muted">No items.</p>}
      </section>
    </div>
  )
}
