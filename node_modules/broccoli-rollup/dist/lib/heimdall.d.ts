export interface ILogger {
    debug(...args: any[]): void;
}
export declare const logger: ILogger;
export declare function instrument(name: string, cb: () => Promise<void>): Promise<void>;
