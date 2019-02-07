"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// tslint:disable:no-var-requires
const heimdall = require('heimdalljs');
const _logger = require('heimdalljs-logger');
exports.logger = _logger('broccoli-rollup');
function instrument(name, cb) {
    return heimdall.node(name, cb);
}
exports.instrument = instrument;
//# sourceMappingURL=heimdall.js.map