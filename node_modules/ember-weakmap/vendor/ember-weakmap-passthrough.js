/* globals Ember, require, WeakMap */

(function() {
  var _Ember;

  if (typeof Ember !== 'undefined') {
    _Ember = Ember;
  } else {
    _Ember = require('ember').default;
  }

  if (!_Ember.WeakMap) {
    _Ember.WeakMap = WeakMap;
  }
})();
