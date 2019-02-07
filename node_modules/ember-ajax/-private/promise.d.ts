/// <reference types="jquery" />
import RSVP, { Promise } from 'rsvp';
/**
 * AJAX Promise
 *
 * Sub-class of RSVP Promise that passes the XHR property on to the
 * child promise
 *
 * @extends RSVP.Promise
 * @private
 */
export default class AJAXPromise<T> extends Promise<T> {
    xhr?: JQueryXHR;
    constructor(executor: (resolve: (value?: RSVP.Arg<T>) => void, reject: (reason?: any) => void) => void, label?: string);
    /**
     * Overriding `.then` to add XHR to child promise
     */
    then<TResult1 = T, TResult2 = never>(onFulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onRejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null, label?: string): AJAXPromise<TResult1 | TResult2>;
}
