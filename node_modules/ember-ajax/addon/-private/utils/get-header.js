import { A } from '@ember/array';
import { isNone } from '@ember/utils';
/**
 * Do a case-insensitive lookup of an HTTP header
 *
 * @function getHeader
 * @private
 */
export default function getHeader(headers, name) {
    if (isNone(headers) || isNone(name)) {
        return undefined;
    }
    const matchedKey = A(Object.keys(headers)).find(key => {
        return key.toLowerCase() === name.toLowerCase();
    });
    return matchedKey ? headers[matchedKey] : undefined;
}
