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
exports.loadState = loadState;
exports.saveState = saveState;
exports.snapshotFrom = snapshotFrom;
exports.rotateIfNewDay = rotateIfNewDay;
const vscode = __importStar(require("vscode"));
const KEY = "devanalytics.state";
function loadState(ctx) {
    const now = Date.now();
    const raw = ctx.globalState.get(KEY);
    if (raw)
        return raw;
    return {
        analytics: { version: 1, byLanguage: {}, totals: { seconds: 0, filesOpened: 0, keystrokes: 0 }, startedAt: now },
        history: [],
        achievements: [],
        lastActivityTs: now,
        lastTickTs: now,
        statusBarEnabled: vscode.workspace.getConfiguration("devanalytics").get("statusBarEnabled", true),
        focusMode: false
    };
}
async function saveState(ctx, s) { await ctx.globalState.update(KEY, s); }
function snapshotFrom(data) {
    const totals = { ...data.totals };
    const byLanguage = {};
    Object.keys(data.byLanguage).forEach(k => byLanguage[k] = { ...data.byLanguage[k] });
    return { date: new Date().toISOString().split("T")[0], totals, byLanguage };
}
function rotateIfNewDay(ctx, s) {
    const today = new Date().toISOString().split("T")[0];
    const last = s.history[s.history.length - 1];
    if (!last || last.date !== today) {
        if (s.analytics.totals.seconds > 0 || s.analytics.totals.filesOpened > 0 || s.analytics.totals.keystrokes > 0)
            s.history.push(snapshotFrom(s.analytics));
        const keep = vscode.workspace.getConfiguration("devanalytics").get("keepDays", 30);
        if (s.history.length > keep)
            s.history = s.history.slice(-keep);
        const now = Date.now();
        s.analytics = { version: 1, byLanguage: {}, totals: { seconds: 0, filesOpened: 0, keystrokes: 0 }, startedAt: now };
    }
}
