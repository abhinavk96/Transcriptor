import Mixin from '@ember/object/mixin';
import Ember from 'ember';
import isPromise from 'ember-promise-utils/utils/is-promise';
import isFulfilled from 'ember-promise-utils/utils/is-fulfilled';
import getPromiseContent from 'ember-promise-utils/utils/get-promise-content';

export interface PromiseResolverMixin {
  resolvePromise(
    maybePromise,
    immediateResolve: (resolved?: any) => any,
    delayedResolve?: (resolved?: any) => any,
    catchResolve?: (error?: Error) => any
  ): any
  _currentPromise?: any
  _promiseValue?: any
  _promiseWasSettled?: boolean
  ensureLatestPromise(promise, callback: (promise?: any) => any): any
  clearPromise(promise?: any): any
}

export default Mixin.create<PromiseResolverMixin>({
  resolvePromise(maybePromise, immediateResolve, delayedResolve?, catchResolve?) {
    if (!isPromise(maybePromise)) {
      this.clearPromise();
      return immediateResolve.call(this, maybePromise);
    }

    /**
     * If we've already fulfilled, just return to avoid returning null
     * Probably could tie into SetValue, something to think about later
     */
    if (isFulfilled(maybePromise)) {
      this.clearPromise();
      return immediateResolve.call(this, getPromiseContent(maybePromise));
    }

    /**
     * If the type wasn't a PromiseProxy or RSVP, check if we resolved for .then
     */
    if (maybePromise === this._currentPromise) {
      if (this._promiseWasSettled) {
        return immediateResolve.call(this, this._promiseValue);
      }
      return null; // Return we don't need to check the latest again
    }

    this.ensureLatestPromise(maybePromise, (promise) => {
      promise.then((value) => {
        if (maybePromise === this._currentPromise) {
          this._promiseWasSettled = true;
          this._promiseValue = value;
          // This will recompue the value and fire the _wasSettled check above
          return (delayedResolve || immediateResolve).call(this, value);
        }
      }).catch((error) => {
        if (catchResolve) {
          return catchResolve.call(this, error);
        } else {
          Ember.Logger.error('Promise died in promise-resolver and no catchResolve method was passed in.');
          Ember.Logger.error(error);
        }
      });
    });
    return null;
  },

  ensureLatestPromise(promise, callback) {
    this.clearPromise(promise);
    callback.call(this, Ember.RSVP.Promise.resolve(promise));
  },

  clearPromise(promise = null) {
    // It's a new promise, reset
    this._promiseWasSettled = false;
    this._currentPromise = promise;
  }
})
