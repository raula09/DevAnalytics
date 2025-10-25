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
exports.DashboardPanel = void 0;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
class DashboardPanel {
    ctx;
    panel;
    analytics;
    static current;
    static show(ctx, analytics) {
        if (DashboardPanel.current) {
            DashboardPanel.current.panel.reveal();
            DashboardPanel.current.postData();
            return;
        }
        const panel = vscode.window.createWebviewPanel('devanalyticsDashboard', 'DevAnalytics Dashboard', vscode.ViewColumn.One, {
            enableScripts: true,
            retainContextWhenHidden: true,
            localResourceRoots: [vscode.Uri.file(path.join(ctx.extensionPath, 'webview-ui', 'dist'))],
        });
        DashboardPanel.current = new DashboardPanel(ctx, panel, analytics);
    }
    constructor(ctx, panel, analytics) {
        this.ctx = ctx;
        this.panel = panel;
        this.analytics = analytics;
        this.panel.onDidDispose(() => (DashboardPanel.current = undefined));
        this.initHtml().then(() => this.postData());
        this.panel.webview.onDidReceiveMessage((msg) => {
            if (msg?.type === 'requestData')
                this.postData();
            if (msg?.type === 'export')
                this.export();
            if (msg?.type === 'reset')
                this.reset();
        });
    }
    async initHtml() {
        // Find the built JS bundle from Vite (e.g., assets/index-xxxxx.js)
        const dist = vscode.Uri.file(path.join(this.ctx.extensionPath, 'webview-ui', 'dist'));
        const assetsDir = vscode.Uri.joinPath(dist, 'assets');
        let bundleUri;
        try {
            const entries = await vscode.workspace.fs.readDirectory(assetsDir);
            const js = entries.find(([name, type]) => type === vscode.FileType.File && name.endsWith('.js'));
            if (js)
                bundleUri = vscode.Uri.joinPath(assetsDir, js[0]);
        }
        catch {
            // fallback: try dist/index.js (unlikely with Vite, but safe)
            bundleUri = vscode.Uri.joinPath(dist, 'index.js');
        }
        const scriptSrc = this.panel.webview.asWebviewUri(bundleUri);
        const csp = this.panel.webview.cspSource;
        // Minimal HTML that mounts the React app
        this.panel.webview.html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <meta http-equiv="Content-Security-Policy"
          content="default-src 'none'; img-src ${csp} https:; script-src ${csp}; style-src ${csp} 'unsafe-inline'; font-src ${csp};">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DevAnalytics</title>
  </head>
  <body style="background: var(--vscode-editor-background); color: var(--vscode-foreground);">
    <div id="root"></div>
    <script src="${scriptSrc}"></script>
  </body>
</html>`;
    }
    postData() {
        this.panel.webview.postMessage({ type: 'data', payload: this.analytics.getData() });
    }
    async export() {
        const uri = await vscode.window.showSaveDialog({
            filters: { JSON: ['json'] },
            defaultUri: vscode.Uri.file('devanalytics.json'),
        });
        if (!uri)
            return;
        const data = JSON.stringify(this.analytics.getData(), null, 2);
        await vscode.workspace.fs.writeFile(uri, Buffer.from(data, 'utf8'));
        vscode.window.showInformationMessage('DevAnalytics: exported JSON.');
    }
    async reset() {
        const ok = await vscode.window.showWarningMessage('Reset DevAnalytics data?', { modal: true }, 'Reset');
        if (ok) {
            await this.ctx.globalState.update('devanalytics.data.v1', undefined);
            this.postData();
            vscode.window.showInformationMessage('DevAnalytics: data reset.');
        }
    }
}
exports.DashboardPanel = DashboardPanel;
//# sourceMappingURL=webview.js.map