// /api/sentiment.js
const Parser = require('rss-parser');
const FEEDS = [
  'https://bitcoinmagazine.com/.rss/full/',
  'https://www.coindesk.com/arc/outboundfeeds/rss/',
  'https://news.bitcoin.com/feed/',
  'https://cryptonews.com/news/feed'
];
const POS = ['surge','soar','bull','bullish','rally','record','all-time high','ath','inflow','adopt','adoption','approve','approval','sec ok','growth','gain','gains','climb','spike','breakout','positive','beat','beats','increase','expansion','pump','accumulate','hodl'];
const NEG = ['drop','dump','bear','bearish','selloff','sell-off','down','plunge','crash','fear','ban','banned','restrict','lawsuit','sue','sues','hack','hacked','exploit','outflow','liquidation','liquidations','recession','decline','decrease','negative','miss','misses'];

function scoreText(t){ if(!t) return 50; const s=t.toLowerCase(); let score=50; POS.forEach(w=>{ if(s.includes(w)) score+=2 }); NEG.forEach(w=>{ if(s.includes(w)) score-=2 }); if(score<0) score=0; if(score>100) score=100; return score; }

module.exports = async (req, res) => {
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
        })
      }catch(e){}
    }
    items.sort((a,b)=> (Date.parse(b.pubDate||0)) - (Date.parse(a.pubDate||0)) );
    const latest = items.slice(0,20);
    const avg = latest.length ? Math.round(latest.reduce((a,b)=>a+b.score,0)/latest.length) : 50;
    res.setHeader('Cache-Control','s-maxage=600, stale-while-revalidate=600');
    res.status(200).json({ score: avg, items: latest });
  }catch(e){
    res.status(200).json({ score: 50, items: [] });
  }
}
