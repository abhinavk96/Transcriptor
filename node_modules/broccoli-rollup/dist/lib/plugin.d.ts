export interface Plugin {
    inputPaths: string[];
    outputPath: string;
    cachePath: string;
}
declare const Plugin: {
    prototype: Plugin;
    new (inputs: any[], options?: {
        annotation?: string;
        name?: string;
        persistentOutput?: boolean;
    }): Plugin;
};
export default Plugin;
