// /api/fng.js
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

module.exports = async (req, res) => {
  try{
    const alt = await fetch('https://api.alternative.me/fng/?limit=1').then(r=>r.json()).catch(_=>null);
    const altValue = alt && alt.data && alt.data[0] ? parseInt(alt.data[0].value,10) : null;
    // Get our sentiment as a proxy AI score
    let ai = 50;
    try{
      const s = await fetch(process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}/api/sentiment` : 'http://localhost:3000/api/sentiment').then(r=>r.json());
      ai = typeof s.score === 'number' ? s.score : 50;
    }catch(e){}
    const parts = [altValue, ai].filter(v=> typeof v === 'number' && !isNaN(v));
    const median = parts.length ? Math.round(parts.sort((a,b)=>a-b)[Math.floor(parts.length/2)]) : 50;
    const label = median < 25 ? 'Extreme Fear' : median < 45 ? 'Fear' : median > 75 ? 'Extreme Greed' : median > 55 ? 'Greed' : 'Neutral';
    res.setHeader('Cache-Control','s-maxage=900, stale-while-revalidate=900');
    res.status(200).json({ alt_fng: altValue, ai_sentiment: ai, median, label });
  }catch(e){
    res.status(200).json({ alt_fng: null, ai_sentiment: 50, median: 50, label: 'Neutral' });
  }
}
