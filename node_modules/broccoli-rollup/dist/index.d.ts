import { OutputChunk, OutputOptions } from 'rollup';
import OutputPatcher from './lib/output-patcher';
import { IGeneratedResult, IRollupOptions } from './lib/rollup';
import { ITree } from './lib/tree-diff';
declare const _default: {
    new (node: any, options: {
        annotation?: string | undefined;
        name?: string | undefined;
        rollup: IRollupOptions;
        cache?: boolean | undefined;
        nodeModulesPath?: string | undefined;
    }): {
        rollupOptions: IRollupOptions;
        cache: boolean;
        innerCachePath: string;
        nodeModulesPath: string;
        _lastChunk: OutputChunk | null;
        lastTree: ITree;
        _output: OutputPatcher | null;
        build(): Promise<void> | undefined;
        _mapInput(input: string | string[]): string | string[];
        _loadOptions(): IRollupOptions;
        _targetsFor(options: IRollupOptions): OutputOptions[];
        _buildTargets(chunk: OutputChunk, options: IRollupOptions): Promise<void>;
        _buildTarget(chunk: OutputChunk, options: OutputOptions, output: OutputPatcher): Promise<void>;
        _generateSourceMapOptions(options: OutputOptions): OutputOptions;
        _writeFile(filePath: string, sourcemap: boolean | "inline", result: IGeneratedResult, output: OutputPatcher): void;
        _addSourceMap(map: any, relativePath: string, output: OutputPatcher): string;
        _getOutput(): OutputPatcher;
        inputPaths: string[];
        outputPath: string;
        cachePath: string;
    };
};
export = _default;
