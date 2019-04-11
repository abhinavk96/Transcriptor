import EmberError from '@ember/error';
export declare class AjaxError extends EmberError {
    payload: any;
    status: number;
    constructor(payload: any, message: string | undefined, status: number);
}
export declare class InvalidError extends AjaxError {
    constructor(payload: any);
}
export declare class UnauthorizedError extends AjaxError {
    constructor(payload: any);
}
export declare class ForbiddenError extends AjaxError {
    constructor(payload: any);
}
export declare class BadRequestError extends AjaxError {
    constructor(payload: any);
}
export declare class NotFoundError extends AjaxError {
    constructor(payload: any);
}
export declare class GoneError extends AjaxError {
    constructor(payload: any);
}
export declare class TimeoutError extends AjaxError {
    constructor();
}
export declare class AbortError extends AjaxError {
    constructor();
}
export declare class ConflictError extends AjaxError {
    constructor(payload: any);
}
export declare class ServerError extends AjaxError {
    constructor(payload: any, status: number);
}
/**
 * Checks if the given error is or inherits from AjaxError
 */
export declare function isAjaxError(error: any): error is AjaxError;
/**
 * Checks if the given status code or AjaxError object represents an
 * unauthorized request error
 */
export declare function isUnauthorizedError(error: AjaxError | number): boolean;
/**
 * Checks if the given status code or AjaxError object represents a forbidden
 * request error
 */
export declare function isForbiddenError(error: AjaxError | number): boolean;
/**
 * Checks if the given status code or AjaxError object represents an invalid
 * request error
 */
export declare function isInvalidError(error: AjaxError | number): boolean;
/**
 * Checks if the given status code or AjaxError object represents a bad request
 * error
 */
export declare function isBadRequestError(error: AjaxError | number): boolean;
/**
 * Checks if the given status code or AjaxError object represents a "not found"
 * error
 */
export declare function isNotFoundError(error: AjaxError | number): boolean;
/**
 * Checks if the given status code or AjaxError object represents a "gone"
 * error
 */
export declare function isGoneError(error: AjaxError | number): boolean;
/**
 * Checks if the given object represents a "timeout" error
 */
export declare function isTimeoutError(error: any): boolean;
/**
 * Checks if the given status code or AjaxError object represents an
 * "abort" error
 */
export declare function isAbortError(error: AjaxError | number): boolean;
/**
 * Checks if the given status code or AjaxError object represents a
 * conflict error
 */
export declare function isConflictError(error: AjaxError | number): boolean;
/**
 * Checks if the given status code or AjaxError object represents a server error
 */
export declare function isServerError(error: AjaxError | number): boolean;
/**
 * Checks if the given status code represents a successful request
 */
export declare function isSuccess(status: number | string): boolean;
