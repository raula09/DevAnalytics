import * as vscode from "vscode"
import { State } from "./types"
import * as fs from "fs"
import * as path from "path"
import * as os from "os"
export async function exportJson(state: State) {
  const folder = path.join(os.tmpdir(), "DevAnalyticsExports")
  if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true })
  const file = path.join(folder, "analytics-" + Date.now() + ".json")
  fs.writeFileSync(file, JSON.stringify(state, null, 2))
  vscode.window.showInformationMessage("Exported JSON: " + file)
}
export async function exportCsv(state: State) {
  const folder = path.join(os.tmpdir(), "DevAnalyticsExports")
  if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true })
  const lines: string[] = []
  lines.push("date,total_seconds,total_files,total_keystrokes,top_language,top_lang_seconds")
  const mapLang = state.analytics.byLanguage
  const top = Object.entries(mapLang).sort((a,b)=>b[1].seconds-a[1].seconds)[0]
  const tl = top ? top[0] : ""
  const tls = top ? top[1].seconds : 0
  const today = new Date().toISOString().split("T")[0]
  lines.push([today, state.analytics.totals.seconds, state.analytics.totals.filesOpened, state.analytics.totals.keystrokes, tl, tls].join(","))
  const file = path.join(folder, "analytics-" + Date.now() + ".csv")
  fs.writeFileSync(file, lines.join("\n"))
  vscode.window.showInformationMessage("Exported CSV: " + file)
}
