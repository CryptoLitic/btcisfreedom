function scoreFunding(fundingRate){
  const clamped = Math.max(-0.05, Math.min(0.05, fundingRate||0));
  return Math.round(((clamped + 0.05) / 0.10) * 100);
}
function scoreVolatility(stdPct){
  const c = Math.max(0, Math.min(10, stdPct||0));
  return Math.round((1 - (c/10)) * 100);
}
exports.handler = async () => {
  try{
    const [alt, funding, marketChart, site] = await Promise.all([
      fetch('https://api.alternative.me/fng/?limit=1').then(r=>r.json()).catch(_=>null),
      fetch('https://fapi.binance.com/fapi/v1/premiumIndex?symbol=BTCUSDT').then(r=>r.json()).catch(_=>null),
      fetch('https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=35&interval=daily').then(r=>r.json()).catch(_=>null),
      fetch('.netlify/functions/sentiment', { headers: { 'x-internal':'1' } }).then(r=>r.json()).catch(_=>null)
    ]);
    const altValue = alt?.data?.[0]?.value ? parseInt(alt.data[0].value,10) : 50;
    const fundingRate = funding?.lastFundingRate ? parseFloat(funding.lastFundingRate) : 0;
    const fundingScore = scoreFunding(fundingRate);
    let volScore = 50;
    try{
      const prices = Array.isArray(marketChart?.prices) ? marketChart.prices.map(p=>p[1]) : [];
      const rets = []; for(let i=1;i<prices.length;i++){ rets.push((prices[i]-prices[i-1])/prices[i-1]*100); }
      const avg = rets.reduce((a,b)=>a+b,0)/Math.max(1,rets.length);
      const std = Math.sqrt(rets.reduce((a,b)=>a+(b-avg)*(b-avg),0)/Math.max(1,rets.length));
      volScore = scoreVolatility(std);
    }catch(e){}
    const ai = typeof site?.score === 'number' ? site.score : 50;
    const values = [altValue, fundingScore, volScore, ai].sort((a,b)=>a-b);
    const median = values[Math.floor(values.length/2)];
    const label = median < 25 ? 'Extreme Fear' : median < 45 ? 'Fear' : median > 75 ? 'Extreme Greed' : median > 55 ? 'Greed' : 'Neutral';
    return { statusCode:200, headers:{'Cache-Control':'public, max-age=900'}, body: JSON.stringify({ alt_fng: altValue, funding_score: fundingScore, vol_score: volScore, ai_sentiment: ai, median, label }) };
  }catch{
    return { statusCode:200, body: JSON.stringify({ alt_fng: 50, funding_score: 50, vol_score: 50, ai_sentiment: 50, median: 50, label: 'Neutral' }) };
  }
};
