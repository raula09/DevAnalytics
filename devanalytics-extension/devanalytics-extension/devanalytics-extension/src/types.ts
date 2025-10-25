export type LanguageStats = { seconds: number; filesOpened: number; keystrokes: number }
export type Totals = { seconds: number; filesOpened: number; keystrokes: number }
export type AnalyticsData = { version: number; byLanguage: Record<string, LanguageStats>; totals: Totals; startedAt: number }
export type DailySnapshot = { date: string; totals: Totals; byLanguage: Record<string, LanguageStats> }
export type State = {
  analytics: AnalyticsData
  history: DailySnapshot[]
  achievements: string[]
  lastActivityTs: number
  lastTickTs: number
  statusBarEnabled: boolean
  focusMode: boolean
}
export type DashboardPayload = {
  analytics: AnalyticsData
  history: DailySnapshot[]
  achievements: string[]
  meta: { goalMinutes: number; idleSeconds: number; now: number; focusMode: boolean }
}
