import * as vscode from "vscode"
import * as path from "path"
import { DashboardPayload, State } from "./types"
function getUri(panel: vscode.WebviewPanel, extPath: string, p: string[]) {
  return panel.webview.asWebviewUri(vscode.Uri.file(path.join(extPath, ...p)))
}
export function openDashboard(ctx: vscode.ExtensionContext, s: State) {
  const panel = vscode.window.createWebviewPanel("devanalyticsDashboard", "DevAnalytics Dashboard", vscode.ViewColumn.One, { enableScripts: true, localResourceRoots: [vscode.Uri.file(path.join(ctx.extensionPath, "webview-ui", "dist"))] })
  const scriptUri = getUri(panel, ctx.extensionPath, ["webview-ui", "dist", "assets", "index.js"])
  const styleUri = getUri(panel, ctx.extensionPath, ["webview-ui", "dist", "assets", "index.css"])
  const csp = "default-src 'none'; img-src data: https:; style-src 'unsafe-inline' " + panel.webview.cspSource + "; script-src " + panel.webview.cspSource + "; font-src " + panel.webview.cspSource + " data:"
  panel.webview.html = `
    <!doctype html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta http-equiv="Content-Security-Policy" content="${csp}">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="${styleUri}">
        <title>DevAnalytics</title>
      </head>
      <body>
        <div id="root"></div>
        <script>
          const vscode = acquireVsCodeApi()
          window.__devanalytics_send = function(t,p){ vscode.postMessage({type:t,payload:p}) }
          window.addEventListener('message', ev => {
            if (window.__devanalytics_onmsg) window.__devanalytics_onmsg(ev.data)
          })
        </script>
        <script type="module" src="${scriptUri}"></script>
      </body>
    </html>`
  const send = () => {
    const payload: DashboardPayload = {
      analytics: s.analytics,
      history: s.history,
      achievements: s.achievements,
      meta: {
        goalMinutes: vscode.workspace.getConfiguration("devanalytics").get<number>("dailyGoalMinutes", 120),
        idleSeconds: vscode.workspace.getConfiguration("devanalytics").get<number>("idleSeconds", 300),
        now: Date.now(),
        focusMode: s.focusMode
      }
    }
    panel.webview.postMessage({ type: "data", payload })
  }
  send()
  panel.webview.onDidReceiveMessage(msg => {
    if (msg?.type === "requestData") send()
    if (msg?.type === "reset") vscode.commands.executeCommand("devanalytics.resetAnalytics")
    if (msg?.type === "exportJson") vscode.commands.executeCommand("devanalytics.exportData")
    if (msg?.type === "exportCsv") vscode.commands.executeCommand("devanalytics.exportCsv")
    if (msg?.type === "toggleFocus") vscode.commands.executeCommand("devanalytics.toggleFocusMode")
  })
}
