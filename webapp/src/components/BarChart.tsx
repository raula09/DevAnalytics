import React, { useEffect, useRef } from 'react';

export default function BarChart({ labels, values, title }: { labels: string[]; values: number[]; title?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const ctx = ref.current?.getContext('2d');
    if (!ctx || !ref.current) return;
    const w = ref.current.width = ref.current.clientWidth;
    const h = ref.current.height = 320;

    ctx.clearRect(0,0,w,h);
    if (title) { ctx.font = '16px sans-serif'; ctx.fillText(title, 10, 22); }

    const max = Math.max(1, ...values);
    const pad = 40;
    const chartW = w - pad * 2, chartH = h - pad * 2;
    const n = Math.max(1, values.length);
    const step = chartW / n;
    const bw = step * 0.6;

    ctx.strokeStyle = '#374151';
    ctx.strokeRect(pad, pad, chartW, chartH);
    ctx.fillStyle = '#93c5fd';

    values.forEach((v, i) => {
      const x = pad + i * step + (step - bw) / 2;
      const bh = (v / max) * (chartH - 10);
      const y = pad + chartH - bh;
      ctx.fillRect(x, y, bw, bh);
      ctx.fillStyle = '#9ca3af';
      ctx.font = '12px sans-serif';
      ctx.fillText(labels[i], x, pad + chartH + 14);
      ctx.fillStyle = '#93c5fd';
    });
  }, [labels, values, title]);

  return <canvas ref={ref} style={{ width: '100%' }} />;
}
