export declare type ChangeOp = 'unlink' | 'create' | 'mkdir' | 'rmdir' | 'change';
export declare type Change = [ChangeOp, string, IEntry];
export interface ITree {
    calculatePatch(next: ITree, isUnchanged?: (a: IEntry, b: IEntry) => boolean): Change[];
}
export interface IEntry {
    relativePath: string;
    basePath: string;
    fullPath: string;
    mode: number;
    size: number;
    mtime: Date | undefined;
    isDirectory(): boolean;
}
export declare function treeFromEntries(entries: IEntry[], options?: {
    sortAndExpand?: boolean;
}): ITree;
export declare function treeFromPath(path: string): ITree;
