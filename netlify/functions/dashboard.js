function halvingETA(height){
  const HALVING_INTERVAL = 210000;
  const NEXT_HALVING = Math.ceil(height / HALVING_INTERVAL) * HALVING_INTERVAL;
  const blocksRemaining = NEXT_HALVING - height;
  const minutes = blocksRemaining * 10;
  const days = Math.floor(minutes / (60*24));
  const hours = Math.floor((minutes - days*60*24) / 60);
  return { text: `${days}d ${hours}h`, nextHalving: NEXT_HALVING, blocksRemaining };
}
function blockSubsidyBTC(height){
  const epoch = Math.floor(height / 210000);
  const subsidy = 50 / Math.pow(2, epoch);
  return Math.max(subsidy, 0);
}

exports.handler = async () => {
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

    const priceUSD   = price?.market_data?.current_price?.usd ?? 0;
    const change24h  = price?.market_data?.price_change_percentage_24h ?? 0;
    const dominance  = global?.data?.market_cap_percentage?.btc ?? 0;

    const height     = parseInt(heightTxt, 10) || 850000;
    const { text: halving_text, nextHalving, blocksRemaining: blocks_to_halving } = halvingETA(height);

    const feeFast    = fees?.fastestFee ?? 15;
    const feeEco     = fees?.economyFee ?? 3;

    const diffProg   = diff?.progressPercent ? Math.round(diff.progressPercent*100)/100 : 50;
    const remaining  = typeof diff?.remainingBlocks === 'number' ? diff.remainingBlocks : 1000;
    const sinceDiff  = 2016 - remaining;

    const supplySats = supplyTxt ? parseInt(supplyTxt,10) : 19_700_000*1e8;
    const supplyBTC  = Math.round(supplySats/1e8);
    const hashrateGH = hashrateTxt ? parseFloat(hashrateTxt) : NaN;
    const hashrateEH = isNaN(hashrateGH) ? 500 : hashrateGH/1e9;

    const subsidyBTC = blockSubsidyBTC(height);
    const pctMined = Math.round((supplyBTC / 21000000) * 1000) / 10;
    const issuanceDayBTC = Math.round((subsidyBTC * 144));
    const issuanceYearBTC = Math.round(issuanceDayBTC * 365);

    return {
      statusCode: 200,
      headers: { 'Cache-Control': 'public, max-age=120' },
      body: JSON.stringify({
        price_usd: priceUSD,
        change_24h: change24h,
        dominance_btc: dominance,
        block_height: height,
        next_halving_height: nextHalving,
        halving_eta: halving_text,
        blocks_to_halving,
        diff_progress: diffProg,
        diff_blocks_since: sinceDiff,
        diff_blocks_remaining: remaining,
        mempool_count: mempool?.count ?? 0,
        mempool_vmb: (typeof mempool?.vsize === 'number' ? Math.round(mempool.vsize/1e6*10)/10 : (mempool?.vsizeSum ? Math.round(mempool.vsizeSum/1e6*10)/10 : 0)),
        fee_fast: feeFast,
        fee_economy: feeEco,
        hashrate_eh: isNaN(hashrateEH) ? 0 : hashrateEH,
        supply_btc: supplyBTC,
        pct_mined: pctMined,
        block_subsidy_btc: subsidyBTC,
        issuance_day_btc: issuanceDayBTC,
        issuance_year_btc: issuanceYearBTC
      })
    };
  }catch{
    return { statusCode: 200, body: JSON.stringify({}) };
  }
};
