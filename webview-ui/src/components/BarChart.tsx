import React, { useEffect, useRef } from 'react';
type Props = { labels: string[]; values: number[]; title?: string };
export default function BarChart({ labels, values, title }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const w = canvasRef.current!.width;
    const h = canvasRef.current!.height;
    ctx.clearRect(0, 0, w, h);
    if (title) { ctx.font = '16px sans-serif'; ctx.fillText(title, 8, 20); }
    const max = Math.max(1, ...values), pad = 32;
    const chartW = w - pad * 2, chartH = h - pad * 2;
    const safeCount = Math.max(1, values.length);
    const barW = (chartW / safeCount) * 0.6;
    ctx.strokeRect(pad, pad, chartW, chartH);
    values.forEach((v, i) => {
      const x = pad + (i + 0.2) * (chartW / safeCount);
      const bh = (v / max) * (chartH - 10);
      const y = pad + chartH - bh;
      ctx.fillRect(x, y, barW, bh);
      ctx.font = '12px sans-serif'; ctx.fillText(labels[i], x, pad + chartH + 14);
    });
  }, [labels, values, title]);
  return <canvas ref={canvasRef} width={640} height={320} />;
}
