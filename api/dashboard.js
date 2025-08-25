// /api/dashboard.js
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

function halvingETA(height){
  const HALVING_INTERVAL = 210000;
  const NEXT_HALVING = Math.ceil(height / HALVING_INTERVAL) * HALVING_INTERVAL;
  const blocksRemaining = NEXT_HALVING - height;
  const minutes = blocksRemaining * 10;
  const days = Math.floor(minutes / (60*24));
  const hours = Math.floor((minutes - days*60*24) / 60);
  return `${days}d ${hours}h`;
}

module.exports = async (req, res) => {
  try{
    const [price, height, fees, diff, supply] = await Promise.all([
      fetch('https://api.coingecko.com/api/v3/coins/bitcoin?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false').then(r=>r.json()).catch(_=>null),
      fetch('https://mempool.space/api/blocks/tip/height').then(r=>r.text()).catch(_=>null),
      fetch('https://mempool.space/api/v1/fees/recommended').then(r=>r.json()).catch(_=>null),
      fetch('https://mempool.space/api/v1/difficulty-adjustment').then(r=>r.json()).catch(_=>null),
      fetch('https://blockchain.info/q/totalbc?cors=true').then(r=>r.text()).catch(_=>null)
    ]);
    const priceUSD = price?.market_data?.current_price?.usd || null;
    const change24h = price?.market_data?.price_change_percentage_24h || null;
    const h = parseInt(height, 10) || null;
    const feeFast = fees?.fastestFee ?? fees?.halfHourFee ?? null;
    const feeEco = fees?.economyFee ?? null;
    const diffProg = diff?.progressPercent ? Math.round(diff.progressPercent*100)/100 : null;
    const supplyBTC = supply ? Math.round(parseInt(supply,10)/1e8) : null;

    res.setHeader('Cache-Control','s-maxage=120, stale-while-revalidate=120');
    res.status(200).json({
      price_usd: priceUSD,
      change_24h: change24h,
      block_height: h,
      halving_eta: h ? halvingETA(h) : null,
      fee_fast: feeFast,
      fee_economy: feeEco,
      diff_progress: diffProg,
      supply_btc: supplyBTC
    });
  }catch(e){
    res.status(200).json({});
  }
}
