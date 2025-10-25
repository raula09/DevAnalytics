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
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const storage_1 = require("./storage");
const exporter_1 = require("./exporter");
const statusBar_1 = require("./statusBar");
const analytics_1 = require("./analytics");
const webviewBridge_1 = require("./webviewBridge");
const achievements_1 = require("./achievements");
async function activate(ctx) {
    let state = (0, storage_1.loadState)(ctx);
    (0, statusBar_1.initStatusBar)(ctx, state);
    (0, statusBar_1.updateStatusBar)(state);
    const tickInterval = setInterval(() => (0, analytics_1.tick)(ctx, state), 1000);
    ctx.subscriptions.push({ dispose: () => clearInterval(tickInterval) });
    ctx.subscriptions.push(vscode.workspace.onDidOpenTextDocument(doc => (0, analytics_1.fileOpened)(state, doc.languageId)));
    ctx.subscriptions.push(vscode.workspace.onDidChangeTextDocument(() => (0, analytics_1.registerActivity)(state)));
    ctx.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(() => (state.lastActivityTs = Date.now())));
    ctx.subscriptions.push(vscode.commands.registerCommand("devanalytics.openDashboard", () => (0, webviewBridge_1.openDashboard)(ctx, state)));
    ctx.subscriptions.push(vscode.commands.registerCommand("devanalytics.exportData", () => (0, exporter_1.exportJson)(state)));
    ctx.subscriptions.push(vscode.commands.registerCommand("devanalytics.exportCsv", () => (0, exporter_1.exportCsv)(state)));
    ctx.subscriptions.push(vscode.commands.registerCommand("devanalytics.resetAnalytics", async () => {
        const c = await vscode.window.showWarningMessage("Reset all analytics?", "Yes", "No");
        if (c === "Yes") {
            state = (0, storage_1.loadState)(ctx);
            await (0, storage_1.saveState)(ctx, state);
            (0, statusBar_1.updateStatusBar)(state);
            vscode.window.showInformationMessage("Analytics reset");
        }
    }));
    ctx.subscriptions.push(vscode.commands.registerCommand("devanalytics.toggleStatusBar", async () => {
        (0, statusBar_1.toggleStatusBar)(state);
        await (0, storage_1.saveState)(ctx, state);
    }));
    ctx.subscriptions.push(vscode.commands.registerCommand("devanalytics.toggleFocusMode", async () => {
        state.focusMode = !state.focusMode;
        await (0, storage_1.saveState)(ctx, state);
        vscode.window.showInformationMessage("Focus mode " + (state.focusMode ? "on" : "off"));
    }));
    ctx.subscriptions.push(vscode.commands.registerCommand("devanalytics.showSummary", async () => {
        const mins = Math.floor(state.analytics.totals.seconds / 60);
        const tl = Object.entries(state.analytics.byLanguage).sort((a, b) => b[1].seconds - a[1].seconds)[0]?.[0] || "N/A";
        vscode.window.showInformationMessage(`Time ${mins}m • Files ${state.analytics.totals.filesOpened} • Keys ${state.analytics.totals.keystrokes} • Top ${tl}`);
    }));
    if (!state.focusMode)
        vscode.window.showInformationMessage("DevAnalytics active");
    (0, achievements_1.checkAchievements)(ctx, state);
}
function deactivate() { }
