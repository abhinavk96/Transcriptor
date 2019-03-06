'use strict';

var fs = require('fs');
var path = require('path');
var Plugin = require('broccoli-plugin');
var mkdirp = require('mkdirp');

module.exports = Creator;
Creator.prototype = Object.create(Plugin.prototype);
Creator.prototype.constructor = Creator;

function Creator (filename, content, _options) {
  var options = _options || {
    encoding: 'utf8'
  };

  if (!(this instanceof Creator)) {
    return new Creator(filename, content, options);
  }

  Plugin.call(this, [/* no inputTrees */], {
    annotation: options.annotation || this.constructor.name + ' ' + filename,
    persistentOutput: true
  });

  delete options.annotation;

  this.content = content;
  this.filename = filename;
  this.fileOptions = options;

  this._built = false;
}

Creator.prototype.build = function () {
  if (this._built) {
    return;
  }

  var outputFilePath = path.join(this.outputPath, this.filename);
  mkdirp.sync(path.dirname(outputFilePath));
  fs.writeFileSync(outputFilePath, this.content, this.fileOptions);
  this._built = true;
};
