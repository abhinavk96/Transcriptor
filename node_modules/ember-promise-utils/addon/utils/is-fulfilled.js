import PromiseProxyMixin from '@ember/object/promise-proxy-mixin';
import { Promise } from 'rsvp';

/**
 * It's assumed if you call this method, it was previously checked that it is a promise
 * @param promise
 * @returns {boolean} whether promise has been fullfilled or not
 */
export default function isFulfilled(promise) {
  if (PromiseProxyMixin.detect(promise)) {
    return !!promise.get('isFulfilled');


  }

  if (promise instanceof Promise) {
    return promise._state === 1;

  }

  // Can't detect it if its not one of the two kinds above
return false;
}
