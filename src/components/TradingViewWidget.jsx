import React from "react";

export default function TradingViewWidget({ symbol = "COINBASE:BTCUSD" }) {
  const src = `https://s.tradingview.com/widgetembed/?frameElementId=tv_iframe&symbol=${encodeURIComponent(
    symbol
  )}&interval=60&hidesidetoolbar=1&symboledit=1&saveimage=0&toolbarbg=rgba(14,20,32,1)&studies=[]&theme=dark&style=1&timezone=Etc/UTC&hideideas=1`;
  return (
    <div className="tvwrap">
      <iframe
        id="tv_iframe"
        title="BTC chart"
        src={src}
        style={{ width: "100%", height: "100%", border: 0 }}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}
