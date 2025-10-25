import * as vscode from "vscode"
import { State } from "./types"
import { checkAchievements } from "./achievements"
import { updateStatusBar } from "./statusBar"
import { saveState, rotateIfNewDay } from "./storage"
export async function tick(ctx: vscode.ExtensionContext, s: State) {
  const now = Date.now()
  const idleLimit = (vscode.workspace.getConfiguration("devanalytics").get<number>("idleSeconds") || 300) * 1000
  if (now - s.lastActivityTs > idleLimit) { updateStatusBar(s); return }
  s.analytics.totals.seconds += 1
  rotateIfNewDay(ctx, s)
  updateStatusBar(s)
  const mins = Math.floor(s.analytics.totals.seconds / 60)
  const goal = vscode.workspace.getConfiguration("devanalytics").get<number>("dailyGoalMinutes", 120)
  if (!s.focusMode && mins === goal) vscode.window.showInformationMessage("Daily goal reached")
  if (s.analytics.totals.seconds % 300 === 0) checkAchievements(ctx, s)
  await saveState(ctx, s)
}
export function registerActivity(s: State, lang?: string) {
  s.lastActivityTs = Date.now()
  s.analytics.totals.keystrokes += 1
  if (lang) {
    if (!s.analytics.byLanguage[lang]) s.analytics.byLanguage[lang] = { seconds: 0, filesOpened: 0, keystrokes: 0 }
    s.analytics.byLanguage[lang].keystrokes += 1
  }
}
export function fileOpened(s: State, lang: string) {
  s.analytics.totals.filesOpened += 1
  if (!s.analytics.byLanguage[lang]) s.analytics.byLanguage[lang] = { seconds: 0, filesOpened: 0, keystrokes: 0 }
  s.analytics.byLanguage[lang].filesOpened += 1
}
