import React, { useEffect, useMemo, useState } from "react"
import { requestData, exportData, resetData } from "./api"
import type { AnalyticsData } from "./types"
import StatCard from "./components/StatCard"
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area,
  Legend
} from "recharts"
const STORAGE_KEY = "devanalytics_notes"

export default function App() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [sessionTime, setSessionTime] = useState(0)
  const [range, setRange] = useState<"today" | "7d" | "30d">("7d")

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
          totals: { seconds: 3600 * 5.2, filesOpened: 38, keystrokes: 28451 },
          byLanguage: {
            typescript: { seconds: 3600 * 2.6, filesOpened: 14, keystrokes: 14210 },
            javascript: { seconds: 3600 * 1.9, filesOpened: 12, keystrokes: 10420 },
            json: { seconds: 3600 * 0.7, filesOpened: 12, keystrokes: 3821 }
          }
        })
        setLoading(false)
      }, 250)
    } else {
      requestData()
    }
    return () => window.removeEventListener("message", handler as EventListener)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => setSessionTime(p => p + 1), 1000)
    return () => clearInterval(interval)
  }, [])
const [notes, setNotes] = useState(localStorage.getItem(STORAGE_KEY) || "")
useEffect(() => {
  localStorage.setItem(STORAGE_KEY, notes)
}, [notes])

function copySnapshot() {
  const text = `
DevAnalytics Snapshot
Total Time: ${totalHours}h
Keystrokes: ${totalKeys}
Files: ${totalFiles}
Productivity: ${productivity}
Files/Hour: ${filesPerHour}
Top Language: ${topLang.toUpperCase()}
`
  navigator.clipboard.writeText(text).then(() => alert("📋 Snapshot copied!"))
}

  const byLang = useMemo(
    () => Object.entries(data?.byLanguage || {}).sort((a, b) => b[1].seconds - a[1].seconds),
    [data]
  )

  const totalSec = data?.totals.seconds || 0
  const totalHours = (totalSec / 3600).toFixed(1)
  const totalKeys = data?.totals.keystrokes || 0
  const totalFiles = data?.totals.filesOpened || 0
  const productivity = totalSec > 0 ? (totalKeys / (totalSec / 60)).toFixed(1) : "0.0"
  const filesPerHour = totalSec > 0 ? (totalFiles / (totalSec / 3600)).toFixed(1) : "0.0"
  const topLang = byLang[0]?.[0] || "Unknown"

  const langBars = byLang.map(([lang, stats]) => ({
    language: lang.toUpperCase(),
    minutes: +(stats.seconds / 60).toFixed(1),
    keystrokes: stats.keystrokes
  }))

  const trendSeed = Math.max(1, Math.round(totalSec / 600))
  const trend = Array.from({ length: 12 }).map((_, i) => ({
    t: `T${i + 1}`,
    focus: Math.max(0.3, Math.sin((i + 2) / 2) + 1.2) * trendSeed
  }))

  if (loading)
    return (
      <div className="loading">
        <div className="spinner" />
        <p>Loading analytics…</p>
        <style>{loadingCss}</style>
      </div>
    )

  return (
    <div className="wrap">
      <div className="bg-aura" />
      <header className="topbar">
        <div className="brand">
          <div className="dot" />
          <h1>DevAnalytics</h1>
          <span className="tag">Private • Local • Pro</span>
        </div>
        <div className="controls">
          <div className="switch">
            <button className={range === "today" ? "on" : ""} onClick={() => setRange("today")}>Today</button>
            <button className={range === "7d" ? "on" : ""} onClick={() => setRange("7d")}>7d</button>
            <button className={range === "30d" ? "on" : ""} onClick={() => setRange("30d")}>30d</button>
          </div>
          <div className="actions">
  <button onClick={copySnapshot}>Copy</button>
  <button onClick={exportData}>Export</button>
  <button className="danger" onClick={resetData}>Reset</button>
</div>

        </div>
      </header>

      <section className="kpis">
        <StatCard label="Total Time" value={`${totalHours}h`} accent />
        <StatCard label="Keystrokes" value={totalKeys.toLocaleString()} />
        <StatCard label="Files" value={totalFiles} />
        <StatCard label="Prod. Index" value={productivity} />
        <StatCard label="Files/Hour" value={filesPerHour} />
        <StatCard label="Top Language" value={topLang.toUpperCase()} />
      </section>

      <section className="panels">
        <div className="panel big">
          <div className="panel-head">
            <h3>Time by Language</h3>
            <span className="hint">minutes</span>
          </div>
          <div className="chart">
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={langBars} margin={{ top: 10, right: 16, left: 0, bottom: 6 }}>
                <defs>
                  <linearGradient id="bar" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.95} />
                    <stop offset="100%" stopColor="var(--accent-2)" stopOpacity={0.95} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeOpacity={0.12} vertical={false} />
                <XAxis dataKey="language" tickMargin={8} />
                <YAxis />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="minutes" fill="url(#bar)" radius={[10, 10, 6, 6]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel">
          <div className="panel-head">
            <h3>Focus Trend</h3>
            <span className="hint">synthetic index</span>
          </div>
          <div className="chart">
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={trend} margin={{ top: 10, right: 16, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.7} />
                    <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="t" hide />
                <YAxis hide />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="focus" stroke="var(--accent)" fill="url(#area)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mini">
            <div className="pill">
              <span>Session</span>
              <strong>{(sessionTime / 60).toFixed(1)}m</strong>
            </div>
            <div className="pill">
              <span>Active Lang</span>
              <strong>{byLang[0]?.[0]?.toUpperCase() || "N/A"}</strong>
            </div>
            <div className="pill">
              <span>Avg Streak</span>
              <strong>{((sessionTime / (data?.totals.filesOpened || 1)) * 2).toFixed(1)}m</strong>
            </div>
          </div>
        </div>
      </section>
<section className="notes">
  <h3>📝 Session Notes</h3>
  <textarea
    value={notes}
    onChange={e => setNotes(e.target.value)}
    placeholder="Quick notes or next goals..."
  />
</section>

      <footer className="foot">
        <span>v{data?.version || 1}</span>
        <span>Since {new Date(data?.startedAt || Date.now()).toLocaleDateString()}</span>
      </footer>

      <style>{css}</style>
    </div>
  )
}

const tooltipStyle: React.CSSProperties = {
  backgroundColor: "rgba(20,20,28,0.95)",
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: 12,
  color: "#fff",
  padding: "10px 12px",
  boxShadow: "0 8px 28px rgba(0,0,0,0.35)"
}

const loadingCss = `
.loading{display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh}
.spinner{width:48px;height:48px;border:3px solid rgba(255,255,255,.1);border-top:3px solid var(--vscode-button-background);border-radius:50%;animation:spin 1s linear infinite;margin-bottom:12px}
@keyframes spin{to{transform:rotate(360deg)}}
`

const css = `
:root{
  --bg: var(--vscode-editor-background);
  --text: var(--vscode-foreground);
  --muted: rgba(255,255,255,.65);
  --accent: var(--vscode-button-background);
  --accent-2: color-mix(in srgb, var(--accent) 70%, #7aa2ff 30%);
  --panel: rgba(255,255,255,.04);
  --border: rgba(255,255,255,.08);
}

.wrap{
  position:relative;
  color:var(--text);
  min-height:100vh;
  padding:24px 28px 32px;
  background: radial-gradient(1000px 500px at 110% -10%, rgba(74,144,226,.12), transparent),
              radial-gradient(900px 600px at -10% -20%, rgba(168,85,247,.10), transparent),
              var(--bg);
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
}

.bg-aura{
  position:absolute;inset:0;pointer-events:none;opacity:.25;mix-blend:screen;
  background: radial-gradient(600px 220px at 80% 0%, rgba(255,255,255,.12), transparent 60%);
}

.topbar{
  position:relative;
  display:flex;justify-content:space-between;align-items:center;
  background: linear-gradient(145deg, rgba(255,255,255,.06), rgba(255,255,255,.03));
  border:1px solid var(--border);
  padding:16px 18px;border-radius:18px;backdrop-filter: blur(16px);
  box-shadow: 0 10px 28px rgba(0,0,0,.25);
  margin-bottom:18px;
}

.brand{display:flex;align-items:center;gap:12px}
.brand h1{font-size:1.2rem;letter-spacing:.3px}
.tag{font-size:.85rem;opacity:.65;margin-left:8px}
.dot{width:10px;height:10px;border-radius:999px;background:var(--accent);box-shadow:0 0 16px var(--accent)}

.controls{display:flex;align-items:center;gap:12px}
.switch{display:flex;background:rgba(255,255,255,.04);border:1px solid var(--border);border-radius:12px;padding:4px}
.switch button{
  appearance:none;border:0;padding:.4rem .7rem;border-radius:8px;cursor:pointer;color:var(--muted);background:transparent;transition:.2s;
}
.switch button.on{background:var(--panel);color:#fff;box-shadow: inset 0 0 0 1px var(--border)}
.actions{display:flex;gap:8px}
.actions button{
  appearance:none;border:1px solid var(--border);padding:.5rem .9rem;border-radius:10px;background:var(--panel);cursor:pointer;color:#fff;transition:.2s
}
.actions button:hover{transform:translateY(-1px)}
.actions .danger{background: linear-gradient(135deg,#ff5757,#c93c3c); border-color:transparent}

.kpis{
  display:grid;grid-template-columns:repeat(6,minmax(160px,1fr));gap:12px;margin:16px 0 18px;
}
@media (max-width:1200px){.kpis{grid-template-columns:repeat(3,minmax(160px,1fr))}}
@media (max-width:720px){.kpis{grid-template-columns:repeat(2,minmax(150px,1fr))}}

.panels{
  display:grid;grid-template-columns:2fr 1fr;gap:14px;
}
@media (max-width:1000px){.panels{grid-template-columns:1fr}}

.panel{
  background: linear-gradient(145deg, rgba(255,255,255,.05), rgba(255,255,255,.03));
  border:1px solid var(--border);
  border-radius:18px;
  padding:16px 16px 12px;
  box-shadow: 0 12px 30px rgba(0,0,0,.25);
}
.panel.big{padding:16px 16px 6px}
.panel-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:6px}
.panel-head h3{font-size:1rem}
.hint{font-size:.85rem;opacity:.6}

.chart{width:100%}

.mini{display:flex;gap:10px;margin-top:12px}
.pill{
  display:flex;flex-direction:column;gap:2px;align-items:flex-start;
  background: rgba(255,255,255,.04);
  border:1px solid var(--border);
  padding:10px 12px;border-radius:12px;min-width:120px
}
.pill span{font-size:.85rem;opacity:.7}
.pill strong{font-size:1.05rem}

.foot{
  display:flex;gap:12px;justify-content:center;opacity:.65;margin-top:18px
}
  .notes{margin-top:1.2rem}
.notes textarea{
  width:100%;
  min-height:100px;
  padding:.8rem;
  border-radius:10px;
  background:rgba(255,255,255,.04);
  border:1px solid var(--border);
  color:var(--text);
  font-size:.9rem;
  resize:vertical;
}

`
