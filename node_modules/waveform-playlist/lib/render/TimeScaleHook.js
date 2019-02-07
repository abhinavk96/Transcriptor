'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/*
* virtual-dom hook for rendering the time scale canvas.
*/
var _class = function () {
  function _class(tickInfo, offset, samplesPerPixel, duration) {
    _classCallCheck(this, _class);

    this.tickInfo = tickInfo;
    this.offset = offset;
    this.samplesPerPixel = samplesPerPixel;
    this.duration = duration;
  }

  _createClass(_class, [{
    key: 'hook',
    value: function hook(canvas, prop, prev) {
      var _this = this;

      // canvas is up to date
      if (prev !== undefined && prev.offset === this.offset && prev.duration === this.duration && prev.samplesPerPixel === this.samplesPerPixel) {
        return;
      }

      var width = canvas.width;
      var height = canvas.height;
      var ctx = canvas.getContext('2d');

      ctx.clearRect(0, 0, width, height);

      Object.keys(this.tickInfo).forEach(function (x) {
        var scaleHeight = _this.tickInfo[x];
        var scaleY = height - scaleHeight;
        ctx.fillRect(x, scaleY, 1, scaleHeight);
      });
    }
  }]);

  return _class;
}();

exports.default = _class;