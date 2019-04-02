'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = require('lodash.assign');

var _lodash2 = _interopRequireDefault(_lodash);

var _lodash3 = require('lodash.forown');

var _lodash4 = _interopRequireDefault(_lodash3);

var _uuid = require('uuid');

var _uuid2 = _interopRequireDefault(_uuid);

var _h = require('virtual-dom/h');

var _h2 = _interopRequireDefault(_h);

var _webaudioPeaks = require('webaudio-peaks');

var _webaudioPeaks2 = _interopRequireDefault(_webaudioPeaks);

var _fadeMaker = require('fade-maker');

var _conversions = require('./utils/conversions');

var _states = require('./track/states');

var _states2 = _interopRequireDefault(_states);

var _CanvasHook = require('./render/CanvasHook');

var _CanvasHook2 = _interopRequireDefault(_CanvasHook);

var _FadeCanvasHook = require('./render/FadeCanvasHook');

var _FadeCanvasHook2 = _interopRequireDefault(_FadeCanvasHook);

var _VolumeSliderHook = require('./render/VolumeSliderHook');

var _VolumeSliderHook2 = _interopRequireDefault(_VolumeSliderHook);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MAX_CANVAS_WIDTH = 1000;

var _class = function () {
  function _class() {
    _classCallCheck(this, _class);

    this.name = 'Untitled';
    this.customClass = undefined;
    this.waveOutlineColor = undefined;
    this.gain = 1;
    this.fades = {};
    this.peakData = {
      type: 'WebAudio',
      mono: false
    };

    this.cueIn = 0;
    this.cueOut = 0;
    this.duration = 0;
    this.startTime = 0;
    this.endTime = 0;
  }

  _createClass(_class, [{
    key: 'setEventEmitter',
    value: function setEventEmitter(ee) {
      this.ee = ee;
    }
  }, {
    key: 'setName',
    value: function setName(name) {
      this.name = name;
    }
  }, {
    key: 'setCustomClass',
    value: function setCustomClass(className) {
      this.customClass = className;
    }
  }, {
    key: 'setWaveOutlineColor',
    value: function setWaveOutlineColor(color) {
      this.waveOutlineColor = color;
    }
  }, {
    key: 'setCues',
    value: function setCues(cueIn, cueOut) {
      if (cueOut < cueIn) {
        throw new Error('cue out cannot be less than cue in');
      }

      this.cueIn = cueIn;
      this.cueOut = cueOut;
      this.duration = this.cueOut - this.cueIn;
      this.endTime = this.startTime + this.duration;
    }

    /*
    *   start, end in seconds relative to the entire playlist.
    */

  }, {
    key: 'trim',
    value: function trim(start, end) {
      var trackStart = this.getStartTime();
      var trackEnd = this.getEndTime();
      var offset = this.cueIn - trackStart;

      if (trackStart <= start && trackEnd >= start || trackStart <= end && trackEnd >= end) {
        var cueIn = start < trackStart ? trackStart : start;
        var cueOut = end > trackEnd ? trackEnd : end;

        this.setCues(cueIn + offset, cueOut + offset);
        if (start > trackStart) {
          this.setStartTime(start);
        }
      }
    }
  }, {
    key: 'setStartTime',
    value: function setStartTime(start) {
      this.startTime = start;
      this.endTime = start + this.duration;
    }
  }, {
    key: 'setPlayout',
    value: function setPlayout(playout) {
      this.playout = playout;
    }
  }, {
    key: 'setOfflinePlayout',
    value: function setOfflinePlayout(playout) {
      this.offlinePlayout = playout;
    }
  }, {
    key: 'setEnabledStates',
    value: function setEnabledStates() {
      var enabledStates = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      var defaultStatesEnabled = {
        cursor: true,
        fadein: true,
        fadeout: true,
        select: true,
        shift: true
      };

      this.enabledStates = (0, _lodash2.default)({}, defaultStatesEnabled, enabledStates);
    }
  }, {
    key: 'setFadeIn',
    value: function setFadeIn(duration) {
      var shape = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'logarithmic';

      if (duration > this.duration) {
        throw new Error('Invalid Fade In');
      }

      var fade = {
        shape: shape,
        start: 0,
        end: duration
      };

      if (this.fadeIn) {
        this.removeFade(this.fadeIn);
        this.fadeIn = undefined;
      }

      this.fadeIn = this.saveFade(_fadeMaker.FADEIN, fade.shape, fade.start, fade.end);
    }
  }, {
    key: 'setFadeOut',
    value: function setFadeOut(duration) {
      var shape = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'logarithmic';

      if (duration > this.duration) {
        throw new Error('Invalid Fade Out');
      }

      var fade = {
        shape: shape,
        start: this.duration - duration,
        end: this.duration
      };

      if (this.fadeOut) {
        this.removeFade(this.fadeOut);
        this.fadeOut = undefined;
      }

      this.fadeOut = this.saveFade(_fadeMaker.FADEOUT, fade.shape, fade.start, fade.end);
    }
  }, {
    key: 'saveFade',
    value: function saveFade(type, shape, start, end) {
      var id = _uuid2.default.v4();

      this.fades[id] = {
        type: type,
        shape: shape,
        start: start,
        end: end
      };

      return id;
    }
  }, {
    key: 'removeFade',
    value: function removeFade(id) {
      delete this.fades[id];
    }
  }, {
    key: 'setBuffer',
    value: function setBuffer(buffer) {
      this.buffer = buffer;
    }
  }, {
    key: 'setPeakData',
    value: function setPeakData(data) {
      this.peakData = data;
    }
  }, {
    key: 'calculatePeaks',
    value: function calculatePeaks(samplesPerPixel, sampleRate) {
      var cueIn = (0, _conversions.secondsToSamples)(this.cueIn, sampleRate);
      var cueOut = (0, _conversions.secondsToSamples)(this.cueOut, sampleRate);

      this.setPeaks((0, _webaudioPeaks2.default)(this.buffer, samplesPerPixel, this.peakData.mono, cueIn, cueOut));
    }
  }, {
    key: 'setPeaks',
    value: function setPeaks(peaks) {
      this.peaks = peaks;
    }
  }, {
    key: 'setState',
    value: function setState(state) {
      this.state = state;

      if (this.state && this.enabledStates[this.state]) {
        var StateClass = _states2.default[this.state];
        this.stateObj = new StateClass(this);
      } else {
        this.stateObj = undefined;
      }
    }
  }, {
    key: 'getStartTime',
    value: function getStartTime() {
      return this.startTime;
    }
  }, {
    key: 'getEndTime',
    value: function getEndTime() {
      return this.endTime;
    }
  }, {
    key: 'getDuration',
    value: function getDuration() {
      return this.duration;
    }
  }, {
    key: 'isPlaying',
    value: function isPlaying() {
      return this.playout.isPlaying();
    }
  }, {
    key: 'setShouldPlay',
    value: function setShouldPlay(bool) {
      this.playout.setShouldPlay(bool);
    }
  }, {
    key: 'setGainLevel',
    value: function setGainLevel(level) {
      this.gain = level;
      this.playout.setVolumeGainLevel(level);
    }
  }, {
    key: 'setMasterGainLevel',
    value: function setMasterGainLevel(level) {
      this.playout.setMasterGainLevel(level);
    }

    /*
      startTime, endTime in seconds (float).
      segment is for a highlighted section in the UI.
       returns a Promise that will resolve when the AudioBufferSource
      is either stopped or plays out naturally.
    */

  }, {
    key: 'schedulePlay',
    value: function schedulePlay(now, startTime, endTime, config) {
      var start = void 0;
      var duration = void 0;
      var when = now;
      var segment = endTime ? endTime - startTime : undefined;

      var defaultOptions = {
        shouldPlay: true,
        masterGain: 1,
        isOffline: false
      };

      var options = (0, _lodash2.default)({}, defaultOptions, config);
      var playoutSystem = options.isOffline ? this.offlinePlayout : this.playout;

      // 1) track has no content to play.
      // 2) track does not play in this selection.
      if (this.endTime <= startTime || segment && startTime + segment < this.startTime) {
        // return a resolved promise since this track is technically "stopped".
        return Promise.resolve();
      }

      // track should have something to play if it gets here.

      // the track starts in the future or on the cursor position
      if (this.startTime >= startTime) {
        start = 0;
        // schedule additional delay for this audio node.
        when += this.startTime - startTime;

        if (endTime) {
          segment -= this.startTime - startTime;
          duration = Math.min(segment, this.duration);
        } else {
          duration = this.duration;
        }
      } else {
        start = startTime - this.startTime;

        if (endTime) {
          duration = Math.min(segment, this.duration - start);
        } else {
          duration = this.duration - start;
        }
      }

      start += this.cueIn;
      var relPos = startTime - this.startTime;
      var sourcePromise = playoutSystem.setUpSource();

      // param relPos: cursor position in seconds relative to this track.
      // can be negative if the cursor is placed before the start of this track etc.
      (0, _lodash4.default)(this.fades, function (fade) {
        var fadeStart = void 0;
        var fadeDuration = void 0;

        // only apply fade if it's ahead of the cursor.
        if (relPos < fade.end) {
          if (relPos <= fade.start) {
            fadeStart = now + (fade.start - relPos);
            fadeDuration = fade.end - fade.start;
          } else if (relPos > fade.start && relPos < fade.end) {
            fadeStart = now - (relPos - fade.start);
            fadeDuration = fade.end - fade.start;
          }

          switch (fade.type) {
            case _fadeMaker.FADEIN:
              {
                playoutSystem.applyFadeIn(fadeStart, fadeDuration, fade.shape);
                break;
              }
            case _fadeMaker.FADEOUT:
              {
                playoutSystem.applyFadeOut(fadeStart, fadeDuration, fade.shape);
                break;
              }
            default:
              {
                throw new Error('Invalid fade type saved on track.');
              }
          }
        }
      });

      playoutSystem.setVolumeGainLevel(this.gain);
      playoutSystem.setShouldPlay(options.shouldPlay);
      playoutSystem.setMasterGainLevel(options.masterGain);
      playoutSystem.play(when, start, duration);

      return sourcePromise;
    }
  }, {
    key: 'scheduleStop',
    value: function scheduleStop() {
      var when = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

      this.playout.stop(when);
    }
  }, {
    key: 'renderOverlay',
    value: function renderOverlay(data) {
      var _this = this;

      var channelPixels = (0, _conversions.secondsToPixels)(data.playlistLength, data.resolution, data.sampleRate);

      var config = {
        attributes: {
          style: 'position: absolute; top: 0; right: 0; bottom: 0; left: 0; width: ' + channelPixels + 'px; z-index: 9;'
        }
      };

      var overlayClass = '';

      if (this.stateObj) {
        this.stateObj.setup(data.resolution, data.sampleRate);
        var StateClass = _states2.default[this.state];
        var events = StateClass.getEvents();

        events.forEach(function (event) {
          config['on' + event] = _this.stateObj[event].bind(_this.stateObj);
        });

        overlayClass = StateClass.getClass();
      }
      // use this overlay for track event cursor position calculations.
      return (0, _h2.default)('div.playlist-overlay' + overlayClass, config);
    }
  }, {
    key: 'renderControls',
    value: function renderControls(data) {
      var _this2 = this;

      var muteClass = data.muted ? '.active' : '';
      var soloClass = data.soloed ? '.active' : '';
      var numChan = this.peaks.data.length;

      return (0, _h2.default)('div.controls', {
        attributes: {
          style: 'height: ' + numChan * data.height + 'px; width: ' + data.controls.width + 'px; position: absolute; left: 0; z-index: 10;'
        }
      }, [(0, _h2.default)('header', [this.name]), (0, _h2.default)('div.btn-group', [(0, _h2.default)('span.btn.btn-default.btn-xs.btn-mute' + muteClass, {
        onclick: function onclick() {
          _this2.ee.emit('mute', _this2);
        }
      }, ['Mute']), (0, _h2.default)('span.btn.btn-default.btn-xs.btn-solo' + soloClass, {
        onclick: function onclick() {
          _this2.ee.emit('solo', _this2);
        }
      }, ['Solo'])]), (0, _h2.default)('label', [(0, _h2.default)('input.volume-slider', {
        attributes: {
          type: 'range',
          min: 0,
          max: 100,
          value: 100
        },
        hook: new _VolumeSliderHook2.default(this.gain),
        oninput: function oninput(e) {
          _this2.ee.emit('volumechange', e.target.value, _this2);
        }
      })])]);
    }
  }, {
    key: 'render',
    value: function render(data) {
      var _this3 = this;

      var width = this.peaks.length;
      var playbackX = (0, _conversions.secondsToPixels)(data.playbackSeconds, data.resolution, data.sampleRate);
      var startX = (0, _conversions.secondsToPixels)(this.startTime, data.resolution, data.sampleRate);
      var endX = (0, _conversions.secondsToPixels)(this.endTime, data.resolution, data.sampleRate);
      var progressWidth = 0;
      var numChan = this.peaks.data.length;

      if (playbackX > 0 && playbackX > startX) {
        if (playbackX < endX) {
          progressWidth = playbackX - startX;
        } else {
          progressWidth = width;
        }
      }

      var waveformChildren = [(0, _h2.default)('div.cursor', {
        attributes: {
          style: 'position: absolute; width: 1px; margin: 0; padding: 0; top: 0; left: ' + playbackX + 'px; bottom: 0; z-index: 5;'
        }
      })];

      var channels = Object.keys(this.peaks.data).map(function (channelNum) {
        var channelChildren = [(0, _h2.default)('div.channel-progress', {
          attributes: {
            style: 'position: absolute; width: ' + progressWidth + 'px; height: ' + data.height + 'px; z-index: 2;'
          }
        })];
        var offset = 0;
        var totalWidth = width;
        var peaks = _this3.peaks.data[channelNum];

        while (totalWidth > 0) {
          var currentWidth = Math.min(totalWidth, MAX_CANVAS_WIDTH);
          var canvasColor = _this3.waveOutlineColor ? _this3.waveOutlineColor : data.colors.waveOutlineColor;

          channelChildren.push((0, _h2.default)('canvas', {
            attributes: {
              width: currentWidth,
              height: data.height,
              style: 'float: left; position: relative; margin: 0; padding: 0; z-index: 3;'
            },
            hook: new _CanvasHook2.default(peaks, offset, _this3.peaks.bits, canvasColor)
          }));

          totalWidth -= currentWidth;
          offset += MAX_CANVAS_WIDTH;
        }

        // if there are fades, display them.
        if (_this3.fadeIn) {
          var fadeIn = _this3.fades[_this3.fadeIn];
          var fadeWidth = (0, _conversions.secondsToPixels)(fadeIn.end - fadeIn.start, data.resolution, data.sampleRate);

          channelChildren.push((0, _h2.default)('div.wp-fade.wp-fadein', {
            attributes: {
              style: 'position: absolute; height: ' + data.height + 'px; width: ' + fadeWidth + 'px; top: 0; left: 0; z-index: 4;'
            }
          }, [(0, _h2.default)('canvas', {
            attributes: {
              width: fadeWidth,
              height: data.height
            },
            hook: new _FadeCanvasHook2.default(fadeIn.type, fadeIn.shape, fadeIn.end - fadeIn.start, data.resolution)
          })]));
        }

        if (_this3.fadeOut) {
          var fadeOut = _this3.fades[_this3.fadeOut];
          var _fadeWidth = (0, _conversions.secondsToPixels)(fadeOut.end - fadeOut.start, data.resolution, data.sampleRate);

          channelChildren.push((0, _h2.default)('div.wp-fade.wp-fadeout', {
            attributes: {
              style: 'position: absolute; height: ' + data.height + 'px; width: ' + _fadeWidth + 'px; top: 0; right: 0; z-index: 4;'
            }
          }, [(0, _h2.default)('canvas', {
            attributes: {
              width: _fadeWidth,
              height: data.height
            },
            hook: new _FadeCanvasHook2.default(fadeOut.type, fadeOut.shape, fadeOut.end - fadeOut.start, data.resolution)
          })]));
        }

        return (0, _h2.default)('div.channel.channel-' + channelNum, {
          attributes: {
            style: 'height: ' + data.height + 'px; width: ' + width + 'px; top: ' + channelNum * data.height + 'px; left: ' + startX + 'px; position: absolute; margin: 0; padding: 0; z-index: 1;'
          }
        }, channelChildren);
      });

      waveformChildren.push(channels);
      waveformChildren.push(this.renderOverlay(data));

      // draw cursor selection on active track.
      if (data.isActive === true) {
        var cStartX = (0, _conversions.secondsToPixels)(data.timeSelection.start, data.resolution, data.sampleRate);
        var cEndX = (0, _conversions.secondsToPixels)(data.timeSelection.end, data.resolution, data.sampleRate);
        var cWidth = cEndX - cStartX + 1;
        var cClassName = cWidth > 1 ? '.segment' : '.point';

        waveformChildren.push((0, _h2.default)('div.selection' + cClassName, {
          attributes: {
            style: 'position: absolute; width: ' + cWidth + 'px; bottom: 0; top: 0; left: ' + cStartX + 'px; z-index: 4;'
          }
        }));
      }

      var waveform = (0, _h2.default)('div.waveform', {
        attributes: {
          style: 'height: ' + numChan * data.height + 'px; position: relative;'
        }
      }, waveformChildren);

      var channelChildren = [];
      var channelMargin = 0;

      if (data.controls.show) {
        channelChildren.push(this.renderControls(data));
        channelMargin = data.controls.width;
      }

      channelChildren.push(waveform);

      var audibleClass = data.shouldPlay ? '' : '.silent';
      var customClass = this.customClass === undefined ? '' : '.' + this.customClass;

      return (0, _h2.default)('div.channel-wrapper' + audibleClass + customClass, {
        attributes: {
          style: 'margin-left: ' + channelMargin + 'px; height: ' + data.height * numChan + 'px;'
        }
      }, channelChildren);
    }
  }, {
    key: 'getTrackDetails',
    value: function getTrackDetails() {
      var info = {
        src: this.src,
        start: this.startTime,
        end: this.endTime,
        name: this.name,
        customClass: this.customClass,
        cuein: this.cueIn,
        cueout: this.cueOut
      };

      if (this.fadeIn) {
        var fadeIn = this.fades[this.fadeIn];

        info.fadeIn = {
          shape: fadeIn.shape,
          duration: fadeIn.end - fadeIn.start
        };
      }

      if (this.fadeOut) {
        var fadeOut = this.fades[this.fadeOut];

        info.fadeOut = {
          shape: fadeOut.shape,
          duration: fadeOut.end - fadeOut.start
        };
      }

      return info;
    }
  }]);

  return _class;
}();

exports.default = _class;