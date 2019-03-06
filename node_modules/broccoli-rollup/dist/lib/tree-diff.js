"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// tslint:disable:no-var-requires
const fsTreeDiff = require('fs-tree-diff');
const walkSync = require('walk-sync');
function treeFromEntries(entries, options) {
    return fsTreeDiff.fromEntries(entries, options);
}
exports.treeFromEntries = treeFromEntries;
function treeFromPath(path) {
    return fsTreeDiff.fromEntries(walkSync.entries(path));
}
exports.treeFromPath = treeFromPath;
//# sourceMappingURL=tree-diff.js.map