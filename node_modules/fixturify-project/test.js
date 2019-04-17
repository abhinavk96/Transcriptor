'use strict';

const expect = require('chai').expect;
const Project = require('./index');
const TMPDIR = require('os').tmpdir();
const fs = require('fs-extra');

describe('Project', function() {
  function readJSON(file) {
    return JSON.parse(fs.readFileSync(file, 'UTF8'));
  }

  function read(file) {
    return fs.readFileSync(file, 'UTF8');
  }

  function readDir(path) {
    return fs.readdirSync(path);
  }

  it('has the basic', function() {
    let project = new Project('rsvp', '3.1.4');

    project.files['index.js'] = `module.exports = "Hello, World!";`;
    project.addDependency('ember-cli', '3.1.1', cli => cli.addDependency('console-ui', '3.3.3')).addDependency('rsvp', '3.1.4');
    project.addDevDependency('ember-source', '3.1.1');
    project.addDevDependency('@ember/ordered-set', '3.1.1');
    project.writeSync();

    let index = read(`${project.root}/rsvp/index.js`, 'UTF8');
    let nodeModules = readDir(`${project.root}/rsvp/node_modules`);

    expect(read(`${project.root}/rsvp/index.js`)).to.eql(`module.exports = "Hello, World!";`);

    expect(readJSON(`${project.root}/rsvp/package.json`, 'UTF8')).to.eql({
      name: 'rsvp',
      version: '3.1.4',
      keywords: [],
      dependencies: {
        'ember-cli': '3.1.1',
      },
      devDependencies: {
        '@ember/ordered-set': '3.1.1',
        'ember-source': '3.1.1'
      },
    });

    expect(read(`${project.root}/rsvp/node_modules/ember-source/index.js`)).to.contain(`module.exports`);
    expect(require(`${project.root}/rsvp/node_modules/ember-source/index.js`)).to.eql({});

    expect(readJSON(`${project.root}/rsvp/node_modules/ember-source/package.json`, 'UTF8')).to.eql({
      name: 'ember-source',
      version: '3.1.1',
      keywords: [],
      dependencies: { },
      devDependencies: { },
    });

    expect(readJSON(`${project.root}/rsvp/node_modules/ember-cli/package.json`, 'UTF8')).to.eql({
      name: 'ember-cli',
      version: '3.1.1',
      keywords: [],
      dependencies: {
        'console-ui': '3.3.3',
        'rsvp': '3.1.4'
      },
      devDependencies: { }
    });

    expect(read(`${project.root}/rsvp/node_modules/ember-cli/node_modules/console-ui/index.js`)).to.contain(`module.exports`);
    expect(require(`${project.root}/rsvp/node_modules/ember-cli/node_modules/console-ui/index.js`)).to.eql({});

    expect(read(`${project.root}/rsvp/node_modules/@ember/ordered-set/index.js`)).to.contain(`module.exports`);
    expect(require(`${project.root}/rsvp/node_modules/@ember/ordered-set/index.js`)).to.eql({});

    expect(readJSON(`${project.root}/rsvp/node_modules/ember-cli/node_modules/console-ui/package.json`, 'UTF8')).to.eql({
      name: 'console-ui',
      version: '3.3.3',
      keywords: [],
      dependencies: { },
      devDependencies: { },
    });

    expect(nodeModules.sort()).to.eql([
      '@ember',
      'ember-cli',
      'ember-source'
    ]);

    expect(index).to.eql('module.exports = "Hello, World!";');
  });

  it('supports default version', function() {
    const input = new Project('foo');
    expect(input.version).to.eql('0.0.0');
    expect(JSON.parse(input.toJSON('package.json'))).to.have.property('version', '0.0.0');
  });

  it('supports removing packages', function() {
    const input = new Project('foo', '3.1.2');

    input.addDependency('rsvp', '4.4.4', rsvp => rsvp.addDependency('mkdirp', '4.4.4'));
    input.addDevDependency('omg', '4.4.4', omg => omg.addDependency('fs-extra', '5.5.5.'));

    expect(input.dependencies().map(dep => dep.name)).to.eql(['rsvp']);
    expect(input.devDependencies().map(dep => dep.name)).to.eql(['omg']);

    input.removeDependency('rsvp');
    input.removeDevDependency('omg');

    expect(input.dependencies().map(dep => dep.name)).to.eql([]);
    expect(input.devDependencies().map(dep => dep.name)).to.eql([]);
  });

  it('requires name and version', function() {
    expect(() => new Project('rsvp', null)).to.throw(/rsvp is missing a version/);
    expect(() => new Project(null, null)).to.throw(/Missing name/);
  });

  it('it supports construction of a project via JSON', function() {
    const input = new Project('foo', '3.1.2');

    input.addDependency('rsvp', '4.4.4', rsvp => rsvp.addDependency('mkdirp', '4.4.4'));
    input.addDevDependency('omg', '4.4.4', omg => omg.addDependency('fs-extra', '5.5.5.'));

    input.files = {
      'index.js': 'OMG',
      'foo': {
        'bar': {
          'baz': 'quz'
        }
      },
    };

    const json = input.toJSON();
    const project = Project.fromJSON(json, 'foo');

    expect(project.toJSON()).to.eql(json);
  });

  it('it supports construction of a project via JSON but without package.json#devDependencies or package.json#dependencies', function() {
    const input = new Project('foo', '3.1.2');

    input.files = {
      'index.js': 'OMG',
      'foo': {
        'bar': {
          'baz': 'quz'
        }
      },
      'package.json': '{"name": "foo"}'
    };

    const json = input.toJSON();
    const project = Project.fromJSON(json, 'foo');

    expect(project.toJSON()).to.eql(json);
  });

  it('it supports deep cloning', function() {
    const input = new Project('foo', '3.1.2');

    input.addDependency('rsvp', '4.4.4', rsvp => rsvp.addDependency('mkdirp', '4.4.4'));
    input.addDevDependency('omg', '4.4.4', omg => omg.addDependency('fs-extra', '5.5.5.'));

    input.files = {
      'index.js': 'OMG',
      'foo': {
        'bar': {
          'baz': 'quz'
        }
      }
    };

    const output = input.clone();

    expect(output.toJSON()).to.eql(input.toJSON());
    input.name = 'bar';

    expect(output.name).to.eql('foo');
    expect(input.name).to.eql('bar');

    input.addDependency('asdf', '22');
    expect(input.dependencies().map(x => x.name)).to.contain('asdf');
    expect(output.dependencies().map(x => x.name)).to.not.contain('asdf');
  });

  it('supports readSync', function() {
    const input = new Project('foo', '3.1.2');
    const output = new Project('foo', '0.0.0');

    input.addDependency('rsvp', '4.4.4', rsvp => rsvp.addDependency('mkdirp', '4.4.4'));
    input.addDevDependency('omg', '4.4.4', omg => omg.addDependency('fs-extra', '5.5.5.'));

    input.files = {
      'index.js': 'OMG',
      'foo': {
        'bar': {
          'baz': 'quz'
        }
      }
    };

    input.writeSync();
    output.readSync(input.root);

    expect(output.toJSON()).to.eql(input.toJSON());
  });

  it('supports static readSync', function() {
    const input = new Project('foo', '3.1.2');

    input.addDependency('rsvp', '4.4.4', rsvp => rsvp.addDependency('mkdirp', '4.4.4'));
    input.addDevDependency('omg', '4.4.4', omg => omg.addDependency('fs-extra', '5.5.5.'));

    input.files = {
      'index.js': 'OMG',
      'foo': {
        'bar': {
          'baz': 'quz'
        }
      }
    };

    input.writeSync();

    const output = Project.fromDir(input.root, 'foo');

    expect(output.toJSON()).to.eql(input.toJSON());
  });

  it('supports custom PKG properties', function() {
    let project = new Project('foo', '123');
    project.pkg['ember-addon'] = {
      name: 'foo'
    };

    project.writeSync();
    expect(readJSON(`${project.root}/foo/package.json`)).to.eql({
      dependencies: {},
      devDependencies: {},
      'ember-addon': {
        name: 'foo'
      },
      keywords: [],
      name: 'foo',
      version: '123'
    });

    project.pkg.name = 'apple';
    project.pkg.version = '123';

    expect(project.name, 'apple');
    expect(project.version, '123');

    project.name = 'pink';
    project.version = '1';

    expect(project.name, 'pink');
    expect(project.version, '1');

    expect(project.pkg.name, 'pink');
    expect(project.pkg.version, '1');
  });

  it('to JSON with 1 arg, is an alias for toJSON()[project.name][arg]', function() {
    let project = new Project('foo', '123');
    project.addDependency('rsvp', '1.2.3');
    project.addDevDependency('q', '1.2.4');

    expect(JSON.parse(project.toJSON('package.json'))).to.deep.eql({
      name: 'foo',
      version: '123',
      keywords: [],
      dependencies: {
        rsvp: '1.2.3'
      },
      devDependencies: {
        q: '1.2.4'
      },
    });
  });

  it('has a working dispose to allow early cleanup', function() {
    let project = new Project('foo', '123');
    project.addDependency('rsvp', '1.2.3');
    project.addDevDependency('q', '1.2.4');
    project.writeSync();
    expect(fs.readdirSync(project.root)).to.eql(["foo"]);
    project.dispose();
    expect(fs.existsSync(project.root)).to.eql(false);
  });
});
