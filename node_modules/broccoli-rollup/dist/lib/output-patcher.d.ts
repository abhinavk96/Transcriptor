export interface ILogger {
    debug(...args: any[]): void;
}
export default class OutputPatcher {
    private outputPath;
    private logger;
    private entries;
    private contents;
    private checksums;
    private lastTree;
    constructor(outputPath: string, logger: ILogger);
    add(relativePath: string, content: string): void;
    patch(): void;
    private isUnchanged;
    private _patch;
}
