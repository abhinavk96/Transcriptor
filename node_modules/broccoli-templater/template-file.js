'use strict'

const fs = require('fs');

module.exports = class TemplateFile {
  static fromPath(path) {
    return new this(path);
  }

  constructor(path, _stat, _content) {
    this.path = path;
    this._stat = _stat;
    this._content = _content;
    this.__template = undefined;
  }

  get stat() {
    if (this._stat !== undefined) {
      return this._stat;
    }

    return (this._stat = fs.statSync(this.path))
  }

  equal(other) {
    // key represents a other, diff the other
    if (this.path     === other.path &&
      this.stat.mode  === other.stat.mode &&
      this.stat.size  === other.stat.size &&
      this.type === 'directory' ? true : this.stat.mtime.getTime() === other.stat.mtime.getTime()) {
      return true;
    }
  }

  get _template() {
    if (this.__template) {
      return this.__template;
    }

    const templater = require('lodash.template');
    return (this.__template = templater(fs.readFileSync(this.path)));
  }

  template(variables) {
    return this._template(variables);
  }
}
