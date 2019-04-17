'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _conversions = require('../../utils/conversions');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _class = function () {
  function _class(track) {
    _classCallCheck(this, _class);

    this.track = track;
  }

  _createClass(_class, [{
    key: 'setup',
    value: function setup(samplesPerPixel, sampleRate) {
      this.samplesPerPixel = samplesPerPixel;
      this.sampleRate = sampleRate;
    }
  }, {
    key: 'click',
    value: function click(e) {
      e.preventDefault();

      var startX = e.offsetX;
      var startTime = (0, _conversions.pixelsToSeconds)(startX, this.samplesPerPixel, this.sampleRate);

      this.track.ee.emit('select', startTime, startTime, this.track);
    }
  }], [{
    key: 'getClass',
    value: function getClass() {
      return '.state-cursor';
    }
  }, {
    key: 'getEvents',
    value: function getEvents() {
      return ['click'];
    }
  }]);

  return _class;
}();

exports.default = _class;