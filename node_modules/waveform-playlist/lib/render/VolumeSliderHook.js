'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/*
* virtual-dom hook for setting the volume input programmatically.
*/
var _class = function () {
  function _class(gain) {
    _classCallCheck(this, _class);

    this.gain = gain;
  }

  _createClass(_class, [{
    key: 'hook',
    value: function hook(volumeInput) {
      volumeInput.setAttribute('value', this.gain * 100);
    }
  }]);

  return _class;
}();

exports.default = _class;