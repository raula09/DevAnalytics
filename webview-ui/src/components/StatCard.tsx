import React from "react"

export default function StatCard({
  label,
  value,
  accent = false
}: {
  label: string
  value: string | number
  accent?: boolean
}) {
  return (
    <div className={`stat ${accent ? "accent" : ""}`}>
      <span className="label">{label}</span>
      <span className="value">{value}</span>
      <style>{`
        .stat{
          display:flex;flex-direction:column;gap:.25rem;
          background: linear-gradient(145deg, rgba(255,255,255,.06), rgba(255,255,255,.03));
          border:1px solid rgba(255,255,255,.08);
          border-radius:16px;padding:14px 16px;min-height:86px;
          box-shadow: 0 8px 22px rgba(0,0,0,.22);
          transition:.25s;
        }
        .stat:hover{transform: translateY(-3px)}
        .label{font-size:.85rem;opacity:.7}
        .value{font-size:1.55rem;font-weight:700;letter-spacing:.2px}
        .accent{
          background: linear-gradient(145deg, var(--accent), var(--accent-2));
          color:#0b0b12;border-color:transparent;
        }
      `}</style>
    </div>
  )
}
