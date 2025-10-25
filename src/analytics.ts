import * as vscode from 'vscode';
import { Storage, AnalyticsData } from './storage';

export class Analytics {
  private timer?: ReturnType<typeof setInterval>;
  private lastActiveLanguage: string | undefined;
  private keystrokeThisTick = 0;

  constructor(private readonly ctx: vscode.ExtensionContext, private readonly storage: Storage) {}

  start() {
    const cfg = vscode.workspace.getConfiguration();
    if (!cfg.get<boolean>('devAnalytics.enable')) return;

    const interval = Math.max(2, Math.min(60, cfg.get<number>('devAnalytics.sampleIntervalSec') || 5));

    this.lastActiveLanguage = vscode.window.activeTextEditor?.document.languageId;
    this.ctx.subscriptions.push(
      vscode.window.onDidChangeActiveTextEditor((ed: vscode.TextEditor | undefined) => {
        this.lastActiveLanguage = ed?.document.languageId;
      })
    );

    this.ctx.subscriptions.push(
      vscode.workspace.onDidOpenTextDocument((doc: vscode.TextDocument) => {
        if (doc.languageId) {
          const data = this.storage.load();
          const bucket = (data.byLanguage[doc.languageId] ||= { seconds: 0, filesOpened: 0, keystrokes: 0 });
          bucket.filesOpened += 1;
          data.totals.filesOpened = (data.totals.filesOpened || 0) + 1;
          this.storage.save(data);
        }
      })
    );

    this.ctx.subscriptions.push(
      vscode.workspace.onDidChangeTextDocument(() => {
        this.keystrokeThisTick += 1;
      })
    );

    this.timer = globalThis.setInterval(() => this.tick(interval), interval * 1000);
    this.ctx.subscriptions.push({ dispose: () => this.stop() });
  }

  stop() {
    if (this.timer) globalThis.clearInterval(this.timer);
    this.timer = undefined;
  }

  private tick(interval: number) {
    
    if (!vscode.window.state.focused) { this.keystrokeThisTick = 0; return; }

    const editor = vscode.window.activeTextEditor;
    if (!editor) { this.keystrokeThisTick = 0; return; }

    const lang = editor.document.languageId || 'unknown';


    const cfg = vscode.workspace.getConfiguration();
    const countUnknown = cfg.get<boolean>('devAnalytics.countUnknown', false);
    if (!countUnknown && (lang === 'unknown' || lang === 'plaintext')) { 
      this.keystrokeThisTick = 0; 
      return; 
    }

    const data = this.storage.load();
    const bucket = (data.byLanguage[lang] ||= { seconds: 0, filesOpened: 0, keystrokes: 0 });

    bucket.seconds += interval;
    bucket.keystrokes += this.keystrokeThisTick;

    data.totals.seconds = (data.totals.seconds || 0) + interval;
    data.totals.keystrokes = (data.totals.keystrokes || 0) + this.keystrokeThisTick;

    this.keystrokeThisTick = 0;
    this.storage.save(data);
  }

  getData(): AnalyticsData { return this.storage.load(); }
}
