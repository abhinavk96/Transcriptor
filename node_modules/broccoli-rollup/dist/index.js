"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const fs_1 = require("fs");
const path = require("path");
const heimdall_1 = require("./lib/heimdall");
const output_patcher_1 = require("./lib/output-patcher");
const plugin_1 = require("./lib/plugin");
const resolver_1 = require("./lib/resolver");
const tree_diff_1 = require("./lib/tree-diff");
// tslint:disable:no-var-requires
const symlinkOrCopySync = require('symlink-or-copy').sync;
const nodeModulesPath = require('node-modules-path');
// tslint:enable:no-var-requires
const deref = typeof fs_1.copyFileSync === 'function'
    ? (srcPath, destPath) => {
        try {
            fs_1.unlinkSync(destPath);
        }
        catch (e) {
            if (e.code !== 'ENOENT') {
                throw e;
            }
        }
        fs_1.copyFileSync(srcPath, destPath, fs_1.constants.COPYFILE_EXCL);
    }
    : (srcPath, destPath) => {
        const content = fs_1.readFileSync(srcPath);
        fs_1.writeFileSync(destPath, content);
    };
module.exports = class Rollup extends plugin_1.default {
    constructor(node, options) {
        super([node], {
            annotation: options.annotation,
            name: options.name,
            persistentOutput: true,
        });
        this.innerCachePath = '';
        this.rollupOptions = options.rollup;
        this._lastChunk = null;
        this._output = null;
        this.lastTree = tree_diff_1.treeFromEntries([]);
        this.cache = options.cache === undefined ? true : options.cache;
        if (options.nodeModulesPath !== undefined &&
            !path.isAbsolute(options.nodeModulesPath)) {
            throw new Error(`nodeModulesPath must be fully qualified and you passed a relative path`);
        }
        this.nodeModulesPath =
            options.nodeModulesPath || nodeModulesPath(process.cwd());
    }
    build() {
        const lastTree = this.lastTree;
        if (!this.innerCachePath) {
            symlinkOrCopySync(this.nodeModulesPath, `${this.cachePath}/node_modules`);
            fs_1.mkdirSync((this.innerCachePath = `${this.cachePath}/build`));
        }
        const newTree = (this.lastTree = tree_diff_1.treeFromPath(this.inputPaths[0]));
        const patches = lastTree.calculatePatch(newTree);
        patches.forEach(change => {
            const op = change[0];
            const relativePath = change[1];
            switch (op) {
                case 'mkdir':
                    fs_1.mkdirSync(`${this.innerCachePath}/${relativePath}`);
                    break;
                case 'unlink':
                    fs_1.unlinkSync(`${this.innerCachePath}/${relativePath}`);
                    break;
                case 'rmdir':
                    fs_1.rmdirSync(`${this.innerCachePath}/${relativePath}`);
                    break;
                case 'create':
                    deref(`${this.inputPaths[0]}/${relativePath}`, `${this.innerCachePath}/${relativePath}`);
                    break;
                case 'change':
                    deref(`${this.inputPaths[0]}/${relativePath}`, `${this.innerCachePath}/${relativePath}`);
                    break;
            }
        });
        // If this a noop post initial build, just bail out
        if (this._lastChunk && patches.length === 0) {
            return;
        }
        const options = this._loadOptions();
        options.input = this._mapInput(options.input);
        return heimdall_1.instrument('rollup', () => {
            return require('rollup')
                .rollup(options)
                .then((chunk) => {
                if (this.cache) {
                    this._lastChunk = chunk;
                }
                return this._buildTargets(chunk, options);
            });
        });
    }
    _mapInput(input) {
        if (Array.isArray(input)) {
            return input.map(entry => `${this.innerCachePath}/${entry}`);
        }
        return `${this.innerCachePath}/${input}`;
    }
    _loadOptions() {
        // TODO: support rollup config files
        const options = Object.assign({
            cache: this._lastChunk,
        }, this.rollupOptions);
        return options;
    }
    _targetsFor(options) {
        return Array.isArray(options.output) ? options.output : [options.output];
    }
    _buildTargets(chunk, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const output = this._getOutput();
            const targets = this._targetsFor(options);
            for (let i = 0; i < targets.length; i++) {
                yield this._buildTarget(chunk, targets[i], output);
            }
            output.patch();
        });
    }
    _buildTarget(chunk, options, output) {
        return __awaiter(this, void 0, void 0, function* () {
            let generateOptions;
            if (this.rollupOptions.experimentalCodeSplitting) {
                const results = (yield chunk.generate(Object.assign({}, options, {
                    sourcemap: !!options.sourcemap,
                })));
                Object.keys(results).forEach(file => {
                    const fileName = resolver_1.default.moduleResolve(file, options.dir + '/');
                    this._writeFile(fileName, options.sourcemap, results[file], output);
                });
            }
            else {
                generateOptions = this._generateSourceMapOptions(options);
                const result = yield chunk.generate(generateOptions);
                this._writeFile(options.file, options.sourcemap, result, output);
            }
        });
    }
    _generateSourceMapOptions(options) {
        const sourcemap = options.sourcemap;
        const file = options.file;
        const sourcemapFile = options.sourcemapFile;
        if (sourcemapFile) {
            options.sourcemapFile = this.innerCachePath + '/' + sourcemapFile;
        }
        else {
            options.sourcemapFile = this.innerCachePath + '/' + file;
        }
        return Object.assign({}, options, {
            sourcemap: !!sourcemap,
        });
    }
    _writeFile(filePath, sourcemap, result, output) {
        let code = result.code;
        const map = result.map;
        if (sourcemap && map !== null) {
            let url;
            if (sourcemap === 'inline') {
                url = map.toUrl();
            }
            else {
                url = this._addSourceMap(map, filePath, output);
            }
            code += '//# sourceMap';
            code += `pingURL=${url}`;
        }
        output.add(filePath, code);
    }
    _addSourceMap(map, relativePath, output) {
        const url = path.basename(relativePath) + '.map';
        output.add(relativePath + '.map', map.toString());
        return url;
    }
    _getOutput() {
        let output = this._output;
        if (!output) {
            output = this._output = new output_patcher_1.default(this.outputPath, heimdall_1.logger);
        }
        return output;
    }
};
//# sourceMappingURL=index.js.map