'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _fadeMaker = require('fade-maker');

var _fadeCurves = require('fade-curves');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/*
* virtual-dom hook for drawing the fade curve to the canvas element.
*/
var FadeCanvasHook = function () {
  function FadeCanvasHook(type, shape, duration, samplesPerPixel) {
    _classCallCheck(this, FadeCanvasHook);

    this.type = type;
    this.shape = shape;
    this.duration = duration;
    this.samplesPerPixel = samplesPerPixel;
  }

  _createClass(FadeCanvasHook, [{
    key: 'hook',
    value: function hook(canvas, prop, prev) {
      // node is up to date.
      if (prev !== undefined && prev.shape === this.shape && prev.type === this.type && prev.duration === this.duration && prev.samplesPerPixel === this.samplesPerPixel) {
        return;
      }

      var ctx = canvas.getContext('2d');
      var width = canvas.width;
      var height = canvas.height;
      var curve = FadeCanvasHook.createCurve(this.shape, this.type, width);
      var len = curve.length;
      var y = height - curve[0] * height;

      ctx.strokeStyle = 'black';
      ctx.beginPath();
      ctx.moveTo(0, y);

      for (var i = 1; i < len; i += 1) {
        y = height - curve[i] * height;
        ctx.lineTo(i, y);
      }
      ctx.stroke();
    }
  }], [{
    key: 'createCurve',
    value: function createCurve(shape, type, width) {
      var reflection = void 0;
      var curve = void 0;

      switch (type) {
        case _fadeMaker.FADEIN:
          {
            reflection = 1;
            break;
          }
        case _fadeMaker.FADEOUT:
          {
            reflection = -1;
            break;
          }
        default:
          {
            throw new Error('Unsupported fade type.');
          }
      }

      switch (shape) {
        case _fadeMaker.SCURVE:
          {
            curve = (0, _fadeCurves.sCurve)(width, reflection);
            break;
          }
        case _fadeMaker.LINEAR:
          {
            curve = (0, _fadeCurves.linear)(width, reflection);
            break;
          }
        case _fadeMaker.EXPONENTIAL:
          {
            curve = (0, _fadeCurves.exponential)(width, reflection);
            break;
          }
        case _fadeMaker.LOGARITHMIC:
          {
            curve = (0, _fadeCurves.logarithmic)(width, 10, reflection);
            break;
          }
        default:
          {
            throw new Error('Unsupported fade shape');
          }
      }

      return curve;
    }
  }]);

  return FadeCanvasHook;
}();

exports.default = FadeCanvasHook;