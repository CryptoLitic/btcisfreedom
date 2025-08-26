import React, { useEffect, useRef } from 'react';
import { createChart } from 'lightweight-charts';

export default function PriceChart({ series=[] }){
  const ref = useRef(null);
  useEffect(()=>{
    const el = ref.current;
    if(!el) return;
    const chart = createChart(el, { width: el.clientWidth, height: 300, layout:{ background:{type:'solid', color: 'transparent'}, textColor:'#cbd5e1'}, grid:{vertLines:{color:'#1f2a44'}, horzLines:{color:'#1f2a44'}}, rightPriceScale:{ borderVisible:false }, timeScale:{ borderVisible:false } });
    const line = chart.addLineSeries({ color:'#f7931a', lineWidth:2 });
    if(series.length) line.setData(series);
    const onResize = () => chart.applyOptions({ width: el.clientWidth });
    window.addEventListener('resize', onResize);
    return ()=>{ window.removeEventListener('resize', onResize); chart.remove(); };
  }, [series]);
  return <div className="chartbox" ref={ref} />;
}
