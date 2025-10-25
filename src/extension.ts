import * as vscode from 'vscode';
import { Storage } from './storage';
import { Analytics } from './analytics';
import { DashboardPanel } from './webview';

export function activate(ctx: vscode.ExtensionContext) {
  const storage = new Storage(ctx.globalState);
  const analytics = new Analytics(ctx, storage);

  analytics.start();

  ctx.subscriptions.push(
    vscode.commands.registerCommand('devanalytics.showDashboard', () => {
      const cfg = vscode.workspace.getConfiguration();
      if (!cfg.get<boolean>('devAnalytics.enable')) {
        vscode.window.showInformationMessage('DevAnalytics is disabled. Enable it in settings to start tracking.', 'Enable').then((sel) => {
          if (sel === 'Enable') cfg.update('devAnalytics.enable', true, vscode.ConfigurationTarget.Global).then(() => analytics.start());
        });
      }
      DashboardPanel.show(ctx, analytics);
    }),
    vscode.commands.registerCommand('devanalytics.exportData', () => DashboardPanel.show(ctx, analytics)),
    vscode.commands.registerCommand('devanalytics.reset', () => DashboardPanel.show(ctx, analytics))
  );
}

export function deactivate() {}
