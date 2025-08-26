import React, { useEffect, useRef } from 'react';

export default function TradingViewWidget({ symbol = "COINBASE:BTCUSD", theme="dark" }){
  const ref = useRef(null);
  useEffect(()=>{
    if(!ref.current) return;
    const script = document.createElement('script');
    script.src = "https://s3.tradingview.com/tv.js";
    script.async = true;
    script.onload = () => {
      if (window.TradingView) {
        new window.TradingView.widget({
          symbol,
          autosize: true,
          interval: "60",
          timezone: "Etc/UTC",
          theme,
          style: "1",
          locale: "en",
          toolbar_bg: "rgba(14,20,32,1)",
          enable_publishing: false,
          allow_symbol_change: true,
          container_id: "tv_container"
        });
      }
    };
    ref.current.appendChild(script);
    return () => { if (script && script.parentNode) script.parentNode.removeChild(script); };
  }, [symbol, theme]);
  return <div className="tvwrap"><div id="tv_container" style={{width:"100%", height:"100%"}}/></div>;
}
