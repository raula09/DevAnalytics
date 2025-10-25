import * as vscode from "vscode"
import { State } from "./types"
let statusItem: vscode.StatusBarItem | undefined
export function initStatusBar(ctx: vscode.ExtensionContext, s: State) {
  if (!s.statusBarEnabled) return
  statusItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100)
  statusItem.command = "devanalytics.openDashboard"
  ctx.subscriptions.push(statusItem)
  updateStatusBar(s)
}
export function updateStatusBar(s: State) {
  if (!statusItem) return
  if (!s.statusBarEnabled) { statusItem.hide(); return }
  const mins = Math.floor(s.analytics.totals.seconds / 60)
  const keys = s.analytics.totals.keystrokes
  const files = s.analytics.totals.filesOpened
  const idleSec = Math.max(0, Math.floor((Date.now() - s.lastActivityTs) / 1000))
  statusItem.text = `⚡ ${mins}m • ${files}f • ${keys}k • idle ${idleSec}s`
  const goal = vscode.workspace.getConfiguration("devanalytics").get<number>("dailyGoalMinutes", 120)
  const pct = Math.min(100, Math.floor((mins / goal) * 100))
  statusItem.tooltip = new vscode.MarkdownString(`DevAnalytics\n\nGoal ${goal}m • ${pct}%\nFocus ${s.focusMode ? "on" : "off"}`)
  statusItem.show()
}
export function toggleStatusBar(s: State) { s.statusBarEnabled = !s.statusBarEnabled; updateStatusBar(s) }
