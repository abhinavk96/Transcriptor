/* globals Ember, require */

(function() {
  var _Ember;
  var id = 0;
  var dateKey = new Date().getTime();

  if (typeof Ember !== 'undefined') {
    _Ember = Ember;
  } else {
    _Ember = require('ember').default;
  }

  function symbol() {
    return '__ember' + dateKey + id++;
  }

  function UNDEFINED() {}

  function FakeWeakMap(iterable) {
    this._id = symbol();

    if (iterable === null || iterable === undefined) {
      return;
    } else if (Array.isArray(iterable)) {
      for (var i = 0; i < iterable.length; i++) {
        var key = iterable[i][0];
        var value = iterable[i][1];
        this.set(key, value);
      }
    } else {
      throw new TypeError('The weak map constructor polyfill only supports an array argument');
    }
  }

  if (!_Ember.WeakMap) {
    var meta = _Ember.meta;
    var metaKey = symbol();

    /*
     * @method get
     * @param key {Object}
     * @return {*} stored value
     */
    FakeWeakMap.prototype.get = function(obj) {
      var metaInfo = meta(obj);
      var metaObject = metaInfo[metaKey];

      if (metaInfo && metaObject) {
        if (metaObject[this._id] === UNDEFINED) {
          return undefined;
        }

        return metaObject[this._id];
      }
    }

    /*
     * @method set
     * @param key {Object}
     * @param value {Any}
     * @return {Any} stored value
     */
    FakeWeakMap.prototype.set = function(obj, value) {
      var type = typeof obj;

      if (!obj || (type !== 'object' && type !== 'function')) {
        throw new TypeError('Invalid value used as weak map key');
      }

      var metaInfo = meta(obj);
      if (value === undefined) {
        value = UNDEFINED;
      }

      if (!metaInfo[metaKey]) {
        metaInfo[metaKey] = {};
      }

      metaInfo[metaKey][this._id] = value;
      return this;
    }

    /*
     * @method has
     * @param key {Object}
     * @return {Boolean} if the key exists
     */
    FakeWeakMap.prototype.has = function(obj) {
      var metaInfo   = meta(obj);
      var metaObject = metaInfo[metaKey];

      return (metaObject && metaObject[this._id] !== undefined);
    }

    /*
     * @method delete
     * @param key {Object}
     */
    FakeWeakMap.prototype.delete = function(obj) {
      var metaInfo = meta(obj);

      if (this.has(obj)) {
        delete metaInfo[metaKey][this._id];

        return true;
      }

      return false;
    }

    if (typeof WeakMap === 'function' && typeof window !== 'undefined' && window.OVERRIDE_WEAKMAP !== true) {
      _Ember.WeakMap = WeakMap;
    } else {
      _Ember.WeakMap = FakeWeakMap;
    }
  }
})();
