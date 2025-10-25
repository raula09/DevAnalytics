import React from "react"
export default function StatCard({ icon, label, value }: { icon: string; label: string; value: string | number }) {
  return (
    <div className="stat glass">
      <div className="icon">{icon}</div>
      <h3>{label}</h3>
      <p>{value}</p>
      <style>{`
        .stat { text-align:center; padding:1rem 1.5rem; transition:all .2s ease }
        .stat:hover { transform:translateY(-2px); background:rgba(255,255,255,.08) }
        .icon { font-size:1.5rem; margin-bottom:.3rem }
        h3 { font-size:.9rem; opacity:.8; margin-bottom:.2rem }
        p { font-size:1.4rem; font-weight:700; color:var(--accent) }
      `}</style>
    </div>
  )
}
