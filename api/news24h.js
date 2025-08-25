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

function explainerFrom(title, snippet){
  const t = (title||'').toLowerCase();
  let why = '';
  if (t.includes('etf')) why = 'Why it matters: ETF flows can drive large spot demand and volatility.';
  else if (t.includes('miner') || t.includes('mining')) why = 'Why it matters: Miner behavior affects selling pressure and network security.';
  else if (t.includes('halving')) why = 'Why it matters: Halvings reduce issuance and often reshape supply dynamics.';
  else if (t.includes('sec') || t.includes('regulat')) why = 'Why it matters: Regulation can change market access, liquidity and sentiment.';
  else if (t.includes('hack') || t.includes('exploit')) why = 'Why it matters: Security incidents hit confidence and can cause sharp moves.';
  else if (t.includes('macro') || t.includes('inflation') || t.includes('fed') || t.includes('rate')) why = 'Why it matters: Macro data and rates shift risk appetite across all assets.';
  else why = 'Why it matters: Headline capturing market attention over the last day.';
  const clean = (snippet||'').replace(/<[^>]+>/g,'').trim();
  return (clean? (clean.slice(0,180) + (clean.length>180?'…':'')) : '') + ' ' + why;
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
          items.push({
            title: it.title||'',
            url: it.link||it.guid||'#',
            source: (f.title||'').replace(/\s+RSS.*$/i,''),
            ts: t,
            timeago: timeAgo(t),
            snippet: it.contentSnippet || it.content || ''
          });
        });
      }catch(e){}
    }
    items.sort((a,b)=> b.ts - a.ts);
    const top5 = items.slice(0,5).map(x => ({
      title: x.title, url: x.url, source: x.source, explainer: explainerFrom(x.title, x.snippet)
    }));
    res.setHeader('Cache-Control','s-maxage=300, stale-while-revalidate=300');
    res.status(200).json({ items, top5 });
  }catch(e){
    res.status(200).json({ items: [], top5: [] });
  }
}
