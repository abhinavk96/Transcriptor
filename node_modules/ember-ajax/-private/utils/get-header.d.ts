import { Headers } from '../types';
/**
 * Do a case-insensitive lookup of an HTTP header
 *
 * @function getHeader
 * @private
 */
export default function getHeader(headers: Headers | undefined, name: string | undefined): string | undefined | null;
