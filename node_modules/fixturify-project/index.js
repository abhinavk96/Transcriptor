'use strict';

const fixturify = require('fixturify');
const tmp = require('tmp');
const fs = require('fs');

tmp.setGracefulCleanup();

function keys(object) {
  if (object !== null && (typeof object === 'object' || Array.isArray(object))) {
    return Object.keys(object);
  } else {
    return [];
  }
}

module.exports = class Project {
  constructor(name, version = '0.0.0', cb) {
    this.pkg = {
      name,
      version,
      keywords: []
    };

    this._dependencies = {};
    this._devDependencies = {};
    this.validate();
    this.files = {
      'index.js': `
'use strict';
module.exports = {};`
    };
    this.isDependency = true;
    this._tmp = tmp.dirSync({ unsafeCleanup: true });
    this._root = fs.realpathSync(this._tmp.name);

    if (typeof cb === 'function') {
      cb(this);
    }
  }

  get root() {
    return this._root;
  }

  get name() {
    return this.pkg.name;
  }

  set name(value) {
    this.pkg.name = value;
  }

  get version() {
    return this.pkg.version;
  }

  set version(value) {
    this.pkg.version = value;
  }

  static fromJSON(json, name) {
    if (json[name] === undefined) {
      throw new Error(`${name} was expected, but not found`);
    }

    let files = JSON.parse(JSON.stringify(json[name]));
    let pkg = JSON.parse(files['package.json']);
    let nodeModules = files['node_modules'];

    // drop "special files"
    delete files['node_modules'];
    delete files['package.json'];

    let project = new this(pkg.name, pkg.version);

    keys(pkg.dependencies).forEach(dependency => {
      project.addDependency(this.fromJSON(nodeModules, dependency));
    });

    keys(pkg.devDependencies).forEach(dependency => {
      project.addDevDependency(this.fromJSON(nodeModules, dependency));
    });

    delete pkg.dependencies;
    delete pkg.devDependencies;

    project.pkg = pkg;
    project.files = files;

    return project;
  }

  static fromDir(root, name) {
    let project = new this(name, 'x.x.x');

    project.readSync(root);

    return project;
  }

  writeSync(root = this.root) {
    fixturify.writeSync(root, this.toJSON());
  }

  readSync(root = this.root) {
    let files = fixturify.readSync(root)[this.name];

    let pkg = JSON.parse(files['package.json']);
    let nodeModules = files['node_modules'];

    // drop "special files"
    delete files['node_modules'];
    delete files['package.json'];

    this.name = pkg.name;
    this.version = pkg.version;
    this.keywords = pkg.keywords;

    this._dependencies = {};
    this._devDependencies = {};
    this.files = files;

    keys(pkg.dependencies).forEach(dependency => {
      this.addDependency(this.constructor.fromJSON(nodeModules, dependency));
    });

    keys(pkg.devDependencies).forEach(dependency => {
      this.addDevDependency(this.constructor.fromJSON(nodeModules, dependency));
    });

  }

  addDependency(name, version, cb) {
    let dep;

    if (typeof name === 'string') {
      dep = this._dependencies[name] = new this.constructor(name, version);
    } else if (name.isDependency) {
      dep = this._dependencies[name.name] = name;
    } else {
      throw new TypeError('WTF');
    }

    if (typeof cb === 'function') {
      cb(dep);
    }

    return dep;
  }

  removeDependency(name) {
    delete this._dependencies[name];
  }

  removeDevDependency(name) {
    delete this._devDependencies[name];
  }

  addDevDependency(name, version, cb) {
    let dep;

    if (typeof name === 'string')  {
      dep = this._devDependencies[name] = new this.constructor(name, version);
    } else if (name.isDependency) {
      dep = this._devDependencies[name.name] = name;
    } else {
      throw new TypeError('WTF');
    }

    if (typeof cb === 'function') {
      cb(dep);
    }

    return dep;
  }

  dependencies() {
    return Object.keys(this._dependencies).map(dependency => this._dependencies[dependency]);
  }

  devDependencies() {
    return Object.keys(this._devDependencies).map(dependency => this._devDependencies[dependency]);
  }

  validate() {
    if (typeof this.name !== 'string') {
      throw new TypeError('Missing name');
    }

    if (typeof this.version !== 'string') {
      throw new TypeError(`${this.name} is missing a version`);
    }

    this.dependencies().forEach(dep => dep.validate());
    this.devDependencies().forEach(dep => dep.validate());
  }

  toJSON() {
    if (arguments.length > 0) {
      return this.toJSON()[this.name][arguments[0]];
    } else {
      return {
        [this.name]: Object.assign({}, this.files, {
          'node_modules': depsAsObject([
            ...this.devDependencies(),
            ...this.dependencies()
          ]),
          'package.json': JSON.stringify(Object.assign(this.pkg, {
            dependencies: depsToObject(this.dependencies()),
            devDependencies: depsToObject(this.devDependencies()),
          }), null, 2),
        }),
      };
    }
  }

  clone() {
    return this.constructor.fromJSON(this.toJSON(), this.name);
  }

  dispose() {
    this._tmp.removeCallback();
  }
}

function parseScoped(name) {
  let matched = name.match(/@([^@\/]+)\/(.*)/);
  if (matched) {
    return {
      scope: matched[1],
      name: matched[2],
    };
  }
  return null;
}

function depsAsObject(modules) {
  let obj = {};
  modules.forEach(dep => {
    let scoped = parseScoped(dep.name);
    if (scoped) {
      let root = obj['@' + scoped.scope] = obj['@' + scoped.scope] || {};
      root[scoped.name] = dep.toJSON()[dep.name];
    } else {
      obj[dep.name] = dep.toJSON()[dep.name];
    }
  });
  return obj;
}

function depsToObject(deps) {
  let obj = {};
  deps.forEach(dep => obj[dep.name] = dep.version);
  return obj;
}
