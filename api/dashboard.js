// /api/dashboard.js
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
    const [price, global, heightTxt, mempool, fees, diff, supplyTxt, hashrateTxt] = await Promise.all([
      fetch('https://api.coingecko.com/api/v3/coins/bitcoin?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false').then(r=>r.json()).catch(_=>null),
      fetch('https://api.coingecko.com/api/v3/global').then(r=>r.json()).catch(_=>null),
      fetch('https://mempool.space/api/blocks/tip/height').then(r=>r.text()).catch(_=>null),
      fetch('https://mempool.space/api/mempool').then(r=>r.json()).catch(_=>null),
      fetch('https://mempool.space/api/v1/fees/recommended').then(r=>r.json()).catch(_=>null),
      fetch('https://mempool.space/api/v1/difficulty-adjustment').then(r=>r.json()).catch(_=>null),
      fetch('https://blockchain.info/q/totalbc?cors=true').then(r=>r.text()).catch(_=>null),
      fetch('https://blockchain.info/q/hashrate?cors=true').then(r=>r.text()).catch(_=>null)
    ]);

    const priceUSD = price?.market_data?.current_price?.usd || null;
    const change24h = price?.market_data?.price_change_percentage_24h || null;
    const volume24 = price?.market_data?.total_volume?.usd || null;
    const dominance = global?.data?.market_cap_percentage?.btc || null;
    const h = parseInt(heightTxt, 10) || null;
    const feeFast = fees?.fastestFee ?? fees?.halfHourFee ?? null;
    const feeEco = fees?.economyFee ?? null;
    const diffProg = diff?.progressPercent ? Math.round(diff.progressPercent*100)/100 : null;
    const supplyBTC = supplyTxt ? Math.round(parseInt(supplyTxt,10)/1e8) : null;
    const memCount = mempool?.count ?? null;
    const memVBytes = mempool?.vsize ?? mempool?.vsizeSum ?? null;
    const memVMB = typeof memVBytes === 'number' ? memVBytes / 1e6 : null;
    const hashrateGH = hashrateTxt ? parseFloat(hashrateTxt) : null;
    const hashrateEH = typeof hashrateGH === 'number' ? hashrateGH / 1e9 : null;

    res.setHeader('Cache-Control','s-maxage=120, stale-while-revalidate=120');
    res.status(200).json({
      price_usd: priceUSD,
      change_24h: change24h,
      volume_24h_usd: volume24,
      dominance_btc: dominance,
      block_height: h,
      halving_eta: h ? halvingETA(h) : null,
      mempool_count: memCount,
      mempool_vmb: memVMB,
      fee_fast: feeFast,
      fee_economy: feeEco,
      diff_progress: diffProg,
      supply_btc: supplyBTC,
      hashrate_eh: hashrateEH
    });
  }catch(e){
    res.status(200).json({});
  }
}
