# BTC is Freedom — Multi-Tab Bitcoin Dashboard (v2)

Tabs:
- Dashboard: tiles (price, volume, dominance, block height, halving ETA, mempool size, fees, difficulty, hashrate, supply) + TradingView chart
- News: top 5 key moves (expanded, linked) + all 24h headlines
- DCA & Analysis: DCA planner with CoinGecko prices
- Fear & Greed: composite from Alternative.me, funding-based score, 30d volatility-derived score, and site AI sentiment
- Memes: fresh posts from r/BitcoinMemes, r/Bitcoin, r/CryptoCurrencyMemes

## Deploy (no Terminal)
1) Create a new empty repo on GitHub.
2) Upload the contents of the `btc-is-freedom/` folder (not the folder itself).
3) On Vercel: New Project → Import Git Repo → Deploy. Output dir: `dist`.
4) Open your live site and browse tabs.

All APIs are serverless functions under `/api/*`, using public endpoints (no keys).
