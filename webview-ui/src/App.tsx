import React, { useEffect, useState } from 'react';
import BarChart from './components/BarChart';
import StatCard from './components/StatCard';
import { requestData, exportData, resetData } from './api';
import type { AnalyticsData } from './types';

export default function App() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  useEffect(() => {
    const handler = (ev: MessageEvent) => {
      const msg = (ev as MessageEvent).data;
      if (msg?.type === 'data') setData(msg.payload as AnalyticsData);
    };
    window.addEventListener('message', handler as EventListener);
    requestData();
    return () => window.removeEventListener('message', handler as EventListener);
  }, []);
  const byLang = Object.entries(data?.byLanguage || {}).sort((a, b) => (b[1].seconds - a[1].seconds));
  const labels = byLang.map(([k]) => k);
  const seconds = byLang.map(([, v]) => v.seconds);
  const totalMin = ((data?.totals.seconds || 0) / 60).toFixed(1);
  return (
    <div style={{ padding: 16, color: 'var(--vscode-foreground)', background: 'var(--vscode-editor-background)' }}>
      <h2>DevAnalytics</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        <StatCard label="Total Time (min)" value={totalMin} />
        <StatCard label="Files Opened" value={String(data?.totals.filesOpened || 0)} />
        <StatCard label="Keystrokes" value={String(data?.totals.keystrokes || 0)} />
      </div>
      <div style={{ marginTop: 16 }}>
        <BarChart title="Time by Language (seconds)" labels={labels} values={seconds} />
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        <button onClick={exportData}>Export JSON</button>
        <button onClick={resetData}>Reset</button>
      </div>
      <p style={{ opacity: 0.7, marginTop: 12 }}>
        Data is stored locally in your VS Code global storage. Tracking is opt-in via <code>devAnalytics.enable</code>.
      </p>
    </div>
  );
}
