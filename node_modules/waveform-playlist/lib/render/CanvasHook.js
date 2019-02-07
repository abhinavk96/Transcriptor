'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/*
* virtual-dom hook for drawing to the canvas element.
*/
var CanvasHook = function () {
  function CanvasHook(peaks, offset, bits, color) {
    _classCallCheck(this, CanvasHook);

    this.peaks = peaks;
    // http://stackoverflow.com/questions/6081483/maximum-size-of-a-canvas-element
    this.offset = offset;
    this.color = color;
    this.bits = bits;
  }

  _createClass(CanvasHook, [{
    key: 'hook',
    value: function hook(canvas, prop, prev) {
      // canvas is up to date
      if (prev !== undefined && prev.peaks === this.peaks) {
        return;
      }

      var len = canvas.width;
      var cc = canvas.getContext('2d');
      var h2 = canvas.height / 2;
      var maxValue = Math.pow(2, this.bits - 1);

      cc.clearRect(0, 0, canvas.width, canvas.height);
      cc.fillStyle = this.color;

      for (var i = 0; i < len; i += 1) {
        var minPeak = this.peaks[(i + this.offset) * 2] / maxValue;
        var maxPeak = this.peaks[(i + this.offset) * 2 + 1] / maxValue;
        CanvasHook.drawFrame(cc, h2, i, minPeak, maxPeak);
      }
    }
  }], [{
    key: 'drawFrame',
    value: function drawFrame(cc, h2, x, minPeak, maxPeak) {
      var min = Math.abs(minPeak * h2);
      var max = Math.abs(maxPeak * h2);

      // draw max
      cc.fillRect(x, 0, 1, h2 - max);
      // draw min
      cc.fillRect(x, h2 + min, 1, h2 - min);
    }
  }]);

  return CanvasHook;
}();

exports.default = CanvasHook;