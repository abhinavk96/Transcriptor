import Mixin from '@ember/object/mixin';
declare const _default: Mixin<{
    /**
     * The AJAX service to send requests through
     *
     * @property {AjaxService} ajaxService
     * @public
     */
    ajaxService: import("@ember/object/computed").default<import("../services/ajax").AjaxServiceClass, import("../services/ajax").AjaxServiceClass>;
    /**
     * @property {string} host
     * @public
     */
    host: import("@ember/object/computed").default<any, any>;
    /**
     * @property {string} namespace
     * @public
     */
    namespace: import("@ember/object/computed").default<any, any>;
    /**
     * @property {object} headers
     * @public
     */
    headers: import("@ember/object/computed").default<any, any>;
    ajax(url: string, _method: string, _options: object): import("../-private/promise").default<any>;
}, import("@ember/object").default>;
export default _default;
