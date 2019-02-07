'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _h = require('virtual-dom/h');

var _h2 = _interopRequireDefault(_h);

var _conversions = require('./utils/conversions');

var _TimeScaleHook = require('./render/TimeScaleHook');

var _TimeScaleHook2 = _interopRequireDefault(_TimeScaleHook);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var TimeScale = function () {
  function TimeScale(duration, offset, samplesPerPixel, sampleRate) {
    var marginLeft = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 0;

    _classCallCheck(this, TimeScale);

    this.duration = duration;
    this.offset = offset;
    this.samplesPerPixel = samplesPerPixel;
    this.sampleRate = sampleRate;
    this.marginLeft = marginLeft;

    this.timeinfo = {
      20000: {
        marker: 30000,
        bigStep: 10000,
        smallStep: 5000,
        secondStep: 5
      },
      12000: {
        marker: 15000,
        bigStep: 5000,
        smallStep: 1000,
        secondStep: 1
      },
      10000: {
        marker: 10000,
        bigStep: 5000,
        smallStep: 1000,
        secondStep: 1
      },
      5000: {
        marker: 5000,
        bigStep: 1000,
        smallStep: 500,
        secondStep: 1 / 2
      },
      2500: {
        marker: 2000,
        bigStep: 1000,
        smallStep: 500,
        secondStep: 1 / 2
      },
      1500: {
        marker: 2000,
        bigStep: 1000,
        smallStep: 200,
        secondStep: 1 / 5
      },
      700: {
        marker: 1000,
        bigStep: 500,
        smallStep: 100,
        secondStep: 1 / 10
      }
    };
  }

  _createClass(TimeScale, [{
    key: 'getScaleInfo',
    value: function getScaleInfo(resolution) {
      var keys = Object.keys(this.timeinfo).map(function (item) {
        return parseInt(item, 10);
      });

      // make sure keys are numerically sorted.
      keys = keys.sort(function (a, b) {
        return a - b;
      });

      for (var i = 0; i < keys.length; i += 1) {
        if (resolution <= keys[i]) {
          return this.timeinfo[keys[i]];
        }
      }

      return this.timeinfo[keys[0]];
    }

    /*
      Return time in format mm:ss
    */

  }, {
    key: 'render',
    value: function render() {
      var widthX = (0, _conversions.secondsToPixels)(this.duration, this.samplesPerPixel, this.sampleRate);
      var pixPerSec = this.sampleRate / this.samplesPerPixel;
      var pixOffset = (0, _conversions.secondsToPixels)(this.offset, this.samplesPerPixel, this.sampleRate);
      var scaleInfo = this.getScaleInfo(this.samplesPerPixel);
      var canvasInfo = {};
      var timeMarkers = [];
      var end = widthX + pixOffset;
      var counter = 0;

      for (var i = 0; i < end; i += pixPerSec * scaleInfo.secondStep) {
        var pixIndex = Math.floor(i);
        var pix = pixIndex - pixOffset;

        if (pixIndex >= pixOffset) {
          // put a timestamp every 30 seconds.
          if (scaleInfo.marker && counter % scaleInfo.marker === 0) {
            timeMarkers.push((0, _h2.default)('div.time', {
              attributes: {
                style: 'position: absolute; left: ' + pix + 'px;'
              }
            }, [TimeScale.formatTime(counter)]));

            canvasInfo[pix] = 10;
          } else if (scaleInfo.bigStep && counter % scaleInfo.bigStep === 0) {
            canvasInfo[pix] = 5;
          } else if (scaleInfo.smallStep && counter % scaleInfo.smallStep === 0) {
            canvasInfo[pix] = 2;
          }
        }

        counter += 1000 * scaleInfo.secondStep;
      }

      return (0, _h2.default)('div.playlist-time-scale', {
        attributes: {
          style: 'position: relative; left: 0; right: 0; margin-left: ' + this.marginLeft + 'px;'
        }
      }, [timeMarkers, (0, _h2.default)('canvas', {
        attributes: {
          width: widthX,
          height: 30,
          style: 'position: absolute; left: 0; right: 0; top: 0; bottom: 0;'
        },
        hook: new _TimeScaleHook2.default(canvasInfo, this.offset, this.samplesPerPixel, this.duration)
      })]);
    }
  }], [{
    key: 'formatTime',
    value: function formatTime(milliseconds) {
      var seconds = milliseconds / 1000;
      var s = seconds % 60;
      var m = (seconds - s) / 60;

      if (s < 10) {
        s = '0' + s;
      }

      return m + ':' + s;
    }
  }]);

  return TimeScale;
}();

exports.default = TimeScale;