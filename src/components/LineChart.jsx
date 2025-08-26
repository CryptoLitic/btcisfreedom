import React, { useEffect, useRef } from 'react';
import { createChart } from 'lightweight-charts';

export default function LineChart({ series = [], overlays = [], colors = {} }) {
  const ref = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Ensure the container has a width before creating the chart
    const width = el.clientWidth || el.parentElement?.clientWidth || 640;

    const chart = createChart(el, {
      width,
      height: 360,
      layout: { background: { type: 'solid', color: 'transparent' }, textColor: '#cbd5e1' },
      grid: { vertLines: { color: '#1f2a44' }, horzLines: { color: '#1f2a44' } },
      rightPriceScale: { borderVisible: false },
      timeScale: { borderVisible: false },
    });
    chartRef.current = chart;

    const price = chart.addLineSeries({ color: colors.price || '#f7931a', lineWidth: 2 });
    if (Array.isArray(series) && series.length) price.setData(series);

    const ovHandles = [];
    overlays.forEach((ov, i) => {
      if (!ov?.data?.length) return;
      const l = chart.addLineSeries({
        color: ov.color || ['#7dd3fc', '#34d399', '#fca5a5', '#fde047', '#a78bfa'][i % 5],
        lineWidth: 1,
      });
      l.setData(ov.data);
      ovHandles.push(l);
    });

    // Keep width in sync — this fixes blank charts
    const ro = new ResizeObserver(() => {
      const w = el.clientWidth || 640;
      chart.applyOptions({ width: w });
    });
    ro.observe(el);

    return () => {
      ro.disconnect();
      ovHandles.forEach(h => chart.removeSeries(h));
      chart.remove();
      chartRef.current = null;
    };
  }, []);

  // Update data when props change
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;
    const seriesList = chart.getSeries();
    if (!seriesList.length) return;

    // First series = price
    const price = seriesList[0];
    if (Array.isArray(series) && series.length) {
      price.setData(series);
    }

    // Overlays: remove old overlays and re-add (simplest robust approach)
    seriesList.slice(1).forEach(s => chart.removeSeries(s));
    overlays.forEach((ov, i) => {
      if (!ov?.data?.length) return;
      const l = chart.addLineSeries({
        color: ov.color || ['#7dd3fc', '#34d399', '#fca5a5', '#fde047', '#a78bfa'][i % 5],
        lineWidth: 1,
      });
      l.setData(ov.data);
    });
  }, [series, overlays, colors]);

  return <div className="chartbox" ref={ref} />;
}
