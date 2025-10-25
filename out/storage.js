"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Storage = void 0;
const KEY = 'devanalytics.data.v1';
class Storage {
    memento;
    constructor(memento) {
        this.memento = memento;
    }
    load() {
        return (this.memento.get(KEY) || {
            version: 1,
            byLanguage: {},
            totals: { seconds: 0, filesOpened: 0, keystrokes: 0 },
            startedAt: Date.now()
        });
    }
    save(data) {
        return this.memento.update(KEY, data);
    }
    reset() {
        return this.memento.update(KEY, undefined);
    }
}
exports.Storage = Storage;
//# sourceMappingURL=storage.js.map