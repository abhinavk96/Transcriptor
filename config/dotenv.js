/* eslint-env node */

'use strict';

const path = require('path');

module.exports = function(/* env */) {
  return {
    clientAllowedKeys: ['API_HOST'],
    fastbootAllowedKeys: ['API_HOST'],
    failOnMissingKey: false,
    path: path.join(__dirname, '.env')
  }
};
