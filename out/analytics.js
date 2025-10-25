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
exports.Analytics = void 0;
const vscode = __importStar(require("vscode"));
class Analytics {
    ctx;
    storage;
    timer;
    lastActiveLanguage;
    keystrokeThisTick = 0;
    constructor(ctx, storage) {
        this.ctx = ctx;
        this.storage = storage;
    }
    start() {
        const cfg = vscode.workspace.getConfiguration();
        if (!cfg.get('devAnalytics.enable'))
            return;
        const interval = Math.max(2, Math.min(60, cfg.get('devAnalytics.sampleIntervalSec') || 5));
        this.lastActiveLanguage = vscode.window.activeTextEditor?.document.languageId;
        this.ctx.subscriptions.push(vscode.window.onDidChangeActiveTextEditor((ed) => {
            this.lastActiveLanguage = ed?.document.languageId;
        }));
        this.ctx.subscriptions.push(vscode.workspace.onDidOpenTextDocument((doc) => {
            if (doc.languageId) {
                const data = this.storage.load();
                const bucket = (data.byLanguage[doc.languageId] ||= { seconds: 0, filesOpened: 0, keystrokes: 0 });
                bucket.filesOpened += 1;
                data.totals.filesOpened = (data.totals.filesOpened || 0) + 1;
                this.storage.save(data);
            }
        }));
        this.ctx.subscriptions.push(vscode.workspace.onDidChangeTextDocument(() => {
            this.keystrokeThisTick += 1;
        }));
        this.timer = globalThis.setInterval(() => this.tick(interval), interval * 1000);
        this.ctx.subscriptions.push({ dispose: () => this.stop() });
    }
    stop() {
        if (this.timer)
            globalThis.clearInterval(this.timer);
        this.timer = undefined;
    }
    tick(interval) {
        if (!vscode.window.state.focused) {
            this.keystrokeThisTick = 0;
            return;
        }
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            this.keystrokeThisTick = 0;
            return;
        }
        const lang = editor.document.languageId || 'unknown';
        const cfg = vscode.workspace.getConfiguration();
        const countUnknown = cfg.get('devAnalytics.countUnknown', false);
        if (!countUnknown && (lang === 'unknown' || lang === 'plaintext')) {
            this.keystrokeThisTick = 0;
            return;
        }
        const data = this.storage.load();
        const bucket = (data.byLanguage[lang] ||= { seconds: 0, filesOpened: 0, keystrokes: 0 });
        bucket.seconds += interval;
        bucket.keystrokes += this.keystrokeThisTick;
        data.totals.seconds = (data.totals.seconds || 0) + interval;
        data.totals.keystrokes = (data.totals.keystrokes || 0) + this.keystrokeThisTick;
        this.keystrokeThisTick = 0;
        this.storage.save(data);
    }
    getData() { return this.storage.load(); }
}
exports.Analytics = Analytics;
//# sourceMappingURL=analytics.js.map