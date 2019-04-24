'use strict';

const { name } = require('./package');

module.exports = {
  name,
  
  included() {
    this._super.included.apply(this, arguments);

    this.import('vendor/recorder.js');
    this.import('vendor/shims/recorder.js');
  }
};
