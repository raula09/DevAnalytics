"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.initStatusBar = initStatusBar;
exports.updateStatusBar = updateStatusBar;
exports.toggleStatusBar = toggleStatusBar;
const vscode = __importStar(require("vscode"));
let statusItem;
function initStatusBar(ctx, s) {
    if (!s.statusBarEnabled)
        return;
    statusItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusItem.command = "devanalytics.openDashboard";
    ctx.subscriptions.push(statusItem);
    updateStatusBar(s);
}
function updateStatusBar(s) {
    if (!statusItem)
        return;
    if (!s.statusBarEnabled) {
        statusItem.hide();
        return;
    }
    const mins = Math.floor(s.analytics.totals.seconds / 60);
    const keys = s.analytics.totals.keystrokes;
    const files = s.analytics.totals.filesOpened;
    const idleSec = Math.max(0, Math.floor((Date.now() - s.lastActivityTs) / 1000));
    statusItem.text = `⚡ ${mins}m • ${files}f • ${keys}k • idle ${idleSec}s`;
    const goal = vscode.workspace.getConfiguration("devanalytics").get("dailyGoalMinutes", 120);
    const pct = Math.min(100, Math.floor((mins / goal) * 100));
    statusItem.tooltip = new vscode.MarkdownString(`DevAnalytics\n\nGoal ${goal}m • ${pct}%\nFocus ${s.focusMode ? "on" : "off"}`);
    statusItem.show();
}
function toggleStatusBar(s) { s.statusBarEnabled = !s.statusBarEnabled; updateStatusBar(s); }
