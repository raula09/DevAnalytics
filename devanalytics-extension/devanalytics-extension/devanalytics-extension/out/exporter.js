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
exports.exportJson = exportJson;
exports.exportCsv = exportCsv;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const os = __importStar(require("os"));
async function exportJson(state) {
    const folder = path.join(os.tmpdir(), "DevAnalyticsExports");
    if (!fs.existsSync(folder))
        fs.mkdirSync(folder, { recursive: true });
    const file = path.join(folder, "analytics-" + Date.now() + ".json");
    fs.writeFileSync(file, JSON.stringify(state, null, 2));
    vscode.window.showInformationMessage("Exported JSON: " + file);
}
async function exportCsv(state) {
    const folder = path.join(os.tmpdir(), "DevAnalyticsExports");
    if (!fs.existsSync(folder))
        fs.mkdirSync(folder, { recursive: true });
    const lines = [];
    lines.push("date,total_seconds,total_files,total_keystrokes,top_language,top_lang_seconds");
    const mapLang = state.analytics.byLanguage;
    const top = Object.entries(mapLang).sort((a, b) => b[1].seconds - a[1].seconds)[0];
    const tl = top ? top[0] : "";
    const tls = top ? top[1].seconds : 0;
    const today = new Date().toISOString().split("T")[0];
    lines.push([today, state.analytics.totals.seconds, state.analytics.totals.filesOpened, state.analytics.totals.keystrokes, tl, tls].join(","));
    const file = path.join(folder, "analytics-" + Date.now() + ".csv");
    fs.writeFileSync(file, lines.join("\n"));
    vscode.window.showInformationMessage("Exported CSV: " + file);
}
