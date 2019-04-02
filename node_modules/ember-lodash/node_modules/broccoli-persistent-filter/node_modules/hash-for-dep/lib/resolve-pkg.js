'use strict';
var resolve = require('resolve');
var path = require('path');

/* @private
 *
 * @method resolvePkg
 * @param {String} name
 * @param {String} dir
 * @return {String}
 */
module.exports = function resolvePkg(name, dir) {
  if (name === './') {
    return path.resolve(name, 'package.json');
  }

  if (name[name.length - 1] !== '/') {
    name += '/';
  }

  if (name.charAt(0) === '/') {
    return name + 'package.json';
  }

  try {
    return resolve.sync(name + 'package.json', {
      basedir: dir || __dirname,
      preserveSymlinks: false
    });
  } catch(err) {
    if (err.code === 'MODULE_NOT_FOUND') {
      return null;
    }

    throw err;
  }
};
