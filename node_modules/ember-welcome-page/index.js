/* eslint-env node */
'use strict';

module.exports = {
  name: 'ember-welcome-page',

  included: function(app) {
    this._super.included(app);
    this._welcomeConfig = app.options['ember-welcome-page'] || {};

    if (this._isDisabled()) { return; }

    app.import('vendor/welcome-page.css');
  },

  treeForPublic: function() {
    if (this._isDisabled()) { return false; }

    var tree = this._super.treeForPublic.apply(this, arguments);

    return tree;
  },

  treeForAddon: function() {
    if (this._isDisabled()) { return false; }

    var tree = this._super.treeForAddon.apply(this, arguments);

    return tree;
  },

  treeForApp: function() {
    if (this._isDisabled()) { return false; }

    var tree = this._super.treeForApp.apply(this, arguments);

    return tree;
  },

  _isDisabled: function() {
    return process.env.EMBER_ENV === 'production' && !this._welcomeConfig.enabled;
  }
};
