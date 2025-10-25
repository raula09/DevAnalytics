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
const analytics_1 = require("./analytics");
const webview_1 = require("./webview");
function activate(ctx) {
    const storage = new storage_1.Storage(ctx.globalState);
    const analytics = new analytics_1.Analytics(ctx, storage);
    analytics.start();
    ctx.subscriptions.push(vscode.commands.registerCommand('devanalytics.showDashboard', () => {
        const cfg = vscode.workspace.getConfiguration();
        if (!cfg.get('devAnalytics.enable')) {
            vscode.window.showInformationMessage('DevAnalytics is disabled. Enable it in settings to start tracking.', 'Enable').then((sel) => {
                if (sel === 'Enable')
                    cfg.update('devAnalytics.enable', true, vscode.ConfigurationTarget.Global).then(() => analytics.start());
            });
        }
        webview_1.DashboardPanel.show(ctx, analytics);
    }), vscode.commands.registerCommand('devanalytics.exportData', () => webview_1.DashboardPanel.show(ctx, analytics)), vscode.commands.registerCommand('devanalytics.reset', () => webview_1.DashboardPanel.show(ctx, analytics)));
}
function deactivate() { }
//# sourceMappingURL=extension.js.map