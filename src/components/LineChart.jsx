import React, { useEffect, useRef } from 'react';
import { createChart } from 'lightweight-charts';

export default function LineChart({ series = [], overlays = [], colors = {} }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const chart = createChart(el, {
      width: el.clientWidth,
      height: 340,
      layout: { background: { type: 'solid', color: 'transparent' }, textColor: '#cbd5e1' },
      grid: { vertLines: { color: '#1f2a44' }, horzLines: { color: '#1f2a44' } },
      rightPriceScale: { borderVisible: false },
      timeScale: { borderVisible: false },
    });

    const price = chart.addLineSeries({ color: colors.price || '#f7931a', lineWidth: 2 });
    price.setData(series || []);

    overlays.forEach((ov, i) => {
      const l = chart.addLineSeries({
        color: ov.color || ['#7dd3fc', '#34d399', '#fca5a5', '#fde047', '#a78bfa'][i % 5],
        lineWidth: 1,
      });
      l.setData(ov.data || []);
    });

    const onResize = () => chart.applyOptions({ width: el.clientWidth });
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      chart.remove();
    };
  }, [series, overlays, colors]);

  return <div className="chartbox" ref={ref} />;
}
