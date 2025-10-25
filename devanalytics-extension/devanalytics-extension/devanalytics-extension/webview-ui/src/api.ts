declare function acquireVsCodeApi(): { postMessage: (message: any) => void }
const vscode = typeof acquireVsCodeApi !== "undefined" ? acquireVsCodeApi() : undefined
export function requestData() { vscode?.postMessage({ type: "requestData" }) }
export function exportJson() { vscode?.postMessage({ type: "exportJson" }) }
export function exportCsv() { vscode?.postMessage({ type: "exportCsv" }) }
export function resetData() { vscode?.postMessage({ type: "reset" }) }
export function toggleFocus() { vscode?.postMessage({ type: "toggleFocus" }) }
