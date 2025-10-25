import React, { useEffect, useMemo, useState } from 'react';
import BarChart from './components/BarChart';
import type { SummaryRow } from './types';

const API_BASE = (import.meta as any).env.VITE_API_BASE || 'http://localhost:5000';

export default function App() {
  const [summary, setSummary] = useState<SummaryRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string>('');
  const [filterUser, setFilterUser] = useState<string>('');

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/analytics/summary`);
      const data = await res.json();
      setSummary(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSummary(); }, []);

  const byLang = useMemo(() => {
    const rows = filterUser ? summary.filter(s => s.userId === filterUser) : summary;
    const map = new Map<string, number>();
    rows.forEach(r => map.set(r.languageId, (map.get(r.languageId) || 0) + r.seconds));
    const labels = Array.from(map.keys());
    const values = labels.map(l => map.get(l) || 0);
    return { labels, values };
  }, [summary, filterUser]);

  const users = useMemo(() => Array.from(new Set(summary.map(s => s.userId))), [summary]);

  return (
    <div className="container">
      <h1>DevAnalytics (External)</h1>

      <div className="card" style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button onClick={fetchSummary} disabled={loading}>{loading ? 'Loading…' : 'Refresh'}</button>
          <select value={filterUser} onChange={e => setFilterUser(e.target.value)}>
            <option value="">All users</option>
            {users.map(u => <option key={u} value={u}>{u}</option>)}
          </select>
          <span style={{ opacity: .7 }}>API: {API_BASE}</span>
        </div>
      </div>

      <div className="card">
        <BarChart title="Seconds by Language" labels={byLang.labels} values={byLang.values} />
      </div>

      <div className="card" style={{ marginTop: 12 }}>
        <h3>Raw summary</h3>
        <table>
          <thead><tr><th>User</th><th>Language</th><th>Seconds</th><th>Files</th><th>Keystrokes</th></tr></thead>
          <tbody>
            {summary.map((r, i) => (
              <tr key={i}>
                <td>{r.userId}</td>
                <td>{r.languageId}</td>
                <td>{r.seconds}</td>
                <td>{r.filesOpened}</td>
                <td>{r.keystrokes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ opacity: .7, marginTop: 12 }}>
        Tip: Set <code>VITE_API_BASE</code> at build/runtime to point to your hosted API.
      </div>
    </div>
  );
}
