import * as vscode from "vscode"
import { AnalyticsData, DailySnapshot, State } from "./types"
const KEY = "devanalytics.state"
export function loadState(ctx: vscode.ExtensionContext): State {
  const now = Date.now()
  const raw = ctx.globalState.get<State>(KEY)
  if (raw) return raw
  return {
    analytics: { version: 1, byLanguage: {}, totals: { seconds: 0, filesOpened: 0, keystrokes: 0 }, startedAt: now },
    history: [],
    achievements: [],
    lastActivityTs: now,
    lastTickTs: now,
    statusBarEnabled: vscode.workspace.getConfiguration("devanalytics").get("statusBarEnabled", true),
    focusMode: false
  }
}
export async function saveState(ctx: vscode.ExtensionContext, s: State) { await ctx.globalState.update(KEY, s) }
export function snapshotFrom(data: AnalyticsData): DailySnapshot {
  const totals = { ...data.totals }
  const byLanguage: Record<string, any> = {}
  Object.keys(data.byLanguage).forEach(k => byLanguage[k] = { ...data.byLanguage[k] })
  return { date: new Date().toISOString().split("T")[0], totals, byLanguage }
}
export function rotateIfNewDay(ctx: vscode.ExtensionContext, s: State) {
  const today = new Date().toISOString().split("T")[0]
  const last = s.history[s.history.length - 1]
  if (!last || last.date !== today) {
    if (s.analytics.totals.seconds > 0 || s.analytics.totals.filesOpened > 0 || s.analytics.totals.keystrokes > 0) s.history.push(snapshotFrom(s.analytics))
    const keep = vscode.workspace.getConfiguration("devanalytics").get<number>("keepDays", 30)
    if (s.history.length > keep) s.history = s.history.slice(-keep)
    const now = Date.now()
    s.analytics = { version: 1, byLanguage: {}, totals: { seconds: 0, filesOpened: 0, keystrokes: 0 }, startedAt: now }
  }
}
