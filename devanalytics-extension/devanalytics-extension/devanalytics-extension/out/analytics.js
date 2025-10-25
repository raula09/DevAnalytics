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
exports.tick = tick;
exports.registerActivity = registerActivity;
exports.fileOpened = fileOpened;
const vscode = __importStar(require("vscode"));
const achievements_1 = require("./achievements");
const statusBar_1 = require("./statusBar");
const storage_1 = require("./storage");
async function tick(ctx, s) {
    const now = Date.now();
    const idleLimit = (vscode.workspace.getConfiguration("devanalytics").get("idleSeconds") || 300) * 1000;
    if (now - s.lastActivityTs > idleLimit) {
        (0, statusBar_1.updateStatusBar)(s);
        return;
    }
    s.analytics.totals.seconds += 1;
    (0, storage_1.rotateIfNewDay)(ctx, s);
    (0, statusBar_1.updateStatusBar)(s);
    const mins = Math.floor(s.analytics.totals.seconds / 60);
    const goal = vscode.workspace.getConfiguration("devanalytics").get("dailyGoalMinutes", 120);
    if (!s.focusMode && mins === goal)
        vscode.window.showInformationMessage("Daily goal reached");
    if (s.analytics.totals.seconds % 300 === 0)
        (0, achievements_1.checkAchievements)(ctx, s);
    await (0, storage_1.saveState)(ctx, s);
}
function registerActivity(s, lang) {
    s.lastActivityTs = Date.now();
    s.analytics.totals.keystrokes += 1;
    if (lang) {
        if (!s.analytics.byLanguage[lang])
            s.analytics.byLanguage[lang] = { seconds: 0, filesOpened: 0, keystrokes: 0 };
        s.analytics.byLanguage[lang].keystrokes += 1;
    }
}
function fileOpened(s, lang) {
    s.analytics.totals.filesOpened += 1;
    if (!s.analytics.byLanguage[lang])
        s.analytics.byLanguage[lang] = { seconds: 0, filesOpened: 0, keystrokes: 0 };
    s.analytics.byLanguage[lang].filesOpened += 1;
}
