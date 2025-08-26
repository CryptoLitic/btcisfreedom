const Parser = require('rss-parser');
const FEEDS = [
  'https://bitcoinmagazine.com/.rss/full/',
  'https://www.coindesk.com/arc/outboundfeeds/rss/',
  'https://news.bitcoin.com/feed/',
  'https://cryptonews.com/news/feed'
];
const POS = ['surge','soar','bull','bullish','rally','record','all-time high','ath','inflow','adopt','approval','growth','gain','climb','breakout','positive','increase','pump','accumulate','hodl'];
const NEG = ['drop','dump','bear','bearish','selloff','down','plunge','crash','fear','ban','lawsuit','hack','exploit','outflow','liquidation','recession','decline','negative','miss'];
function scoreText(t){ if(!t) return 50; const s=t.toLowerCase(); let score=50; POS.forEach(w=>{ if(s.includes(w)) score+=2 }); NEG.forEach(w=>{ if(s.includes(w)) score-=2 }); return Math.max(0, Math.min(100, score)); }
exports.handler = async () => {
  try{
    const parser = new Parser({ timeout: 10000 });
    const items = [];
    for(const url of FEEDS){
      try{
        const feed = await parser.parseURL(url);
        (feed.items||[]).slice(0,10).forEach(it=>{
          const title = it.title||'';
          const content = it.contentSnippet||it.content||'';
          const pub = it.pubDate || it.isoDate || null;
          const score = scoreText(`${title} ${content}`);
          items.push({ title, url: it.link||it.guid||'#', source: (feed.title||'').replace(/\s+RSS.*$/i,''), pubDate: pub, score, contentSnippet: content });
        });
      }catch(e){}
    }
    items.sort((a,b)=> (Date.parse(b.pubDate||0)) - (Date.parse(a.pubDate||0)) );
    const latest = items.slice(0,20);
    const avg = latest.length ? Math.round(latest.reduce((a,b)=>a+b.score,0)/latest.length) : 50;
    return { statusCode:200, headers:{'Cache-Control':'public, max-age=600'}, body: JSON.stringify({ score: avg, items: latest }) };
  }catch{
    return { statusCode:200, body: JSON.stringify({ score: 50, items: [] }) };
  }
};
