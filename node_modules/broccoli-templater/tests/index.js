'use strict';

const chai = require('chai');
const expect = chai.expect;
const broccoli = require('broccoli');
const Template = require('..');
const walkSync = require('walk-sync');
const fs = require('fs');
const { createBuilder, createTempDir } = require('broccoli-test-helper');
const co = require('co');

chai.use(require('chai-fs'));


const TEMPLATE = `
(function (global) {
  define('fetch', [ 'ember', 'exports' ], function(Ember, self) {
    'use strict';
    var Promise = Ember['default'].RSVP.Promise;
    if (global.FormData) {
      self.FormData = global.FormData;
    }
    if (global.FileReader) {
      self.FileReader = global.FileReader;
    }
    if (global.Blob) {
      self.Blob = global.Blob;
    }

    <%= moduleBody %>

    self['default'] = self.fetch;
  });

  define('fetch/ajax', [ 'fetch', 'exports' ], function(fetch, exports) {
    'use strict';

    exports['default'] = function() {
      return fetch['default'].apply(fetch, arguments).then(function(request) {
        return request.json();
      });
    };
  });
}(typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : this));`

describe('BroccoliTemplater', function() {
  describe('builds', function() {
    let input;
    let template;
    let output;

    beforeEach(co.wrap(function* () {
      input = yield createTempDir();
      template = yield createTempDir();

      template.write({
        'module-template.js.t': TEMPLATE
      });

      let tree = new Template(input.path(), template.path() + '/module-template.js.t', (content, relativePath) => {
        return {
          moduleBody: content
        };
      });

      output = createBuilder(tree);
    }));

    after(co.wrap(function* () {
      yield input.dispose();
      yield template.dispose();
      yield output.dispose();
    }));

    it('basic templating', co.wrap(function* () {
      input.write({
        'foo.js': `
function foo() {

}`});

      yield output.build();

      expect(output.read()['foo.js']).to.match(/'fetch\/ajax'/);
    }));

    it('rebuilds correctly', co.wrap(function* () {

      // write a new file
      input.write({
        'foo.js': `
function foo() {

}`});

      yield output.build();
      expect(output.changes()).to.eql({ 'foo.js': 'create' });

      // write a new file
input.write({
        'bar.js': `
function bar() {

}`});

      yield output.build();
      expect(output.changes()).to.eql({ 'bar.js': 'create' });

      // delete a file
      input.write({
        'foo.js': null
      });

      yield output.build();
      expect(output.changes()).to.eql({ 'foo.js': 'unlink' });

      // add a directory with a file
      input.write({
        'bar.js': 'new content',
        'apple': {
          'orange.js': 'foo'
        }
      });

      yield output.build();

      expect(output.read()['bar.js']).to.contain(`define('fetch', `);
      expect(output.read()['bar.js']).to.contain(`new content`);
      expect(output.read().apple['orange.js']).to.contain(`define('fetch', `);
      expect(output.read().apple['orange.js']).to.contain(`foo`);

      expect(output.changes()).to.eql({
        'bar.js': 'change',
        'apple/': 'mkdir',
        'apple/orange.js': 'create'
      });

      // make no changes
      yield output.build();
      expect(output.changes()).to.eql({ });

      template.write({
        'module-template.js.t': TEMPLATE + 'CHANGE'
      });

      // template changes
      yield output.build();

      expect(output.changes()).to.eql({
        'bar.js': 'change',
        'apple/orange.js': 'change'
      });

      // remove the directoy and file
      input.write({
        'apple': null
      });

      yield output.build();
      expect(output.changes()).to.eql({
        'apple/': 'rmdir',
        'apple/orange.js': 'unlink'
      });

      expect(output.read()['bar.js']).to.contain(`define('fetch', `);
      expect(output.read()['bar.js']).to.contain(`new content`);
      expect(output.read()['bar.js']).to.contain(`CHANGE`);

      // no changes
      yield output.build();
      expect(output.changes()).to.eql({});
    }));
  });
});
