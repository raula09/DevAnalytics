"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.openDashboard = openDashboard;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
function getUri(panel, extPath, p) {
    return panel.webview.asWebviewUri(vscode.Uri.file(path.join(extPath, ...p)));
}
function openDashboard(ctx, s) {
    const panel = vscode.window.createWebviewPanel("devanalyticsDashboard", "DevAnalytics Dashboard", vscode.ViewColumn.One, { enableScripts: true, localResourceRoots: [vscode.Uri.file(path.join(ctx.extensionPath, "webview-ui", "dist"))] });
    const scriptUri = getUri(panel, ctx.extensionPath, ["webview-ui", "dist", "assets", "index.js"]);
    const styleUri = getUri(panel, ctx.extensionPath, ["webview-ui", "dist", "assets", "index.css"]);
    const csp = "default-src 'none'; img-src data: https:; style-src 'unsafe-inline' " + panel.webview.cspSource + "; script-src " + panel.webview.cspSource + "; font-src " + panel.webview.cspSource + " data:";
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
    </html>`;
    const send = () => {
        const payload = {
            analytics: s.analytics,
            history: s.history,
            achievements: s.achievements,
            meta: {
                goalMinutes: vscode.workspace.getConfiguration("devanalytics").get("dailyGoalMinutes", 120),
                idleSeconds: vscode.workspace.getConfiguration("devanalytics").get("idleSeconds", 300),
                now: Date.now(),
                focusMode: s.focusMode
            }
        };
        panel.webview.postMessage({ type: "data", payload });
    };
    send();
    panel.webview.onDidReceiveMessage(msg => {
        if (msg?.type === "requestData")
            send();
        if (msg?.type === "reset")
            vscode.commands.executeCommand("devanalytics.resetAnalytics");
        if (msg?.type === "exportJson")
            vscode.commands.executeCommand("devanalytics.exportData");
        if (msg?.type === "exportCsv")
            vscode.commands.executeCommand("devanalytics.exportCsv");
        if (msg?.type === "toggleFocus")
            vscode.commands.executeCommand("devanalytics.toggleFocusMode");
    });
}
