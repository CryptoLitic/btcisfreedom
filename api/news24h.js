// /api/news24h.js
const Parser = require('rss-parser');
const feeds = [
  'https://www.coindesk.com/arc/outboundfeeds/rss/',
  'https://bitcoinmagazine.com/.rss/full/',
  'https://news.bitcoin.com/feed/',
  'https://cryptonews.com/news/feed'
];
function timeAgo(ts){
  const d = Date.now() - ts; const h = Math.floor(d/36e5); if(h<1) return 'just now'; if(h<24) return h+'h ago'; return Math.floor(h/24)+'d ago';
}
module.exports = async (req, res)=>{
  try{
    const parser = new Parser({ timeout: 10000 });
    const now = Date.now();
    const cutoff = now - 24*60*60*1000;
    const items = [];
    for(const url of feeds){
      try{
        const f = await parser.parseURL(url);
        (f.items||[]).forEach(it=>{
          const t = Date.parse(it.pubDate || it.isoDate || 0);
          if(!t || t<cutoff) return;
          items.push({ title: it.title||'', url: it.link||it.guid||'#', source: (f.title||'').replace(/\s+RSS.*$/i,''), ts: t });
        });
      }catch(e){}
    }
    items.sort((a,b)=> b.ts - a.ts);
    const summary = [];
    if(items.length){
      const top = items.slice(0,6);
      top.forEach(x=> summary.push(`${x.source}: ${x.title}`));
    }
    res.setHeader('Cache-Control','s-maxage=300, stale-while-revalidate=300');
    res.status(200).json({ items: items.map(i=>({...i, timeago: timeAgo(i.ts)})), summary });
  }catch(e){
    res.status(200).json({ items: [], summary: [] });
  }
}
