import Mixin from '@ember/object/mixin';
import { AjaxError } from '../errors';
import AJAXPromise from 'ember-ajax/-private/promise';
import { AJAXOptions, Headers, Method, RequestData, RawResponse } from '../-private/types';
declare const _default: Mixin<{
    /**
     * The default value for the request `contentType`
     *
     * For now, defaults to the same value that jQuery would assign.  In the
     * future, the default value will be for JSON requests.
     * @property {string} contentType
     * @public
     */
    contentType: string;
    /**
     * Headers to include on the request
     *
     * Some APIs require HTTP headers, e.g. to provide an API key. Arbitrary
     * headers can be set as key/value pairs on the `RESTAdapter`'s `headers`
     * object and Ember Data will send them along with each ajax request.
     *
     * ```javascript
     * // app/services/ajax.js
     * import AjaxService from 'ember-ajax/services/ajax';
     *
     * export default AjaxService.extend({
     *   headers: {
     *     'API_KEY': 'secret key',
     *     'ANOTHER_HEADER': 'Some header value'
     *   }
     * });
     * ```
     *
     * `headers` can also be used as a computed property to support dynamic
     * headers.
     *
     * ```javascript
     * // app/services/ajax.js
     * import Ember from 'ember';
     * import AjaxService from 'ember-ajax/services/ajax';
     *
     * const {
     *   computed,
     *   get,
     *   inject: { service }
     * } = Ember;
     *
     * export default AjaxService.extend({
     *   session: service(),
     *   headers: computed('session.authToken', function() {
     *     return {
     *       'API_KEY': get(this, 'session.authToken'),
     *       'ANOTHER_HEADER': 'Some header value'
     *     };
     *   })
     * });
     * ```
     *
     * In some cases, your dynamic headers may require data from some object
     * outside of Ember's observer system (for example `document.cookie`). You
     * can use the `volatile` function to set the property into a non-cached mode
     * causing the headers to be recomputed with every request.
     *
     * ```javascript
     * // app/services/ajax.js
     * import Ember from 'ember';
     * import AjaxService from 'ember-ajax/services/ajax';
     *
     * const {
     *   computed,
     *   get,
     *   inject: { service }
     * } = Ember;
     *
     * export default AjaxService.extend({
     *   session: service(),
     *   headers: computed('session.authToken', function() {
     *     return {
     *       'API_KEY': get(document.cookie.match(/apiKey\=([^;]*)/), '1'),
     *       'ANOTHER_HEADER': 'Some header value'
     *     };
     *   }).volatile()
     * });
     * ```
     *
     * @property {Headers} headers
     * @public
     */
    headers: undefined;
    /**
     * @property {string} host
     * @public
     */
    host: undefined;
    /**
     * @property {string} namespace
     * @public
     */
    namespace: undefined;
    /**
     * @property {Matcher[]} trustedHosts
     * @public
     */
    trustedHosts: undefined;
    /**
     * Make an AJAX request, ignoring the raw XHR object and dealing only with
     * the response
     */
    request<T = any>(url: string, options?: AJAXOptions | undefined): AJAXPromise<T>;
    /**
     * Make an AJAX request, returning the raw XHR object along with the response
     */
    raw<T = any>(url: string, options?: AJAXOptions | undefined): AJAXPromise<RawResponse<T>>;
    /**
     * Shared method to actually make an AJAX request
     */
    _makeRequest<T>(hash: AJAXOptions): AJAXPromise<RawResponse<T>>;
    /**
     * calls `request()` but forces `options.type` to `POST`
     */
    post<T = any>(url: string, options?: AJAXOptions | undefined): AJAXPromise<T>;
    /**
     * calls `request()` but forces `options.type` to `PUT`
     */
    put<T = any>(url: string, options?: AJAXOptions | undefined): AJAXPromise<T>;
    /**
     * calls `request()` but forces `options.type` to `PATCH`
     */
    patch<T = any>(url: string, options?: AJAXOptions | undefined): AJAXPromise<T>;
    /**
     * calls `request()` but forces `options.type` to `DELETE`
     */
    del<T = any>(url: string, options?: AJAXOptions | undefined): AJAXPromise<T>;
    /**
     * calls `request()` but forces `options.type` to `DELETE`
     *
     * Alias for `del()`
     */
    delete<T = any>(url: string, options?: AJAXOptions | undefined): AJAXPromise<T>;
    /**
     * Wrap the `.get` method so that we issue a warning if
     *
     * Since `.get` is both an AJAX pattern _and_ an Ember pattern, we want to try
     * to warn users when they try using `.get` to make a request
     */
    get(url: string): any;
    /**
     * Manipulates the options hash to include the HTTP method on the type key
     */
    _addTypeToOptionsFor(options: AJAXOptions | undefined, method: Method): AJAXOptions;
    /**
     * Get the full "headers" hash, combining the service-defined headers with
     * the ones provided for the request
     */
    _getFullHeadersHash(headers?: Headers | undefined): Headers;
    /**
     * Created a normalized set of options from the per-request and
     * service-level settings
     */
    options(url: string, options?: AJAXOptions): AJAXOptions;
    /**
     * Build a URL for a request
     *
     * If the provided `url` is deemed to be a complete URL, it will be returned
     * directly.  If it is not complete, then the segment provided will be combined
     * with the `host` and `namespace` options of the request class to create the
     * full URL.
     */
    _buildURL(url: string, options?: AJAXOptions): string;
    /**
     * Takes an ajax response, and returns the json payload or an error.
     *
     * By default this hook just returns the json payload passed to it.
     * You might want to override it in two cases:
     *
     * 1. Your API might return useful results in the response headers.
     *    Response headers are passed in as the second argument.
     *
     * 2. Your API might return errors as successful responses with status code
     *    200 and an Errors text or object.
     */
    handleResponse<T>(status: number, headers: Headers, payload: T, requestData: RequestData): AjaxError | T;
    _createCorrectError(status: number, headers: Headers, payload: any, requestData: RequestData): AjaxError;
    /**
     * Match the host to a provided array of strings or regexes that can match to a host
     */
    _matchHosts(host: string | undefined, matcher?: string | RegExp | undefined): boolean;
    /**
     * Determine whether the headers should be added for this request
     *
     * This hook is used to help prevent sending headers to every host, regardless
     * of the destination, since this could be a security issue if authentication
     * tokens are accidentally leaked to third parties.
     *
     * To avoid that problem, subclasses should utilize the `headers` computed
     * property to prevent authentication from being sent to third parties, or
     * implement this hook for more fine-grain control over when headers are sent.
     *
     * By default, the headers are sent if the host of the request matches the
     * `host` property designated on the class.
     */
    _shouldSendHeaders({ url, host }: AJAXOptions): boolean;
    /**
     * Generates a detailed ("friendly") error message, with plenty
     * of information for debugging (good luck!)
     */
    generateDetailedMessage(status: number, headers: Headers, payload: any, requestData: RequestData): string;
    /**
     * Default `handleResponse` implementation uses this hook to decide if the
     * response is a an authorized error.
     */
    isUnauthorizedError(status: number, _headers: Headers, _payload: any): boolean;
    /**
     * Default `handleResponse` implementation uses this hook to decide if the
     * response is a forbidden error.
     */
    isForbiddenError(status: number, _headers: Headers, _payload: any): boolean;
    /**
     * Default `handleResponse` implementation uses this hook to decide if the
     * response is a an invalid error.
     */
    isInvalidError(status: number, _headers: Headers, _payload: any): boolean;
    /**
     * Default `handleResponse` implementation uses this hook to decide if the
     * response is a bad request error.
     */
    isBadRequestError(status: number, _headers: Headers, _payload: any): boolean;
    /**
     * Default `handleResponse` implementation uses this hook to decide if the
     * response is a "not found" error.
     */
    isNotFoundError(status: number, _headers: Headers, _payload: any): boolean;
    /**
     * Default `handleResponse` implementation uses this hook to decide if the
     * response is a "gone" error.
     */
    isGoneError(status: number, _headers: Headers, _payload: any): boolean;
    /**
     * Default `handleResponse` implementation uses this hook to decide if the
     * response is an "abort" error.
     */
    isAbortError(status: number, _headers: Headers, _payload: any): boolean;
    /**
     * Default `handleResponse` implementation uses this hook to decide if the
     * response is a "conflict" error.
     */
    isConflictError(status: number, _headers: Headers, _payload: any): boolean;
    /**
     * Default `handleResponse` implementation uses this hook to decide if the
     * response is a server error.
     */
    isServerError(status: number, _headers: Headers, _payload: any): boolean;
    /**
     * Default `handleResponse` implementation uses this hook to decide if the
     * response is a success.
     */
    isSuccess(status: number, _headers: Headers, _payload: any): boolean;
    parseErrorResponse(responseText: string): any;
    normalizeErrorResponse(_status: number, _headers: Headers, payload: any): any;
}, import("@ember/object").default>;
/**
 * AjaxRequest Mixin
 */
export default _default;
