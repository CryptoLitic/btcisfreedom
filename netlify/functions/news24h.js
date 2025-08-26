const Parser = require('rss-parser');
const feeds = [
  'https://www.coindesk.com/arc/outboundfeeds/rss/',
  'https://bitcoinmagazine.com/.rss/full/',
  'https://news.bitcoin.com/feed/',
  'https://cryptonews.com/news/feed'
];

function timeAgo(ts){
  const d = Date.now() - ts; const h = Math.floor(d/36e5);
  if(h<1) return 'just now'; if(h<24) return h+'h ago'; return Math.floor(h/24)+'d ago';
}
function explainerFrom(title, snippet){
  const t = (title||'').toLowerCase();
  let why = 'Why it matters: Headline capturing market attention over the last day.';
  if (t.includes('etf')) why = 'Why it matters: ETF flows can shift spot demand and volatility.';
  else if (t.includes('miner') || t.includes('mining')) why = 'Why it matters: Miner behavior affects selling pressure and network security.';
  else if (t.includes('halving')) why = 'Why it matters: Halving reduces issuance and reshapes supply dynamics.';
  else if (t.includes('sec') || t.includes('regulat')) why = 'Why it matters: Regulation can change access, liquidity and sentiment.';
  else if (t.includes('hack') || t.includes('exploit')) why = 'Why it matters: Security incidents hit confidence and can cause sharp moves.';
  const clean = (snippet||'').replace(/<[^>]+>/g,'').trim();
  return (clean? (clean.slice(0,180) + (clean.length>180?'…':'')) : '') + ' ' + why;
}

exports.handler = async () => {
  try{
    const parser = new Parser({ timeout: 8000 });
    const now = Date.now(), cutoff = now - 24*60*60*1000;
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
    let top5 = items.slice(0,5).map(x => ({
      title: x.title, url: x.url, source: x.source, explainer: explainerFrom(x.title, x.snippet)
    }));

    if (!items.length) {
      const fallbackItems = [
        {title:'Bitcoin market overview', url:'https://bitcoinmagazine.com/', source:'Bitcoin Magazine', ts:now-2*3600*1000, timeago:'2h ago', snippet:'Daily overview of BTC price and network metrics.'},
        {title:'ETF flows snapshot', url:'https://www.coindesk.com/', source:'CoinDesk', ts:now-3*3600*1000, timeago:'3h ago', snippet:'Institutional flows into BTC-linked products.'}
      ];
      top5 = fallbackItems.slice(0,2).map(x=>({title:x.title, url:x.url, source:x.source, explainer: explainerFrom(x.title, x.snippet)}));
      return { statusCode:200, body: JSON.stringify({ items: fallbackItems, top5 }) };
    }

    return {
      statusCode: 200,
      headers: { 'Cache-Control': 'public, max-age=300' },
      body: JSON.stringify({ items, top5 })
    };
  }catch(e){
    return { statusCode: 200, body: JSON.stringify({ items: [], top5: [] }) };
  }
};
