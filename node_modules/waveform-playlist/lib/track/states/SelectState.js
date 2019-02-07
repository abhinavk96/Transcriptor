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
    this.active = false;
  }

  _createClass(_class, [{
    key: 'setup',
    value: function setup(samplesPerPixel, sampleRate) {
      this.samplesPerPixel = samplesPerPixel;
      this.sampleRate = sampleRate;
    }
  }, {
    key: 'emitSelection',
    value: function emitSelection(x) {
      var minX = Math.min(x, this.startX);
      var maxX = Math.max(x, this.startX);
      var startTime = (0, _conversions.pixelsToSeconds)(minX, this.samplesPerPixel, this.sampleRate);
      var endTime = (0, _conversions.pixelsToSeconds)(maxX, this.samplesPerPixel, this.sampleRate);

      this.track.ee.emit('select', startTime, endTime, this.track);
    }
  }, {
    key: 'complete',
    value: function complete(x) {
      this.emitSelection(x);
      this.active = false;
    }
  }, {
    key: 'mousedown',
    value: function mousedown(e) {
      e.preventDefault();
      this.active = true;

      this.startX = e.offsetX;
      var startTime = (0, _conversions.pixelsToSeconds)(this.startX, this.samplesPerPixel, this.sampleRate);

      this.track.ee.emit('select', startTime, startTime, this.track);
    }
  }, {
    key: 'mousemove',
    value: function mousemove(e) {
      if (this.active) {
        e.preventDefault();
        this.emitSelection(e.offsetX);
      }
    }
  }, {
    key: 'mouseup',
    value: function mouseup(e) {
      if (this.active) {
        e.preventDefault();
        this.complete(e.offsetX);
      }
    }
  }, {
    key: 'mouseleave',
    value: function mouseleave(e) {
      if (this.active) {
        e.preventDefault();
        this.complete(e.offsetX);
      }
    }
  }], [{
    key: 'getClass',
    value: function getClass() {
      return '.state-select';
    }
  }, {
    key: 'getEvents',
    value: function getEvents() {
      return ['mousedown', 'mousemove', 'mouseup', 'mouseleave'];
    }
  }]);

  return _class;
}();

exports.default = _class;