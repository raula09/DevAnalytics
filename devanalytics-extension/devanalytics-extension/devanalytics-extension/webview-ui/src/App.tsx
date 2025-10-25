import React, { useEffect, useMemo, useState } from "react"
import { requestData, exportJson, exportCsv, resetData, toggleFocus } from "./api"
import type { DashboardPayload, AnalyticsData } from "./types"
import StatCard from "./components/StatCard"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"

export default function App() {
  const [payload, setPayload] = useState<DashboardPayload | null>(null)
  const [sessionTime, setSessionTime] = useState(0)
  useEffect(() => {
    ;(window as any).__devanalytics_onmsg = (msg: any) => {
      if (msg?.type === "data") setPayload(msg.payload as DashboardPayload)
    }
    requestData()
  }, [])
  useEffect(() => {
    const i = setInterval(() => setSessionTime(p => p + 1), 1000)
    return () => clearInterval(i)
  }, [])
  const data: AnalyticsData | null = payload?.analytics || null
  const byLang = useMemo(() => Object.entries(data?.byLanguage || {}).sort((a,b)=>b[1].seconds-a[1].seconds), [data])
  const totalSec = data?.totals.seconds || 0
  const totalMin = (totalSec / 60).toFixed(1)
  const totalHours = (totalSec / 3600).toFixed(1)
  const totalKeys = data?.totals.keystrokes || 0
  const totalFiles = data?.totals.filesOpened || 0
  const productivity = totalSec > 0 ? (totalKeys / (totalSec / 60)).toFixed(1) : "0"
  const filesPerHour = totalSec > 0 ? (totalFiles / (totalSec / 3600)).toFixed(1) : "0"
  const topLang = byLang[0]?.[0] || "Unknown"
  const chartData = byLang.map(([lang, stats]) => ({ language: lang.toUpperCase(), minutes: +(stats.seconds / 60).toFixed(1), keystrokes: stats.keystrokes }))
  const goal = payload?.meta.goalMinutes || 120
  const progress = Math.min(100, Math.floor((parseFloat(totalMin) / goal) * 100))

  return (
    <div className="dashboard fade-in">
      <header className="header glass">
        <h1>⚡ DevAnalytics</h1>
        <div className="actions">
          <button onClick={exportJson}>📤 JSON</button>
          <button onClick={exportCsv}>📄 CSV</button>
          <button onClick={resetData} className="danger">�� Reset</button>
          <button onClick={toggleFocus}>{payload?.meta.focusMode ? "🎯 Focus On" : "🎯 Focus Off"}</button>
        </div>
      </header>

      <div className="goal glass">
        <div className="bar"><div className="fill" style={{width: progress + "%"}} /></div>
        <div className="goaltext">Goal {goal}m • {progress}%</div>
      </div>

      <div className="focus-summary glass">
        <h3>🕐 Live Tracker</h3>
        <p>Session: <strong>{(sessionTime / 60).toFixed(1)} min</strong></p>
        <p>Most Active: <strong>{byLang[0]?.[0] || "N/A"}</strong></p>
        <p>Idle limit: <strong>{payload?.meta.idleSeconds || 300}s</strong></p>
      </div>

      <div className="stats-grid">
        <StatCard icon="🕒" label="Time" value={`${totalHours} hrs`} />
        <StatCard icon="⌨️" label="Keystrokes" value={totalKeys} />
        <StatCard icon="📁" label="Files" value={totalFiles} />
        <StatCard icon="🔥" label="Productivity" value={productivity} />
        <StatCard icon="📊" label="Files/Hour" value={filesPerHour} />
        <StatCard icon="⭐" label="Top Lang" value={topLang} />
      </div>

      <div className="chart glass">
        <h2>Time by Language (minutes)</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
            <XAxis dataKey="language" />
            <YAxis />
            <Tooltip contentStyle={{ backgroundColor: "rgba(20,20,30,0.9)", border: "none", borderRadius: "10px", color: "#fff" }} />
            <Bar dataKey="minutes" fill="var(--accent)" radius={[10,10,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="achievements glass">
        <h2>Achievements</h2>
        <ul>
          {(payload?.achievements || []).map(a => <li key={a}>{a}</li>)}
          {(payload?.achievements || []).length === 0 && <li>No achievements yet</li>}
        </ul>
      </div>

      <footer className="footer">Private. Local. Yours.</footer>

      <style>{`
        :root { --bg: #0f1116; --text: #e8e8f0; --accent: #7aa2ff; --card-bg: rgba(255,255,255,0.06); --blur: 14px }
        body, .dashboard { font-family: Inter, ui-sans-serif, system-ui; background: var(--bg); color: var(--text); min-height: 100vh; padding: 2rem }
        .glass { background: var(--card-bg); backdrop-filter: blur(var(--blur)); border-radius: 18px; box-shadow: 0 4px 25px rgba(0,0,0,0.25) }
        .fade-in { animation: fade .6s ease forwards } @keyframes fade { from {opacity:0; transform: translateY(8px)} to {opacity:1; transform: translateY(0)} }
        .header { display:flex; justify-content:space-between; align-items:center; padding:1rem 1.5rem; margin-bottom:1.5rem }
        .actions button { margin-left:.5rem; padding:.5rem 1rem; border:none; border-radius:8px; cursor:pointer; font-weight:600; color:#fff; background:var(--accent) }
        .danger { background: linear-gradient(145deg,#d14b4b,#a42a2a) }
        .stats-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(180px,1fr)); gap:1rem; margin-bottom:1.5rem }
        .chart { padding:1.2rem 1.5rem; margin-bottom:1.5rem }
        h2 { margin-bottom:.8rem; font-size:1.05rem; opacity:.9 }
        .footer { text-align:center; opacity:.6; margin-top:.5rem }
        .focus-summary { padding:1rem 1.2rem; margin-bottom:1.2rem; border-left:4px solid var(--accent); background: linear-gradient(145deg, rgba(100,120,255,0.12), rgba(150,80,255,0.06)) }
        .goal { padding:1rem 1.2rem; margin-bottom:1.2rem }
        .bar { width:100%; height:10px; background:rgba(255,255,255,.07); border-radius:999px; overflow:hidden }
        .fill { height:100%; background:var(--accent) }
        .goaltext { margin-top:.4rem; font-size:.9rem; opacity:.85 }
        .achievements { padding:1.2rem 1.5rem }
        .achievements ul { margin:0; padding-left:1rem }
      `}</style>
    </div>
  )
}
