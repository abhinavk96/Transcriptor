interface URLObject {
    href?: string;
    protocol?: string;
    hostname?: string;
    port?: string;
    pathname?: string;
    search?: string;
    hash?: string;
}
/**
 * Parse a URL string into an object that defines its structure
 *
 * The returned object will have the following properties:
 *
 *   href: the full URL
 *   protocol: the request protocol
 *   hostname: the target for the request
 *   port: the port for the request
 *   pathname: any URL after the host
 *   search: query parameters
 *   hash: the URL hash
 *
 * @function parseURL
 * @private
 */
export declare function parseURL(str: string): URLObject;
export declare function isFullURL(url: string): boolean;
export declare function haveSameHost(a: string, b: string): boolean;
export {};
