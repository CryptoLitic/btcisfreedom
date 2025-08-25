// /api/fng.js
// Composite Fear & Greed: Alternative.me + funding-based + 30d volatility + site AI sentiment
async function fetchJSON(url, opts){ const r = await fetch(url, opts); if(!r.ok) throw new Error('fetch'); return r.json(); }

function scoreFunding(fundingRate){
  // funding ~0 neutral; high positive => greed, high negative => fear. Clamp -0.05..0.05 to 0..100
  const clamped = Math.max(-0.05, Math.min(0.05, fundingRate||0));
  return Math.round(((clamped + 0.05) / 0.10) * 100);
}
function scoreVolatility(stdPct){
  // higher vol => fear. Map 0%..10% daily std to 100..0
  const c = Math.max(0, Math.min(10, stdPct||0));
  return Math.round((1 - (c/10)) * 100);
}

module.exports = async (req, res) => {
  try{
    const [alt, funding, marketChart, site] = await Promise.all([
      fetch('https://api.alternative.me/fng/?limit=1').then(r=>r.json()).catch(_=>null),
      fetch('https://fapi.binance.com/fapi/v1/premiumIndex?symbol=BTCUSDT').then(r=>r.json()).catch(_=>null),
      fetch('https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=35&interval=daily').then(r=>r.json()).catch(_=>null),
      fetch(process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}/api/sentiment` : 'http://localhost:3000/api/sentiment').then(r=>r.json()).catch(_=>null)
    ]);

    const altValue = alt && alt.data && alt.data[0] ? parseInt(alt.data[0].value,10) : null;
    const fundingRate = funding && typeof funding.lastFundingRate !== 'undefined' ? parseFloat(funding.lastFundingRate) : (funding && funding.lastFundingRate ? parseFloat(funding.lastFundingRate) : 0);
    const fundingScore = scoreFunding(fundingRate);

    let volScore = 50;
    try{
      const prices = (marketChart && marketChart.prices) ? marketChart.prices.map(p=>p[1]) : [];
      const rets = []; for(let i=1;i<prices.length;i++){ rets.push((prices[i]-prices[i-1])/prices[i-1]*100); }
      const avg = rets.reduce((a,b)=>a+b,0)/Math.max(1,rets.length);
      const std = Math.sqrt(rets.reduce((a,b)=>a+(b-avg)*(b-avg),0)/Math.max(1,rets.length));
      volScore = scoreVolatility(std);
    }catch(e){}

    const ai = (site && typeof site.score === 'number') ? site.score : 50;

    const components = [
      ['alt_fng', altValue],
      ['funding_score', fundingScore],
      ['vol_score', volScore],
      ['ai_sentiment', ai]
    ].filter(x=> typeof x[1]==='number' && !isNaN(x[1]));

    const values = components.map(x=>x[1]).sort((a,b)=>a-b);
    const median = values.length ? values[Math.floor(values.length/2)] : 50;
    const label = median < 25 ? 'Extreme Fear' : median < 45 ? 'Fear' : median > 75 ? 'Extreme Greed' : median > 55 ? 'Greed' : 'Neutral';

    const out = { alt_fng: altValue, funding_score: fundingScore, vol_score: volScore, ai_sentiment: ai, median, label };
    res.setHeader('Cache-Control','s-maxage=900, stale-while-revalidate=900');
    res.status(200).json(out);
  }catch(e){
    res.status(200).json({ alt_fng: null, funding_score: 50, vol_score: 50, ai_sentiment: 50, median: 50, label: 'Neutral' });
  }
}
