import * as vscode from "vscode"
import { State } from "./types"
export function checkAchievements(ctx: vscode.ExtensionContext, s: State) {
  if (s.focusMode) return
  const keys = s.analytics.totals.keystrokes
  const hours = s.analytics.totals.seconds / 3600
  const files = s.analytics.totals.filesOpened
  const add = (a: string, msg: string) => { if (!s.achievements.includes(a)) { s.achievements.push(a); vscode.window.showInformationMessage(msg) } }
  if (keys >= 1000) add("First1000", "Achievement: First 1000 keystrokes")
  if (hours >= 3) add("MarathonCoder", "Achievement: 3-hour session")
  const h = new Date().getHours()
  if (h >= 0 && h < 5) add("NightOwl", "Achievement: Night Owl")
  if (files >= 10) add("Explorer", "Achievement: Explorer")
  if (keys >= 10000) add("KeyboardWarrior", "Achievement: Keyboard Warrior")
  if (s.analytics.totals.seconds >= 6 * 3600) add("IronFocus", "Achievement: Iron Focus")
}
