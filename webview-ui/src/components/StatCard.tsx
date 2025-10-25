import React from 'react';
type Props = { label: string; value: string };
export default function StatCard({ label, value }: Props) {
  return (
    <div style={{ border: '1px solid var(--vscode-editorWidget-border)', padding: 12, borderRadius: 6 }}>
      <div style={{ opacity: 0.7, fontSize: 12 }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 600 }}>{value}</div>
    </div>
  );
}
