/* eslint-env node */
'use strict';

const debug = require('debug')('weakmap');
const browserslist = require('browserslist');
const minBrowserVersion = {
  'chrome': 38,
  'edge': 12,
  'firefox': 46,
  'ie': 11,
  'opera': 9,
  'safari': 10,
  'electron': 38,
  'and_chr': 38,
  'and_ff': 46,
  'ios_saf': 9
};

function normalizeVersion(version) {
  if (version === 'all') {
    return 0;
  } else if (version.indexOf('-') !== -1) { // 10.0-10.2
    version = version.split('-')[0]; // just take the lower value
  }

  return parseFloat(version);
}

module.exports = {
  name: 'ember-weakmap',

  included() {
    this._super.included.apply(this, arguments);
    
    this._ensureThisImport();
    const targets = this.project.targets;
    let needsPolyfill = false;

    if (targets && targets.browsers) {
      const browsers = browserslist(targets.browsers);

      browsers.forEach(browser => {
        const name = browser.split(' ')[0];
        const version = browser.split(' ')[1];

        if (!minBrowserVersion[name]
          || minBrowserVersion[name] > normalizeVersion(version)) {
          debug(`config/targets includes (${browser}) which needs a polyfill.`);
          needsPolyfill = true;
        }
      });
    } else {
      debug(`target browsers was not found. including polyfill as a fallback.`);
      needsPolyfill = true;
    }

    if (needsPolyfill) {
      debug('Including the weakmap polyfill');
      this.import('vendor/ember-weakmap-polyfill.js');
    } else {
      debug('Not including the weakmap polyfill. Including the passthrough instead.');
      this.import('vendor/ember-weakmap-passthrough.js');
    }
  },

  _ensureThisImport() {
    if (!this.import) {
      this._findHost = function findHostShim() {
        var current = this;
        var app;
        do {
          app = current.app || app;
        } while (current.parent.parent && (current = current.parent));
        return app;
      };
      this.import = function importShim(asset, options) {
        var app = this._findHost();
        app.import(asset, options);
      };
    }
  }
};
