import PromiseProxyMixin from '@ember/object/promise-proxy-mixin'
import {Promise} from 'rsvp'

/**
 * It's assumed if you call this method, it was previously checked that it was a promise
 * and is fullfilled
 *
 * @param promise
 * @returns {Object} contents of the promise
 */
export default function getPromiseContent(promise) {
  if (PromiseProxyMixin.detect(promise)) {
    return promise.get('content');
  }

  if (promise instanceof Promise) {
    return promise._result;
  }

  // Only can get the content for one of the two above
  return null;
}
