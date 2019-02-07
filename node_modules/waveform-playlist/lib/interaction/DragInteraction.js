'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _conversions = require('../utils/conversions');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _class = function () {
  function _class(playlist) {
    var _this = this;

    var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, _class);

    this.playlist = playlist;
    this.data = data;
    this.active = false;

    this.ondragover = function (e) {
      if (_this.active) {
        e.preventDefault();
        _this.emitDrag(e.clientX);
      }
    };
  }

  _createClass(_class, [{
    key: 'emitDrag',
    value: function emitDrag(x) {
      var deltaX = x - this.prevX;

      // emit shift event if not 0
      if (deltaX) {
        var deltaTime = (0, _conversions.pixelsToSeconds)(deltaX, this.playlist.samplesPerPixel, this.playlist.sampleRate);
        this.prevX = x;
        this.playlist.ee.emit('dragged', deltaTime, this.data);
      }
    }
  }, {
    key: 'complete',
    value: function complete() {
      this.active = false;
      document.removeEventListener('dragover', this.ondragover);
    }
  }, {
    key: 'dragstart',
    value: function dragstart(e) {
      var ev = e;
      this.active = true;
      this.prevX = e.clientX;

      ev.dataTransfer.dropEffect = 'move';
      ev.dataTransfer.effectAllowed = 'move';
      ev.dataTransfer.setData('text/plain', '');
      document.addEventListener('dragover', this.ondragover);
    }
  }, {
    key: 'dragend',
    value: function dragend(e) {
      if (this.active) {
        e.preventDefault();
        this.complete();
      }
    }
  }], [{
    key: 'getClass',
    value: function getClass() {
      return '.shift';
    }
  }, {
    key: 'getEvents',
    value: function getEvents() {
      return ['dragstart', 'dragend'];
    }
  }]);

  return _class;
}();

exports.default = _class;