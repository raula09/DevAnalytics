export interface LanguageStats {
  seconds: number;
}

export interface Totals {
  seconds: number;
  filesOpened: number;
  keystrokes: number;
}

export interface AnalyticsData {
  byLanguage: Record<string, LanguageStats>;
  totals: Totals;
}
