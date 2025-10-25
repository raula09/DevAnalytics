// eslint-disable-next-line @typescript-eslint/no-explicit-any
const vscode = (typeof acquireVsCodeApi !== 'undefined') ? acquireVsCodeApi() as any : undefined;
export function requestData() { vscode?.postMessage({ type: 'requestData' }); }
export function exportData() { vscode?.postMessage({ type: 'export' }); }
export function resetData() { vscode?.postMessage({ type: 'reset' }); }
