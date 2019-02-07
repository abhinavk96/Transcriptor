"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const crypto = require("crypto");
const fs = require("fs");
const tree_diff_1 = require("./tree-diff");
class OutputPatcher {
    constructor(outputPath, logger) {
        this.outputPath = outputPath;
        this.logger = logger;
        this.entries = [];
        this.contents = Object.create(null);
        this.checksums = new WeakMap();
        this.lastTree = tree_diff_1.treeFromEntries([]);
        this.isUnchanged = this.isUnchanged.bind(this);
    }
    // relativePath should be without leading '/' and use forward slashes
    add(relativePath, content) {
        const entry = new Entry(relativePath);
        this.entries.push(entry);
        const checksum = crypto.createHash('md5').update(content).digest('hex');
        this.checksums.set(entry, checksum);
        this.contents[relativePath] = content;
    }
    patch() {
        try {
            this.lastTree = this._patch();
        }
        catch (e) {
            this.lastTree = tree_diff_1.treeFromPath(this.outputPath);
            throw e;
        }
        finally {
            this.entries = [];
            this.contents = Object.create(null);
        }
    }
    isUnchanged(a, b) {
        if (a.isDirectory() && b.isDirectory()) {
            return true;
        }
        const checksums = this.checksums;
        if (a.mode === b.mode && checksums.get(a) === checksums.get(b)) {
            this.logger.debug('cache hit, no change to: %s', a.relativePath);
            return true;
        }
        this.logger.debug('cache miss, write to: %s', a.relativePath);
        return false;
    }
    _patch() {
        const entries = this.entries;
        const lastTree = this.lastTree;
        const isUnchanged = this.isUnchanged;
        const outputPath = this.outputPath;
        const contents = this.contents;
        const nextTree = tree_diff_1.treeFromEntries(entries, { sortAndExpand: true });
        const patch = lastTree.calculatePatch(nextTree, isUnchanged);
        patch.forEach((change) => {
            const op = change[0];
            const path = change[1];
            switch (op) {
                case 'mkdir':
                    fs.mkdirSync(outputPath + '/' + path);
                    break;
                case 'rmdir':
                    fs.rmdirSync(outputPath + '/' + path);
                    break;
                case 'unlink':
                    fs.unlinkSync(outputPath + '/' + path);
                    break;
                case 'create':
                case 'change':
                    fs.writeFileSync(outputPath + '/' + path, contents[path]);
                    break;
            }
        });
        return nextTree;
    }
}
exports.default = OutputPatcher;
// tslint:disable-next-line:max-classes-per-file
class Entry {
    constructor(relativePath) {
        this.basePath = '';
        this.fullPath = '';
        this.size = -1;
        this.relativePath = relativePath;
        this.mode = 0;
    }
    isDirectory() {
        return false;
    }
}
//# sourceMappingURL=output-patcher.js.map