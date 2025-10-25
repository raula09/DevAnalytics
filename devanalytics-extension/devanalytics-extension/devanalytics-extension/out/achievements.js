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
exports.checkAchievements = checkAchievements;
const vscode = __importStar(require("vscode"));
function checkAchievements(ctx, s) {
    if (s.focusMode)
        return;
    const keys = s.analytics.totals.keystrokes;
    const hours = s.analytics.totals.seconds / 3600;
    const files = s.analytics.totals.filesOpened;
    const add = (a, msg) => { if (!s.achievements.includes(a)) {
        s.achievements.push(a);
        vscode.window.showInformationMessage(msg);
    } };
    if (keys >= 1000)
        add("First1000", "Achievement: First 1000 keystrokes");
    if (hours >= 3)
        add("MarathonCoder", "Achievement: 3-hour session");
    const h = new Date().getHours();
    if (h >= 0 && h < 5)
        add("NightOwl", "Achievement: Night Owl");
    if (files >= 10)
        add("Explorer", "Achievement: Explorer");
    if (keys >= 10000)
        add("KeyboardWarrior", "Achievement: Keyboard Warrior");
    if (s.analytics.totals.seconds >= 6 * 3600)
        add("IronFocus", "Achievement: Iron Focus");
}
