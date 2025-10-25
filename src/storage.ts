import * as vscode from 'vscode';

export type AnalyticsData = {
  version: number;
  byLanguage: Record<string, { seconds: number; filesOpened: number; keystrokes: number }>;
  totals: { seconds: number; filesOpened: number; keystrokes: number };
  startedAt: number;
};

const KEY = 'devanalytics.data.v1';

export class Storage {
  constructor(private readonly memento: vscode.Memento) {}

  load(): AnalyticsData {
    return (
      this.memento.get<AnalyticsData>(KEY) || {
        version: 1,
        byLanguage: {},
        totals: { seconds: 0, filesOpened: 0, keystrokes: 0 },
        startedAt: Date.now()
      }
    );
  }

  save(data: AnalyticsData) {
    return this.memento.update(KEY, data);
  }

  reset() {
    return this.memento.update(KEY, undefined);
  }
}
