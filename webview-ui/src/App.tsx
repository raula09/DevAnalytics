import React, { useEffect, useState } from "react"
import { requestData, exportData, resetData } from "./api"
import type { AnalyticsData } from "./types"
import StatCard from "./components/StatCard"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts"

export default function App() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [sessionTime, setSessionTime] = useState(0)

  useEffect(() => {
    const handler = (ev: MessageEvent) => {
      const msg = ev.data
      if (msg?.type === "data") {
        setData(msg.payload as AnalyticsData)
        setLoading(false)
      }
    }
    window.addEventListener("message", handler as EventListener)

    if (typeof acquireVsCodeApi === "undefined") {
      setTimeout(() => {
        setData({
          version: 1,
          startedAt: Date.now(),
          totals: { seconds: 3600, filesOpened: 10, keystrokes: 5000 },
          byLanguage: {
            typescript: { seconds: 1500, filesOpened: 4, keystrokes: 2400 },
            javascript: { seconds: 1200, filesOpened: 3, keystrokes: 1800 },
            json: { seconds: 900, filesOpened: 3, keystrokes: 800 },
          },
        })
        setLoading(false)
      }, 400)
    } else {
      requestData()
    }

    return () => window.removeEventListener("message", handler as EventListener)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => setSessionTime(p => p + 1), 1000)
    return () => clearInterval(interval)
  }, [])

  if (loading)
    return (
      <div className="loading">
        <div className="spinner" />
        <p>Loading analytics...</p>
      </div>
    )

  const byLang = Object.entries(data?.byLanguage || {}).sort(
    (a, b) => b[1].seconds - a[1].seconds
  )

  const totalSec = data?.totals.seconds || 0
  const totalHours = (totalSec / 3600).toFixed(1)
  const totalKeys = data?.totals.keystrokes || 0
  const totalFiles = data?.totals.filesOpened || 0
  const productivity = (totalKeys / (totalSec / 60)).toFixed(1)
  const filesPerHour = (totalFiles / (totalSec / 3600)).toFixed(1)
  const topLang = byLang[0]?.[0] || "Unknown"

  const chartData = byLang.map(([lang, stats]) => ({
    language: lang.toUpperCase(),
    minutes: +(stats.seconds / 60).toFixed(1),
    keystrokes: stats.keystrokes,
  }))

  return (
    <div className="dashboard fade-in">
      <header className="header glass">
        <h1>⚡ DevAnalytics</h1>
        <div className="actions">
          <button onClick={exportData}>📤 Export</button>
          <button className="danger" onClick={resetData}>🗑 Reset</button>
        </div>
      </header>

      <div className="focus-summary glass">
        <h3>🕐 Live Focus Tracker</h3>
        <p>Session Time: <strong>{(sessionTime / 60).toFixed(1)} min</strong></p>
        <p>Most Active Language: <strong>{byLang[0]?.[0] || "N/A"}</strong></p>
        <p>Average Focus Streak: <strong>{((sessionTime / (data?.totals.filesOpened || 1)) * 2).toFixed(1)} min/file</strong></p>
      </div>

      <div className="stats-grid">
        <StatCard icon="🕒" label="Total Time" value={`${totalHours} hrs`} />
        <StatCard icon="⌨️" label="Keystrokes" value={totalKeys} />
        <StatCard icon="📁" label="Files Opened" value={totalFiles} />
        <StatCard icon="🔥" label="Productivity Index" value={productivity} />
        <StatCard icon="📊" label="Files / Hour" value={filesPerHour} />
        <StatCard icon="⭐" label="Top Language" value={topLang} />
      </div>

      <div className="chart glass">
        <h2>Time Spent by Language (minutes)</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
            <XAxis dataKey="language" />
            <YAxis />
            <Tooltip contentStyle={{ backgroundColor: "rgba(20,20,30,0.9)", border: "none", borderRadius: "10px", color: "#fff" }} />
            <Bar dataKey="minutes" fill="var(--accent)" radius={[10, 10, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <footer className="footer">Private. Local. Yours.</footer>

      <style>{`
        :root {
          --bg: var(--vscode-editor-background);
          --text: var(--vscode-foreground);
          --accent: var(--vscode-button-background);
          --card-bg: rgba(255,255,255,0.06);
          --blur: 14px;
        }
        body, .dashboard {
          font-family: "Inter", sans-serif;
          background: var(--bg);
          color: var(--text);
          min-height: 100vh;
          padding: 2rem;
        }
        .focus-summary {
          padding: 1.2rem 1.5rem;
          margin-bottom: 1.5rem;
          border-left: 4px solid var(--accent);
          background: linear-gradient(145deg, rgba(100,120,255,0.15), rgba(150,80,255,0.08));
        }
        .focus-summary h3 {
          margin-bottom: 0.5rem;
          font-size: 1rem;
          color: var(--accent);
        }
        .focus-summary p { margin: 0.2rem 0; opacity: 0.9; }
        .glass {
          background: var(--card-bg);
          backdrop-filter: blur(var(--blur));
          border-radius: 18px;
          box-shadow: 0 4px 25px rgba(0,0,0,0.25);
        }
        .fade-in { animation: fade 0.8s ease forwards; }
        @keyframes fade { from {opacity:0;transform:translateY(10px);} to {opacity:1;transform:translateY(0);} }
        .header { display:flex;justify-content:space-between;align-items:center; padding:1rem 1.5rem;margin-bottom:2rem; }
        .actions button {
          margin-left:0.5rem;padding:0.5rem 1rem;border:none;
          border-radius:8px;cursor:pointer;font-weight:500;
          color:#fff;background:var(--accent);
        }
        .danger { background:linear-gradient(145deg,#d14b4b,#a42a2a); }
        .stats-grid {
          display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));
          gap:1rem;margin-bottom:2rem;
        }
        .chart {
          padding:1.5rem 2rem;margin-bottom:1.5rem;
          background:linear-gradient(145deg,rgba(50,50,70,0.3),rgba(25,25,35,0.5));
        }
        h2 { margin-bottom:1rem; font-size:1.1rem; opacity:0.8; }
        .footer { text-align:center;opacity:0.6;margin-top:1rem; }
        .spinner {
          border:3px solid rgba(255,255,255,0.1);
          border-top:3px solid var(--accent);
          border-radius:50%;width:40px;height:40px;
          animation:spin 1s linear infinite;margin-bottom:1rem;
        }
        @keyframes spin {0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}
      `}</style>
    </div>
  )
}
