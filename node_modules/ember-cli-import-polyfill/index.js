/* jshint node: true */
'use strict';

var Addon = require('ember-cli/lib/models/addon');

if (!Addon.prototype.import) {
  Addon.prototype.import = function(asset, options) {
    var app = this._findHost();
    app.import(asset, options);
  };
}

if (!Addon.prototype._findHost) {
  Addon.prototype._findHost = function _findHost() {
    var app = this.app;
    var parent = this.parent;
    while (parent.parent) {
      if (parent.app) {
        app = parent.app;
        break;
      }

      parent = parent.parent;
    }
    return app;
  };
}

module.exports = {
  name: 'ember-cli-import-polyfill'
};
