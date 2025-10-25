import * as vscode from "vscode"
import { loadState, saveState } from "./storage"
import { exportJson, exportCsv } from "./exporter"
import { initStatusBar, updateStatusBar, toggleStatusBar } from "./statusBar"
import { tick, registerActivity, fileOpened } from "./analytics"
import { openDashboard } from "./webviewBridge"
import { checkAchievements } from "./achievements"

export async function activate(ctx: vscode.ExtensionContext) {
  let state = loadState(ctx)
  initStatusBar(ctx, state)
  updateStatusBar(state)
  const tickInterval = setInterval(() => tick(ctx, state), 1000)
  ctx.subscriptions.push({ dispose: () => clearInterval(tickInterval) })
  ctx.subscriptions.push(vscode.workspace.onDidOpenTextDocument(doc => fileOpened(state, doc.languageId)))
  ctx.subscriptions.push(vscode.workspace.onDidChangeTextDocument(() => registerActivity(state)))
  ctx.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(() => (state.lastActivityTs = Date.now())))
  ctx.subscriptions.push(vscode.commands.registerCommand("devanalytics.openDashboard", () => openDashboard(ctx, state)))
  ctx.subscriptions.push(vscode.commands.registerCommand("devanalytics.exportData", () => exportJson(state)))
  ctx.subscriptions.push(vscode.commands.registerCommand("devanalytics.exportCsv", () => exportCsv(state)))
  ctx.subscriptions.push(vscode.commands.registerCommand("devanalytics.resetAnalytics", async () => {
    const c = await vscode.window.showWarningMessage("Reset all analytics?", "Yes", "No")
    if (c === "Yes") {
      state = loadState(ctx)
      await saveState(ctx, state)
      updateStatusBar(state)
      vscode.window.showInformationMessage("Analytics reset")
    }
  }))
  ctx.subscriptions.push(vscode.commands.registerCommand("devanalytics.toggleStatusBar", async () => {
    toggleStatusBar(state)
    await saveState(ctx, state)
  }))
  ctx.subscriptions.push(vscode.commands.registerCommand("devanalytics.toggleFocusMode", async () => {
    state.focusMode = !state.focusMode
    await saveState(ctx, state)
    vscode.window.showInformationMessage("Focus mode " + (state.focusMode ? "on" : "off"))
  }))
  ctx.subscriptions.push(vscode.commands.registerCommand("devanalytics.showSummary", async () => {
    const mins = Math.floor(state.analytics.totals.seconds / 60)
    const tl = Object.entries(state.analytics.byLanguage).sort((a,b)=>b[1].seconds-a[1].seconds)[0]?.[0] || "N/A"
    vscode.window.showInformationMessage(`Time ${mins}m • Files ${state.analytics.totals.filesOpened} • Keys ${state.analytics.totals.keystrokes} • Top ${tl}`)
  }))
  if (!state.focusMode) vscode.window.showInformationMessage("DevAnalytics active")
  checkAchievements(ctx, state)
}
export function deactivate() {}
