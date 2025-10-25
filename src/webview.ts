import * as vscode from 'vscode';
import * as path from 'path';
import { Analytics } from './analytics';

export class DashboardPanel {
  static current: DashboardPanel | undefined;

  static show(ctx: vscode.ExtensionContext, analytics: Analytics) {
    if (DashboardPanel.current) {
      DashboardPanel.current.panel.reveal();
      DashboardPanel.current.postData();
      return;
    }

    const panel = vscode.window.createWebviewPanel(
      'devanalyticsDashboard',
      'DevAnalytics Dashboard',
      vscode.ViewColumn.One,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [vscode.Uri.file(path.join(ctx.extensionPath, 'webview-ui', 'dist'))],
      }
    );

    DashboardPanel.current = new DashboardPanel(ctx, panel, analytics);
  }

  private constructor(
    private ctx: vscode.ExtensionContext,
    public panel: vscode.WebviewPanel,
    private analytics: Analytics
  ) {
    this.panel.onDidDispose(() => (DashboardPanel.current = undefined));
    this.initHtml().then(() => this.postData());

    this.panel.webview.onDidReceiveMessage((msg: any) => {
      if (msg?.type === 'requestData') this.postData();
      if (msg?.type === 'export') this.export();
      if (msg?.type === 'reset') this.reset();
    });
  }

  private async initHtml() {
    const dist = vscode.Uri.file(path.join(this.ctx.extensionPath, 'webview-ui', 'dist'));
    const assetsDir = vscode.Uri.file(path.join(dist.fsPath, 'assets'));

    let bundleUri: vscode.Uri | undefined;
    try {
      const entries = await vscode.workspace.fs.readDirectory(assetsDir);
      const js = entries.find(([name, type]) => type === vscode.FileType.File && name.endsWith('.js'));
      if (js) bundleUri = vscode.Uri.file(path.join(assetsDir.fsPath, js[0]));
    } catch {
      bundleUri = vscode.Uri.file(path.join(dist.fsPath, 'index.js'));
    }

    const scriptSrc = this.panel.webview.asWebviewUri(bundleUri!);
    const csp = this.panel.webview.cspSource;

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

  private postData() {
    this.panel.webview.postMessage({ type: 'data', payload: this.analytics.getData() });
  }

  private async export() {
    const uri = await vscode.window.showSaveDialog({
      filters: { JSON: ['json'] },
      defaultUri: vscode.Uri.file('devanalytics.json'),
    });
    if (!uri) return;
    const data = JSON.stringify(this.analytics.getData(), null, 2);
    await vscode.workspace.fs.writeFile(uri, Buffer.from(data, 'utf8'));
    vscode.window.showInformationMessage('DevAnalytics: exported JSON.');
  }

  private async reset() {
    const ok = await vscode.window.showWarningMessage('Reset DevAnalytics data?', { modal: true }, 'Reset');
    if (ok) {
      await this.ctx.globalState.update('devanalytics.data.v1', undefined);
      this.postData();
      vscode.window.showInformationMessage('DevAnalytics: data reset.');
    }
  }
}
