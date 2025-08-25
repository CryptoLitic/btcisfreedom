import React, { useEffect, useState } from 'react'

export default function Memes() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    async function load(){
      try{
        const r = await fetch('/api/memes')
        const d = await r.json()
        setItems(d.items||[])
      }catch(e){
        setItems([])
      }finally{ setLoading(false) }
    }
    load()
  }, [])

  return (
    <div className="card">
      <h2>Bitcoin Memes (Fresh)</h2>
      {loading && <p className="muted">Loading memes…</p>}
      {!loading && !items.length && <p className="muted">No memes found. Try again later.</p>}
      <div className="memes">
        {items.map((m,i)=>(
          <div className="meme" key={i}>
            {m.image ? <img src={m.image} alt={m.title}/> : <div className="meta">No image preview</div>}
            <div className="meta"><a href={m.url} target="_blank" rel="noreferrer">{m.title}</a></div>
          </div>
        ))}
      </div>
    </div>
  )
}
