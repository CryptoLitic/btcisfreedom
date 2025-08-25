import React, { useEffect, useState } from 'react'

export default function News() {
  const [items, setItems] = useState([])
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const r = await fetch('/api/news24h')
        const d = await r.json()
        setItems(d.items||[])
        setSummary(d.summary||null)
      } catch (e) {
        setItems([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="row">
      <section className="card">
        <h2>Past 24 Hours — Key Moves</h2>
        {loading && <p className="muted">Loading latest headlines…</p>}
        {!loading && summary && <ul>{summary.map((s,i)=>(<li key={i}>{s}</li>))}</ul>}
        {!loading && !summary && <p className="muted">No summary available yet.</p>}
      </section>

      <section className="card">
        <h2>Latest Headlines</h2>
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
