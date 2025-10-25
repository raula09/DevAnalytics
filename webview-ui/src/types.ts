export interface LanguageStats {
  seconds: number;
  filesOpened: number;
  keystrokes: number; 
}

export interface Totals {
  seconds: number;
  filesOpened: number;
  keystrokes: number;
}

export interface AnalyticsData {
  version: number;
  byLanguage: Record<string, LanguageStats>;
  totals: Totals;
  startedAt: number;
}
