'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _BlobLoader = require('./BlobLoader');

var _BlobLoader2 = _interopRequireDefault(_BlobLoader);

var _XHRLoader = require('./XHRLoader');

var _XHRLoader2 = _interopRequireDefault(_XHRLoader);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _class = function () {
  function _class() {
    _classCallCheck(this, _class);
  }

  _createClass(_class, null, [{
    key: 'createLoader',
    value: function createLoader(src, audioContext, ee) {
      if (src instanceof Blob) {
        return new _BlobLoader2.default(src, audioContext, ee);
      } else if (typeof src === 'string') {
        return new _XHRLoader2.default(src, audioContext, ee);
      }

      throw new Error('Unsupported src type');
    }
  }]);

  return _class;
}();

exports.default = _class;